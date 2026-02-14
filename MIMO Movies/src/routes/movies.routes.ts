import express from "express";
import { moviesController } from "../controllers/movies.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { ratingsRoutes } from "./ratings.routes";



const router = express.Router();


router.get("/", moviesController.getAllMovies);
router.get("/:movieId", moviesController.getMovieById);
router.use("/:movieId/ratings", ratingsRoutes);

export { router as moviesRoutes };
