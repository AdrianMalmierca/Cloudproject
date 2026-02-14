import request from "supertest";
import { app } from "../app";
import db from "../db";
import { Movie } from "../db";

describe("Movies API", () => {
  beforeAll(async () => {
    await db.initialize();
  });

  beforeEach(async () => {
    await db.instance.sync({ force: true });
  });
  
  describe("GET /movies", () => {
    it("should return empty list when no movies exist", async () => {
      const res = await request(app)
        .get("/movies")
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it("should paginate movies", async () => {
        for (let i = 1; i <= 15; i++) {
            await Movie.create({
                title: `Movie ${i}`,
                genre: "Drama",
                duration: 100 + i,
            });
        }

      const res = await request(app)
        .get("/movies?page=2&limit=5")
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body.data.length).toBe(5);
      expect(res.body.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });
  });

  describe("GET /movies/:id", () => {
    it("should return movie by id", async () => {
      const movie = await Movie.create({title: "Test Movie",
                                        genre: "Action",
                                        duration: 120,
                                        });


      const res = await request(app)
        .get(`/movies/${movie.id}`)
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body.title).toBe("Test Movie");
    });

    it("should return 404 if movie does not exist", async () => {
      await request(app)
        .get("/movies/999")
        .set("Accept", "application/json")
        .expect(404);
    });
  });
});
