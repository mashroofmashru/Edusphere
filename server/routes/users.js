var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
  res.json([
    { id: 1, name: 'Aisha', role: 'Admin' },
    { id: 2, name: 'Rahul', role: 'User' },
  ]);
});

module.exports = router;
