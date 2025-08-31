var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/hello',(req,res)=>{
  res.json({ message: "Hello from server!" });
})
module.exports = router;
