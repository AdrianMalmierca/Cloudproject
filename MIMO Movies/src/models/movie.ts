import { Movie, MovieAttributes, Rating } from "../db";
import { Sequelize, FindAndCountOptions } from "sequelize";

export interface MovieWithRating extends MovieAttributes {
  rating: number | null;
}

export const MovieModel = {
  get model(): typeof Movie {
    return Movie;
  },

  async findById(id: number): Promise<Movie | null> {
    return this.model.findByPk(id);
  },

  async findAll(pagination?: { page: number; limit: number }): Promise<{ rows: Movie[]; count: number }> {
    const options: FindAndCountOptions = {};

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = (pagination.page - 1) * pagination.limit;
    }

    const { count, rows } = await this.model.findAndCountAll(options);
    return { count,rows };
  },


  /**
   * Obtiene una película con su rating promedio calculado
   */
  async findByIdWithRating(id: number): Promise<MovieWithRating | null> {
    const movie = await this.model.findByPk(id, {
      include: [
        {
          model: Rating,
          as: "ratings",
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.fn("AVG", Sequelize.col("ratings.rating")),
            "rating",
          ],
        ],
      },
      group: ["Movie.id"],
    });

    if (!movie) return null;

    return movie.get({ plain: true }) as MovieWithRating;
  },

  /**
   * Obtiene todas las películas con su rating promedio calculado
   */
  async findAllWithRating(pagination?: {
    page: number;
    limit: number;
  }): Promise<{ rows: MovieWithRating[]; count: number }> {
      const options: FindAndCountOptions = {
        include: [
          {
            model: Rating,
            as: "ratings",
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [Sequelize.fn("AVG", Sequelize.col("ratings.rating")), "rating"]
          ],
        },
        group: ["Movie.id"],
        subQuery: false,
      };


    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      options.limit = pagination.limit;
      options.offset = offset;
    }

    const { count: countResult, rows } = await this.model.findAndCountAll(options);
    
    // findAndCountAll con group devuelve un array de objetos {count: number}
    const count = Array.isArray(countResult) ? countResult.length : countResult;

    return {
      rows: rows.map((m) => m.get({ plain: true })) as MovieWithRating[],
      count,
    };
  },
};

