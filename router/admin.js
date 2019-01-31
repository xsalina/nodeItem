const express = require('express'),
    {user} = require('../model/sch.js'),
    crypto = require('crypto'),
    router = express.Router();

router.use((req,res,next) => {
    if(req.session.login){
        //console.log(req.session.user)
        if(req.session.user.level >= 10){
            return next()
        }
        return res.send('您没有权限')
    }
    res.send('您没有登录')
});

router.get('/user', (req, res) => {
    res.render('admin/user',{
        user:req.session.user
    })
}).post('/user', (req, res) => {
    Promise.all([//从第几页查，查找多少个
        user.find().skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        user.countDocuments()//总共多少条数据
    ]).then((data) => {
        //console.log(data);
        res.send({code:0,data:data[0],count:data[1]})
    })
});
//账号是否可用
router.post('/user/reuserlevel', (req, res) => {
    user.updateOne({_id:req.body.user_id},{$set:{used:req.body.used}}, () => {
        res.send({code:0,data:'修改成功'})
    })
});
//删除用户 关联的文章、任务、删除
router.post('/user/del', (req, res) => {
    user.deleteOne({_id:req.body._id}, () => {

    })
})
//更改级别
router.post('/user/relevel', (req, res) => {
    user.updateOne({_id:req.body._id},{$set:{level:req.body.level}},(err,data) => {
        if(err) res.send('数据库错误')

    })
})

module.exports = router