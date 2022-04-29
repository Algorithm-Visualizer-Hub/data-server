import Router from "express"
import bcrypt from 'bcrypt'

import { emailSchema, passwordSchema } from "./users.js"
import User from "../models/user.js"

const router = Router()

router.post('/', async (req, res) => {
  
  // Validate email and password 
  let {error, value} = emailSchema.validate(req.body.email)
  if (error) {
    return res.status(400).send('Email: ' + error.details[0].message)
  }
  let user = await User.findOne({email: req.body.email})
  if (!user) {
    return res.status(400).send('User does not exist!')
  }

  ({error, value} = passwordSchema.validate(req.body.password))
  if (error) {
    return res.status(400).send('Password: ' + error.details[0].message)
  }
  const isValidPassword = await bcrypt.compare(req.body.password, user.pwHash)
  if (!isValidPassword) {
    return res.status(401).send('Invalid password!')
  }

  // Send back user info and token
  const token = user.generateAuthToken()
  user = user.toObject()
  user = {
    id: user._id,
    username: user.username,
    email: user.email,
    starEarned: user.starEarned,
    collectionIds: user.collectionIds,
    token: token
  }

  res.send(user)
})

export default router