import request from "supertest";
import { app } from "../app";
import db from "../db";
import { Movie, Rating, User } from "../db";
import { generateApiKey } from "../auth";
import { UserModel } from "../models/user";

describe("Ratings API", () => {
  let apiKey: string;
  let userId: number;
  let movieId: number;

  beforeAll(async () => {
    await db.initialize();
  });

  beforeEach(async () => {
    await db.instance.sync({ force: true });

    const api = generateApiKey();

    const user = await UserModel.create({
    username: "test",
    email: "test@test.com",
    apiKey: api,
    });


    apiKey = api;
    userId = user.id;

    const movie = await Movie.create({title: "Test Movie",
                                      genre: "Action",
                                      duration: 120,
                                    });

    movieId = movie.id;
  });

  it("should create rating", async () => {
    const res = await request(app)
      .post(`/movies/${movieId}/ratings`)
      .set("Accept", "application/json")
      .set("x-api-key", apiKey)
      .send({ rating: 4, comment: "Great movie" })
      .expect(201);

    expect(res.headers.location).toBe(
      `/movies/${movieId}/ratings/${res.body.id}`
    );
    expect(res.body).toHaveProperty("createdAt");
  });

  it("should return 409 if movie already rated", async () => {
    await request(app)
      .post(`/movies/${movieId}/ratings`)
      .set("Accept", "application/json")
      .set("x-api-key", apiKey)
      .send({ rating: 5 });

    await request(app)
      .post(`/movies/${movieId}/ratings`)
      .set("Accept", "application/json")
      .set("x-api-key", apiKey)
      .send({ rating: 3 })
      .expect(409);
  });

  it("should return 422 for invalid rating", async () => {
    await request(app)
      .post(`/movies/${movieId}/ratings`)
      .set("Accept", "application/json")
      .set("x-api-key", apiKey)
      .send({ rating: 10 })
      .expect(422);
  });

  it("should return 401 if not authenticated", async () => {
    await request(app)
      .post(`/movies/${movieId}/ratings`)
      .set("Accept", "application/json")
      .send({ rating: 4 })
      .expect(401);
  });
});
