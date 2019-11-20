var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
<<<<<<< HEAD
  res.render('index', { title: 'Express' });
=======
  res.render('public/html/index', { title: 'Express' });
>>>>>>> 1452c1aa1c567345e33c5df971fa1ec77e4e9373
});

module.exports = router;
