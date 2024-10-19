import * as crypto from 'crypto';
import * as path from 'path';
// For creating unique filenames to avoid overwriting existing files
export const generateUniqueFilename = (originalName) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // const timestamp = new Date().toISOString().replace(/:/g, '-');
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    const extension = path.extname(originalName);
    return `${timestamp}-${random}${extension}`;
}