import mongoose from 'mongoose';

const sopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      default: 'admin', // Placeholder for admin user
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    bufferCommands: false,
  }
);

const Sop = mongoose.model('Sop', sopSchema);
export { Sop };
