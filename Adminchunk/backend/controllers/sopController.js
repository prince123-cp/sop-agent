import fs from "fs";
import * as pdfParseLib from "pdf-parse";
import mongoose from "mongoose";
import { Sop } from "../models/Sop.js";
import { SopChunk } from "../models/SopChunk.js";

const getUploadErrorResponse = (err) => {
  const msg = (err?.message || "").toLowerCase();

  if (msg.includes("pdf") || msg.includes("parse") || msg.includes("extract")) {
    return {
      status: 400,
      message: "PDF ko read nahi kiya ja saka. Valid PDF file upload karke dobara try karein.",
    };
  }

  if (msg.includes("file too large") || msg.includes("limit_file_size")) {
    return {
      status: 400,
      message: "PDF size limit exceed ho gayi. Max size 10MB hai.",
    };
  }

  if (msg.includes("only pdf files are allowed")) {
    return {
      status: 400,
      message: "Sirf PDF file upload kar sakte hain.",
    };
  }

  if (msg.includes("validation failed")) {
    return {
      status: 400,
      message: "Form data sahi nahi hai. Name, department aur version check karein.",
    };
  }

  return {
    status: 500,
    message: "Server error aaya hai. 1 minute baad dobara try karein.",
  };
};

const extractPdfText = async (dataBuffer) => {
  const legacyFn =
    typeof pdfParseLib.default === "function"
      ? pdfParseLib.default
      : typeof pdfParseLib.pdfParse === "function"
      ? pdfParseLib.pdfParse
      : null;

  if (legacyFn) {
    const data = await legacyFn(dataBuffer);
    return data?.text || "";
  }

  if (typeof pdfParseLib.PDFParse === "function") {
    const parser = new pdfParseLib.PDFParse({ data: dataBuffer });
    try {
      const data = await parser.getText();
      return data.text || "";
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Unsupported pdf-parse export shape in runtime");
};

const uploadSop = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connect nahi hai. Thodi der baad try karein." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF file receive nahi hui." });
    }

    const { name, department, version } = req.body;
    if (!name || !department || !version) {
      return res.status(400).json({
        message: "Required fields: name, department, version, and pdf file.",
      });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const extractedText = await extractPdfText(dataBuffer);

    const sop = new Sop({
      name,
      department,
      version,
      filePath: req.file.path,
      extractedText,
      uploadedBy: 'admin'
    });

    await sop.save();

    res.status(201).json({ message: "SOP upload ho gayi.", sopId: sop._id });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    const { status, message } = getUploadErrorResponse(err);
    res.status(status).json({ message });
  }
};

const getSopList = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB not connected. Please try again." });
    }

    const sops = await Sop.find({});
    res.json(sops);
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    res.status(500).json({ message: error.message || 'Error fetching SOPs' });
  }
};

const updateSop = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB not connected. Please try again." });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid SOP id." });
    }

    const { name, department, version } = req.body;
    if (!name || !department || !version) {
      return res.status(400).json({
        message: "name, department aur version teeno required hain.",
      });
    }

    const updated = await Sop.findByIdAndUpdate(
      id,
      { name, department, version },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "SOP not found." });
    }

    return res.json({ message: "SOP updated successfully.", sop: updated });
  } catch (error) {
    console.error("Error updating SOP:", error);
    return res.status(500).json({ message: error.message || "Error updating SOP." });
  }
};

const deleteSop = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB not connected. Please try again." });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid SOP id." });
    }

    const sop = await Sop.findById(id);
    if (!sop) {
      return res.status(404).json({ message: "SOP not found." });
    }

    await SopChunk.deleteMany({ sopId: sop._id });
    await Sop.findByIdAndDelete(sop._id);

    if (sop.filePath && fs.existsSync(sop.filePath)) {
      fs.unlinkSync(sop.filePath);
    }

    return res.json({ message: "SOP deleted successfully." });
  } catch (error) {
    console.error("Error deleting SOP:", error);
    return res.status(500).json({ message: error.message || "Error deleting SOP." });
  }
};

export { uploadSop, getSopList, updateSop, deleteSop };


