const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");

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
  it('404: returns a custom error message if article id does not exist', () => {
    return request(app)
    .get('/api/articles/20')
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('Not found')
    })
  })
  it('400: returns a psql error message if an invalid article id is passed', () => {
    return request(app)
    .get('/api/articles/notnumber')
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe('Invalid request')
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
  it('200: return articles with no properties named body', () => {
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
