const { getAllTopics, selectArticleById, selectAllArticles } = require('../models/topics.model')
const endpointsData = require('../endpoints.json')

exports.getAllTopics = (req, res, next) => {
    return getAllTopics().then((topics) => {
        res.status(200).send({topics})
    })
}

exports.getAllEndpoints = (req, res) => {
    res.status(200).send(endpointsData)
}

exports.getArticle = (req, res, next) => {
    const { article_id } = req.params
    selectArticleById(article_id)
    .then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getAllArticles = (req, res, next) => {
    selectAllArticles()
    .then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => {
        next(err)
    })
}