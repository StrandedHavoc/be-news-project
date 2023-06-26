const express = require('express')
const { getAllTopics } = require('./controllers/topics.controller')


const app = express()

app.get('/api/topics', getAllTopics)


app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('Server Error!');
  });

module.exports = {app}

