const express = require('express');
const router = express.Router();
const { upload, getPublicFileUrl } = require('../middleware/upload');
const { mandatory } = require('../middleware/auth');

// Upload a document and return a public URL. Requires authentication.
router.post('/document', mandatory, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = getPublicFileUrl(req, req.file.filename);
    return res.json({ success: true, url });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
