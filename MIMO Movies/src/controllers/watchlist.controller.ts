import { Request, Response } from "express";
import { WatchlistItemModel } from "../models/watchlistItem";
import { MovieModel } from "../models/movie";
import { UserModel } from "../models/user";
import {
  parsePaginationParams,
  createPaginationMetadata,
} from "../utils/pagination";

interface AuthenticatedRequest extends Request {
  userId: number;
}

export const watchlistController = {
  // GET /watchlist/:userId
  async getAll(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const userId = Number(req.params.userId);

    if (authReq.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { page, limit } = parsePaginationParams(req.query);

    const result = await WatchlistItemModel.findAllByUserId(userId, {
      page,
      limit,
    });

    res.json({
      data: result.rows,
      pagination: createPaginationMetadata(page, limit, result.count),
    });
  },

  // POST /watchlist/:userId/items
  async create(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const userId = Number(req.params.userId);
    const { movieId } = req.body;

    if (authReq.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    const existing = await WatchlistItemModel.findByUserAndMovie(
      userId,
      movieId
    );

    if (existing) {
      res.status(409).json({ error: "Movie already in watchlist" });
      return;
    }

    const item = await WatchlistItemModel.create({
      userId,
      movieId,
      watched: false,
    });

    res
      .status(201)
      .location(`/watchlist/${userId}/items/${item.id}`)
      .json(item);
  },

  // PATCH /watchlist/:userId/items/:itemId
  async update(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const { userId, itemId } = req.params;

    if (authReq.userId !== Number(userId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const item = await WatchlistItemModel.findByIdAndUserId(
      Number(itemId),
      Number(userId)
    );

    if (!item) {
      res.status(404).json({ error: "Watchlist item not found" });
      return;
    }

    await WatchlistItemModel.update(item.id, {
      watched: req.body.watched,
    });

    const updated = await WatchlistItemModel.findById(item.id);
    res.json(updated);
  },

  // DELETE /watchlist/:userId/items/:itemId
  async delete(req: Request, res: Response) {
    const authReq = req as AuthenticatedRequest;
    const { userId, itemId } = req.params;

    if (authReq.userId !== Number(userId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const item = await WatchlistItemModel.findByIdAndUserId(
      Number(itemId),
      Number(userId)
    );

    if (!item) {
      res.status(404).json({ error: "Watchlist item not found" });
      return;
    }

    await WatchlistItemModel.delete(item.id);
    res.status(204).end();
  },
};