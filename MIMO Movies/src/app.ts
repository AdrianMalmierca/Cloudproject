import express from "express";
import { moviesRoutes } from "./routes/movies.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { respondTo } from "./middlewares/respondTo";
import { watchlistRoutes } from "./routes/watchlist.routes";

const app = express();

app.use(express.json());
app.use(respondTo("application/json"));

app.use("/movies", moviesRoutes);
app.use("/watchlist", watchlistRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };