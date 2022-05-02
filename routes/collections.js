import express from "express"
import Joi from "joi"
import mongoose from "mongoose"

import auth from "../middleware/auth.js"
import Collection from "../models/collection.js"
import User from "../models/user.js"
import Visualization from "../models/visualization.js"

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
  let collection = await Collection
    .findById(req.params.id)
    .select('-_id')
    .populate('visIds')
  if (!collection) {
    return res.status(404).send('Collection not found!')
  }
  collection = collection.toObject()
  collection.id = req.params.id

  res.send(collection)
})

// Update a collection's name or description
router.put('/:id', auth, async (req, res) => {
  // Validate the collection id
  const collection = await Collection.findById(req.params.id)
  if (!collection) {
    return res.status(404).send('Collection not found!')
  }
  // Validate that user is the creator of this collection
  if (req.user._id.toString() !== collection.creatorId.toString()) {
    return res.status(403).send('Permission denied!')
  }

  // Validate and update name and description when included.
  if (req.body.name) {
    let {error, value} = collectionNameSchema.validate(req.body.name)
    if (error) {
      return res.status(400).send('Collection name: ' + error.details[0].message)
    }
    collection.name = req.body.name
  }

  if (req.body.description) {
    let {error, value} = descriptionSchema.validate(req.body.description)
    if (error) {
      return res.status(400).send('Collection description: ' + error.details[0].message)
    }
    collection.description = req.body.description
  }

  await collection.save()
  res.send(collection)  
})

// Add a visualization to a collection's visIds array.
// TODO: Group read and write into a transaction.
router.post('/:id/visIds', auth, async (req, res) => {
  // Validate the collection id
  const collection = await Collection.findById(req.params.id)
  if (!collection) {
    return res.status(404).send('Collection not found!')
  }
  // Validate that user is the creator of this collection
  if (req.user._id.toString() !== collection.creatorId.toString()) {
    return res.status(403).send('Permission denied!')
  }

  // Validate and add visId
  const visualization = await Visualization.findById(req.body.visId)
  if (!visualization) {
    return res.status(404).send('Visualization not found!')
  }
  if (collection.visIds.map(visId => visId.toString()).includes(visualization._id.toString())) {
    return res.status(400).send('visId already in the visIds array of this collection')
  }
  collection.visIds.push(req.body.visId)
  visualization.star += 1

  // Transaction for saving both collection and visualization or neither (all or nothing)
  const session = await mongoose.startSession()
  await session.withTransaction(async () => {
    await collection.save({session: session})
    await visualization.save({session: session})
  })
  session.endSession()

  res.send(collection)
})

export default router