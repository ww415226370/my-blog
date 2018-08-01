$(function(){
    var pages = 0;
    var currentPage = 1;
    var limit = 10;
    var commentDatas = [];

    function getComments() {
        $.ajax({
            url: '/api/comment',
            type: 'get',
            data: {
                contentId: window.location.search.split('=')[1]
            },
            success: function(res) {
                commentDatas = res.data;
                forPages(commentDatas);
            }
        });
    }

    getComments();

    $('#comment-btn').on('click', function(){
        var commentVal = $('#comment').val().trim();
        if(!commentVal) return;
        
        $.ajax({
            url: '/api/comment/post',
            type: 'post',
            data: {
                contentId: window.location.search.split('=')[1],
                content: commentVal
            },
            dataType: 'json',
            success: function(res) {
                $('#comment').val('');
                commentDatas = res.data;
                currentPage = 1;
                forPages(commentDatas);
            }
        });
    });

    $('#comment-pages').find('.previous').on('click', function() {
        forPages(commentDatas, -1);
    });

    $('#comment-pages').find('.next').on('click', function() {
        forPages(commentDatas, 1);
    });

    function renderComment(list, data) {
        var html = '';
        for(let comment of data){
            html += `<li>
                <p style="overflow: hidden;">
                    <span>${comment.username}：</span><span style="float: right;">${formatDate(comment.postTime)}</span>
                </p>
                <div style="overflow: hidden;word-break: break-all;">${comment.content}</div>
            </li>`;
        };
        list.html(html);
    }

    function formatDate(d) {
        var date = new Date(d);
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    }

    function forPages(commentDatas, toPage){
        pages = Math.ceil(commentDatas.length / limit);
        if(toPage) {
            currentPage = currentPage + toPage;
            currentPage = Math.min(currentPage, pages);
            currentPage = Math.max(currentPage, 1);
        }
        var currentPageDatas = commentDatas.slice((currentPage - 1) * limit, currentPage * limit);
        $('#comment-pages').find('.message-pages').html(` 一共有 ${commentDatas.length} 条数据， 每天显示 ${limit} 条数据， 一共 ${pages} 页， 当前 ${currentPage} 页`);

        $('#comments-len').html(commentDatas.length);
        renderComment($('#comment-list'), currentPageDatas);
    }
});


