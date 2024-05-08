import Joi from 'joi';

export const roomValidation = (data) => {
  const schema = Joi.object({
    roomNumber: Joi.string().required(),
    description: Joi.string().allow(''),
  });

  return schema.validate(data);
};