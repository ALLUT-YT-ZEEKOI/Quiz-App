import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  FileImage,
  File as FileIcon,
  Link2,
  StickyNote,
  Download,
  ExternalLink,
  Eye,
  NotebookText,
  Presentation,
  FileSpreadsheet,
  LoaderCircle,
  PenLine,
  Trash2,
  X,
  Plus,
  HardDrive,
  FolderOpen,
  CheckCircle2,
  Info,
  Pencil,
  Check
} from 'lucide-react';
import { getNoteFile, formatFileSize } from '../../utils/notesStorage';
import { parseDriveLink, DRIVE_KINDS } from '../../utils/driveLinks';

// =========================================================================
// Helpers
// =========================================================================

const isPdf = (note) =>
  note.fileType === 'application/pdf' || /\.pdf$/i.test(note.fileName || '');
const isImage = (note) =>
  (note.fileType || '').startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(note.fileName || '');

const DRIVE_KIND_STYLE = {
  doc: { Icon: FileText, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300' },
  sheet: { Icon: FileSpreadsheet, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300' },
  slides: { Icon: Presentation, tone: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300' },
  folder: { Icon: FolderOpen, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300' },
  file: { Icon: HardDrive, tone: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300' }
};

export const getNoteKind = (note) => {
  if (note.type === 'link') {
    const drive = parseDriveLink(note.url);
    if (drive) return { label: DRIVE_KINDS[drive.kind].label, ...DRIVE_KIND_STYLE[drive.kind] };
    return { label: 'Link', Icon: Link2, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300' };
  }
  if (note.type === 'text') {
    return { label: 'Written Notes', Icon: StickyNote, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300' };
  }
  const name = note.fileName || '';
  if (isPdf(note)) return { label: 'PDF', Icon: FileText, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300' };
  if (isImage(note)) return { label: 'Image', Icon: FileImage, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300' };
  if (/\.(pptx?)$/i.test(name)) return { label: 'Slides', Icon: Presentation, tone: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300' };
  if (/\.(xlsx?)$/i.test(name)) return { label: 'Sheet', Icon: FileSpreadsheet, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300' };
  if (/\.(docx?)$/i.test(name)) return { label: 'Word', Icon: FileText, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300' };
  return { label: 'File', Icon: FileIcon, tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
};

const safeHttpUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// Loads a stored note file and returns a temporary object URL (revoked on unmount)
const useNoteFileUrl = (note) => {
  const [state, setState] = useState({ url: null, loading: false, error: null });

  useEffect(() => {
    if (!note || note.type !== 'file') return undefined;
    let objectUrl = null;
    let cancelled = false;
    setState({ url: null, loading: true, error: null });

    getNoteFile(note.id)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setState({ url: null, loading: false, error: 'This file is not available on this device.' });
          return;
        }
        // Keep the original type so PDFs/images render inline
        const typed = note.fileType && !blob.type ? new Blob([blob], { type: note.fileType }) : blob;
        objectUrl = URL.createObjectURL(typed);
        setState({ url: objectUrl, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, loading: false, error: 'Could not open this file.' });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note]);

  return state;
};

// =========================================================================
// Notes list (shared by teacher + student)
// =========================================================================

export const NotesList = ({ notes, onOpen, onDelete, onEdit, emptyState }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!notes || notes.length === 0) return emptyState || null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {notes.map((note) => {
        const { label, Icon, tone } = getNoteKind(note);
        const linkUrl = note.type === 'link' ? safeHttpUrl(note.url) : null;
        const drive = note.type === 'link' ? parseDriveLink(note.url) : null;
        const meta = [
          note.type === 'file' ? formatFileSize(note.fileSize) : null,
          drive ? 'Google Drive' : note.type === 'link' && linkUrl ? new URL(linkUrl).hostname.replace(/^www\./, '') : null,
          formatDate(note.createdAt)
        ].filter(Boolean);

        return (
          <article
            key={note.id}
            className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs hover:border-[#20B8C7]/50 transition-all flex flex-col gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                  {meta.length > 0 && <span className="font-medium normal-case tracking-normal"> • {meta.join(' • ')}</span>}
                </span>
                <h4
                  className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2"
                  title={note.title}
                >
                  {note.title}
                </h4>
                {note.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                    {note.description}
                  </p>
                )}
                {note.type === 'text' && note.content && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-snug">
                    {note.content.replace(/\s+/g, ' ')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              {confirmDeleteId === note.id ? (
                <div className="flex items-center gap-1.5 w-full justify-end animate-in fade-in duration-150">
                  <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 mr-auto">Delete these notes?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(note);
                      setConfirmDeleteId(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <>
                  {drive ? (
                    <button
                      type="button"
                      onClick={() => onOpen(note)}
                      className="px-3 py-1.5 rounded-lg bg-[#E6F4F6] hover:bg-[#d8eef1] dark:bg-[#0E353E] dark:hover:bg-[#12424d] text-[#0C4E5B] dark:text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{drive.kind === 'folder' ? 'Open Folder' : 'Read Notes'}</span>
                    </button>
                  ) : note.type === 'link' ? (
                    linkUrl ? (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#E6F4F6] hover:bg-[#d8eef1] dark:bg-[#0E353E] dark:hover:bg-[#12424d] text-[#0C4E5B] dark:text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Link</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">Invalid link</span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpen(note)}
                      className="px-3 py-1.5 rounded-lg bg-[#E6F4F6] hover:bg-[#d8eef1] dark:bg-[#0E353E] dark:hover:bg-[#12424d] text-[#0C4E5B] dark:text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{note.type === 'text' ? 'Read Notes' : 'View'}</span>
                    </button>
                  )}

                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#087F8C] hover:bg-[#E6F4F6] dark:hover:bg-[#0E353E] transition-colors ml-auto"
                      title="Edit Notes"
                      aria-label={`Edit ${note.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Notes"
                      aria-label={`Delete ${note.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

// =========================================================================
// Note viewer (PDF / image inline, other files download, written notes as text)
// =========================================================================

export const NotePreviewModal = ({ note, onClose, studentView = false }) => {
  const { url, loading, error } = useNoteFileUrl(note);
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
  );

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!note) return null;
  const { label, Icon, tone } = getNoteKind(note);
  const drive = note.type === 'link' ? parseDriveLink(note.url) : null;
  const restrictDrivePreview = studentView && drive && drive.kind !== 'folder';
  // Mobile browsers generally can't render PDFs inside an iframe, so offer Open/Download there
  const showPdfInline = note.type === 'file' && isPdf(note) && !isTouch;
  const showImageInline = note.type === 'file' && isImage(note);

  // Portal to <body>: the page's animated wrappers use transforms, which would otherwise
  // trap this fixed overlay inside the content area instead of covering the screen.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={note.title}
    >
      <div
        className={`w-full max-w-4xl bg-white dark:bg-surface-darkCard rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col ${
          drive ? 'h-[92vh] max-h-full supports-[height:100dvh]:h-[92dvh]' : 'max-h-[92vh] animate-in zoom-in-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{note.title}</h3>
            <p className="text-[11px] text-slate-400 truncate">
              {note.type === 'file' ? `${note.fileName} • ${formatFileSize(note.fileSize)}` : label}
            </p>
          </div>
          {url && (
            <a
              href={url}
              download={note.fileName || note.title}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className={`flex-1 min-h-0 bg-slate-50 dark:bg-slate-950/40 ${drive ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
          {drive ? (
            <>
              {note.description && (
                <p className="max-h-[25%] shrink-0 overflow-y-auto break-words px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{note.description}</p>
              )}
              <div className="relative min-h-0 flex-1">
                <iframe
                  src={drive.previewUrl}
                  title={note.title}
                  className="block h-full w-full border-0 bg-white"
                  allow="autoplay"
                  sandbox={restrictDrivePreview ? 'allow-scripts allow-same-origin' : undefined}
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* Drive renders the pop-out control inside its cross-origin file preview. */}
                {restrictDrivePreview && drive.kind === 'file' && (
                  <div className="absolute right-0 top-0 z-10 size-16 bg-[#202124]" aria-hidden="true" />
                )}
              </div>
              {!studentView && (
                <p className="shrink-0 px-4 py-2 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
                  Not loading? Ask your instructor to share it as &ldquo;Anyone with the link&rdquo;.
                </p>
              )}
            </>
          ) : note.type === 'text' ? (
            <div className="p-5 sm:p-6 space-y-3">
              {note.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{note.description}</p>
              )}
              <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                {note.content}
              </div>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center gap-2 text-slate-400 text-xs">
              <LoaderCircle className="w-6 h-6 animate-spin" />
              <span>Opening notes…</span>
            </div>
          ) : error ? (
            <div className="py-16 px-6 text-center space-y-2">
              <FileIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{error}</p>
            </div>
          ) : showPdfInline ? (
            <iframe src={url} title={note.title} className="w-full h-[75vh] border-0 bg-white" />
          ) : showImageInline ? (
            <div className="p-3 sm:p-4 flex justify-center">
              <img src={url} alt={note.title} className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-sm" />
            </div>
          ) : (
            <div className="py-14 px-6 text-center space-y-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${tone}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-all">{note.fileName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isPdf(note) ? 'Open the PDF to read it.' : 'Download this file to open it on your device.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {isPdf(note) && url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open PDF</span>
                  </a>
                )}
                {url && (
                  <a
                    href={url}
                    download={note.fileName || note.title}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile download bar (only when the file is shown inline; otherwise the body has the buttons) */}
        {url && (showPdfInline || showImageInline) && (
          <div className="sm:hidden p-3 border-t border-slate-200 dark:border-slate-800">
            <a
              href={url}
              download={note.fileName || note.title}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download {getNoteKind(note).label}</span>
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// =========================================================================
// Add Notes modal (teacher)
// =========================================================================

// Notes come from Google Drive; other links and written notes are still possible
const NOTE_TYPES = [
  { id: 'drive', label: 'Google Drive', Icon: HardDrive },
  { id: 'link', label: 'Other Link', Icon: Link2 },
  { id: 'text', label: 'Write', Icon: PenLine }
];

const EMPTY_FORM = { title: '', description: '', url: '', content: '' };

/**
 * Add a note, or edit one (initialNote). sections: [{ id, title }] shows a Section picker
 * (initialSectionId selected); onSave(noteData, file, sectionId).
 */
export const AddNoteModal = ({ moduleTitle, onClose, onSave, showToast, initialNote = null, sections = null, initialSectionId = '' }) => {
  const editing = !!initialNote;
  const isFile = initialNote?.type === 'file'; // older uploaded files: only the details can change
  const [type, setType] = useState(() => {
    if (!initialNote) return 'drive';
    if (initialNote.type === 'text') return 'text';
    if (initialNote.type === 'link') return initialNote.provider === 'gdrive' || parseDriveLink(initialNote.url || '') ? 'drive' : 'link';
    return 'file';
  });
  const [form, setForm] = useState(() =>
    initialNote
      ? {
          title: initialNote.title || '',
          description: initialNote.description || '',
          url: initialNote.url || '',
          content: initialNote.content || ''
        }
      : EMPTY_FORM
  );
  const [sectionId, setSectionId] = useState(initialSectionId || initialNote?.sectionId || '');
  const [saving, setSaving] = useState(false);

  const drive = type === 'drive' ? parseDriveLink(form.url) : null;
  const driveUrlTyped = type === 'drive' && form.url.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Please give these notes a title', 'warning');
      return;
    }
    if (type === 'drive' && !drive) {
      showToast('Please paste a Google Drive or Google Docs link', 'warning');
      return;
    }
    if (type === 'link' && !safeHttpUrl(form.url.trim())) {
      showToast('Please paste a valid link starting with https://', 'warning');
      return;
    }
    if (type === 'text' && !form.content.trim()) {
      showToast('Please write your notes', 'warning');
      return;
    }

    // Drive notes are stored as links; the app recognises Drive links when showing them
    const noteData = isFile
      ? { title: form.title.trim(), description: form.description.trim() }
      : {
          type: type === 'text' ? 'text' : 'link',
          title: form.title.trim(),
          description: form.description.trim(),
          ...(type === 'drive' ? { url: safeHttpUrl(form.url.trim()), provider: 'gdrive' } : {}),
          ...(type === 'link' ? { url: safeHttpUrl(form.url.trim()) } : {}),
          ...(type === 'text' ? { content: form.content.trim() } : {})
        };

    setSaving(true);
    const ok = await onSave(noteData, null, sectionId || null);
    setSaving(false);
    if (ok !== false) onClose();
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/60';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <NotebookText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{editing ? 'Edit Notes' : 'Add Notes'}</h3>
              <p className="text-xs text-slate-400 truncate">Module: {moduleTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {sections && sections.length > 0 && (
            <div>
              <label htmlFor="note-section" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Section
              </label>
              <select
                id="note-section"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className={inputClass}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
                {editing && <option value="">Unsorted</option>}
              </select>
            </div>
          )}

          {isFile && (
            <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>This is an uploaded file. You can change its title, description and section. To replace the file, add new notes.</span>
            </p>
          )}

          {/* Note type switcher */}
          {!isFile && (
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800" role="tablist">
            {NOTE_TYPES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={type === id}
                onClick={() => setType(id)}
                className={`py-2 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === id
                    ? 'bg-white dark:bg-slate-800 text-[#0C4E5B] dark:text-cyan-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
          )}

          {type === 'drive' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Google Drive link *</label>
              <input
                type="url"
                required
                autoFocus
                placeholder="https://drive.google.com/file/d/…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className={inputClass}
              />
              {driveUrlTyped && (
                drive ? (
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {DRIVE_KINDS[drive.kind].label} link. Students will read it inside the app.
                  </p>
                ) : (
                  <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    This isn&apos;t a Google Drive link. Copy it from Drive with Share &rarr; Copy link.
                  </p>
                )
              )}
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 text-[11px] text-sky-900 dark:text-sky-200 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  In Google Drive, open <strong>Share</strong> and set General access to <strong>Anyone with the link &middot; Viewer</strong>,
                  then <strong>Copy link</strong> and paste it here. Files, Docs, Sheets, Slides and folders all work.
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 1 Summary Notes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>

          {type === 'link' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link *</label>
              <input
                type="url"
                required
                placeholder="https://…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className={inputClass}
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                OneDrive, Dropbox or any web page. Students open it in a new tab. Make sure they have access.
              </span>
            </div>
          )}

          {type === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes *</label>
              <textarea
                rows={7}
                placeholder="Write key points, formulas, definitions…"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={`${inputClass} leading-relaxed`}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
            <input
              type="text"
              placeholder="What's inside? (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] disabled:opacity-60 text-xs font-bold text-white shadow-md shadow-[#087F8C]/20 flex items-center justify-center gap-1.5"
            >
              {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : editing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Share Notes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
