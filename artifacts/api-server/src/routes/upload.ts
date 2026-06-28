import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

import fs from "fs";

const router = Router();

const getUploadsDir = () => {
  let uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    return uploadsDir;
  } catch (e) {
    uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    return uploadsDir;
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadsDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
  });
});

export default router;
