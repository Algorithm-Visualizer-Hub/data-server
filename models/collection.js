import mongoose from "mongoose"


const collectionSchema = new mongoose.Schema({
  name: String,
  creatorId: {
    type: mongoose.ObjectId,
    ref: 'User'
  },
  description: String,
  numSaved: Number,
  visIds: {
    type: [mongoose.ObjectId],
    ref: 'Visualization'
  }
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection