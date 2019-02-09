const express = require('express'),
    {user,task} = require('../model/sch.js'),
    crypto = require('crypto'),
    router = express.Router();



//首页
router.get('/', (req, res) => {
    res.render('index',{
        login:req.session.login,
        user:req.session.user,
        title:'首页'
    })
});

//注册
router.get('/reg', (req, res) => {
    res.render('reg',{
        // login:req.session.login,
        title:'注册'
    })
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
    res.render('login',{
        login:req.session.login,
        title:'登录'
    });
}).post('/login', (req, res) => {
    //判断用户名存不存在
    user.findOne({username:req.body.username}, function(err, data){

        if(data){

            //指定用什么加密方式
            const c = crypto.createHash('sha256');
            //加密
            const password = c.update(req.body.password).digest('hex');
            if(data.password === password){
                //console.log(data);
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
router.get('/detail/:id', (req, res) => {

    task.findOne({_id:req.params.id}).populate('author receiver.user').exec((err,data) => {
        //console.log(data);
        const people = data.receiver.findIndex((val) => {
            //返回-1就是没有接取过
            //console.log(String(val._id) === req.session.user._id)
            return String(val._id) === req.session.user && req.session.user._id
        });
        //console.log(people);
        res.render('detail',{
            title:'详情页 - '+ data.title,
            user:req.session.user,
            login:req.session.login,
            data:data,
            people
        })
    })
});
router.post('/detail/:id', (req, res) => {
    //console.log(req.session.user._id)
    //console.log(req.params.id);
    Promise.all([
        task.updateOne({_id:req.params.id},{$push:{receiver:{user:req.session.user._id}}}),
        user.updateOne({_id:req.session.user._id},{$push:{'task.receive':req.params.id}})
    ])
});
router.post('/task/finmsg', (req, res) => {
    task.updateOne(
        {_id:'jjj'},
        {$set:{
            ['receiver.'+req.body.index + '.msg']:req.body.con},
            ['receiver.'+req.body.index + '.finmsg']:true
        }).then()
})

module.exports = router;