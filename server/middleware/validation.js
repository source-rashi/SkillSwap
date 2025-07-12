const Joi = require('joi');

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateProfile = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100),
    location: Joi.string().max(100),
    skillsOffered: Joi.array().items(Joi.string().max(50)),
    skillsWanted: Joi.array().items(Joi.string().max(50)),
    availability: Joi.string().valid('weekdays', 'weekends', 'evenings', 'flexible'),
    isPublic: Joi.boolean(),
    profileImage: Joi.string().uri().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateSwapRequest = (req, res, next) => {
  const schema = Joi.object({
    recipient: Joi.string().required(),
    skillOffered: Joi.string().max(50).required(),
    skillRequested: Joi.string().max(50).required(),
    message: Joi.string().max(500),
    scheduledDate: Joi.date().min('now')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validatePost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(150).required(),
    content: Joi.string().min(10).max(2000).required(),
    type: Joi.string().valid('insight', 'problem', 'question', 'tip').required(),
    category: Joi.string().max(50),
    tags: Joi.array().items(Joi.string().max(30))
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateComment = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(500).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateSkillSwapRequest = (req, res, next) => {
  const schema = Joi.object({
    skillOffered: Joi.string().max(50).required(),
    skillWanted: Joi.string().max(50).required(),
    message: Joi.string().max(200)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfile,
  validateSwapRequest,
  validatePost,
  validateComment,
  validateSkillSwapRequest
};
