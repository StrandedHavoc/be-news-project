exports.handleCustomErrors = (err, req, res, next) => {
    if (err.msg) {
        res.status(err.status).send({msg: err.msg})
    } else next(err)
}

exports.handlePsqlErrors = (err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg: 'Invalid request'})
    } 
    if (err.code === '23503') {
        res.status(404).send({msg: 'Article not found'})
    }
     else next(err)
    
}

exports.handleServerErrors = (err, req, res, next) => {
    console.log(err)
    res.status(500).send({msg: 'Server Error'})
}