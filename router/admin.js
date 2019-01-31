const express = require('express'),
    {user,task} = require('../model/sch.js'),
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

// 总共多少条/当前显示多少条
// 第一页 1 显示 10
// （当前页数 - 1）* 每页显示多少条
// 从第几个开始查找计算方法 （3 -1）* 10
// page 1  0 9
// page 2  10 19
// page 3  20 29
router.get('/user', (req, res) => {
    res.render('admin/user',{
        user:req.session.user,
        title:'用户管理'
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
    //如果想要修改用户权限 > 当前执行修改操作的用户权限
    user.findOne({_id:req.body.user_id}, (err, data) => {
        //console.log(data);

        if(data.level >= 999){
          return res.send({code:1,data:'不能修改超级管理员'})
        }

        //自己不可以删除自己
        if(data._id == req.session.user._id){
            return res.send({code:1,data:'您没有此权限修改哦'})
        }

        if(data.level !== req.session.user.level){
            if(data.level > req.session.user.level){
                //比你高等级的不能修改
                return res.send({code:1,data:'您没有此权限修改哦'})
            }
        }else{
            //跟你同等级的不能修改
            return res.send({code:1,data:'您没有此权限修改哦'})
        }


        user.updateOne({_id:req.body.user_id},{$set:{used:req.body.used}}, () => {
            res.send({code:0,data:'修改成功'})
        })

    })

});

//删除用户 关联的文章、任务、删除
router.post('/user/del', (req, res) => {
    if(!req.body._id){
       return res.send({code:1,data:'参数不正确'})
    }
    //1.普通 2.管理员 3.超级管理员,能进来的都是10以上的   管理员只可以删除比自己等级低的人 同等级以及比自己高的人都不能修改
    user.findOne({_id:req.body._id}, (err, data) => {
        if(data.level < req.session.user.level){
            Promise.all([
                    //删除  用户数据
                    user.deleteOne({_id:req.body._id}, () => {}),
                    //删除用户发布的文章
                    task.deleteMany({author:req.body._id}, () => {}),
                    //删除文章的评论
                    task.updateMany({receiver:req.body._id},{$pull:{receiver:req.body._id}})
            ]).then()
        }
    })




})
//更改级别
router.post('/user/relevel', (req, res) => {
    user.findOne({_id:req.body._id}, (err, data) => {
        //只能改比自己等级低的而且改过之后等级不能超过自己
        if(data.level < req.session.user.level && req.body.level < req.session.user.level){
            user.updateOne({_id:req.body._id},{$set:{level:req.body.level}},(err,data) => {
                if(err) res.send('数据库错误')

            })
        }
    })

})
//发布
router.get('/task/add', (req, res) => {
    res.render('admin/addtask',{
        title:'发布',
        user:req.session.user
    })
})
router.post('/task/add', (req, res) => {
    const data = req.body;
    data.author = req.session.user._id;
    task.create(data, (err, data) => {
        if(err) res.send({code:1,data:'数据库错误'})
        user.updateOne({_id:req.session.user._id},{$push:{'task.publish':data._id}}, (err, data) => {

        });
        res.send({code:0,data:'保存成功'})
    })
})


//文章
router.get('/task/all', (req, res) => {
    res.render('admin/deltask',{
        user:req.session.user,
        title:'任务管理'
    })

})
router.post('/task/all', (req, res) => {
    Promise.all([
        task.find().populate('author').skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments()
    ]).then((data) => {
        res.send({code:0,data:data[0],count:data[1]})
    })
})

//删除任务
router.post('/task/del', (req, res) => {
    Promise.all([
        task.deleteOne({_id:req.body._id}),
        //如果用户发布任务的数组中  有当前删除的任务   当前任务从数组删除
        user.updateMany(
            {$or:[{'task.publish':req.body._id,'task.receive':req.body._id,'task.accomplish':req.body._id}]},
            {$pull:{'task.publish':req.body._id,'task.receive':req.body._id,'task.accomplish':req.body._id}}
        )
    ]).then(() => {

    })

})

module.exports = router