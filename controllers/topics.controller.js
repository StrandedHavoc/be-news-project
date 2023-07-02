const { getAllTopics, selectArticleById, selectAllArticles, selectComments, insertComment, updateArticle } = require('../models/topics.model')
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
        const comments = resolvedPromises[0]
        res.status(200).send({comments})
    })
    .catch((err) => {
        next(err)
    })
}

exports.postComment = (req, res, next) => {
    const { article_id } = req.params
    const { username, body } = req.body

    const promises = [insertComment(username, body, article_id)]

    if(article_id) {
        promises.push(checkArticleExists(article_id))
    }

    Promise.all(promises)
    .then((resolvedPromises) => {
        const comment = resolvedPromises[0]
        res.status(201).send({comment})
    })
    .catch((err) => {
        next(err)
    })
}

exports.patchArticle = (req, res, next) => {
    const {article_id} = req.params
    const {inc_votes} = req.body

    const promises = [updateArticle(inc_votes, article_id)]

    if (article_id) {
        promises.push(checkArticleExists(article_id))
    }

    Promise.all(promises)
    .then((resolvedPromises) => {
        const updatedArticle = resolvedPromises[0]
        res.status(200).send({updatedArticle})
    })
    .catch(next)
}