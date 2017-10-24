/**
 * Created by haileyyin on 4/5/17.
 */

var PREVIOUS_URL = "";
var NEXT_URL = "";
var FIRST_PAGE = 0; //0为首页
var SECOND_PAGE = 1; //1为details页
var FAVORITE_LIST = [];
var TYPE = "";
var TIMERID = "";
var LATITUDE = '';
var LONGITUDE = '';

(function () {

    $("[data-toggle='tooltip']").tooltip();

    angular.module('hailey-app', []).controller('myCtrl', function ($scope, $compile) {
        $scope.appendDynamicTable = function (html) {
            var temp = $compile(html)($scope);
            angular.element(document.getElementById('table-body')).append(temp);
        }
    })

    if(localStorage.getItem("favoriteList") != null){
        FAVORITE_LIST = JSON.parse(localStorage.getItem("favoriteList"));
    }

    FB.init({
        appId      : '1489625841070947',
        status     : true,
        xfbml      : true,
        version    : 'v2.7' // or v2.6, v2.5, v2.4, v2.3
    });

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;

        LATITUDE = crd.latitude;
        LONGITUDE = crd.longitude;
    };

    function error(err) {
        console.warn('ERROR('+ err.code +'): '+ err.message);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

})();

$('#clear').click(function () {
    $('#keyword').val("");
    $('#details').css('display','none');
    $('#table-head').html('');
    $('#table-body').html('');
    $('.page-row').html('');
    $('.progress-area').css('display','none');
    clearTimeout(TIMERID);

    $("li").each(function(){
        if($(this).text().toLowerCase() == 'users'){
            $(this).addClass('active')
        } else {
            $(this).removeClass('active')
        }
    });
});

$("li").each(function(){
    if($(this).hasClass('active')){
        var type = $(this).text().toLowerCase();
        TYPE = type.substr(0,type.length-1);
    }
});

$('li').click(function () {
    $(this).addClass("active");
    $(this).siblings().removeClass("active");
    var type = $(this).text().toLowerCase();
    TYPE = type.substr(0,type.length-1);
    if($('#keyword').val() != ''){
        $("#keyword").tooltip('hide');
        if(TYPE == "place") {
            var data = {keyword: $('#keyword').val(),type: TYPE,lat:LATITUDE,lng:LONGITUDE};
            getDataFromPHP(data,FIRST_PAGE);
        } else if(TYPE == "favorite") {
            $('#table-row').css('display','none');
            $('.progress-area').css('display','');
            appendFavoriteTable();
        } else {
            var data = {keyword: $('#keyword').val(),type: TYPE};
            getDataFromPHP(data,FIRST_PAGE);
        }
    } else if($('#keyword').val() =='' && TYPE == "favorite") {
        $('#table-row').css('display','none');
        $('.progress-area').css('display','');
        appendFavoriteTable();
    } else {
        $('#details').css('display','none');
        $('#table-head').html('');
        $('#table-body').html('');
        $('.page-row').html('');
        $('.progress-area').css('display','none');
        $("#keyword").attr('data-title','Please type a keyword');
        $("#keyword").tooltip('show');
    }
});

$("#content-table").on("click",".details-btn",function() {
    $('#details').css('display','');
    $('#details').removeClass('ng-leave');
    $('#content').removeClass('ng-enter');
    $('#details').addClass('ng-enter');
    $('#content').addClass('ng-leave');
    var id = $(this).closest('tr').find('#id').text();
    var data = {id: id};
    if(TYPE == 'event'||(TYPE == 'favorite'&&$(this).closest('tr').find('td:nth-child(4)').text() == 'events')) {
        showDetails(data);
    } else {
        showProgressBar(data,SECOND_PAGE);
    }
});

$("#content-table").on("click",".favorite-btn",function () {
    likeItOrNot($(this), FIRST_PAGE);
});

$('.favorite-btn').click(function () {
    likeItOrNot($(this), SECOND_PAGE);
});

$("#content-table").on("click",".favorite-delete",function () {
    for(var i=0; i<FAVORITE_LIST.length; i++){
        if (FAVORITE_LIST[i]['id'] === $(this).closest('tr').find('#id').text()) {
            FAVORITE_LIST.splice(i, 1);
        }
    }
    localStorage.setItem("favoriteList", JSON.stringify(FAVORITE_LIST));
    appendFavoriteTable();
});

$("#search-button").click(function(){
    $('#content').removeClass('ng-leave');
    $('#details').removeClass('ng-enter');
    $('#content').addClass('ng-enter');
    $('#details').addClass('ng-leave');

    if($('#keyword').val() != ''){
        $("#keyword").attr('data-original-title','');
        if(TYPE == "place") {
            var data = {keyword: $('#keyword').val(),type: TYPE,lat:LATITUDE,lng:LONGITUDE};
            showProgressBar(data,FIRST_PAGE);
        } else if(TYPE == "favorite") {
            $('#table-row').css('display','none');
            $('.progress-area').css('display','');
            TIMERID = setTimeout(function(){ appendFavoriteTable();}, 2000);
        } else {
            var data = {keyword: $('#keyword').val(),type: TYPE};
            showProgressBar(data,FIRST_PAGE);
        }
    } else {
        $("#keyword").attr('data-original-title','Please type a keyword');
        $("#keyword").tooltip('show');
    }
});

$('#facebook').click(function () {
    FB.ui({
        method: 'feed',
        picture: $('.post-img').attr('src'),
        name: $('#detail-name').html(),
        caption: 'FB SEARCH FROM USC CSCI571',
        display: 'popup',
        link: window.location.href
    }, function(response){
        if(response && !response.error_message){
            alert('Post successfully');
        } else {
            alert("Not Posted");
        }
    });
});

$('#back').click(function () {
    if(TYPE =='favorite') {
        appendFavoriteTable();
    }
});

function paging(url){
    var data = {pageurl: url};
    getDataFromPHP(data,FIRST_PAGE);
}

function getDataFromPHP(data,page){
    $.ajax({
        url: "hw08rest.php",
        type: "GET",
        dataType: "JSON",
        data: data,
        success: function(result){
            if(page == 0){
                appendTable(result)
            } else if(page == 1){
                showDetails(result);
            }
        },
        error: function (err, result) {
            console.log("Error: "+JSON.stringify(err));
        }
    });
}

function appendTable(result) {
    $('#table-row').css('display','');
    $('.progress-area').css('display','none');

    var head = "<tr><td width='5%'>#</td>"
        +"<td width='17%'>Profile photo</td>"
        +"<td width='53%'>Name</td>"
        +"<td width='13%'>Favorite</td>"
        +"<td width='12%'>Details</td>"
        +"</tr>";
    var html = "";
    var buttons = "";
    var count = 0;
    for(var i=0; i<result['data'].length; i++){
        var favoriteHTML = "glyphicon-star-empty";
        FAVORITE_LIST.forEach(function (element) {
            if (element.id === result['data'][count].id) {
                favoriteHTML = "glyphicon-star yellow";
            }
        });
        count++;
        var tr = "<tr>"
            +"<td>" + (i+1) + "</td>"
            +"<td id='photo'><img src='" + result['data'][i]['picture']['data']['url'] + "'></td>"
            +"<td id='name'>" + result['data'][i]['name'] + "</td>"
            +"<td><button class='favorite-btn'><i class='glyphicon "+ favoriteHTML +"'></i></button></td>"
            +"<td><button class='details-btn' ng-click=\"details='ng-enter';content='ng-leave'\"><i class='glyphicon glyphicon-chevron-right'></i></button></td>"
            +"<td style='display: none' id='id'>" + result['data'][i]['id'] + "</td></tr>";
        html += tr;
    }
    if(result['paging']){
        if(result['paging']['previous']) {
            PREVIOUS_URL = result['paging']['previous'];
            buttons += "<a href='#page-row' type='button' class='btn' id='previous' onclick='paging(PREVIOUS_URL)'>Previous</a>";
        }
        if(result['paging']['next']){
            NEXT_URL = result['paging']['next'];
            buttons += "<a href='#page-row' type='button' class='btn' id='next' onclick='paging(NEXT_URL)'>Next</a>";
        }
    }
    $('#table-head').empty();
    $('#table-body').empty();
    $('#page-row').empty();
    $('#table-head').append(head);
    $('#page-row').append(buttons);
    angular.element(document.getElementById('table-row')).scope().appendDynamicTable(html);
}

function appendFavoriteTable() {
    $('#table-row').css('display','');
    $('.progress-area').css('display','none');

    var head = "<tr><td width='5%'>#</td>"
        +"<td width='25%'>Profile photo</td>"
        +"<td width='25%'>Name</td>"
        +"<td width='15%'>Type</td>"
        +"<td width='15%'>Favorite</td>"
        +"<td width='15%'>Details</td>"
        +"</tr>";
    var body = "";
    FAVORITE_LIST.forEach(function (element, index) {
        var item = "<tr><td>"+(index+1)+"</td>"
            +"<td><img src='"+element.photo+"'></td>"
            +"<td>"+element.name+"</td>"
            +"<td>"+element.type+"</td>"
            +"<td><button class='favorite-delete'><i class='glyphicon glyphicon-trash'></i></button></td>"
            +"<td><button class='details-btn' ng-click=\"details='ng-enter';content='ng-leave'\"><i class='glyphicon glyphicon-chevron-right'></i></button></td>"
            +"<td style='display: none' id='id'>" + element.id + "</td></tr>"
        body += item;
    });
    $('#table-head').empty();
    $('#table-body').empty();
    $('#page-row').empty();
    $('#table-head').append(head);
    angular.element(document.getElementById('table-row')).scope().appendDynamicTable(body);
}

function showDetails(result) {
    $('.albums-progress').css('display','none');
    $('.posts-progress').css('display','none');
    $('#albums-list').css('display','');
    $('#posts-list').css('display','');
    $('#facebook').css('display','');
    $('#favorite').css('display','');
    $('#albums-list').empty();
    $('#posts-list').empty();
    for(var i=0; i<FAVORITE_LIST.length; i++){
        if (FAVORITE_LIST[i]['id'] === result['id']) {
            $('#favorite').find('i').removeClass('glyphicon-star-empty');
            $('#favorite').find('i').addClass('yellow');
            $('#favorite').find('i').addClass('glyphicon-star');
        } else {
            $('#favorite').find('i').addClass('glyphicon-star-empty');
            $('#favorite').find('i').removeClass('yellow');
            $('#favorite').find('i').removeClass('glyphicon-star');
        }
    }
    var albums = "";
    var posts = "";
    $('#details-id').val(result['id']);

    if(TYPE != "favorite") {
        $('#details-type').val(TYPE+'s');
        $('#content-table tr').each(function(){
            if($(this).find('td:nth-child(6)').text() == result['id']) {
                $('#details-photo').val($(this).find('td:nth-child(2)').find('img').attr('src'));
                $('#details-name').val($(this).find('td:nth-child(3)').text());
            }
        });
    } else {
        $('#content-table tr').each(function(){
            if($(this).find('td:nth-child(7)').text() == result['id']) {
                $('#details-photo').val($(this).find('td:nth-child(2)').find('img').attr('src'));
                $('#details-name').val($(this).find('td:nth-child(3)').text());
                $('#details-type').val($(this).find('td:nth-child(4)').text());
            }
        });
    }


    if(result['albums']){
        for(var i=0; i<result['albums']['data'].length; i++){
            var img = "";
            if(result['albums']['data'][i]['photos']&&result['albums']['data'][i]['photos']['data'][0]){
                var url = "https://graph.facebook.com/v2.8/"+ result['albums']['data'][i]['photos']['data'][0]['id'] +"/picture?access_token=EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD";
                img += "<img class='details-img' src='"+ url +"'>"
            }
            if(result['albums']['data'][i]['photos']&&result['albums']['data'][i]['photos']['data'][1]) {
                var url = "https://graph.facebook.com/v2.8/"+ result['albums']['data'][i]['photos']['data'][1]['id'] +"/picture?access_token=EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD";
                img += "<img class='details-img' src='"+ url +"'>"
            }
            var collapseStatue = i==0? "in":"";
            var item = "<div class='panel panel-default album-item'>"
                + "<div class='panel-heading'>"
                + "<h4 class='panel-title'>"
                + "<a data-toggle='collapse' data-parent='#albums-list' href='#collapse"+i+"'>"+result['albums']['data'][i]['name']+" </a>"
                + "</h4></div>"
                + "<div id='collapse"+i+"' class='panel-collapse collapse " + collapseStatue + "'>"
                + "<div class='panel-body'>"+img +"</div></div></div>";
            albums += item;
        }
    } else {
        albums += "<div class='no-data-area'><span>No data found.</span></div>";
    }
    if(result['posts']){
        for(var i=0; i<result['posts']['data'].length; i++) {
            var arr = [];
            arr = result['posts']['data'][i]['created_time'].split('T');
            var time = arr[0]+" "+arr[1].substr(0,8);
            var item = "<div class='card post-item'>"
                + "<div class='card-block'>"
                + "<div class='post-first-row' style='display: flex'>"
                + "<div class='inline-element' style='flex-grow:0;'><img class='post-img' src='"+result['picture']['data']['url']+"'></div>"
                + "<div class='inline-element' style='margin-left: 20px;flex:1;'><span id='detail-name'>"+result['name']+"</span><br><span>"+time+"</span></div></div>"
                + "<div class='post-second-row'>"+result['posts']['data'][i]['message']+"</div></div></div>";
            posts += item;
        }
    } else {
        posts += "<div class='no-data-area'><span>No data found.</span></div>";
    }

    $('#albums-list').append(albums);
    $('#posts-list').append(posts);
}

function likeItOrNot(btn, page) {
    if(btn.find('i').hasClass('yellow')){
        btn.find('i').removeClass('yellow');
        btn.find('i').removeClass('glyphicon-star');
        btn.find('i').addClass('glyphicon-star-empty');

        var id = "";
        if(page == 0) {
            id = btn.closest('tr').find('#id').text();
        } else {
            id = $('#details-id').val();
            $('#content-table tr').each(function(){
                if($(this).find('td:nth-child(6)').text() == id) {
                    $(this).find('td:nth-child(4)').find('i').removeClass('yellow');
                    $(this).find('td:nth-child(4)').find('i').removeClass('glyphicon-star');
                    $(this).find('td:nth-child(4)').find('i').addClass('glyphicon-star-empty');
                }
            });
        }

        for(var i=0; i<FAVORITE_LIST.length; i++){
            if (FAVORITE_LIST[i]['id'] === id) {
                FAVORITE_LIST.splice(i, 1);
            }
        }
        localStorage.setItem("favoriteList", JSON.stringify(FAVORITE_LIST));

    } else {
        btn.find('i').addClass('yellow');
        btn.find('i').addClass('glyphicon-star');
        btn.find('i').removeClass('glyphicon-star-empty');

        var id = "";
        var object = {};
        if(page == 0) {
            id = btn.closest('tr').find('#id').text();
            object = {
                photo: btn.closest('tr').find('#photo').find('img').attr('src'),
                name: btn.closest('tr').find('#name').text(),
                type: TYPE+"s",
                id: id
            };
        } else {
            object = {
                photo: $('#details-photo').val(),
                name: $('#details-name').val(),
                type: $('#details-type').val(),
                id: $('#details-id').val()
            };
        }

        var isDuplicate = false;
        if(FAVORITE_LIST.length > 0) {
            FAVORITE_LIST.forEach(function (element) {
                if (element.id === object.id) {
                    isDuplicate = true;
                    return false;
                }
            });
        }
        if(!isDuplicate){
            FAVORITE_LIST.push(object);
            localStorage.setItem("favoriteList", JSON.stringify(FAVORITE_LIST));
        }


    }
}

function showProgressBar(data, page){
    if(page == 0) {
        $('#table-row').css('display','none');
        $('.progress-area').css('display','');
    } else {
        $('#albums-list').css('display','none');
        $('#posts-list').css('display','none');
        $('#facebook').css('display','none');
        $('#favorite').css('display','none');
        $('.albums-progress').css('display','');
        $('.posts-progress').css('display','');
    }
    TIMERID = setTimeout(function(){ getDataFromPHP(data,page)}, 1000);
}