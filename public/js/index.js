$(function(){
    var login = $('#login .btnBox');
    var register = $('#register .btnBox');
    var userInfo = $('#userInfo');
    var logout = $('#logout');

    login.find('input').eq(1).on('click', function(){
        login.parent().hide();
        register.parent().show();
    });

    register.find('input').eq(1).on('click', function(){
        login.parent().show();
        register.parent().hide();
    });

    //注册
    register.find('input').eq(0).on('click', function(){
        var username = register.parent().find('[name=username]').val().trim();
        var password = register.parent().find('[name=password]').val().trim();
        $.ajax({
            url: '/api/user/register',
            type: 'post',
            data: {
                username: username,
                password: password
            },
            dataType: 'json',
            success: function(result){
                $('#register-results').html(result.message);
                if(!result.code){
                    setTimeout(function() {
                        login.parent().show();
                        register.parent().hide();
                    }, 1000);
                }
            }
        })
    });

    //登录
    login.find('input').eq(0).on('click', function(){
        var username = login.parent().find('[name=username]').val().trim();
        var password = login.parent().find('[name=password]').val().trim();
        $.ajax({
            url: '/api/user/login',
            type: 'post',
            data: {
                username: username,
                password: password
            },
            dataType: 'json',
            success: function(result){
                $('#login-results').html(result.message);
                if(!result.code){
                    window.location.reload();
                }
            }
        })
    });

    //退出
    logout.on('click', function(){
        $.ajax({
            url: '/api/user/logout',
            type: 'get',
            success: function(result){
                if(!result.code){
                    window.location.reload();
                }
            }
        })
    })

});
