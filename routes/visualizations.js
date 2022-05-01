import express from "express"
import Joi from "joi"

import auth from '../middleware/auth.js'
import Visualization from "../models/visualization.js"

const router = express.Router()

const visualizationNameSchema = Joi.string().required().min(1).max(100)
const filenameSchema = Joi.string().required().min(1).max(100)

// Create a new visualization
router.post('/', auth, async (req, res) => {
  // Validate visualization name and file names
  let {error, value} = visualizationNameSchema.validate(req.body.name)
  if (error) {
    return res.status(400).send('Name: ' + error.details[0].message)
  }
  req.body.files.forEach(({filename, content}) => {
    ({error, value} = filenameSchema.validate(filename))
    if (error) {
      return res.status(400).send('Filename: ' + error.details[0].message)
    }
  })

  // Save visualization
  const visualization = new Visualization({
    name: req.body.name,
    authorId: req.user._id,
    star: 0,
    files: req.body.files
  })
  await visualization.save()

  // Send back info of visualization
  res.send({
    id: visualization._id,
    name: visualization.name,
    authorId: visualization.authorId,
    star: visualization.star
  })
})

// Get info of a visualization with given id
router.get('/:id', async (req, res) => {
  // Find the visualization
  let visualization = await Visualization.findById(req.params.id)
  if (!visualization) {
    return res.status(404).send('Visualization not found!')
  }

  // Send it to the client
  visualization = visualization.toObject()
  res.send({
    id: visualization._id,
    name: visualization.name,
    authorId: visualization.authorId,
    star: visualization.star,
    files: visualization.files
  })
})

// Get visualizations matching some query params.
router.get('/', async (req, res) => {
  const visualizations = await Visualization.find(req.query)
  res.send(visualizations)
})

export default router