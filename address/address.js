$(function(){
    var AB ={};
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

            var region = encodeURI("±±¾©");
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
                var city = $(this).attr("data-city").replace("ÊÐ", "");
                var region = $(this).attr("data-region");
                var lnglat = $(this).attr("data-lnglat");
                onSelect && onSelect(name, city, region, lnglat);
                $(resultSelector).hide();
            }).on("hover",function(){
                $("li.focus").removeClass("focus");
                $(this).addClass("focus");
            });
        }

       /* return {
            init:init
        };*/
        init();
    };
    window['AB'] = AB;
});

