const { getAllTopics } = require('../models/topics.model')
const endpointsData = require('../endpoints.json')

exports.getAllTopics = (req, res, next) => {
    return getAllTopics().then((topics) => {
        res.status(200).send({topics})
    })
}

exports.getAllEndpoints = (req, res) => {
    res.status(200).send(endpointsData)
}