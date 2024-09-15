const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { secret } = require('../config/jwt.config');

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });
  res.json({ token });
};

module.exports = {
  login
};
