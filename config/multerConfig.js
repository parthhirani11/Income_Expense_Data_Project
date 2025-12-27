// import multer from "multer";
// import fs from "fs";
// import path from "path";

// const uploadDir = path.join(process.cwd(), "uploads");

// // Auto-create uploads folder
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, unique + path.extname(file.originalname));
//     }
// });

// export const upload = multer({ storage });

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + cleanName);
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, true); // allow all files
};

const upload = multer({ storage, fileFilter });

export default upload;

