const express = require('express'),
    {user} = require('../model/sch.js'),
    crypto = require('crypto'),
    router = express.Router();



//首页
router.get('/', (req, res) => {
    res.render('index',{
        login:req.session.login,
        user:req.session.user
    })
});

//注册
router.get('/reg', (req, res) => {
    res.render('reg')
}).post('/reg', (req, res) => {
    //console.log(req.body)
    user.findOne({username:req.body.username})
        .then((data) => {
            if(data){
                return res.send({
                    code:300,
                    msg:'用户已存在'
                })
            }
            //指定用什么加密方式
            const hash = crypto.createHash('sha256');
            //加密
            const password = hash.update(req.body.password).digest('hex');
            user.create({
                username:req.body.username,
                password:password
            }).then((data) => {
                res.send({
                    code:200,
                    msg:'注册成功'
                })
            })
        });
});

//登录
router.get('/login', (req, res) => {
    //console.log(req.session.login);
    res.render('login',{login:req.session.login});
}).post('/login', (req, res) => {
    //判断用户名存不存在
    user.findOne({username:req.body.username}, function(err, data){

        if(data){

            //指定用什么加密方式
            const c = crypto.createHash('sha256');
            //加密
            const password = c.update(req.body.password).digest('hex');
            if(data.password === password){
                console.log(data);
                req.session.login = true;
                req.session.user = data;
                return res.send({
                    msg:'登录成功',
                    code:200
                })
            }
            return res.send({msg:'密码错误'})
        }
        res.send({msg:'用户不存在'})
    })
});

//退出
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
});

//适合给单独的路由设置,如果想多个路由就用use然后next
// router.get('/admin', (req, res,next) => {
//     if(req.session.user.level >= 10){
//         return next()
//     }
// }, (req, res) => {
//
// })

module.exports = router;