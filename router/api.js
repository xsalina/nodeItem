const express = require('express'),
      router = express.Router(),
        path = require('path'),
    {user,task} = require('../model/sch')
      multer = require('multer');


const storage = multer.diskStorage({
    //1.__dirname 当前文件夹所在的目录
    //2.process.cwd（）当前node的工作目录
    destination:path.join(process.cwd(),'public/upload'),
    //接收到的文件重命名
    filename(req,file,callback){
        //console.log(file);
        const h = file.originalname.split('.');
        const filename = `${Date.now()}.${h[h.length - 1]}`;
        callback(null,filename);
    }

});
//上传文件的类型
const fileFilter = (req, file, cb) => {
    //当设置这个的时候，没有允许(没有设置)就是拒绝,
    if(file.mimeType === 'image/gif'){
        cb(null,true)
    }else{
        //除了gif其余的都不行
        cb(null,false)
    }
}
const upload = multer({
    storage,
    //fileFilter
});
router.post('/upload', (req,res) => {
    //1.指定保存到什么目录
    upload.single('file')(req,res, (err) => {
        if(err) res.send({code:1})
        res.send({code:0,data:{
            src:`/upload/${req.file.filename}`
        }})
    })
});
router.get('/task/all', (req, res) => {
    res.render('admin/deltask',{
        user:req.session.user,
        title:'任务管理'
    })

})
//全部任务
router.post('/task/all', (req, res) => {
    Promise.all([
        task.find().populate('author').sort({_id:-1})
            .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments()
    ]).then((data) => {
        res.send({code:0,data:data[0],count:data[1]})
    })
})
//可接取任务
router.post('/task/can', (req, res) => {
    Promise.all([
        task.find({can:false}).populate('author').sort({_id:-1})
            .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments({can:false})
    ]).then((data) => {
        res.send({code:0,data:data[0],count:data[1]})
    })
})
//不可接取任务
router.post('/task/notcan', (req, res) => {
    Promise.all([
        task.find({can:true}).populate('author').sort({_id:-1})
            .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments({can:true})
    ]).then((data) => {
        res.send({code:0,data:data[0],count:data[1]})
    })
});
//我的发布
router.post('/task/my', (req, res) => {
    user.findOne({_id:req.session.user._id})
        .populate({
            path:'task.publish',
            options:{
                sort:{_id:-1},
                skip:(req.body.page - 1) * req.body.limit,
                limit:Number(req.body.limit)
            }
        })
        .then((data) => {
        res.send({code:0,data:data.task.publish,count:data.task.publish.length})
    })
});
//已接取任务
router.post('/task/receive', (req, res) => {
    user.findOne({_id:req.session.user._id})
        .populate({
            path:'task.receive',
            options:{
                sort:{_id:-1},
                skip:(req.body.page - 1) * req.body.limit,
                limit:Number(req.body.limit)
            }
        })
        .then((data) => {
            res.send({code:0,data:data.task.receive,count:data.task.receive.length})
        })
});
//已完成
router.post('/task/complete', (req, res) => {
    user.findOne({_id:req.session.user._id})
        .populate({
            path:'task.accomplish',
            options:{
                sort:{_id:-1},
                skip:(req.body.page - 1) * req.body.limit,
                limit:Number(req.body.limit)
            }
        })
        .then((data) => {
            res.send({code:0,data:data.task.accomplish,count:data.task.accomplish.length})
        })
});
module.exports = router;