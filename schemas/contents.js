const mongoose = require('mongoose');

//内容表结构
module.exports = new mongoose.Schema({
    //分类--关联字段
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories'
    },
    //用户--关联字段
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    //标题
    title: String,
    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    //阅读量
    views: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    }
}, {usePushEach: true});
