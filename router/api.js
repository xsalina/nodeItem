const express = require('express'),
      router = express.Router(),
        path = require('path'),
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
})

module.exports = router;