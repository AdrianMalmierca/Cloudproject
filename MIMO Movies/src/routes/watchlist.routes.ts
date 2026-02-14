import express from "express";
import { watchlistController } from "../controllers/watchlist.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { validatePayload } from "../middlewares/validatePayload";
import { watchlistSchema } from "../schemas/watchlist.schema";

const router = express.Router();

router.use(verifyToken);

router.get("/:userId", watchlistController.getAll);

router.post(
  "/:userId/items",
  validatePayload(watchlistSchema.create),
  watchlistController.create
);

router.patch(
  "/:userId/items/:itemId",
  validatePayload(watchlistSchema.update),
  watchlistController.update
);

router.delete("/:userId/items/:itemId", watchlistController.delete);

export { router as watchlistRoutes };
