import express from 'express';
import upload from '../middlewares/upload';

const router = express.Router();

router.post('/upload-test', upload.single('file'), async (req, res) => {
  try {
    console.log('File received:', req.file);

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return
    }

    res.status(200).json({
      message: 'Uploaded successfully',
      url: req.file.path, // Cloudinary URL
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
    return;
  }
});

export default router;
