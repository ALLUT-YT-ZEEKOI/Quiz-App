// Google Drive / Google Docs links for study notes.
//
// Admins paste the normal "Share" link; this works out what it points to and the URL that shows
// it inside the app (Google's preview page, which can be embedded in an iframe). The file must be
// shared as "Anyone with the link: Viewer" for students to see it.

const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com']);

export const DRIVE_KINDS = {
  file: { label: 'Drive File' },
  doc: { label: 'Google Doc' },
  sheet: { label: 'Google Sheet' },
  slides: { label: 'Google Slides' },
  folder: { label: 'Drive Folder' }
};

const ID = '([a-zA-Z0-9_-]{10,})';

/**
 * Reads a Google Drive / Docs link. Returns null when it is not one we can show.
 * { kind: 'file'|'doc'|'sheet'|'slides'|'folder', id, previewUrl, openUrl }
 */
export const parseDriveLink = (raw) => {
  let url;
  try {
    url = new URL(String(raw || '').trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !DRIVE_HOSTS.has(url.hostname)) return null;

  const path = url.pathname;
  const resourceKey = url.searchParams.get('resourcekey');
  const rk = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : '';
  let m;

  if (url.hostname === 'docs.google.com') {
    const docTypes = [
      ['document', 'doc'],
      ['spreadsheets', 'sheet'],
      ['presentation', 'slides']
    ];
    for (const [segment, kind] of docTypes) {
      m = path.match(new RegExp(`^/${segment}/(?:u/\\d+/)?d/${ID}`));
      if (m) {
        const base = `https://docs.google.com/${segment}/d/${m[1]}`;
        return { kind, id: m[1], previewUrl: `${base}/preview${rk}`, openUrl: url.href };
      }
    }
    return null;
  }

  // drive.google.com
  m = path.match(new RegExp(`/file/(?:u/\\d+/)?d/${ID}`));
  if (m) {
    return { kind: 'file', id: m[1], previewUrl: `https://drive.google.com/file/d/${m[1]}/preview${rk}`, openUrl: url.href };
  }
  m = path.match(new RegExp(`/folders/${ID}`));
  if (m) {
    return {
      kind: 'folder',
      id: m[1],
      previewUrl: `https://drive.google.com/embeddedfolderview?id=${m[1]}${resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : ''}#list`,
      openUrl: url.href
    };
  }
  const idParam = url.searchParams.get('id');
  if ((path === '/open' || path === '/uc') && idParam && new RegExp(`^${ID}$`).test(idParam)) {
    return { kind: 'file', id: idParam, previewUrl: `https://drive.google.com/file/d/${idParam}/preview${rk}`, openUrl: url.href };
  }
  return null;
};

/** True for a link note that points to Google Drive. */
export const isDriveNote = (note) => note?.type === 'link' && Boolean(parseDriveLink(note.url));
