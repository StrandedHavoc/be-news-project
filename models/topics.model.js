const db = require('../db/connection')
const fs = require('fs')

exports.getAllTopics = () => {   
    return db.query('SELECT * FROM topics').then(({rows}) => {
        return rows
    })
}

