import request from "supertest";
import { app } from "../app";
import db from "../db";
import { Movie, Rating, User } from "../db";
import { generateApiKey } from "../auth";
import { UserModel } from "../models/user";

describe("Watchlist API", () => {
  let apiKey: string;
  let userId: number;
  let movieId: number;

  beforeAll(async () => {
    await db.initialize();
  });

  beforeEach(async () => {
    await db.instance.truncate({ cascade: true });

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

  it("should add movie to watchlist", async () => {
    const res = await request(app)
      .post(`/watchlist/${userId}/items`)
      .set("Accept", "application/json")
      .set("x-api-key", apiKey)
      .send({ movieId })
      .expect(201);

    expect(res.body).toHaveProperty("watched", false);
    expect(res.body).toHaveProperty("createdAt");
  });

  it("should return 409 if movie already in watchlist", async () => {
    await request(app)
      .post(`/watchlist/${userId}/items`)
      .set("x-api-key", apiKey)
      .send({ movieId });

    await request(app)
      .post(`/watchlist/${userId}/items`)
      .set("x-api-key", apiKey)
      .send({ movieId })
      .expect(409);
  });

  it("should update watched status", async () => {
    const create = await request(app)
      .post(`/watchlist/${userId}/items`)
      .set("x-api-key", apiKey)
      .send({ movieId });

    await request(app)
      .patch(`/watchlist/${userId}/items/${create.body.id}`)
      .set("x-api-key", apiKey)
      .send({ watched: true })
      .expect(200);
  });

  it("should return 403 accessing another user's watchlist", async () => {
    await request(app)
      .get(`/watchlist/${userId + 1}`)
      .set("x-api-key", apiKey)
      .expect(403);
  });
});
