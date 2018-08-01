const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Categories = require('../models/categories');
const Contents = require('../models/contents');

router.use((req, res, next) => {
    if(!req.userInfo.isAdmin){
        res.send('对不起，没有权限');
        return;
    }
    next();
});

router.get('/', (req, res, next) => {
    res.render('admin/index.html', {
        userInfo: req.userInfo
    });
});

router.get('/user', (req, res, next) => {
    //limit限制条数
    //skip忽略多少条

    let page = Number(req.query.page || 1);
    let limit = 10;
    let pages = 0;

    Users.count().then(count => {
        pages = Math.ceil(count / limit);
        page = Math.min(pages, page);
        page = Math.max(1, page);
        let skip = (page - 1) * limit;

        Users.find().sort({_id: -1}).limit(limit).skip(skip).then(users => {
            res.render('admin/user.html', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                count: count,
                limit: limit,
                pages: pages
            });
        });
    });
    
});

router.get('/category', (req, res, next) => {
    //limit限制条数
    //skip忽略多少条

    let page = Number(req.query.page || 1);
    let limit = 10;
    let pages = 0;

    Categories.count().then(count => {
        pages = Math.ceil(count / limit);
        page = Math.min(pages, page);
        page = Math.max(1, page);
        let skip = (page - 1) * limit;

        Categories.find().sort({_id: -1}).limit(limit).skip(skip).then(categories => {
            res.render('admin/category.html', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                count: count,
                limit: limit,
                pages: pages
            });
        });
    });
});

router.get('/category/add', (req, res, next) => {
    res.render('admin/category_add.html', {
        userInfo: req.userInfo
    });
});

router.post('/category/add', (req, res, next) => {
    let name = req.body.name;

    if(name.trim() === ''){
        res.render('admin/error.html', {
            userInfo: req.userInfo,
            errorMessage: '名称不能为空'
        });
        return;
    }

    //查询是否有同名
    Categories.findOne({name: name}).then(rs => {
        if(rs){
            res.render('admin/error.html', {
                userInfo: req.userInfo,
                errorMessage: '该名称已存在'
            });
            return Promise.reject();
        }

        return new Categories({name: name}).save();
    }).then(newCategory => {
        res.render('admin/success.html', {
            userInfo: req.userInfo,
            errorMessage: '添加分类成功',
            url: '/admin/category'
        });
    });

});

router.get('/category/edit', (req, res, next) => {
    //读取要修改的分类信息
    let id = req.query.id || '';

    Categories.findOne({_id: id}).then(category => {
        if(!category){
            res.render('admin/error.html', {
                userInfo: req.userInfo,
                errorMessage: '分类信息不存在'
            });
        }else{
            res.render('admin/category_edit.html', {
                userInfo: req.userInfo,
                category: category
            });
        }
    })
});

router.post('/category/edit', (req, res, next) => {
    //读取要修改的分类信息
    let id = req.query.id || '';
    let name = req.body.name || '';

    Categories.findOne({_id: id}).then(category => {
        if(!category){
            res.render('admin/error.html', {
                userInfo: req.userInfo,
                errorMessage: '分类信息不存在'
            });
            return Promise.reject();
        }else{
            if(name === category.name){
                res.render('admin/success.html', {
                    userInfo: req.userInfo,
                    errorMessage: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            }else{
                return Categories.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
        }
    }).then(sameCategory => {
        if(sameCategory){
            res.render('admin/error.html', {
                userInfo: req.userInfo,
                errorMessage: '已存在同名的数据',
                url: '/admin/category'
            });
            return Promise.reject();
        }else{
            return Categories.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(() => {
        res.render('admin/success.html', {
            userInfo: req.userInfo,
            errorMessage: '修改成功',
            url: '/admin/category'
        });
    });
});

router.get('/category/delete', (req, res, next) => {
    //读取要修改的分类信息
    let id = req.query.id || '';

    Categories.remove({_id: id}).then(category => {
        res.render('admin/success.html', {
            userInfo: req.userInfo,
            errorMessage: '删除成功',
            url: '/admin/category'
        });
    })
});

router.get('/content', (req, res, next) => {

    //limit限制条数
    //skip忽略多少条

    let page = Number(req.query.page || 1);
    let limit = 10;
    let pages = 0;

    Contents.count().then(count => {
        pages = Math.ceil(count / limit);
        page = Math.min(pages, page);
        page = Math.max(1, page);
        let skip = (page - 1) * limit;

        Contents.find().sort({_id: -1}).limit(limit).skip(skip).sort({addTime: -1}).populate(['category', 'user']).then(contents => {
            res.render('admin/content.html', {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                count: count,
                limit: limit,
                pages: pages
            });
        });
    });
});

router.get('/content/add', (req, res, next) => {
    Categories.find().sort({_id: -1}).then(categories => {
        res.render('admin/content_add.html', {
            userInfo: req.userInfo,
            categories: categories
        });
    })
});

router.post('/content/add', (req, res, next) => {
    if(req.body.category == ''){
        res.render('admin/error.html', {
            userInfo: req.userInfo,
            errorMessage: '所属分类不能为空'
        });
        return;
    }

    if(req.body.title == ''){
        res.render('admin/error.html', {
            userInfo: req.userInfo,
            errorMessage: '分类标题不能为空'
        });
        return;
    }

    new Contents({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        user: req.userInfo._id.toString()
    }).save().then(() => {
        res.render('admin/success.html', {
            userInfo: req.userInfo,
            errorMessage: '添加成功',
            url: '/admin/content'
        });
    })
});

router.get('/content/edit', (req, res, next) => {
    var id = req.query.id || '';

    Categories.find().sort({_id: 1}).then(categories => {
        return Promise.resolve(categories);
    }).then(categories => {
        Contents.findOne({
            _id: id
        }).then(content => {
            if(!content){
                res.render('admin/error.html', {
                    userInfo: req.userInfo,
                    errorMessage: '内容不存在'
                });
                return Promise.reject();
            }else{
                res.render('admin/content_edit.html', {
                    userInfo: req.userInfo,
                    id: id,
                    content: content,
                    categories: categories
                });
            }
        });
    });
});

router.post('/content/edit', (req, res, next) => {

    var id = req.query.id || '';

    if(req.body.category == ''){
        res.render('admin/error.html', {
            userInfo: req.userInfo,
            errorMessage: '所属分类不能为空'
        });
        return;
    }

    if(req.body.title == ''){
        res.render('admin/error.html', {
            userInfo: req.userInfo,
            errorMessage: '分类标题不能为空'
        });
        return;
    }

    Contents.update({_id: id}, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(content => {

        res.render('admin/success.html', {
            userInfo: req.userInfo,
            errorMessage: '修改成功',
            url: '/admin/content'
        });
    })
});

router.get('/content/delete', (req, res, next) => {
    var id = req.query.id || '';

    Contents.remove({_id: id}).then(() => {
        res.render('admin/success.html', {
            userInfo: req.userInfo,
            errorMessage: '删除成功',
            url: '/admin/content'
        });
    });
});

module.exports = router;
