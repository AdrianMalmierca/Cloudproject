import { Request, Response } from "express";
import { MovieModel } from "../models/movie";
import {
  parsePaginationParams,
  createPaginationMetadata,
} from "../utils/pagination";

export const moviesController = {
  /**
   * GET /movies
   */
  async getAllMovies(req: Request, res: Response): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);

    const result = await MovieModel.findAllWithRating({ page, limit });

    const pagination = createPaginationMetadata(
      page,
      limit,
      result.count
    );

    res.json({
      data: result.rows,
      pagination,
    });
  },

  /**
   * GET /movies/:movieId
   */
  async getMovieById(req: Request, res: Response): Promise<void> {
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      res.status(400).json({ error: "Invalid movie id" });
      return;
    }

    const movie = await MovieModel.findByIdWithRating(movieId);

    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    res.json(movie);
  },
};
