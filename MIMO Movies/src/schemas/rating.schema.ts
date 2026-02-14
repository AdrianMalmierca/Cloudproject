import Joi from "joi";

export const ratingSchema = {
  create: Joi.object({
    rating: Joi.number().min(0).max(5).required(),
    comment: Joi.string().max(500).allow("", null),
  }),

  update: Joi.object({
    rating: Joi.number().min(0).max(5),
    comment: Joi.string().max(500).allow("", null),
  }),
};
