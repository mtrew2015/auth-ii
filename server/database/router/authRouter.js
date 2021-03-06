const express = require('express');
const db = require('../dbHelpers.js');
const bcrypt = require('bcryptjs');
const { protected, newToken } = require('../middleware/middleware')
const router = express.Router();

router.post('/api/register', (req, res) => {
  const user = req.body;
  const hashedPass = bcrypt.hashSync(user.password, 12)
  user.password = hashedPass;
  db.insertUser(user)
    .then(ids => {
      const id = ids[0];
      db.findByID(id)
        .then(user => {
          const token = (newToken(user));
          res.status(200).json({ id: user.id, token });
        })
        .catch(err => {
          console.log("error", err);
          res.status(500).json({ error: 'Something went wrong' })
        })
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

router.post('/api/login', (req, res) => {
  const creds = req.body;
  db.findByUsername(creds.username)
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = newToken(user);
        res.status(200).json({ id: user.id, token });
      } else {
        res.status(401).json({ error: 'Cannot Login' })
      }
    })
    .catch(err => res.send(`${err}`));
});

router.get('/api/users', protected, (req, res) => {
  db.getUsers()
    .then(users => { res.json(users); })
    .catch(err => res.status(500).send(err));
})

module.exports = router;