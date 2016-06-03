/**
 * Created by mmwang on 2016/6/2.
 */
;(function($){
    $.fn.extend({
        'showtip':function(targetid){
            $(targetid).on("mouseover mousemove", function (event){
                var event = event || window.event || arguments.callee.caller.arguments[0];
                var left=event.pageX;
                var top=event.pageY;
                var winHeight=$(window).height();
                var winWidth=$(window).width();
                var divWidth=parseInt($(this).next("div").outerWidth());
                var divHeight=parseInt($(this).next("div").outerHeight());
                if((winHeight - top) >=  divHeight){
                    $(this).next("div").find("div.tipBox").removeClass("arrows-bottom").addClass("arrows-top");
                    $(this).next("div").css({
                        "top": (top+defaultTop)+"px",
                        "left":(left-divWidth/2)+"px"
                    }).removeClass("hide");
                }else{
                    $(this).next("div").find("div.tipBox").removeClass("arrows-top").addClass("arrows-bottom");
                    $(this).next("div").css({
                        "top": (top-defaultTop-divHeight)+"px",
                        "left":(left-divWidth/2)+"px"
                    }).removeClass("hide");
                }

                $(this).next("div").css({
                    "top": (top-divHeight/2)+"px",
                    "left":(left+20)+"px"
                }).removeClass("hide");

            }).on("mouseout",function (){
                $(this).next("div").addClass("hide");
            });
        },

        'moreInfoTip':function(parentid,targetid){
            if(!!$(parentid)[0]){
                $(parentid).on("mouseover mousemove",targetid, function (event){
                    var defaultTop=defaultTop || 25;
                    var event = event || window.event || arguments.callee.caller.arguments[0];
                    var left=event.pageX;
                    var top=event.pageY;
                    var winWidth=$(window).width();
                    var winHeight=$(window).height();
                    var divWidth=parseInt($(this).next("div").outerWidth());
                    var divHeight=parseInt($(this).next("div").outerHeight());
                    if((winHeight - top) >=  divHeight){
                        $(this).next("div").find("div.tipBox").removeClass("arrows-bottom").addClass("arrows-top");
                        $(this).next("div").css({
                            "top": (top+defaultTop)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }else{
                        $(this).next("div").find("div.tipBox").removeClass("arrows-top").addClass("arrows-bottom");
                        $(this).next("div").css({
                            "top": (top-defaultTop-divHeight)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }
                }).on("mouseout", targetid,function (){
                    $(this).next("div").addClass("hide");
                });
            }
            else{
                $(targetid).on("mouseover mousemove", function (event){
                    var defaultTop=defaultTop || 25;
                    var event = event || window.event || arguments.callee.caller.arguments[0];
                    var left=event.pageX;
                    var top=event.pageY;
                    var winWidth=$(window).width();
                    var winHeight=$(window).height();
                    var divWidth=parseInt($(this).next("div").outerWidth());
                    var divHeight=parseInt($(this).next("div").outerHeight());
                    if((winHeight - top) >=  divHeight){
                        $(this).next("div").find("div.tipBox").removeClass("arrows-bottom").addClass("arrows-top");
                        $(this).next("div").css({
                            "top": (top+defaultTop)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }else{
                        $(this).next("div").find("div.tipBox").removeClass("arrows-top").addClass("arrows-bottom");
                        $(this).next("div").css({
                            "top": (top-defaultTop-divHeight)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }
                }).on("mouseout",function (){
                    $(this).next("div").addClass("hide");
                });
            }
        }
    });
})(jQuery)