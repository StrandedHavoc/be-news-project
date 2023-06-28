const request = require("supertest");
const { app } = require("../app");
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

