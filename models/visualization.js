import mongoose from "mongoose";

const visualizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.ObjectId,
    required: true
  },
  star: {
    type: Number
  },
  files: {
    type: [String]
  }
});

const Visualization = mongoose.model('Visualization', visualizationSchema);

export default Visualization;