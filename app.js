const express = require('express'),
    app = express(),
    session = require('express-session'),
    Mongosession = require('connect-mongo')(session),
    mongoose = require('mongoose');

//链接数据库
mongoose.connect('mongodb://localhost/a',{useNewUrlParser:true});

//session 使用方式 req.session.xxxx = xxx;
app.use(session({
    secret:'abc',//密钥
    rolling:true,//每次操作（刷新页面 点击a标签 ajax ）重新设定时间
    resave:false,//是否每次请求都保存数据
    saveUninitialized:false,//初始值
    cookie:{maxAge:1000 * 60 * 60},// 设定时间1小时
    store:new Mongosession({
        url:'mongodb://localhost/a'
    })
}));

//获取post参数
app.use(express.json());
app.use(express.urlencoded({extended:false}));


//静态资源目录
app.use(express.static(__dirname + '/public'));


//设置模板引擎
app.set('views',__dirname + '/view');
app.set('view engine','ejs');




app.use('/',require('./router/index.js'));
app.use('/api',require('./router/api.js'));
app.use('/admin',require('./router/admin.js'));







app.listen(7000,() => {
    console.log("监听7000端口成功")
})
