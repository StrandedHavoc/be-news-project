const express = require('express')
const { getAllTopics, getAllEndpoints } = require('./controllers/topics.controller')

const app = express()

app.get('/api/topics', getAllTopics)

app.get('/api', getAllEndpoints)

module.exports = {app}

