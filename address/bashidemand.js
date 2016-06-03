$(function () {
    var cache = {};
    function init() {
        $("#start").bind("focus keyup",function(e){
            if (keyPress(e.keyCode, "#suggestStart")) return;
            var value = $.trim($(this).val());
			var postion=value.length;
            placeSearch(value, "#suggestStart", function(name, city, region, lnglat){
                $("#start").val(name);
                $("#start_city").val(city);
                $("#start_region").val(region);
                $("#start_lnglat").val(lnglat);
            });
			
			setCursorPosition("start",postion);
	
			//$(this).focus();
			//alert("aaa");
        }).blur(function(){
            setTimeout(function () {
                $("#suggestStart").hide();
            }, 200);
            $("li.focus").removeClass("focus");
        });
        
        $("#end").bind("focus keyup",function(e) {
            if(keyPress(e.keyCode, "#suggestEnd")) return;
            var value = $.trim($(this).val());
			var postion=value.length;
            placeSearch(value, "#suggestEnd", function(name, city, region, lnglat){
                $("#end").val(name);
                $("#end_city").val(city);
                $("#end_region").val(region);
                $("#end_lnglat").val(lnglat);
            });
			
			setCursorPosition("end",postion);
			
        }).blur(function(){
            setTimeout(function () {
                $("#suggestEnd").hide();
            }, 200);
            $("li.focus").removeClass("focus");
        });
        
        $("#submit").click(function(){
            submit();
        });
        
        var left=document.documentElement.clientWidth/2-100+'px';
        $("#_tmp_pop_message").css('left',left);
    }
    
	function setCursorPosition(id,postion){
		var obj = document.getElementById(id);      
		if (obj.createTextRange) {//IE浏览器
		   
			var txt =obj.createTextRange();      
			txt.moveStart('character',postion);      
			txt.collapse(true);      
			txt.select();  
		} 
	}
	 
    function keyPress(keyCode, selector)
    {
        var focus = $("li.focus");
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
            $("li.focus").click();
            return true;
        }
        
        return false;
    }
    
    function showErr(id){
        $("#"+id).show();
        setTimeout(function () {
            $("#"+id).hide();
        }, 1500);
    }
    
    function submit(){
        var start = $.trim($("#start").val());
        if (start === ""){
            showErr("errStart");
            return;
        }
        
        var end = $.trim($("#end").val());
        if (end === ""){
            showErr("errEnd");
            return;
        }
        
        var hour1 = $("#hour1").val();
        var min1 = $("#minute1").val();
        var hour2 = $("#hour2").val();
        var min2 = $("#minute2").val();
        
        var depart_time = hour1 + ":" + min1;
        var return_time = hour2 + ":" + min2;
        if (hour1 === "" || min1 === ""){
            //showErr("errDepart");
            //return;
            depart_time = "";
        }
        
        if (hour2 === "" || min2 === ""){
            //showErr("errReturn");
            //return;
            return_time = "";
        }
        
        var phone = $.trim($("#phone").val());
        if (phone === ""){
            showErr("errPhone1");
            return;
        }else if (!/^1[3-9][0-9]{9}$/.test(phone)){
            showErr("errPhone2");
            return;
        }
        
        var start_city = $("#start_city").val();
        var start_region = $("#start_region").val();
        var start_lnglat = $("#start_lnglat").val();
        var end_city = $("#end_city").val();
        var end_region = $("#end_region").val();
        var end_lnglat = $("#end_lnglat").val();
        
        
        $.ajax({
            "url":"/ajax.php?action=bashi&cmd=addBashiDemand",
            "data":{
                "start":start,
                "start_city":start_city,
                "start_region":start_region,
                "start_lnglat":start_lnglat,
                "end_city":end_city,
                "end":end,
                "end_region":end_region,
                "end_lnglat":end_lnglat,
                "depart_time":depart_time,
                "return_time":return_time,
                "phone":phone
            },
            "dateType":"json",
            "type":"POST",
            "success":function(rqData){
                if (rqData.message === "success"){
                    $("#_tmp_pop_message").show();
                    setTimeout(function () {
                        $("#_tmp_pop_message").hide();
                       window.location.href = "/";
                    }, 1500);
                }else {
                    alert("提交失败!")
                }
            },
            "error":function(){
                alert("提交失败!")
            }
        });
    }

    function placeSearch(query, boxSelector, callback) {
        query = $.trim(query);
        callback && callback(query, "", "", "");
        if (query === "") {
            cache[query] = [];
        } 

        if (cache[query]) {
            updateSuggestBox(cache[query], boxSelector, callback);
            return;
        }

        query = encodeURI(query);
        $.getJSON('/ajax.php?action=bashi&cmd=bdaddress&query=' + query, {}, function (data) {
            if (data.status == 0) {
                cache[query] = data.result;
                updateSuggestBox(data.result, boxSelector, callback);
            }
        });
    }

    function updateSuggestBox(data, boxSelector, onSelect) {
        var box = $(boxSelector).find("ul");
        box.html("");
        if (data.length === 0){
            $(boxSelector).hide();
            return;
        }
        
        var html = [];
        for (var i = 0; i < data.length && i < 10; i++) {
            var name = data[i].name;
            var city = data[i].city;
            var region = data[i].district;
            var lnglat = "";
            if (data[i].location) {
                lnglat = data[i].location.lng + "," + data[i].location.lat;
            }
            
            html.push("<li class='black-color1' data-city='" + city + "'data-region='" + region + "'data-lnglat='" + lnglat + "'>"+name+"</li>");
        }
        
        box.html(html.join(""));
        $(boxSelector).show();
        box.find("li").click(function () {
            var name = $(this).text();
            var city = $(this).attr("data-city").replace("市", "");
            var region = $(this).attr("data-region");
            var lnglat = $(this).attr("data-lnglat");
            onSelect && onSelect(name, city, region, lnglat);
            $(boxSelector).hide();
        }).on("hover",function(){
            $("li.focus").removeClass("focus");
			$(this).addClass("focus");
			});
    }
    
    init();
});
