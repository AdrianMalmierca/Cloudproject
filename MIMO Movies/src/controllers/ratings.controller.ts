import { Request, Response } from "express";
import { RatingModel } from "../models/rating";
import { MovieModel } from "../models/movie";
import {
  parsePaginationParams,
  createPaginationMetadata,
} from "../utils/pagination";

interface AuthenticatedRequest extends Request {
  userId: number;
}

export const ratingsController = {
  // GET /movies/:movieId/ratings
  async getAll(req: Request, res: Response) {
    const movieId = Number(req.params.movieId);
    const { page, limit } = parsePaginationParams(req.query);

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    const result = await RatingModel.findAllByMovieId(movieId, {
      page,
      limit,
    });

    res.json({
      data: result.rows,
      pagination: createPaginationMetadata(page, limit, result.count),
    });
  },

  // GET /movies/:movieId/ratings/:ratingId
  async getById(req: Request, res: Response) {
    const movieId = Number(req.params.movieId);
    const ratingId = Number(req.params.ratingId);

    const rating = await RatingModel.findByIdAndMovieId(
      ratingId,
      movieId
    );

    if (!rating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    res.json(rating);
  },

  // POST /movies/:movieId/ratings
  async create(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const movieId = Number(req.params.movieId);

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    const existing = await RatingModel.findByUserAndMovie(
      authReq.userId,
      movieId
    );

    if (existing) {
      res.status(409).json({ error: "Movie already rated by user" });
      return;
    }

    const rating = await RatingModel.create({
      movieId,
      userId: authReq.userId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res
      .status(201)
      .location(`/movies/${movieId}/ratings/${rating.id}`)
      .json(rating);
  },

  // PATCH /movies/:movieId/ratings/:ratingId
  async update(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const { movieId, ratingId } = req.params;

    const rating = await RatingModel.findByIdAndMovieId(
      Number(ratingId),
      Number(movieId)
    );

    if (!rating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    if (rating.userId !== authReq.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await RatingModel.update(rating.id, req.body);

    const updated = await RatingModel.findById(rating.id);
    res.json(updated);
  },

  // DELETE /movies/:movieId/ratings/:ratingId
  async delete(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const { movieId, ratingId } = req.params;

    const rating = await RatingModel.findByIdAndMovieId(
      Number(ratingId),
      Number(movieId)
    );

    if (!rating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    if (rating.userId !== authReq.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await RatingModel.delete(rating.id);
    res.status(204).end();
  },
};