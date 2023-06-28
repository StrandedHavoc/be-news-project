const express = require('express')
const { getAllTopics, getAllEndpoints, getArticle } = require('./controllers/topics.controller')
const { handlePsqlErrors, handleCustomErrors } = require('./errors/errors')

const app = express()

app.get('/api/topics', getAllTopics)

app.get('/api', getAllEndpoints)

app.get('/api/articles/:article_id', getArticle)

app.all('*', (_, res) => {
  res.status(404).send({ msg: 'Not found'})
})

app.use(handlePsqlErrors)

app.use(handleCustomErrors)


module.exports = {app}

