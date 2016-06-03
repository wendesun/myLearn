(function(){
    window['treevc']={
        //判断是否是润年
        isLeapYear:function(num){
            if((num%4 == 0) && (num%100 != 0) || (num%400 == 0)){
                return true;
            }else{
                return false;
            }
        },

        //趣味报数
        fizzBuzz:function(num){
            var report="";
            if(num%15 == 0){
                report+="fizzBuzz";
                return report;
            }else if(num%3 == 0){
                report+="fizz";
            }else if(num%5 == 0){
                report+="Buzz";
            }else{
                report+=num;
            }
            return report;
        }
   };
}())