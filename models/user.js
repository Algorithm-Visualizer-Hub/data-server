import mongoose from "mongoose"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  pwHash: String,
  starEarned: Number,
  collectionIds: {
    type: [mongoose.ObjectId],
    ref: 'Collection'
  }
})

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({_id: this._id}, process.env.jwtPrivateKey)
  return token
}

const User = mongoose.model('User', userSchema)


export default User