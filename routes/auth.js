const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/authMiddleware');
const AppError = require('../util/appError');
const bcrypt = require('bcrypt')
const User = require('../models/user');
const generateToken = require('../util/generateToken');

router.post('/api/user/login', async (req, res, next) => {
  const { userName, password } = req.body
  try {
    const user = await User.findOne({ user_name: userName });
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Username or Password" });
    const token = generateToken(user);
    return res.status(200).json({ authenticated: true, user, token });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

router.post('/api/user/create', async (req, res, next) => {
  const { userName, password } = req.body
  if (!userName || !password) {
    return next(new AppError('Missing required fields', 400));
  }

  const count = await User.count();
  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(password, salt);
  if (count == 0) {
    const encryption_key = uuidv4();

    const user = new User({
      user_name: userName,
      password: hashPassword,
      encryption_key,
      files: []
    });
    await user.save();
    const token = generateToken(user);
    console.log(token)
    return res.status(200).json({ authenticated: true, user, token });
  }

  console.log('finding user if exists');
  const user = await User.findOne({ user_name: userName });
  console.log(`user: ${user}`);
  if (user) {
    console.log('User already exists!');
    return res.status(200).json({ message: 'User already exists' });
  }
  console.log('User not found!');
  try {
    console.log('trying to create a user');
    const encryption_key = uuidv4();
    const user = new User({
      password: hashPassword,
      user_name: userName,
      encryption_key,
      files: []
    });
    console.log('saving user');
    await user.save();
    const token = generateToken(user);
    return res.status(200).json({ authenticated: true, user, token });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
});

module.exports = router;
