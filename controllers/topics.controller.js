const { getAllTopics, selectArticleById, selectAllArticles, selectComments } = require('../models/topics.model')
const {checkArticleExists} = require('../db/seeds/utils')
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

exports.getComments = (req, res, next) => {
    const {article_id} = req.params

    const promises = [selectComments(article_id)]

    if(article_id) {
        promises.push(checkArticleExists(article_id))
    }

    Promise.all(promises)
    .then((resolvedPromises) => {
        console.log('inside resolved promises')
        const comments = resolvedPromises[0]
        res.status(200).send({comments})
    })
    .catch(next)
}