const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");
const { updateArticle } = require("../models/topics.model");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe('ALL non-existent paths', () => {
  it('404: return a custom error message when the path is not found', () => {
    return request(app)
    .get('/api/nonexistentpath')
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Not found')
    })
  })
})

describe("GET/api/topics/", () => {
  it("200: should return all topics from the database in an array format", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("GET/api/", () => {
  it("200: returns an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpointsData);
      });
  });
});

describe("GET /api/articles/:articles_id", () => {
  it("200: returns an article based on the article id passed in by user", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it('400: returns a psql error message if an invalid article id is passed', () => {
    return request(app)
    .get('/api/articles/notnumber')
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Invalid request')
    })
  })
  it('404: returns a custom error message if article id does not exist', () => {
    return request(app)
    .get('/api/articles/20')
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Not found')
    })
  })
});

describe('GET/api/articles', () => {
  it('200: return an articles array sorted by date in descending order', () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({body}) => {
      const {articles} = body
      expect(articles).toBeSortedBy('created_at', {descending: true})
    })
  })
  it('200: returns article objects with the correct properties', () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({body}) => {
      const {articles} = body
      expect(articles).toHaveLength(13)
      articles.forEach(article => {
        expect(article).toHaveProperty('author', expect.any(String))
        expect(article).toHaveProperty('title', expect.any(String))
        expect(article).toHaveProperty('article_id', expect.any(Number))
        expect(article).toHaveProperty('topic', expect.any(String))
        expect(article).toHaveProperty('created_at', expect.any(String))
        expect(article).toHaveProperty('votes', expect.any(Number))
        expect(article).toHaveProperty('article_img_url', expect.any(String))
        expect(article).toHaveProperty('comment_count', expect.any(Number))
      })
    })
  })
  it('200: should not return any articles with a body property', () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({body}) => {
      const {articles} = body
      expect(articles).toHaveLength(13)
      articles.forEach(article => {
        expect(article).not.toHaveProperty('body', expect.any(String))
      })
    })
  })
})

describe('GET/api/articles/:article_id/comments', () => {
  it('200: returns an array of comments for article id requested by user sorted by newest comment first', () => {
    return request(app)
    .get('/api/articles/1/comments')
    .expect(200)
    .then(({body}) => {
      const {comments} = body
      expect(comments).toBeSortedBy('created_at', {descending: true})
      expect(comments).toHaveLength(11)
      
      comments.forEach(comment => {
        expect(comment).toHaveProperty('votes', expect.any(Number))
        expect(comment).toHaveProperty('body', expect.any(String))
        expect(comment).toHaveProperty('author', expect.any(String))
        expect(comment).toHaveProperty('comment_id', expect.any(Number))
        expect(comment).toHaveProperty('article_id', expect.any(Number))
        expect(comment).toHaveProperty('created_at', expect.any(String))
      })
    })
  })
  it('200: returns an empty array if category exists but there are no comments in that article', () => {
    return request(app)
    .get('/api/articles/2/comments')
    .expect(200)
    .then(({body}) => {
      expect(body.comments).toHaveLength(0)
    })
  })
  it('400: returns a psql error message if an invalid article id is requested', () => {
    return request(app)
    .get('/api/articles/notnumber/comments')
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Invalid request')
    })
  })
  it('404: returns a custom error if article_id does not exist', () => {
    return request(app)
    .get('/api/articles/30/comments')
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Article not found')
    })
  })
})

describe('POST/api/articles/:article_id/comments', () => {
  it('201: returns a new comment based on article with matching article_id', () => {
    const newComment = {
      body: "Meh...waste of time",
      username: "butter_bridge",
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(201)
    .then(({body}) => {
      const {comment} = body
      expect(comment).toHaveProperty('author', expect.any(String))
      expect(comment).toHaveProperty('body', expect.any(String))
      expect(comment).toMatchObject({
        comment_id: 19,
        body: "Meh...waste of time",
        votes: 0,
        author: "butter_bridge",
        article_id: 1,
      })
    })
  })
  it('201: returns a new comment ignoring any extra properties user tries to change when posting', () => {
    const newComment = {
      body: "Meh...waste of time",
      username: "butter_bridge",
      created_at: 1,
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(201)
    .then(({body}) => {
      const {comment} = body
      expect(comment.created_at).not.toBe(1)
    })
  })
  it('400: returns a psql error message if an invalid article id is requested', () => {
    const newComment = {
      body: "Meh...waste of time",
      username: "butter_bridge",
    }
    return request(app)
    .post('/api/articles/notnumber/comments')
    .send(newComment)
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Invalid request')
    })
  })
  it('400: returns error message when user posts a comment with missing properties', () => {
    const newComment = {
      body: "butter_bridge",
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Bad Request')
    })
  })
  it('404: returns a custom error if article_id is valid but does not exist', () => {
    const newComment = {
      body: "Meh...waste of time",
      username: "butter_bridge",
    }
    return request(app)
    .post('/api/articles/30/comments')
    .send(newComment)
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Article not found')
    })
  })
})

describe('PATCH/api/articles/:article_id', () => {
  it('200: return updated vote property of an article based on article id', () => {
    const newVote = {inc_votes: 1}
    return request(app)
    .patch('/api/articles/1')
    .send(newVote)
    .expect(200)
    .then(({body}) => {
      const {updatedArticle} = body
      expect(updatedArticle.votes).toBe(1)
    })
  })
  it('200: return updated vote property if minus votes are requested', () => {
    const minusVote = {inc_votes: -2}
    return request(app)
    .patch('/api/articles/1')
    .send(minusVote)
    .expect(200)
    .then(({body}) => {
      const {updatedArticle} = body
      expect(updatedArticle.votes).toBe(-2)
    })
  })
  it('400: returns a psql error message if an invalid article id is requested', () => {
    const newVote = {inc_votes: 1}
    return request(app)
    .patch('/api/articles/notnumber')
    .send(newVote)
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Invalid request')
    })
  })
  it('400: returns an error message if data input for updated property is invalid', () => {
    const newVote = {inc_votes: 'twenty'}
    return request(app)
    .patch('/api/articles/2')
    .send(newVote)
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Invalid request')
    })
  })
  it('400: returns an error message if request is missing properties', () => {
    const testPatch = {created_at: 2}
    return request(app)
    .patch('/api/articles/1')
    .send(testPatch)
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Bad request')
    })
  })
  it('404: returns an error message if article id is valid but does not exist', () => {
    const newVote = {inc_votes: 1}
    return request(app)
    .patch('/api/articles/25')
    .send(newVote)
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Article not found')
    })
  })
})

describe('GET/api/users', () => {
  it('200: return all users with the correct properties', () => {
    return request(app)
    .get('/api/users')
    .expect(200)
    .then(({body}) => {
      const {users} = body
      expect(users).toHaveLength(4)
      users.forEach(user => {
        expect(user).toHaveProperty('username', expect.any(String))
        expect(user).toHaveProperty('name', expect.any(String))
        expect(user).toHaveProperty('avatar_url', expect.any(String))
      })
    })
  })
})