const db = require("../db/connection");

exports.getAllTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.selectAllArticles = () => {
    const query = 'SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC;'
    
    return db.query(query).then(({rows}) => {
        return rows;
    })
}

exports.selectComments = (article_id) => {
  const query = 'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at desc;'
  return db.query(query, [article_id]).then(({rows}) => {
    return rows
  })
}

exports.insertComment = (author, body, article_id) => {  
  if (!author || !body) {
    return Promise.reject({status: 400, msg: 'Bad Request'})
  }

  return db
  .query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`, [author, body, article_id])
  .then(({rows}) => {
    return rows[0]
  })
}

exports.updateArticle = (vote, id) => {
  if (!vote) return Promise.reject({status: 400, msg: 'Bad request'})

  return db
  .query(`UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *`, [vote, id])
  .then(({rows}) => {
    return rows[0]
  })
}