const bookmarkQuery = require('../dbQueries/bookmark');
const hbs = require('hbs');
const {body,validationResult} = require('express-validator');

hbs.handlebars.registerHelper("capitalize",function(options){
   let firstChar = this.name.slice(0,1);
   firstChar = firstChar.toUpperCase();
   return firstChar + this.name.slice(1,this.name.length);
});
hbs.handlebars.registerHelper("idCheck",function(value){
    return value === 'id';
});
hbs.handlebars.registerHelper("topicCheck",function(value){
    return value === 'topic';
});
hbs.handlebars.registerHelper("editLink",function(options){
    return `<a class="link-info fw-bold" href="/web/bookmark/${this.id}/edit">${options.fn(this)}</a>`;
});
hbs.handlebars.registerHelper("deleteLink",function(options){
    return `<a class="link-danger fw-bold" href="/web/bookmark/${this.id}/delete">Delete</a>`;
});

exports.bookmark_list = function(req,res,next){
    let [query,pool] = (req.query.sort) ? bookmarkQuery.id_sort() : bookmarkQuery.all();
    pool.getConnection((err,connection)=>{
        connection.query(query,function(err,results,fields){
            if (err) return next(err);
            res.render('all_table',{title:"Bookmark Table",results,fields});
        });
        connection.release();
    });
}
exports.bookmark_create_get = function(req,res,next){
    res.render("bookmark/new",{title:"New Bookmark"});
}
exports.bookmark_create_post = [
    body('topic').trim().isLength({min:1}).withMessage("Please enter a topic").isAlpha(),
    body('url').trim().isLength({min:1}).withMessage("Please enter a URL").isURL()
        .withMessage("Please enter a valid URL"),
    body('about').trim().isLength({min:1}).withMessage("Please provide more information about the bookmark")
        .escape(),

    function(req,res,next){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('bookmark/new', { title: "New Bookmark", errors: errors.array() });
            return;
        }
        const [query,pool] = bookmarkQuery.create({topic:req.body.topic,url:req.body.url,content:req.body.about});
        pool.getConnection((err,connection)=>{
            connection.query(query,function(err,results,fields){
                if(err) return next(err);
                res.redirect('/web/bookmark/new');
            });
            connection.release();
        });
    }
];
exports.bookmark_edit_get = function (req,res,next){
    const id = req.params.id;
    const [query,pool] = bookmarkQuery.id_search(id);
    pool.getConnection((err,connection)=>{
        connection.query(query,function(err,results,fields){
            if(err) return next(err);
            res.render('bookmark/edit',{
                title:"Edit ID: #"+id,
                topic:results[0].topic,
                url:results[0].url,
                about:results[0].content
            });
        });
        connection.release();
    });
}
exports.bookmark_edit_post = [
    body('topic').trim().isLength({min:1}).withMessage("Please enter a topic").isAlpha(),
    body('url').trim().isLength({min:1}).withMessage("Please enter a URL").isURL()
        .withMessage("Please enter a valid URL"),
    body('about').trim().isLength({min:1}).withMessage("Please provide more information about the bookmark")
        .escape(),

    function(req,res,next){
        const errors = validationResult(req);
        const id = req.params.id;
        if (!errors.isEmpty()) {
            const [searchQuery,searchPool] = bookmarkQuery.id_search(id);
            searchPool.getConnection((err,connection)=>{
                connection.query(searchQuery,function(err,results,fields){
                    // There are errors. Render form again with sanitized values/errors messages.
                    res.render('bookmark/edit', {
                        title:"Edit ID: #"+id,
                        topic:results[0].topic,
                        url:results[0].url,
                        about:results[0].content,
                        errors: errors.array()
                    });
                });
                connection.release();
            });
        }else{
            const [query,pool] = bookmarkQuery.update(id,{topic:req.body.topic,url:req.body.url,content:req.body.about});
            pool.getConnection((err,connection)=>{
                connection.query(query,function(err,results,fields){
                    if(err) return next(err);
                    res.redirect('/web/bookmarks');
                });
                connection.release();
            });
        }
    }
];
exports.bookmark_delete = function(req,res,next){
    const [query,pool] = bookmarkQuery.delete(req.params.id);
    pool.getConnection((err,connection)=>{
       connection.query(query,function (err,results,fields){
           if(err) return next(err);
       });
       res.redirect('/web/bookmarks');
       connection.release();
    });
}