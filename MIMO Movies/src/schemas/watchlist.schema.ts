import Joi from "joi";

export const watchlistSchema = {
  create: Joi.object({
    movieId: Joi.number().integer().positive().required(),
  }),

  update: Joi.object({
    watched: Joi.boolean().required(),
  }),
};
