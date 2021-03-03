var express = require('express');
var router = express.Router();
const indexController = require('../controllers/index');

/* GET home page. */
router.get('/', indexController.home_page);
router.get('/login',indexController.login_get);
router.post('/login',indexController.login_post);
router.get('/login/reset',indexController.login_reset);

module.exports = router;
