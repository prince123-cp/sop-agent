import express from "express";
import multer from "multer";
import { uploadSop, getSopList } from "../controllers/sop.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/sops",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  }
});

router.post("/upload", upload.single("pdf"), uploadSop);
router.get("/list", getSopList);

export default router;
