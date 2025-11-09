var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.json([
    { id: 1, name: 'Aisha', role: 'Admin' },
    { id: 2, name: 'Rahul', role: 'User' },
  ]);
});

router.get('/hello',(req,res)=>{
  res.json({ message: "Hello from server!" });
})
module.exports = router;
