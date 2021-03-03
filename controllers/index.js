const {body,validationResult} = require('express-validator');
const {init,reset} = require('../dbQueries/bookmark');
exports.home_page = function(req, res, next) {
    res.render('index', { title: 'Web of Wonders', layout: 'other'});
}

exports.login_get = function(req,res,next){
    res.render('login',{title:"Login",layout: 'other'});
}
exports.login_post = [
    body('username').trim().isLength({min:1}).withMessage("Please enter a valid Username").escape()
        .isAlphanumeric().withMessage("Username can only contain numbers and letters"),
    body('password').isLength({min:1}).withMessage("Please enter a valid Password").escape()
    , function(req,res,next){
        const login = {
            password:req.body.password,
            user:req.body.username
        };
        const errors = validationResult(req);
        init(login,res,errors);
    }
];
exports.login_reset = function(req,res,next){
    reset();
    res.redirect('/login');
}