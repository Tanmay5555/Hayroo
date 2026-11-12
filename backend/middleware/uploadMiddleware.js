import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = fs.existsSync(path.join(process.cwd(), 'backend'))
  ? path.join(process.cwd(), 'backend', 'uploads')
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const ALLOWED_EXT = /^\.(jpe?g|png|webp)$/i;
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const fileFilter = (req, file, cb) => {
  const ext = ALLOWED_EXT.test(path.extname(file.originalname));
  const mime = ALLOWED_MIMES.has(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only raster image files (jpg, jpeg, png, webp) are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});
