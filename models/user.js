import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  pwHash: {
    type: String,
    required: true
  },
  starEarned: {
    type: Number
  },
  collectionIds: {
    type: [mongoose.ObjectId]
  }
});

const User = mongoose.model('User', userSchema);

export default User;