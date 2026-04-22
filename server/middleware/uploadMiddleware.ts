import multer from 'multer';

// Use memory storage since Cloud Functions/Run environment uses ephemeral local storage.
// We will upload the buffer directly to Cloudinary.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});
