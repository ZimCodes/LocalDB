const express = require("express");
const router = express.Router();
const bookmarkController = require('../controllers/bookmark');
const {checkAuthentication} = require('../dbQueries/bookmark');
router.get('/',function(req,res,next){
    res.redirect('/');
});

/*Bookmark Routers*/
router.get('/bookmarks',checkAuthentication,bookmarkController.bookmark_list);
router.get('/bookmark/new',checkAuthentication,bookmarkController.bookmark_create_get);
router.post('/bookmark/new',checkAuthentication,bookmarkController.bookmark_create_post);
router.get('/bookmark/:id/edit',checkAuthentication,bookmarkController.bookmark_edit_get);
router.post('/bookmark/:id/edit',checkAuthentication,bookmarkController.bookmark_edit_post);
router.get('/bookmark/:id/delete',checkAuthentication,bookmarkController.bookmark_delete);

module.exports = router;