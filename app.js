const express = require('express');
const swig = require('swig');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Cookies = require('cookies');
const Users = require('./models/users');

const app = express();

//设置静态文件托管
//当用户访问文件以public 开始，直接返回__dirname + '/public'下文件
app.use('/public', express.static(__dirname + '/public'));

//配置模板引擎，第一个参数模板引擎名称，也是后缀；第二个参数表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);

//设置模板文件存放的目录
app.set('views', './views');

//注册使用的模板引擎
app.set('view engine', 'html');

//开发取消模板缓存
swig.setDefaults({cache: false});
app.use(bodyParser.urlencoded({extended: true}));

//设置cookies
app.use(function(req, res, next){
    req.cookies = new Cookies(req, res);
    //解析登录用户的cookies信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前用户是否是管理员
            Users.findById(req.userInfo._id).then(userInfo => {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            });
        }catch(err){
            next();
        }
    }else{
        next();
    }
});

//根据不同功能划分模块
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/main'));

mongoose.connect('mongodb://localhost:27017/blog', (err, res) => {
    if(err){
        console.log('connect failed');
    }else{
        console.log('connect success');
        app.listen(3000);
    }
});


//用户发送http请求 》 url 》 解析路由 》 找到匹配的规则 》 找到制定的函数，返回给用户

//public 》 静态 》 直接读取指定的文件返回给用户

//动态 》 处理业务逻辑，加载模板，解析模板 》 返回给用户
