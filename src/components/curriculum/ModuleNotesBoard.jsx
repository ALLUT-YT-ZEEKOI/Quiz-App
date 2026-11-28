import React from 'react';
import { Plus, Inbox, NotebookText, Eye, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { confirmDialog } from '../common/ConfirmDialog';
import { groupNotesBySection } from '../../utils/curriculumSections';
import { NotesList } from './ModuleNotes';
import { CurriculumSection } from './CurriculumSection';

/**
 * A module's study notes grouped by the module's sections (the same sections as its videos and
 * questions). Older notes without a section are listed as "Unsorted" (admin) / "More notes" (students).
 * Admin (editable): add notes to a section, delete, and move unsorted notes into a section.
 */
export const ModuleNotesBoard = ({ subject, module, editable = false, onAdd, onOpen, onDelete, onEdit, onEditSection }) => {
  const { moveNote } = useApp();
  const { groups, unsorted } = groupNotesBySection(module);
  const total = (module.notes || []).length;

  if (!editable && total === 0) {
    return (
      <div className="p-8 sm:p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
        <NotebookText className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No study notes yet</h3>
        <p className="text-xs text-slate-400">Your instructor hasn&apos;t shared notes for this module yet.</p>
      </div>
    );
  }

  const shownGroups = editable ? groups : groups.filter((g) => g.notes.length > 0);

  return (
    <div className="space-y-4">
      {shownGroups.map((g) => (
        <CurriculumSection
          key={g.section.id}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 overflow-hidden"
          headerClassName="bg-white dark:bg-surface-darkCard"
          title={g.section.title}
          summary={`${g.notes.length} ${g.notes.length === 1 ? 'note' : 'notes'}`}
          collapsible={editable}
          badge={
            <span aria-hidden="true" className="w-9 h-9 rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center leading-none shrink-0">
              <span className="text-[7px] font-bold uppercase opacity-80">Sec</span>
              <span className="text-sm font-black">{g.sectionIndex + 1}</span>
            </span>
          }
          actions={editable && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onAdd(g.section.id)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Add Notes
              </button>
              {onEditSection && (
                <button
                  type="button"
                  onClick={() => onEditSection(g.section)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-slate-800"
                  title="Rename section"
                  aria-label={`Rename ${g.section.title}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        >
          <div className="p-3 sm:p-4">
            {g.notes.length > 0 ? (
              <NotesList notes={g.notes} onOpen={onOpen} onDelete={editable ? onDelete : undefined} onEdit={editable ? onEdit : undefined} emptyState={null} />
            ) : (
              <button
                type="button"
                onClick={() => onAdd(g.section.id)}
                className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-400 hover:text-amber-700 hover:border-amber-300"
              >
                + Add notes for {g.section.title}
              </button>
            )}
          </div>
        </CurriculumSection>
      ))}

      {unsorted.length > 0 && (
        <CurriculumSection
          className={`rounded-2xl border overflow-hidden ${
            editable
              ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30'
          }`}
          title={editable ? `Unsorted notes (${unsorted.length})` : 'More notes'}
          summary={editable && 'Added before sections. Put them all in one section here, or choose a section for each one.'}
          collapsible={editable}
          badge={<Inbox aria-hidden="true" className="w-5 h-5 text-amber-600 shrink-0" />}
          actions={editable && groups.length > 0 && (
              <select
                aria-label="Put all unsorted notes in"
                value=""
                onChange={async (e) => {
                  const sectionId = e.target.value;
                  if (!sectionId) return;
                  const title = groups.find((g) => g.section.id === sectionId)?.section.title;
                  const ok = await confirmDialog({
                    title: `Move all ${unsorted.length} notes to ${title}?`,
                    message: 'Students will then find them under that section.',
                    confirmLabel: 'Move all'
                  });
                  if (!ok) return;
                  unsorted.forEach((n) => moveNote(subject.id, module.id, n.id, sectionId));
                }}
                className="ml-auto px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-700 dark:text-slate-200 shrink-0"
              >
                <option value="">Put all {unsorted.length} in…</option>
                {groups.map((g) => (
                  <option key={g.section.id} value={g.section.id}>
                    {g.section.title}
                  </option>
                ))}
              </select>
          )}
        >
          <div className="p-3 sm:p-4">
            {editable ? (
              <ul className="space-y-2">
                {unsorted.map((n) => (
                  <li key={n.id} className="p-2.5 rounded-xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="flex-1 min-w-0 text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpen(n)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#087F8C] hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={`Open ${n.title}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(n)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#087F8C] hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label={`Edit ${n.title}`}
                          title="Edit Notes"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <select
                        aria-label={`Section for ${n.title}`}
                        value=""
                        onChange={(e) => e.target.value && moveNote(subject.id, module.id, n.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <option value="">Put in section…</option>
                        {groups.map((g) => (
                          <option key={g.section.id} value={g.section.id}>
                            {g.section.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <NotesList notes={unsorted} onOpen={onOpen} emptyState={null} />
            )}
          </div>
        </CurriculumSection>
      )}
    </div>
  );
};

export default ModuleNotesBoard;
