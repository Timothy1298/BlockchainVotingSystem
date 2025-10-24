const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs for KYC
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported file type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

function getPublicFileUrl(req, filename) {
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}/uploads/${encodeURIComponent(filename)}`;
}

module.exports = { upload, getPublicFileUrl, uploadsDir };
