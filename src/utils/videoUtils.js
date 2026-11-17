/**
 * Video Utilities for CohesionTech Learning Suite
 * Automatically sanitizes and transforms raw YouTube / Vimeo links into playable embed URLs.
 */

export function extractYouTubeVideoId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // 1. youtu.be/<id>
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }

  // 2. youtube.com/watch?v=<id>
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // 3. youtube.com/embed/<id>
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  // 4. youtube.com/shorts/<id> or youtube.com/live/<id>
  const altMatch = url.match(/youtube\.com\/(?:shorts|live)\/([a-zA-Z0-9_-]+)/i);
  if (altMatch && altMatch[1]) {
    return altMatch[1];
  }

  return null;
}

export function formatEmbedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();

  // YouTube transformation
  const ytId = extractYouTubeVideoId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}`;
  }

  // Vimeo transformation: https://vimeo.com/<id>
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
}

export function isEmbeddableVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  return Boolean(
    extractYouTubeVideoId(rawUrl) ||
    rawUrl.includes('youtube.com') ||
    rawUrl.includes('youtu.be') ||
    rawUrl.includes('vimeo.com') ||
    rawUrl.endsWith('.mp4') ||
    rawUrl.endsWith('.webm')
  );
}

export function getYouTubeThumbnail(rawUrl) {
  const ytId = extractYouTubeVideoId(rawUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return null;
}
