const express = require("express")
const { getAllTopics, getAllEndpoints, getArticle, getAllArticles, getComments, postComment, patchArticle, getAllUsers } = require('./controllers/topics.controller')
const { handlePsqlErrors, handleCustomErrors, handleServerErrors} = require('./errors/errors')

const app = express()

app.use(express.json())

app.get('/api/topics', getAllTopics)

app.get('/api', getAllEndpoints)

app.get('/api/articles/:article_id', getArticle)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id/comments', getComments)

app.get('/api/users', getAllUsers)

app.post('/api/articles/:article_id/comments', postComment)

app.patch('/api/articles/:article_id', patchArticle)

app.all('*', (_, res) => {
  res.status(404).send({ msg: 'Not found'})
})

app.use(handlePsqlErrors)

app.use(handleCustomErrors)

app.use(handleServerErrors)


module.exports = app

