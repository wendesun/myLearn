$(function(){
    function showBigImg(){
        var index=0;
        var size=0;
        function showMoveImg(url){
            var url=url || "";
            var html='<div class="showImg"><div class="mskeLayBg"></div><div class="mskelayBox"><div class="mske_html"><img class="img" src='+url+'/></div><img class="mskeClaose" src="mke_close.png" width="27" height="27" /><div class="btn btn_l">&lt;</div><div class="btn btn_r">&gt;</div></div></div>';

            var html2='<div id="work_time_box" name="pop_window" class="add-alter-user center-box well "><b class="center-hack"></b><div class="center-body"><div class="mskelayBox"><div class="mske_html"><img class="img" src='+url+'/></div><img class="mskeClaose" src="mke_close.png" width="27" height="27" /><div class="btn btn_l">&lt;</div><div class="btn btn_r">&gt;</div></div></div></div>'

            if($("#work_time_box").length === 0){
                $("body").append(html2);
            }
            $("#work_time_box").show();
            $(".mske_html img").css({opacity: 0}).attr("src",url).animate({opacity: 1},300);
        }

        $("body").on("click",".btn.btn_l",function(){
            index--;
            if(index == -1){
                index=size-1;
            }
            var url=$("#img-list img").eq(index).attr("src");
            console.log(index);
            showMoveImg(url);
        });
        $("body").on("click",".btn.btn_r",function(){
            index++;
            if(index == size){
                index=0;
            }
            var url=$("#img-list img").eq(index).attr("src");
            console.log(index);
            showMoveImg(url);
        });

        $("body").on("click",".clickShowBigImg",function(){
            index=$(this).index();
            size=$(this).siblings().size()+1;
            console.log(index);
            var url = $(this).attr("true-src") ? $(this).attr("true-src") : $(this).attr("src");
            showMoveImg(url);
        });

        $("body").on("click",".mskeClaose",function(){$("#work_time_box").hide()});


    }
    showBigImg();


})