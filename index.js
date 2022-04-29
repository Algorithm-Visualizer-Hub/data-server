import 'dotenv/config'
import mongoose from "mongoose"
import express from 'express'
import cors from 'cors'

import users from './routes/users.js'
import collections from './routes/collections.js'
import visualizations from './routes/visualizations.js'
import auth from './routes/auth.js'

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to database!'))
  .catch(error => console.error('Failed to connect to database: ', error))

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/users', users)
app.use('/api/collections', collections)
app.use('/api/visualizations', visualizations)
app.use('/api/auth', auth)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))