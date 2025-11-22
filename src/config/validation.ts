import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  MONGO_URI: Joi.string().required(),
  MONGO_DB: Joi.string().default('users_db'),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES: Joi.string().default('12h'),

  BCRYPT_SALT: Joi.number().default(10),
});
