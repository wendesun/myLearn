(function () {
    var loadingCountNum = 0;
    window['TVC'] = {
        debug: true,
        ajax_loading: {},
        log: function (msg) {
            TVC.debug && window.console.log(msg);
        },
        trim: function (text, len) {
            text = $.trim(text);
            if (len) {
                text = text.substr(0, len);
            }

            return text;
        },
        trimFloat: function (value)
        {
            //先把非数字的都替换掉，除了数字和.
            value = value.replace(/[^\d.]/g, "");
            //必须保证第一个为数字而不是.
            value = value.replace(/^\./g, "");
            //保证只有出现一个.而没有多个.
            value = value.replace(/\.{2,}/g, ".");
            //保证.只出现一次，而不能出现两次以上
            return value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        },
        trimNumber: function (value, len)
        {
            //先把非数字的都替换掉，除了数字和.
            value = value.replace(/[^\d]/g, "");
            return len ? value.substr(0, len) : value;
        },
        trimCharAndNumber: function (value, len)
        {
            //先把非数字的都替换掉，除了数字和.
            value = value.replace(/[^\d[a-zA-Z]/g, "");
            return len ? value.substr(0, len) : value;
        },
        trimTime: function (value)
        {
            //先把非数字的都替换掉，除了数字和:
            value = value.replace(/[^\d:]/g, "");
            //必须保证第一个为数字而不是:
            value = value.replace(/^:/g, "");
            //保证只有出现一个:而没有多个:
            value = value.replace(/:{2,}/g, ":");
            //保证:只出现一次，而不能出现两次以上
            return value.replace(":", "$#$").replace(/:/g, "").replace("$#$", ":");
        },
        empty: function (text) {
            return $.trim(text) === '';
        },
        regex: function (pattern, text) {
            return pattern.test(text);
        },
        getDate: function (format) {
            var myDate = new Date();
            var Y = myDate.getFullYear();
            var m = myDate.getMonth() + 1;
            m = (m < 10) ? "0" + m : m;
            var d = myDate.getDate();        //获取当前日(1-31)  
            d = (d < 10) ? "0" + d : d;
            var H = myDate.getHours();       //获取当前小时数(0-23) 
            H = (H < 10) ? "0" + H : H;
            var i = myDate.getMinutes();     //获取当前分钟数(0-59) 
            i = (i < 10) ? "0" + i : i;
            var s = myDate.getSeconds();
            s = (s < 10) ? "0" + s : s;

            var string = format;
            string = string.replace(/Y/, Y);
            string = string.replace(/m/, m);
            string = string.replace(/d/, d);
            string = string.replace(/H/, H);
            string = string.replace(/i/, i);
            string = string.replace(/s/, s);
            return string;
        },
        showLoading: function (msg, delayhiding){
            //msg = msg || "正在搜索";
            loadingCountNum +=1;
            delayhiding = delayhiding || 0;
            if ($("#_tmp_pop_loading").length === 0) {
                var html = '<div class="loading" id="_tmp_pop_loading"><img src="/images/line_loading.gif" />&nbsp;'+ msg +'</div>';
                $(html).appendTo("body");
            }
            //var left ="-"+ $(".loading").outerWidth(true)/2+"px";
            //$(".loading").css("margin-left",left);

            $("#_tmp_pop_loading").find(".color-white").html(msg);
            $("#_tmp_pop_loading").show();
            if (delayhiding) {
                TVC.hideLoading(delayhiding);
            }
        },
        hideLoading: function (delay) {
            loadingCountNum -= 1;
            if(loadingCountNum < 1){
                delay = delay || 0;
                if (delay > 0) {
                    setTimeout(function () {
                        $("#_tmp_pop_loading").remove();
                    }, delay);
                } else {
                    $("#_tmp_pop_loading").remove();
                }
            }
        },
        showTip: function (msg, time, autohide, callback) {
            time = time || 1500;
            autohide = ("undefined" === typeof autohide) ? true : autohide;
            if ($("#_tmp_pop_message").length > 0) {
                $("#_tmp_pop_message").remove();
            }

            var left = document.documentElement.clientWidth / 2 - 108 + 'px';
            var html = '<div id="_tmp_pop_message" style="position:fixed;top:30%; width:200px; text-align:center; background:rgba(0,0,0,.7); line-height:25px; color:#fff; padding:8px;z-index:10002;-webkit-border-radius:6px;">' + msg + '</div>';
            //$(html).appendTo("body").fadeOut(time);
            $(html).css('left', left).appendTo("body").show();
            if (autohide) {
                setTimeout(function () {
                    $("#_tmp_pop_message").remove();
                    callback && callback();
                }, time);
            }
        },
        showMask: function () {
            $('#notice').click(function () {
                $('.bg-wrapper').fadeIn(1000);
            });
            $('.bg-wrapper').click(function () {
                $(this).fadeOut(1000);

            });

        },
        hideTip: function () {
            $("#_tmp_pop_message").remove();
        },
        alert: function (msg, callback) {
            if ($("#_tmp_alert_message").length > 0) {
                $("#_tmp_alert_message").remove();
            }
            var left = document.documentElement.clientWidth / 2 - 100 + 'px';
            var html = '<div id="_tmp_alert_message" class="floatBox"><div class="fb_bg"></div><div class="fb_Box"><div class="fb_header">提示</div><div class="fb_content">' + msg + '</div><div class="fb_footer"><input type="submit" name="yes" class="fb_btn" value="确定" /></div></div></div>';
            $(html).css('left', left).appendTo("body").show();

            $("#_tmp_alert_message input[name=yes]").click(function(){
                $("#_tmp_alert_message").remove();
                callback && callback();
            });
        },
        confirm: function (msg, yes, no) {
            if ($("#_tmp_confirm_message").length > 0) {
                $("#_tmp_congirm_message").remove();
            }
            var left = document.documentElement.clientWidth / 2 - 100 + 'px';
            var html = '<div id="_tmp_confirm_message" class="floatBox"><div class="fb_bg"></div><div class="fb_Box"><div class="fb_header">提示</div><div id="fb_content" class="fb_content">' + msg + '</div><div class="fb_footer"><input type="submit" name="yes" class="fb_btn" value="确定" id="pager" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" name="no" class="fb_btn" value="取消" /></div></div></div>';
            $(html).css('left', left).appendTo("body").show();
            $("#_tmp_confirm_message input[name=yes]").click(function(){
                $("#_tmp_confirm_message").remove();
                yes && yes();
            });
            $("#_tmp_confirm_message input[name=no]").click(function(){
                $("#_tmp_confirm_message").remove();
                no && no();
            });
        },
        redirect: function (url) {
            window.location.href = url;
        },
        reload: function () {
            window.location.reload();
        },
        ajax: function (url, data, type, dataType, success) {
            if (TVC.ajax_loading[url]) {
                return true;
            }

            TVC.ajax_loading[url] = true;

            var timeout = 10000;
            setTimeout(function () {
                TVC.ajax_loading[url] = false;
            }, timeout);

            $.ajax({
                "url": url,
                "data": data,
                "dateType": dataType,
                "type": type,
                "cache":false,
                "timeout":timeout,
                "success": function (rqData) {
                    TVC.ajax_loading[url] = false;
                    success && success(rqData);
                },
                "error": function () {
                    TVC.ajax_loading[url] = false;
                    alert("网络异常");
                }
            });
        },
        getText: function (url, data, success) {
            TVC.ajax(url, data, "GET", "text", success);
        },
        getJson: function (url, data, success, fail) {
            TVC.ajax(url, data, "GET", "json", function (rqData) {
                if (rqData.message === "success") {
                    success && success(rqData.data);
                } else if (rqData.message === "_NEED_LOGIN_"){
                    TVC.redirect("/admin/login");
                } else {
                    fail && fail(rqData.message);
                }
            });
        },
        postJson: function (url, data, success, fail) {
            TVC.ajax(url, data, "POST", "json", function (rqData) {
                if (rqData.message === "success") {
                    success && success(rqData.data);
                } else if (rqData.message === "_NEED_LOGIN_"){
                    TVC.redirect("/admin/login");
                } else {
                    fail && fail(rqData.message);
                }
            });
        },
        truncate: function (string, length, etc) {
            string = "" + string;
            etc = etc || "...";
            if (string.length > length) {
                return string.substr(0, length) + etc;
            } else {
                return string;
            }
        },
        setCookie: function (cName, cValue, cAge) {
            cAge = cAge || 60 * 60 * 24 * 365;
            cValue = encodeURI(cValue);
            document.cookie = cName + "=" + cValue +
                "; max-age=" + cAge +
                "; path=/";
        },
        getCookie: function (cName) {
            var cValue = "";
            var allCookie = document.cookie;
            var pos = allCookie.indexOf(cName + "=");
            if (pos !== -1) {
                var start = pos + cName.length + 1;
                var end = allCookie.indexOf(";", start);
                if (end === -1)
                    end = allCookie.length;
                cValue = decodeURI(allCookie.substring(start, end));
            }
            return cValue;
        },
        setCloseWindowTip:function(showObject){
            $(window).unbind("beforeunload");
            $(window).bind("beforeunload", function(){
                if (showObject.isShow) {
                    return "";
                }
                return;
            });
        }
    };

    TVC.Validater = {
        isPhoneNumber: function (text) {
            return /^1[3-9][0-9]{9}$/.test(text);
        },
        isSmsCaptcha: function (text) {
            return /^[0-9]{4}$/.test(text);
        },
        isEmail: function (text) {
            return /^[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i.test(text);
        },
        isHaveSbcCase: function (str) {                        //是否存在全角字符
            if (str.length === 0) {
                return false;
            }
            for (var i = str.length - 1; i >= 0; i--) {
                var unicode = str.charCodeAt(i);
                if (unicode > 65280 && unicode < 65375) {
                    return true;
                }
            }
            return false;
        }
    };



    TVC.Pager = function(p, callback){
        function init()
        {
            bindPagingEvent(p, callback);
            gotoNpage(callback);
        };

        function bindPagingEvent(p, callback) {
            if ($("#page").length) {
                $("#page a").click(function () {
                    var page = $(this).html();
                    if (page === '下一页')
                        page = p + 1;
                    if (page === '上一页')
                        page = p - 1;
                    callback(page);
                });
            }
        }

        function gotoNpage(callback) {
            if (!callback) {
                return;
            }
            $("#page_index [name=page_index]").on("keyup", function () {
                var val = $(this).val();
                if (!(/^[0-9]*$/.test(val))) {
                    var len = $(this).val().length;
                    $(this).val($(this).val().substr(0, len - 1));
                }
            });
            $("#page_index [name=confirm]").click(function () {
                var total = $("#page [name=pages]").val();
                var index = $("#page_index [name=page_index]").val();
                if (!index) {
                    return;

                }
                if (parseInt(index) < 1) {
                    index = 1;
                }
                if (parseInt(index) > total) {
                    index = total;
                }
                callback(parseInt(index));
            });
        }

        return {
            init:init
        };
    };

    TVC.Form = function (obj) {
        var form = null;
        if (typeof obj === 'string') {
            form = $(obj);
        } else {
            form = obj;
        }

        var defaultValue = {};
        $(form).find("input").each(function () {
            var type = "" + $(this).attr("type");
            type = type.toLowerCase();
            if (type === "submit" || type === "button"){
                return;
            }

            var name = $(this).attr("name");
            defaultValue[name] = get(name);
        });

        function init() {
            $(form).find("input[autotrim=float]").keyup(function () {
                $(this).val(TVC.trimFloat($(this).val()));
            });

            $(this._form).find("input[autotrim=number]").keyup(function () {
                $(this).val(TVC.trimNumber($(this).val(), $(this).attr('maxlen')));
            });

            $(this._form).find("input[autotrim=time]").keyup(function () {
                $(this).val(TVC.trimTime($(this).val()));
            });

            $(this._form).find("input[autotrim=charandnumber]").keyup(function () {
                $(this).val(TVC.trimCharAndNumber($(this).val(), $(this).attr('maxlen')));
            });
        }

        function get(name, delemiter) {
            delemiter = delemiter || ',';
            var obj = $(form).find("[name=" + name + "]");
            if (!obj || obj.length === 0)
                return '';
            var type = obj[0].type;
            if (type === 'radio') {
                return $.trim($(form).find("[name=" + name + "][checked]").val());
            } else if (type === 'select-one') {
                return $.trim(obj.val());
            } else if (type === 'checkbox') {
                var val = [];
                obj.each(function(){
                    if ($(this).is(":checked")){
                        val.push($(this).val());
                    }
                });

                return val.join(delemiter);
            } else {
                return $.trim(obj.val());
            }
        }

        function set(name, value) {
            var obj = $(form).find("[name=" + name + "]");
            var type = $(form).find("[name=" + name + "]")[0].type;
            if (type === 'radio' || type === 'checkbox') {
                //obj.removeAttr("checked");
                $(form).find("[name=" + name + "][value=" + value + "]").attr("checked", "checked");
            } else {
                return obj.val(value);
            }
        }

        function enable(name) {
            $(form).find("[name=" + name + "]").removeAttr("disabled");
        }

        function disabled(name) {
            $(form).find("[name=" + name + "]").attr("disabled", "disabled");
        }

        function getFormData()
        {
            var paras = {};
            $(form).find("input").each(function(){
                var name = $(this).attr("name");
                paras[name] = get(name);
            });

            return paras;
        }

        function submit(url, options, validate, success, fail) {
            var that = this;
            $(form).unbind('submit').submit(function () {
                that.error("");
                if (validate && !validate(that)) {
                    return false;
                }

                var paras = getFormData();
                /*var tmpAr = form.serializeArray();
                 if (tmpAr.length) {
                 for (var key in tmpAr) {
                 paras[tmpAr[key]['name']] = tmpAr[key]['value'];
                 }
                 }*/

                $.extend(paras, options);
                TVC.postJson(url, paras, success, fail);
                return false;
            });
        }

        function reset() {
            for (var name in defaultValue) {
                set(name, defaultValue[name]);
            }
        }

        function error(msg)
        {
            if (msg === ""){
                $(form).find(".error").hide();
            }else {
                $(form).find(".error").html(msg).show();
            }
        }

        init();
        return {
            get: get,
            set: set,
            enable: enable,
            disabled: disabled,
            submit: submit,
            reset: reset,
            error:error
        };
    };
}());

$(function() {
    function init() {
        if ($("#zink_search").length > 0) {
            bindSearchEvent();
            bindPagingEvent();
        }
    }

    function bindSearchEvent() {
        $("#zink_search").click(function(){
            doSearch(1);
        });
    }

    function bindPagingEvent() {
        var p = $("input[name=p]").val()
        var page = TVC.Pager(parseInt(p), doSearch);
        page.init();
    }

    function doSearch(p) {
        TVC.showLoading("");
        if ($("#search_form").length > 0) {
            var data = $("#search_form").serialize();
            data += '&p=' + p;
        }else {
            var data = "p=" + p;
        }

        var url = $("#zink_search").attr("url");
        url += "?" + data;
        TVC.redirect(url);
    }
    init();
});