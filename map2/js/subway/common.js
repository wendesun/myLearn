var SW = {
	cache: {
		curCity:{adcode:null,name:null},
		dataForDrw: {},
		cities: {/*110:{name:null, lines: [{"line_sid": "110001","line_sname": "10号线","color": "","coords": [],"loop": "1","status": "1",},{},{}...], stations:null，zolines:[{},{},...{},{}], zostations:null}*/},
		lines: {},
		stations: {},
		stationsInfo: {}
	},
	firstOpen: false,
	root: window.location.protocol + "\/\/" + window.location.host + window.location.pathname,
	root_child: window.location.protocol + "\/\/" + window.location.host,
	QR_CODE_SERVICE_URL: 'http://apps1.amap.com/qrcode/encode?qrt=',//二维码接口
	zmOut: {
		"1100": ["11000237","11000010","11000160","11000114","11000052","11000154","11000148","11000149","11000121","11000217","11000140","11000147","11000056","11000089","11000045","11000224","11000168","11000220","11000050","11000218","11000222","11000020","11000109","11000041","11000181","11000059","11000004","11000038","11000176","11000040","11000001","11000027","11000219","11000223","11000221","11000234","11000101","11000228","11000018","11000097","11000155","11000071","11000009"],//北京
		//森林公园南门，惠新西街南口，金台路，白石桥南，建国门，平安里，大望路，四惠，高碑店，磁器口，木樨地，永安里，和平门，良乡南关，积水潭，大屯路东，北宫门，北新桥，东四十条,灯市口,和平西桥，双井，七里庄，车道沟，陶然亭, 复兴门，知春路，公主坟，动物园，慈寿寺，巴沟，石榴庄,张自忠路，惠新西街北口，和平里北街，安华桥，巩华城，天通苑，金台夕照，大葆台，北海北，望京西，安贞门
		"1200": ["12000027"],//天津
		//顺驰桥
		"2101": [],//沈阳
		"2102": [],//大连
		"2201": [],//长春
		"2301": [],//哈尔滨
		"3100": ["31000067","31000267","31000255","31000266","31000114","31000261","31000272","31000236","31000148","31000152","31000270","31000260","31000018","31000077","31000265","31000274"],//上海
		//枫桥路,虹口足球场，虹桥2号航站楼，宝山路，徐泾东，常熟路,肇嘉浜路，小南门,塘桥，上海体育场，东安路，上海体育馆，龙柏新村，上海赛车场, 中潭路，陆家浜路，
		"3201": [],//南京
		"3205": [],//苏州
		"3301": [],//杭州
		"3302": [],//宁波
		"4101": [],//郑州
		"4201": [],//武汉
		"4301": [],//长沙
		"4401": ["44010106","44010115","44010114","44010104"],//广州
		//区庄，燕塘，林和西，五羊邨
		"4403": ["44030057","44030118"],//深圳
		//岗厦，黄贝岭
		"4406": [],//佛山
		"5000": ["50010087"],//重庆
		//较场口
		"5101": [],//成都
		"5301": [],//昆明
		"6101": [],//西安
		"8100": ["81000046"], //香港
        //荔枝角
        "3202": [],//无锡
        "3702": [],//青岛
        "3601": []//南昌
    },

	swInit: function() {
		if(!this.firstOpen){
			this.firstLoadingOver();
			this.firstOpen = true;
		}
		this.navBindEvent();
		this.initCity();//根据缓存加载相应城市
		tip.init();
	},
	initCity: function(){
		var self = this;

		var adcode = window.location.search.split('&')[1];
		if(adcode && self.zmOut[adcode]){
			$("#" + adcode).trigger('click');
		}else{
			$("#1100").trigger('click');
		}
	},
	navBindEvent: function() {
		var self = this;
		// $(".more-city").on("click", function() {
		// 	var listClose = $(".more-icon").hasClass("close");
		// 	var liseOpen = $(".more-icon").hasClass("open");
		// 	if (listClose) {
		// 		$(".more-icon").removeClass("close").addClass("open");
		// 		$(".more-city-list").css("display", "block");
		// 		$(this).css('border-bottom','1px #FFF solid');
		// 	} else if (liseOpen) {
		// 		$(".more-icon").removeClass("open").addClass("close");
		// 		$(".more-city-list").css("display", "none");
		// 		$(this).css('border-bottom','1px #D5D5D5 solid');
		// 	}
		// });
		$(window).on("resize", function(){
			var h = $(window).height();
			var w = $(window).width();
			var svg = document.getElementById('subway-svg');
            var viewBox = svg.getAttribute('viewBox').split(" ");
				viewBox[2] = w;
				viewBox[3] = h;
			svg.setAttribute('height', h - 5);
			svg.setAttribute('width', w);
			svg.setAttribute('viewBox', viewBox.join(' '));
		});
		$(".more-city").on("mouseover", function() {
			$(".more-icon").removeClass("close").addClass("open");
			$(".more-city-list").css("display", "block");
			$(this).addClass('more-hover');
		}).on('mouseout',function(){
			$(".more-icon").removeClass("open").addClass("close");
			$(".more-city-list").css("display", "none");
			$(this).removeClass('more-hover');
		});
		$(".city,.other-city").on("click", function() {
			var cityName = $(this).attr("id") + '-' + $(this).attr("cityname");
			var cityCode = $(this).attr("id");
			tip.isHighlight = false;
			$(".city").removeClass("select");
			$(this).addClass("select");
			$("#subway").attr("citycode",cityCode);
			$(".sw-share-QRcode").removeClass('show');
			self.loading();
			self.loadData(cityName, function(drwData) {
				$(".line-caption,#subway-svg,#infowindow-content").remove();
				$("#sw-zoom-drag").css("top","16px");
				self.setPrint(drwData);
				drwSw.draw(drwData);
				initialize();
				var city_code = drwData.id;
				var city_name = drwData.name;
				// self.creatQRcode(city_code,city_name);
			});
		});
		$(".city").on("click",function(){
           $(".more-text").html('更多').css('color','#333');
		});
		$(".other-city").on("click", function(){
			var cityName = $(this).html();
			$(".more-icon").removeClass("open").addClass("close");
			$(".more-text").html(cityName).css('color','#008CD6');
		    $(".more-city-list").css("display", "none");
		    $(".more-city").removeClass('more-hover');
		});
		$(".other-city").on("mouseover",function(e){
			// e.stopPropagation();
			$(this).addClass('hover');
		}).on("mouseout",function(e){
			e.stopPropagation();
			$(this).removeClass('hover');
		});
		$('#sw-share').on("click", function(e){
			e.stopPropagation();
			var hasOpen = $(this).hasClass('open');
			if(hasOpen){
				$('.sw-share-box').css('display','none');
				$(this).removeClass('open');
			}else{
				$('.sw-share-box').css('display','block');
				$(this).addClass('open');
			}
			if(!$('.sw-share-QRcode').hasClass('show')){
				var citycode = self.cache.curCity.adcode;
				var cityname = self.cache.curCity.name;
				// self.creatQRcode(citycode,cityname);
			}
		});
		$('.sw-share-content').on('click',function(e){
			e.stopPropagation();
		});
		$('.sw-wrap').on('click',function(){
			var shareOpen = $('#sw-share').hasClass('open');
			if(shareOpen){
				$('.sw-share-box').css('display','none');
				$('#sw-share').removeClass('open');
			}
		});
		$('.sw-share-item').on("click",function(){
			var type = $(this).attr('id');
			self.swShare(type);
		});
		$("#sw-zoomin-btn").on("click",function(){
			zoom("zoomIn", pos);
		});
		$("#sw-zoomout-btn").on("click",function(){
			zoom("zoomOut", pos);
		})
	},
	setPrint:function(data){
		var adcode = data.id;
		var name = data.name;
		var href = './print/print.html?&' + adcode + '|' + name;
		$('#sw-print').attr('href',href);
	},
	swShare: function(type){
		var self = this;
		var shorturl, title, url, windowName, picurl;
		var city_name = self.cache.curCity.name;
		var city_code = self.cache.curCity.adcode;
        shorturl = encodeURIComponent(self.root + '?&' + city_code);
        var gaodename;
        if(type == 'xl'){
        	gaodename = "#高德地图#";
        }else{
        	gaodename = "高德地图";
        }
        title = encodeURIComponent(city_name + '线路图');
        desc = encodeURIComponent('高德地图提供最新' + city_name + '线路图浏览，以及准确首末班车时间信息。');
        msg = encodeURIComponent("我用"+gaodename+"查询"+ city_name +"线路图，有了这地铁线路图，我再也不会迷路啦！ （分享自 @高德地图）");
        picurl = encodeURIComponent(self.root_child + '/subway/img/share/' + city_code + '.jpg');
        switch (type) {
            case 'xl':
                url = 'http://service.weibo.com/share/share.php?url=' + shorturl + '&title=' + msg + '&type=3&count=' + '' + '&appkey=' + '884965267' + '&pic=' + picurl + '&ralateUid=' + '' + '&language=' + 'zh_cn' + '&rnd=' + (new Date).valueOf() + '&mbweb=' + '1';
                windowName = 'sina_weibo';
                break;
            case 'tx':
                url = 'http://v.t.qq.com/share/share.php?url=' + shorturl + '&title=' + title + '&appkey=' + '801309185';
                windowName = 'tencent_weibo';
                break;
            case 'qq':
                url = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + shorturl + '&title=' + title + '&desc=' + msg + '&summary=' + desc +'&pics='+ picurl + '&site=' + '\u9ad8\u5fb7\u5730\u56fe';
                windowName = 'QZone';
                break;
            case 'rr':
                url = 'http://widget.renren.com/dialog/share?resourceUrl=' + shorturl + '&srcUrl=' + shorturl + '&title=' + title + '&message=' + msg +'&pic='+ picurl + '&description=' + desc;
                windowName = 'renren';
                break;
            case 'kx':
                url = 'http://www.kaixin001.com/rest/records.php?url=' + shorturl + '&content=' + msg + '&count=' + '' + '&pic=' + picurl + '&starid=' + '0' + '&aid=' + '0' + '&showcount=' + '0' + '&style=' + '11';
                windowName = 'kaixin';
                break;
            case 'db':
                url = 'http://www.douban.com/share/service?url=' + shorturl + '&title=' + msg + '&sel=' + title + '&image=' + picurl + '&v='  + '1' + '&text=' + title;
                windowName = 'douban';
                break;
            case 'sh':
                url = 'http://t.sohu.com/third/post.jsp?url=' + shorturl + '&title=' + title;
                windowName = 'sohu';
                break;
        }
        window.open(url, windowName);
	},
	loadCitySw: function(city_name) {
		var self = this;
	},

	loadData: function(cityName, callback) {
		var self = this;
		var city = cityName.split("-");
		var city_code = city[0];
		var city_name = city[1];
		if (SW.cache.cities[city_code]) {
			self.loadingOver();
			callback(SW.cache.cities[city_code]);
			SW.cache.curCity.adcode = city_code;
			SW.cache.curCity.name = SW.cache.cities[city_code].name;
		} else {
			// var requestUrl = "./data/" + city_code + "_drw_" + city_name + ".json";
            var srhdata = city_code + "_drw_" + city_name + ".json";
			//console.log(new Date().getTime());
			var data=drwDataSource;
			function drwDataFn(data){
				self.loadingOver();
				SW.cache.dataForDrw[data.i]= data;
				SW.cache.cities[data.i] = SW.cache.cities[data.i] || {};
				SW.cache.cities[data.i].name = data.s;
				SW.cache.cities[data.i].id = data.i;
				SW.cache.cities[data.i].offset = data.o;
				// SW.cache.cities[data.id].sort = data.sort;
				SW.cache.cities[data.i].lines = [];
				SW.cache.cities[data.i].stations = [];
				SW.cache.cities[data.i].zolines = {};
				SW.cache.cities[data.i].zostations = [];
				for (var i = 0; i < data.l.length; i++) {
					SW.cache.cities[data.i].lines.push(data.l[i]);
					SW.cache.lines[data.l[i].ls] = data.l[i]; //写入line
					var currStations = [];
					for (var j = 0; j < data.l[i].st.length; j++) {
						if(data.l[i].st[j].su == '1'){
							SW.cache.cities[data.i].stations.push(data.l[i].st[j]);
							SW.cache.stations[data.l[i].st[j].si] = data.l[i].st[j];
						}
						if(j == 0 || j == data.l[i].st.length-1 || j%3 == 0 || data.l[i].st[j].t == "1"){
							/*
							 *每条线路每隔两个站点取一个站点，压入数组，
							 *其中遇到换乘站也取出并压入数组，第一点和最后一点也压入数组，
							 *key为线路line的id
							 */
							for(var h = 0; h < self.zmOut[city_code].length; h++){//除去特殊点
								if(data.l[i].st[j].si == self.zmOut[city_code][h]){
									break;
								}
							}
							if(h == self.zmOut[city_code].length){
								if(data.l[i].st[j].su == '1'){
									currStations.push(data.l[i].st[j]);
									SW.cache.cities[data.i].zostations.push(data.l[i].st[j]);
								}
							}
						}
						if(j == data.l[i].st.length - 1){
							SW.cache.cities[data.i].zolines[data.l[i].ls] = currStations;
						}
					}
				}
				// self.toCache(data, info_data);
				callback(SW.cache.cities[city_code]);
				SW.cache.curCity.adcode = city_code;
				SW.cache.curCity.name = SW.cache.cities[city_code].name;
			}

			drwDataFn(data);

			var info_data=infoDataSource;
			function infoDataFn(info_data){
				for (var k = 0; k < info_data.l.length; k++) {
					for (var l = 0; l < info_data.l[k].st.length; l++) {
						SW.cache.stationsInfo[info_data.l[k].st[l].si] = info_data.l[k].st[l];
					}
				}
			}
			infoDataFn(info_data);

		}
	},
	creatQRcode: function(id,name){
		var self = this;
		var adcode = id;
		var cityname = name;
		var QRimg_loading = $('.sw-share-QRcode-loading');
		var QRimg = document.getElementById('sw-share-QRcode');
		var QR_box = $('.sw-share-QRcode');
		// var url = self.root_child + '/subway/share/share.html?&' + adcode + '|' + cityname;
		var url = self.root_child + '/subway/share/share.html?adcode=' + adcode;
		QRimg.src = self.QR_CODE_SERVICE_URL + encodeURIComponent(url);
		QRimg.onload = function(){
			QRimg_loading.css('display','none');
			QRimg.style.display = 'block';
			QR_box.addClass('show');
		}
	},
	dragMoveUp: function(obj){
		var self = this;
		var topTemp = obj.css("top");
		var top = parseFloat(topTemp.substring(0,topTemp.length-2));
        obj.css({top:(top - 16) + "px"});
	},
	dragMoveDown: function(obj){
		var self = this;
		var topTemp = obj.css("top");
		var top = parseFloat(topTemp.substring(0,topTemp.length-2));
        obj.css({top:(top + 16) + "px"});
	},
	urlToJson: function(url){
        var pairs = url.replace(/^\?/, '').split('&'),
        obj = {};
        for (var i = pairs.length - 1; i >= 0; i--) {
            var pair = pairs[i].split('=');
            obj[pair[0]] = pair[1] ? decodeURIComponent(pair[1]) : '';
        };
        return obj;
    },
    loading: function(){
    	$('.loading-bg').css('display','block');
    },
    loadingOver: function(){
    	$('.loading-bg').css('display','none');
    },
    firstLoadingOver: function(){
    	$('.loading-bg-once').css('display','none');
    },
	printSw: function() {},
	downloadSw: function() {}
}