$(function(){

    function init() {
        bindInputEvent();
        bindClearEvent();
        bindValidateEvent();
    }

    function bindInputEvent() {

        $("input[name='code']").on("input change keyup",function(){
            var newVal = $(this).val();
            $(this).val($(this).val().replace(/[^a-zA-Z0-9]/g, ""));

            var first=newVal.indexOf(" ");
            if(first==0){
                $(this).val(newVal.replace(/\s/g,""));
            }

            if ($(this).val().replace(/\s/g,"").length >= 12) {
                $(this).blur();
                $(this).val($(this).val().replace(/\s/g,"").substr(0,12));
            }

            var  length = newVal.replace(/\s/g,"").length;
            /*if (length > 12) {
             $(this).val(newVal.substr(0, newVal.length - 1));
             return;
             }*/

            if(length <=0){
                $("img[name='validate_close']").addClass("hide");
            }else{
                $("img[name='validate_close']").removeClass("hide");
                var arr="";
                var newVal2=$(this).val().replace(/\s/g,"");
                for(var i=0;i<newVal2.length;i=i+4){
                    arr+=newVal2.substring(i,i+4)+" ";
                }
                $(this).val("");
                $(this).val(arr.substring(0,arr.length-1));

            }

            var  len1= $(this).val().length;
            if(len1==14){                               //输入最后一位时自动验证兑换码
                $(this).val($(this).val().substr(0, 14));
                //validateCode($(this).val());
            }


        });
    }


    function validateCode(code) {
        $("[name=error]").hide();
        code = code.replace(/\s/g,"");
        TVC.showLoading();
        TVC.postJson("/code/validate", {code: code}, function(rqData){
            TVC.hideLoading();
            $("input[name='code']").blur();
            $(rqData).appendTo("body").show();
        },function(result){
            TVC.hideLoading();
            var code = $("input[name=code]").val();
            $("input[name=code]").val("").focus().val(code);
            showError(result.message);
        })
    }

    function bindClearEvent() {
        $("[name='validate_close']").on("click",function(){
            $("input[name='code']").val("");
            $(this).addClass("hide");
        })
    }

    function bindValidateEvent() {
        $("#validate").click(function(){
            var  length = $("input[name='code']").val().replace(/\s/g,"").length;
            if(length > 0 && length < 12){
                showError("请输入正确的兑换码");
                return;
            }
            if (length > 0) {
                validateCode($("input[name='code']").val());
            }
        });
    }

    function showError(message) {
        $("div[data-name]").text(message).show();
    }
    init();
});