const mongoose = require('mongoose');

//用户详情
const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    //账号是否可用
    used:{type:Boolean,required:true,default:false},
    //任务状态
    task:{
        //发布的任务数组
        publish:{type:[ {type:mongoose.Schema.Types.ObjectId,ref:'task'} ]},

        //已经接取的任务
        receive:{type:[ {type:mongoose.Schema.Types.ObjectId,ref:'task'} ]},

        //已经完成的任务
        accomplish:{type:[ {type:mongoose.Schema.Types.ObjectId,ref:'task'} ]},


    },
    //普通用户 1  管理员10     超级管理员 999
    level:{type:Number,required:true,default:12}
});



//任务详情
const taskSchema = new mongoose.Schema({
    //标题
    title:{type:String},

    //内容
    content:{type:String},

    //发布人
    author:{type:mongoose.Schema.Types.ObjectId,ref:'user'},

    //接取人
    receiver:{type:[ {type:mongoose.Schema.Types.ObjectId,ref:'user'} ]},

    //发布时间
    time:{type:String,default: new Date()},

    //接取人数限制
    num:{type:Number},

    //奖励
    reward:{type:String},

    //难度
    difficulty:{type:String},

    //截止日期
    expiration:{type:String},

    //任务是否已经完成
    can:{type:Boolean,default:false}

})


//创建表
const user = mongoose.model('user',userSchema);
const task = mongoose.model('task',taskSchema);


module.exports = {
    user,
    task
}















