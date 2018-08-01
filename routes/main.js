const express = require('express');
const router = express.Router();
const Categories = require('../models/categories');
const Contents = require('../models/contents');

var data = {};

router.use(function(req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    }
    Categories.find().then(categories => {
        data.categories = categories;
        next();
    });
});

router.get('/', (req, res, next) => {

     //limit限制条数
    //skip忽略多少条
    data.category = req.query.category || '';
    data.page = Number(req.query.page || 1);
    data.limit = 1;
    data.pages = 0;
    var where = {};

    if(data.category) {
        where.category = data.category;
    };

    Contents.where(where).count().then(count => {
        data.count = count;
        data.pages = Math.ceil(count / data.limit);
        data.page = Math.min(data.pages, data.page);
        data.page = Math.max(1, data.page);
        let skip = (data.page - 1) * data.limit;
        
        return Contents.where(where).find().limit(data.limit).skip(skip).sort({addTime: -1}).populate(['category', 'user']);
    }).then(contents => {
        data.contents = contents;
        res.render('main/index', data);
    });
});

router.get('/view', (req, res, next) => {
    var contentId = req.query.id;

    Contents.findOne({_id: contentId}).then(content => {
        data.content = content;

        content.views++;
        content.save();

        res.render('main/view.html', data);
    });
});

module.exports = router;
