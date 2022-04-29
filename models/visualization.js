import mongoose from "mongoose"


const visualizationSchema = new mongoose.Schema({
  name: String,
  authorId: {
    type: mongoose.ObjectId,
    ref: 'User'
  },
  star: Number,
  files: [{filename: String, content: String}]
})

const Visualization = mongoose.model('Visualization', visualizationSchema)

export default Visualization