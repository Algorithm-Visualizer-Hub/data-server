import express from "express"
import Joi from "joi"
import bcrypt from "bcrypt"

import User from "../models/user.js"

// validation schemas
const usernameSchema = Joi.string().required().min(5).max(50)
export const emailSchema = Joi.string().required().email().min(5).max(100)
export const passwordSchema = Joi.string().required().min(5).max(100)

const router = express.Router()

// Register new user
router.post('/', async (req, res) => {

  // Validate username, email, and password
  let {error, value} = usernameSchema.validate(req.body.username)
  if (error) {
    return res.status(400).send('username: ' + error.details[0].message)
  }

  ({error, value} = emailSchema.validate(req.body.email))
  if (error) {
    return res.status(400).send('email: ' + error.details[0].message)
  }
  let user = await User.findOne({email: req.body.email})
  if (user) {
    return res.status(400).send('Email already registered!')
  }

  ({error, value} = passwordSchema.validate(req.body.password))
  if (error) {
    return res.status(400).send('password: ' + error.details[0].message)
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const pwHash = await bcrypt.hash(req.body.password, salt)
  
  user = new User({
    username: req.body.username,
    email: req.body.email,
    pwHash: pwHash,
    starEarned: 0,
    collectionIds: []
  })
  await user.save()

  // Generate JWT
  const token = user.generateAuthToken()
  
  user = {
    id: user._id,
    username: req.body.username,
    email: req.body.email,
    token: token
  }
  res.send(user)
})

// Get information of the user with given id
router.get('/:id', async (req, res) => {
  
  let user = await User.findById(req.params.id).select('-pwHash -_id')
  if (!user) {
    res.status(404).send('User not found!')
  }
  user = user.toObject()
  user.id = req.params.id

  res.send(user)
})

export default router