import express from "express"
import Joi from "joi"
import mongoose from "mongoose"

import auth from "../middleware/auth.js"
import Collection from "../models/collection.js"
import User from "../models/user.js"

const router = express.Router()

const collectionNameSchema = Joi.string().required().min(1).max(100)
const descriptionSchema = Joi.string().max(300)

// Create a new collection
router.post('/', auth, async (req, res) => {

  // Validate collection name and description
  let {error, value} = collectionNameSchema.validate(req.body.name)
  if (error) {
    return res.status(400).send('Collection name: ' + error.details[0].message)
  }
  ({error, value} = descriptionSchema.validate(req.body.description))
  if (error) {
    return res.status(400).send('Collection description: ' + error.details[0].message)
  }

  const collection = new Collection({
    name: req.body.name,
    creatorId: req.user._id,
    description: req.body.description,
    numVis: 0,
    numSaved: 1,
    visIds: []
  })

  const user = await User.findById(req.user._id)
  user.collectionIds.push(collection._id)

  // Transaction for saving both collection and user or neither (all or nothing)
  const session = await mongoose.startSession()
  await session.withTransaction(async () => {
    await collection.save({session: session})
    await user.save({session: session})
  })
  session.endSession()

  res.send(collection)
})

// Get information of the collection with given id
router.get('/:id', async (req, res) => {
  let collection = await Collection.findById(req.params.id).select('-_id')
  if (!collection) {
    return res.status(404).send('Collection not found!')
  }
  collection = collection.toObject()
  collection.id = req.params.id

  res.send(collection)
})

export default router