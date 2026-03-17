import mongoose from 'mongoose';

const sopChunkSchema = new mongoose.Schema({
  sopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sop',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
  section: {
    type: String,
    default: null,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SopChunk = mongoose.model('SopChunk', sopChunkSchema);
export { SopChunk };
