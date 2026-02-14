import express from "express";
import { ratingsController } from "../controllers/ratings.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { validatePayload } from "../middlewares/validatePayload";
import { ratingSchema } from "../schemas/rating.schema";

const router = express.Router({ mergeParams: true });

router.get("/", ratingsController.getAll);
router.get("/:ratingId", ratingsController.getById);

router.post(
  "/",
  verifyToken,
  validatePayload(ratingSchema.create),
  ratingsController.create
);

router.patch(
  "/:ratingId",
  verifyToken,
  validatePayload(ratingSchema.update),
  ratingsController.update
);

router.delete(
  "/:ratingId",
  verifyToken,
  ratingsController.delete
);

export { router as ratingsRoutes };
