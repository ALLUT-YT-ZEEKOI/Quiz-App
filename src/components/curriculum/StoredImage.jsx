import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

// Payment screenshots saved on the server are referenced as "stored:<subscription id>".
// They need the signed-in user's token, so they are downloaded and shown from memory.
const STORED_PREFIX = 'stored:';
const cache = new Map(); // id -> Promise<object URL>

const resolveStored = (id) => {
  if (!cache.has(id)) {
    const p = api(`/files/screenshots/${encodeURIComponent(id)}`, { responseType: 'blob' }).then((blob) => URL.createObjectURL(blob));
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return cache.get(id);
};

export const useStoredImage = (src) => {
  const isStored = typeof src === 'string' && src.startsWith(STORED_PREFIX);
  const [url, setUrl] = useState(isStored ? null : src);

  useEffect(() => {
    if (!isStored) {
      setUrl(src);
      return undefined;
    }
    let alive = true;
    setUrl(null);
    resolveStored(src.slice(STORED_PREFIX.length))
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setUrl(null));
    return () => {
      alive = false;
    };
  }, [src, isStored]);

  return url;
};

/** <img> that also understands server-stored screenshots. */
export const StoredImage = ({ src, alt = '', className = '', ...rest }) => {
  const url = useStoredImage(src);
  if (!url) return <div className={`${className} animate-pulse bg-slate-700/40`} aria-label={alt} />;
  return <img src={url} alt={alt} className={className} {...rest} />;
};
