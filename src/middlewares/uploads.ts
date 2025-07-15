import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const profileDir = path.join(__dirname, "../../uploads/profiles");
const blogDir = path.join(__dirname, "../../uploads/blogs");
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, profileDir);
    } else if (file.fieldname === "image") {
      cb(null, blogDir);
    } else {
      cb(null, path.join(__dirname, "../../uploads/others"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });