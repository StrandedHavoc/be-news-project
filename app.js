const express = require('express')
const { getAllTopics } = require('./controllers/topics.controller')
const endpointsData = require('./endpoints.json')

const app = express()

app.get('/api/topics', getAllTopics)

app.get('/api', (req, res) => {
  res.status(200).send(endpointsData)
})

module.exports = {app}

