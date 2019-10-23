const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bycrypt = require('bcryptjs');
const gravatar = require('gravatar');
const User = require('../../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route POST api/users
// @desc  Register user
// @access Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please a password with 6 or more character').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    console.log(req.body);
    console.log(mongoose.connection.readyState);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bycrypt.genSalt(10);
      user.password = await bycrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      let jwtkey = config.get('jwtSecret');

      jwt.sign(payload, jwtkey, { expiresIn: '1d' }, function(err, token) {
        res.json({ token });
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
