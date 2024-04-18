const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('Welcome to DashFile API v1.0!');
});

module.exports = router;
