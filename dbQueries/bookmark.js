const mysql = require('mysql2');
const bcrypt = require('bcrypt');
let pool;

exports.init = function(login,res,valErrs){
    if(valErrs && !valErrs.isEmpty()){
        res.render('login',{title:"Login",valErrs:valErrs.array(),layout:"other"});
    }
    else{
        bcrypt.compare(login.password,process.env.DB_PASS,(hashErr,hashResult)=>{
            bcrypt.compare(login.user,process.env.DB_USER,(userErr,userResult)=>{
                if(hashErr || userErr) {
                    let err = hashErr || userErr;
                    res.render('login',{title:"Login",dbError:err,layout:"other"});
                    return;
                }
                if(hashResult && userResult){
                    pool = mysql.createPool({
                        ...login,
                        database:'web',
                        connectionLimit:5
                    });
                    res.redirect('/web/bookmarks');
                }
            });
        });
    }
}
exports.checkAuthentication = function(req,res,next){
    pool ? next() : res.redirect('/login');
}
exports.reset = function(){
    if(pool){
        pool.end();
        pool = undefined;
    }
}
exports.all = function(){
    const sql = 'SELECT * FROM `bookmark` order by `topic`';
    return [mysql.format(sql),pool];
}
exports.id_sort = function(){
    const sql = 'SELECT * FROM `bookmark` order by `id`';
    return [mysql.format(sql),pool];
}
exports.create = function(valueObj){
    const sql = 'INSERT INTO bookmark SET ?';
    return [mysql.format(sql,valueObj),pool];
}
exports.id_search = function(id){
    const sql = 'SELECT * FROM bookmark WHERE id = ?';
    return [mysql.format(sql,[id]),pool];
}
exports.update = function(id,updateObj){
    const sql = 'UPDATE bookmark SET ? WHERE id = ?';
    return [mysql.format(sql,[updateObj,id]),pool];
}
exports.delete = function(id){
    const sql = 'DELETE FROM bookmark WHERE id = ?';
    return [mysql.format(sql,[id]),pool];
}

process.on('SIGTERM',()=>{
    pool.end();
});