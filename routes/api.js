const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Contents = require('../models/contents');

//统一返回格式
let responseData;

router.use(function(req, res, next){
    responseData = {
        code: 0,
        message: ''
    };
    next();
});

router.post('/user/register', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;

    if(username === ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    if(password === ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    
    //数据库重名验证
    Users.findOne({username: username}).then(userInfo => {
        if(userInfo){
            return Promise.reject('用户名已注册');
        }

        let user = new Users({username: username, password: password});
        return user.save();
    }).then(userInfo => {
        responseData.message = '注册成功';
        res.json(responseData);
    }).catch(err => {
        responseData.code = 4;
        responseData.message = err;
        res.json(responseData);
    });
});

router.post('/user/login', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;

    if(username === '' || password === ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }

    //查询数据库用户信息存在
    Users.findOne({username: username, password: password}).then(userInfo => {
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }

        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
    });

});

router.get('/user/logout', (req, res, next) => {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});

//获取评论
router.get('/comment', (req, res, next) => {
    var contentId = req.query.contentId;

    Contents.findOne({_id: contentId}).then(content => {
        responseData.message = "获取成功";
        responseData.data = content.comments.reverse();
        res.json(responseData);
    });
});

//评论提交
router.post('/comment/post', (req, res, next) => {
    //内容id
    var contentId = req.body.contentId;
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    }

    Contents.findOne({_id: contentId}).then(content => {
        content.comments.push(postData);
        return content.save();
    }).then(newContent => {
        responseData.message = "评论成功";
        responseData.data = newContent.comments.reverse();
        res.json(responseData);
    }).catch(err => {
    });
});

module.exports = router;
