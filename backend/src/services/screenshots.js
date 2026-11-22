import { getScreenshotsBucket } from '../db.js';

// Payment screenshots arrive inside subscription requests as base64 images. They are moved to
// GridFS and replaced with a short reference ("stored:<subscription id>"), so the subscription
// list the admin downloads stays small however many requests there are.

export const STORED_PREFIX = 'stored:';
const MAX_BYTES = 6 * 1024 * 1024;
const DATA_URL = /^data:(image\/[\w.+-]+);base64,(.+)$/s;

/** Returns the item with its screenshot stored separately (if it carried an image). */
export const externalizeScreenshot = async (key, item) => {
  const match = typeof item?.screenshot === 'string' ? item.screenshot.match(DATA_URL) : null;
  if (!match) return item;
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_BYTES) return { ...item, screenshot: '' };

  const bucket = getScreenshotsBucket();
  const old = await bucket.find({ filename: key }).toArray();
  await Promise.all(old.map((f) => bucket.delete(f._id)));
  await new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(key, { metadata: { contentType: match[1] } });
    upload.once('finish', resolve).once('error', reject);
    upload.end(buffer);
  });
  return { ...item, screenshot: STORED_PREFIX + key };
};
