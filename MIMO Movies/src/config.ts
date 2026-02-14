const config = {
  PORT: Number(process.env.PORT) || 3000,
  DB_PATH: process.env.DB_PATH || "mimo_movies.sqlite",
};

export { config };

