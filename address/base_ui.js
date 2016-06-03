$(function () {
    var AB = {
        debug:true,
        ajax_loading:{},
        log:function(msg){
            AB.debug && window.console.log(msg);
        },
        isZaoban:function(){
            var time = this.getCurrentDate("H:i");
            return (time <= "12:00");
        },
        isSearchZaoban:function(){
            var time = this.getCurrentDate("H:i");
            if (time >= "22:00" || time < "10:00"){
                return true;
            }
            
            return false;
        },
        getCurrentDate:function(format){
            var myDate = new Date();   
            var Y = myDate.getFullYear();
            var m = myDate.getMonth() + 1;
            m = (m < 10) ? "0"+m : m;
            var d = myDate.getDate();        //获取当前日(1-31)  
            d = (d < 10) ? "0"+d : d;
            var H = myDate.getHours();       //获取当前小时数(0-23) 
			H = (H<10) ? "0"+H : H;
            var i = myDate.getMinutes();     //获取当前分钟数(0-59) 
            i = (i<10) ? "0"+i : i;
            var s = myDate.getSeconds();  
            s = (s<10) ? "0"+s : s;
            
            var string = format;
            string = string.replace(/Y/,Y);   
            string = string.replace(/m/,m);
            string = string.replace(/d/,d);
            string = string.replace(/H/,H);
            string = string.replace(/i/,i);
            string = string.replace(/s/,s);
            return string;
        },
        showTip:function(msg,time, autohide, callback){
            time = time || 2000;
            autohide = ("undefined" === typeof autohide) ? true : autohide;
            if ($("#_tmp_pop_message").length > 0) {
                $("#_tmp_pop_message").remove();
            }

            var left=document.documentElement.clientWidth/2-100+'px';
           // var html ='<div id="_tmp_pop_message" style="width:200px;position:fixed;left:20%;top:20%; z-index:9999;  text-align: center;"><div style=" position:relative; height:100%;"><div style=" position:absolute; padding:10px; width:200px;top:0; left:0; z-index:99; background:#000; opacity:0.7; border:1px solid #000;border-radius:6px;-webkit-border-radius:6px;" content="">'+msg+'</div><div style=" padding:10px; position:absolute; width:200px;color:#fff; font-size:14px;z-index:999; text-align:center;">'+msg+'</div></div></div>';  
            var html ='<div id="_tmp_pop_message" style="position:fixed;left:20%;top:20%; width:200px; text-align:center; background:url(/images/h5/bg1.png) repeat center left; line-height:25px; color:#fff; padding:10px;z-index:999;-webkit-border-radius:6px;">'+msg+'</div>';  
            //var html = '<div id="_tmp_pop"  class="fdc-box1 alphabg"></div><div id="_tmp_pop_message" class="fdc-box4 copy_window"><div class="fdc-header header-box m-bottom20"><img src="/images/ui/close.jpg" class="float-right fdc-close" />提示</div><div class="font18 padding-left25">'+msg+'</div></div>';
//$(html).appendTo("body").fadeOut(time);
            $(html).css('left',left).appendTo("body").show();
            //$(html).appendTo("body").show();
            if (autohide){
                setTimeout(function () {
                    $("#_tmp_pop,#_tmp_pop_message").remove();
                    callback && callback();
                }, time);
            }
            
            $("#_tmp_pop_message img").click(function(){
                $("#_tmp_pop,#_tmp_pop_message").remove();
                callback && callback();
            });
        },
        hideTip:function(){
            $("#_tmp_pop_message").remove();
        },
        redirect:function(url){
            window.location.href = url;
        },
        ajax:function(url,data,type, dataType, success, fail, error){
            if (AB.ajax_loading[url]){
                return true;
            }
            
            AB.ajax_loading[url] = true;
            $.ajax({
                "url":url,
                "data":data,
                "dateType":dataType,
                "type":type,
                "success":function(rqData){
                    AB.ajax_loading[url] = false;
                    if (dataType === 'json') {
                        if (rqData.message === "success") {
                            success && success(rqData.data);
                        } else {
                            fail && fail(rqData.message);
                        }
                    }else {
                        success && success(rqData);
                    }
                    
                },
                "error":function(){
                    AB.ajax_loading[url] = false;
                    error && error();
                }
            });
        },
        getText:function(url,data,success, fail,error){
            AB.ajax(url,data,"GET","text", success, fail,error);
        },
        getJson:function(url,data,success, fail,error){
            AB.ajax(url,data,"GET","json", success, fail,error);
        },
        postJson:function(url, data, success, fail, error){
            AB.ajax(url,data,"POST","json", success, fail,error);
        },
        truncate:function(string, length, etc){
            string = "" + string;
            etc = etc || "...";
            if (string.length > length){
                return string.substr(0, length) + etc;
            }else {
                return string;
            }
        },
        timeOut:function(time,obj,callback){
            setTimeout(function () {
                callback && callback(obj);
            }, time);
        },
        setCookie:function(cName, cValue, cAge){
            cAge = cAge || 60*60*24*365;
            cValue = encodeURI(cValue);
            document.cookie = cName + "=" + cValue + 
            "; max-age=" + cAge +
            "; path=/";
        },
        getCookie:function(cName){
            var cValue = "";
            var allCookie = document.cookie;
            var pos = allCookie.indexOf(cName+"=");
            if(pos !== -1) {
                var start = pos + cName.length + 1;
                var end = allCookie.indexOf(";", start);
                if(end === -1)	end = allCookie.length;
                cValue = decodeURI(allCookie.substring(start, end));
            }
            return cValue;
        },
        getBackup:function(){
            return AB.getCookie("page.backup");
        },
        updateBackup:function(url){
            url = url || window.location.href;
            AB.setCookie("page.backup", url);
        },
        getRefer:function(){
            return window.top.document.referrer;
        },
        bindInputClearEvent: function (options) {
            options = options || {};
            $("input[required]").each(function () {
                var next = $(this).next();
                var input = $(this);
                if (next.hasClass("clear")) {
                    next.click(function () {
                        input.val("");
                        next.css("display", "none");
                        options.onClear && options.onClear($(this))
                    });

                    input.focus(function () {
                        if ($(this).val() !== "") {
                            next.css("display", "inline-block");
                        }

                        options.onFocus && options.onFocus($(this));
                    }).blur(function () {
                        setTimeout(function () {
                            next.css("display", "none");
                        }, 120);

                        options.onBlur && options.onBlur($(this));
                    }).bind("input propertychange keyup", function () {
                        if ($(this).val() !== "") {
                            next.css("display", "inline-block");
                        } else {
                            next.css("display", "none");
                        }

                        options.onChange && options.onChange($(this));
                    });
                }
            });
        },
        bindLoadMoreEvent:function(uri, data, callback, selector){
            data = data || {};
            selector = selector || "li";
            $("#loadMore div.loadmore").unbind("click").bind("click", function(){
                $("#loadMore div.loadmore").hide();
                $("#loadMore div.loading").show();
                
                var start = $("#resultList").children(selector).length;
                AB.getText(uri+"?start="+start, data, function (html) {
                    $("#resultList").append(html); 
                    callback && callback(html);
                    var last = $("#resultList").children(selector+":last");
                    if (last.hasClass("data-more")){
                        $("#loadMore div.loadmore").show();
                        $("#loadMore div.loading").hide();
                    }else{
                        $("#loadMore").hide();
                    }
                }, function () {
                    $("#loadMore div.loadmore").show();
                    $("#loadMore div.loading").hide();
                });
            });
        },
        checkOrder:function(orderNumber, tryTime, callback){
            AB.showTip("支付成功，正在跳转...", 5000, false);
            tryTime = tryTime || 5; // 重试5次
            // 检测订单状态
            AB.getJson("/weixin/my/order/check", {"order_number":orderNumber}, function(rqData){
                tryTime--;
                if (rqData.message === 'success' && rqData.data.status == 1){
                    callback && callback(orderNumber);
                }else if (tryTime > 0) {
                    setTimeout(function () {
                        AB.checkOrder(orderNumber, tryTime, callback);
                    }, 1000);
                }
            },function(){
                tryTime--;
                setTimeout(function () {
                    AB.checkOrder(orderNumber, tryTime, callback);
                }, 1000);
            });
        },
        isWeixin:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /micromessenger/.test(ua);
        },
        isIphone:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /iphone/.test(ua);
        },
        isAndroid:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /android/.test(ua);
        }
    };
    
    AB.Validater = {
        isPhoneNumber:function(text){
            return /^1[3-9][0-9]{9}$/.test(text);
        },
        isSmsCaptcha:function(text){
            return /^[0-9]{4}$/.test(text);
        }
    };

    AB.LoadMore = {
        isLoading:false,
        loading:function(){
            $("#loadMore div.loadmore").hide();
            $("#loadMore,#loadMore div.loading").show();
            this.isLoading = true;
        },
        show:function(){
            $("#loadMore div.loading").hide();
            $("#loadMore,#loadMore div.loadmore").show();
            this.isLoading = false;
        },
        hide:function(){
            $("#loadMore").hide();
            this.isLoading = false;
        },
        click:function(callback){
            $("#loadMore div.loadmore").unbind("click").bind("click", callback);
        }
    };
    
    AB.Selectbox = function(onSelect){
        var selector = "#selectBox";  
        
        function init(){
            $(selector).find("div[name=option]").click(function(){
                var option = $(this).attr("data-option");
                onSelect && onSelect(option);
                hide();
            });
            
            $(selector).click(function(){
                hide();
            });
        }
        
        function show(option){
            $(selector).show();
            $("#selectBox span").hide();
            if (option){
                $("#selectBox div[data-option="+option+"]").find("span").show();
            }
        }
        
        function hide(){
            $(selector).hide();
        }
        
        init();
        return {
            show:show
        };
    };
    
    AB.Address = function(input, result, onSelect){
        var cache = {};
        var inputSelector = input;
        var resultSelector = result;
        function init(){
            $(inputSelector).on("keyup", function(e){
                if (keyPress(e.keyCode, resultSelector)) return;
                var value = $.trim($(this).val());
                placeSearch(value);
            }).blur(function(){
                setTimeout(function () {
                    $(resultSelector).hide();
                }, 200);
                
                $("li.focus").removeClass("focus");
            });
        }

        function keyPress(keyCode, selector)
        {
            var focus = $(resultSelector).find("li.focus");
            var up = focus.length > 0 ? focus.prev() : focus;
            var down = focus.length > 0 ? focus.next() : $(selector).find("li").eq(0);
            if (keyCode == 38){
                if (up.length > 0){
                    focus.removeClass("focus");
                    up.addClass("focus");
                }

                return true;
            }else if (keyCode == 40){
                if (down.length > 0){
                    focus.removeClass("focus");
                    down.addClass("focus");
                }
                return true;
            }else if (keyCode == 13){
                $(resultSelector).find("li.focus").click();
                return true;
            }

            return false;
        }

        function placeSearch(query) {
            query = $.trim(query);
            if (query === ""){
                cache[query] = [];
            }
            if (cache[query]){
                updateSuggestBox(cache[query]);
                return;
            }

            var region = encodeURI("北京");
            var keyword = encodeURI(query);
            var url = "http://apis.map.qq.com/ws/place/v1/suggestion/?keyword="+keyword+"&region="+region+"&output=jsonp&key=3JLBZ-B7PRJ-CHRFM-KNZKB-UARAH-72FFF&callback=?";
            $.getJSON(url,function(rqData){
                if (rqData.status === 0){
                    cache[query] = rqData.data;
                    updateSuggestBox(rqData.data);
                }
            });
        }

        function updateSuggestBox(data){
            var box = $(resultSelector).find("ul");
            box.html("");
            var html = [];
            for (var i = 0; i < data.length && i < 10; i++) {
                var name = data[i].title;
                var city = data[i].city;
                var region = data[i].district;
                var lnglat = "";
                if (data[i].location) {
                    lnglat = data[i].location.lng + "," + data[i].location.lat;
                }

                html.push("<li class='black-color1' data-city='" + city + "'data-region='" + region + "'data-lnglat='" + lnglat + "'>"+name+"</li>");
            }
            
            box.html(html.join(""));
            $(resultSelector).show();
            box.find("li").click(function () {
                var name = $(this).text();
                var city = $(this).attr("data-city").replace("市", "");
                var region = $(this).attr("data-region");
                var lnglat = $(this).attr("data-lnglat");
                onSelect && onSelect(name, city, region, lnglat);
                $(resultSelector).hide();
            }).on("hover",function(){
                $("li.focus").removeClass("focus");
                $(this).addClass("focus");
            });
        }

        function onSelect(name, city, region, lnglat){
            $("#start").val(name);
            $("#start_city").val(city);
            $("#start_region").val(region);
            $("#start_lnglat").val(lnglat);
        }

        return {
            init:init
        };
    };
    
    window['AB'] = AB;
});