import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.ObjectId,
    required: true
  },
  description: {
    type: String
  },
  numVis: {
    type: Number,
    default: 0
  },
  numSaved: {
    type: Number,
    default: 0
  },
  visIds: {
    type: [mongoose.ObjectId]
  }
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;