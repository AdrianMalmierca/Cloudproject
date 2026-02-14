import { Sequelize, DataTypes, Model } from "sequelize";
import { config } from "./config";

// ============================================
// INTERFACES
// ============================================

export interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  apiKey: string;
  createdAt?: Date;
}

export interface MovieAttributes {
  id?: number;
  title: string;
  genre: string;
  duration: number;
}

export interface RatingAttributes {
  id?: number;
  movieId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt?: Date;
}

export interface WatchlistItemAttributes {
  id?: number;
  userId: number;
  movieId: number;
  watched: boolean;
  createdAt?: Date;
}

// ============================================
// MODELS
// ============================================

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public apiKey!: string;
  public readonly createdAt!: Date;
}

export class Movie extends Model<MovieAttributes> implements MovieAttributes {
  public id!: number;
  public title!: string;
  public genre!: string;
  public duration!: number;
}

export class Rating extends Model<RatingAttributes> implements RatingAttributes {
  public id!: number;
  public movieId!: number;
  public userId!: number;
  public rating!: number;
  public comment!: string | null;
  public readonly createdAt!: Date;
}

export class WatchlistItem
  extends Model<WatchlistItemAttributes>
  implements WatchlistItemAttributes
{
  public id!: number;
  public userId!: number;
  public movieId!: number;
  public watched!: boolean;
  public readonly createdAt!: Date;
}

// ============================================
// DATABASE CONNECTION
// ============================================

const db = new Sequelize({
  dialect: "sqlite",
  storage: config.DB_PATH,
  logging: false,
});

// ============================================
// DATABASE MODULE
// ============================================

const dbModule = {
  get instance(): Sequelize {
    return db;
  },

  async initialize(): Promise<void> {
    // User model
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        apiKey: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          field: "api_key",
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: "created_at",
        },
      },
      {
        sequelize: db,
        modelName: "User",
        tableName: "users",
        timestamps: false,
      }
    );

    // Movie model
    Movie.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        genre: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize: db,
        modelName: "Movie",
        tableName: "movies",
        timestamps: false,
      }
    );

    // Rating model
    Rating.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        movieId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "movie_id",
          references: {
            model: "movies",
            key: "id",
          },
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "user_id",
          references: {
            model: "users",
            key: "id",
          },
        },
        rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          validate: {
            min: 0,
            max: 5,
          },
        },
        comment: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: "created_at",
        },
      },
      {
        sequelize: db,
        modelName: "Rating",
        tableName: "ratings",
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "movie_id"],
          },
        ],
      }
    );

    // WatchlistItem model
    WatchlistItem.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "user_id",
          references: {
            model: "users",
            key: "id",
          },
        },
        movieId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "movie_id",
          references: {
            model: "movies",
            key: "id",
          },
        },
        watched: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: "created_at",
        },
      },
      {
        sequelize: db,
        modelName: "WatchlistItem",
        tableName: "watchlist_items",
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "movie_id"],
          },
        ],
      }
    );

    // ============================================
    // ASSOCIATIONS
    // ============================================

    User.hasMany(Rating, { foreignKey: "userId", as: "ratings" });
    Rating.belongsTo(User, { foreignKey: "userId", as: "user" });

    User.hasMany(WatchlistItem, { foreignKey: "userId", as: "watchlistItems" });
    WatchlistItem.belongsTo(User, { foreignKey: "userId", as: "user" });

    Movie.hasMany(Rating, { foreignKey: "movieId", as: "ratings" });
    Rating.belongsTo(Movie, { foreignKey: "movieId", as: "movie" });

    Movie.hasMany(WatchlistItem, { foreignKey: "movieId", as: "watchlistItems" });
    WatchlistItem.belongsTo(Movie, { foreignKey: "movieId", as: "movie" });

    await db.sync();
  },

  async reset(): Promise<void> {
    await db.sync({ force: true });
  },

  async close(): Promise<void> {
    await db.close();
  },
};

export default dbModule;

