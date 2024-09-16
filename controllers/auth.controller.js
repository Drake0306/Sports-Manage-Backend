const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { secret } = require('../config/jwt.config');

const saltRounds = 10;

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
const register = async (req, res) => {
  console.log('Request Body:', req.body);

  const { username, firstname, lastname, email, password, role, status } = req.body;

  let errors = [];
  
  if (!username) errors.push('Username is required');
  if (!firstname) errors.push('Firstname is required');
  if (!lastname) errors.push('Lastname is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!role) errors.push('Role is required');
  if (!status) errors.push('Status is required');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
      status
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error',error);
  }
};


module.exports = {
  login,
  register
};
