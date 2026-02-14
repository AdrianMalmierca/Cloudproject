import db, { User, Movie, Rating, WatchlistItem } from "../src/db";

async function seed(): Promise<void> {
  console.log("🌱 Inicializando base de datos...");
  await db.initialize();

  console.log("🗑️  Limpiando datos existentes...");
  await db.reset();

  console.log("👤 Creando usuarios...");
  const users = await User.bulkCreate([
    {
      username: "john_doe",
      email: "john@example.com",
      apiKey: "api_key_john_12345",
    },
    {
      username: "jane_smith",
      email: "jane@example.com",
      apiKey: "api_key_jane_67890",
    },
    {
      username: "bob_wilson",
      email: "bob@example.com",
      apiKey: "api_key_bob_11111",
    },
  ]);

  console.log("🎬 Creando películas...");
  const movies = await Movie.bulkCreate([
    { title: "Inception", genre: "Sci-Fi", duration: 148 },
    { title: "The Dark Knight", genre: "Action", duration: 152 },
    { title: "Pulp Fiction", genre: "Crime", duration: 154 },
    { title: "The Matrix", genre: "Sci-Fi", duration: 136 },
    { title: "Forrest Gump", genre: "Drama", duration: 142 },
    { title: "The Shawshank Redemption", genre: "Drama", duration: 142 },
    { title: "Fight Club", genre: "Drama", duration: 139 },
    { title: "Goodfellas", genre: "Crime", duration: 146 },
    { title: "The Godfather", genre: "Crime", duration: 175 },
    { title: "Interstellar", genre: "Sci-Fi", duration: 169 },
    { title: "Gladiator", genre: "Action", duration: 155 },
    { title: "The Silence of the Lambs", genre: "Thriller", duration: 118 },
    { title: "Schindler's List", genre: "Drama", duration: 195 },
    { title: "Saving Private Ryan", genre: "War", duration: 169 },
    { title: "The Green Mile", genre: "Drama", duration: 189 },
    { title: "Jurassic Park", genre: "Sci-Fi", duration: 127 },
    { title: "Titanic", genre: "Romance", duration: 194 },
    { title: "The Lion King", genre: "Animation", duration: 88 },
    { title: "Back to the Future", genre: "Sci-Fi", duration: 116 },
    { title: "Terminator 2", genre: "Action", duration: 137 },
    { title: "Alien", genre: "Horror", duration: 117 },
    { title: "The Departed", genre: "Crime", duration: 151 },
    { title: "Django Unchained", genre: "Western", duration: 165 },
    { title: "Whiplash", genre: "Drama", duration: 107 },
    { title: "Parasite", genre: "Thriller", duration: 132 },
  ]);

  console.log("⭐ Creando valoraciones...");
  await Rating.bulkCreate([
    // John's ratings
    {
      movieId: movies[0].id,
      userId: users[0].id,
      rating: 4.5,
      comment: "Increíble película, muy compleja",
    },
    {
      movieId: movies[1].id,
      userId: users[0].id,
      rating: 5.0,
      comment: "La mejor película de Batman",
    },
    { movieId: movies[3].id, userId: users[0].id, rating: 4.0, comment: null },
    // Jane's ratings
    {
      movieId: movies[0].id,
      userId: users[1].id,
      rating: 4.0,
      comment: "Muy buena pero confusa a veces",
    },
    {
      movieId: movies[2].id,
      userId: users[1].id,
      rating: 4.5,
      comment: "Tarantino en su mejor momento",
    },
    {
      movieId: movies[4].id,
      userId: users[1].id,
      rating: 5.0,
      comment: "Me hizo llorar",
    },
    {
      movieId: movies[5].id,
      userId: users[1].id,
      rating: 5.0,
      comment: "Una obra maestra",
    },
    // Bob's ratings
    { movieId: movies[1].id, userId: users[2].id, rating: 4.5, comment: null },
    {
      movieId: movies[6].id,
      userId: users[2].id,
      rating: 4.0,
      comment: "No hables del club de la lucha",
    },
    {
      movieId: movies[8].id,
      userId: users[2].id,
      rating: 5.0,
      comment: "Le haré una oferta que no podrá rechazar",
    },
  ]);

  console.log("📋 Creando watchlist items...");
  await WatchlistItem.bulkCreate([
    // John's watchlist
    { userId: users[0].id, movieId: movies[2].id, watched: false },
    { userId: users[0].id, movieId: movies[5].id, watched: true },
    { userId: users[0].id, movieId: movies[9].id, watched: false },
    // Jane's watchlist
    { userId: users[1].id, movieId: movies[1].id, watched: false },
    { userId: users[1].id, movieId: movies[6].id, watched: false },
    { userId: users[1].id, movieId: movies[8].id, watched: true },
    // Bob's watchlist
    { userId: users[2].id, movieId: movies[0].id, watched: true },
    { userId: users[2].id, movieId: movies[3].id, watched: false },
    { userId: users[2].id, movieId: movies[4].id, watched: false },
  ]);

  console.log("\n✅ Base de datos poblada correctamente!\n");
  console.log("📊 Resumen:");
  console.log(`   - ${users.length} usuarios`);
  console.log(`   - ${movies.length} películas`);
  console.log(`   - 10 valoraciones`);
  console.log(`   - 9 items en watchlist`);
  console.log("\n🔑 API Keys de prueba:");
  users.forEach((user) => {
    console.log(`   - ${user.username}: ${user.apiKey}`);
  });

  await db.close();
}

seed().catch((error) => {
  console.error("❌ Error al poblar la base de datos:", error);
  process.exit(1);
});
