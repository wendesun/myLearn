var SW = {
	cache: {
		citylist: [],
		citylistByAdcode: null,
		curCity: {
			adcode: null,
			name: null
		},
		dataForDrw: {},
		cities: {},
		lines: {},
		stations: {},
		sug: {},
		stationsInfo: {},
		stationspoi: {},
		offset: {},
		navlines: {},
		navStations: {},
		navStPixel: {}
	},
	subwayFlag: 1, // 0 没有 1 有
	param: null,
	nearlnglat: null,
	datas: [],
	info_datas: [],
	// 从adcode前四位读取文件名称
	fileNameData: {
		'1100': 'beijing',
		'3100': 'shanghai',
		'4401': 'guangzhou',
		'4403': 'shenzhen',
		'4201': 'wuhan',
		'1200': 'tianjin',
		'3201': 'nanjing',
		'8100': 'xianggang',
		'5000': 'chongqing',
		'3301': 'hangzhou',
		'2101': 'shenyang',
		'2102': 'dalian',
		'5101': 'chengdu',
		'2201': 'changchun',
		'3205': 'suzhou',
		'4406': 'foshan',
		'5301': 'kunming',
		'6101': 'xian',
		'4101': 'zhengzhou',
		'2301': 'haerbin',
		'4301': 'changsha',
		'3302': 'ningbo',
		'3202': 'wuxi',
		'3702': 'qingdao',
		'3601': 'nanchang'
	},
	cityname: {
		'1100': '\u5317\u4eac', //北京,
		'3100': '\u4e0a\u6d77', //上海,
		'4401': '\u5e7f\u5dde', //广州,
		'4403': '\u6df1\u5733', //深圳,
		'4201': '\u6b66\u6c49', //武汉,
		'1200': '\u5929\u6d25', //天津,
		'3201': '\u5357\u4eac', //南京,
		'8100': '\u9999\u6e2f', //香港,
		'5000': '\u91cd\u5e86', //重庆,
		'3301': '\u676d\u5dde', //杭州,
		'2101': '\u6c88\u9633', //沈阳,
		'2102': '\u5927\u8fde', //大连,
		'5101': '\u6210\u90fd', //成都,
		'2201': '\u957f\u6625', //长春,
		'3205': '\u82cf\u5dde', //苏州,
		'4406': '\u4f5b\u5c71', //佛山,
		'5301': '\u6606\u660e', //昆明,
		'6101': '\u897f\u5b89', //西安,
		'4101': '\u90d1\u5dde', //郑州,
		'2301': '\u54c8\u5c14\u6ee8', //哈尔滨,
		'4301': '\u957f\u6c99', //长沙
		'3302': '\u5b81\u6ce2', //宁波
		'3202': '\u65e0\u9521', //无锡
		'3702': '\u9752\u5c9b', //青岛
		'3601': '\u5357\u660c' //南昌
	},
	cityListData: [{
		adcode: '1100',
		spell: 'beijing',
		cityname: '北京'
	}, {
		adcode: '3100',
		spell: 'shanghai',
		cityname: '上海'
	}, {
		adcode: '4401',
		spell: 'guangzhou',
		cityname: '广州'
	}, {
		adcode: '4403',
		spell: 'shenzhen',
		cityname: '深圳'
	}, {
		adcode: '4201',
		spell: 'wuhan',
		cityname: '武汉'
	}, {
		adcode: '1200',
		spell: 'tianjin',
		cityname: '天津'
	}, {
		adcode: '3201',
		spell: 'nanjing',
		cityname: '南京'
	}, {
		adcode: '8100',
		spell: 'xianggang',
		cityname: '香港'
	}, {
		adcode: '5000',
		spell: 'chongqing',
		cityname: '重庆'
	}, {
		adcode: '3301',
		spell: 'hangzhou',
		cityname: '杭州'
	}, {
		adcode: '2101',
		spell: 'shenyang',
		cityname: '沈阳'
	}, {
		adcode: '2102',
		spell: 'dalian',
		cityname: '大连'
	}, {
		adcode: '5101',
		spell: 'chengdu',
		cityname: '成都'
	}, {
		adcode: '2201',
		spell: 'changchun',
		cityname: '长春'
	}, {
		adcode: '3205',
		spell: 'suzhou',
		cityname: '苏州'
	}, {
		adcode: '4406',
		spell: 'foshan',
		cityname: '佛山'
	}, {
		adcode: '5301',
		spell: 'kunming',
		cityname: '昆明'
	}, {
		adcode: '6101',
		spell: 'xian',
		cityname: '西安'
	}, {
		adcode: '4101',
		spell: 'zhengzhou',
		cityname: '郑州'
	}, {
		adcode: '2301',
		spell: 'haerbin',
		cityname: '哈尔滨'
	}, {
		adcode: '4301',
		spell: 'changsha',
		cityname: '长沙'
	}, {
		adcode: '3302',
		spell: 'ningbo',
		cityname: '宁波'
	}, {
		adcode: '3202',
		spell: 'wuxi',
		cityname: '无锡'
	}, {
		adcode: '3702',
		spell: 'qingdao',
		cityname: '青岛'
	}, {
		adcode: '3601',
		spell: 'nanchang',
		cityname: '南昌'
	}],

	swInit: function() {
		var self = this;
		FastClick.attach(document.body);
		amapCache.init({
			complete: function() {
				self.initCity(); //根据缓存加载相应城市
				tip.init();
				self.loadingOver()
			}
		});
	},

	initCity: function() {
		var self = this;
		self.showCity();
		// 通过监听hashchange来更改城市
		$(window).on('hashchange', function() {
			self.showCity();
		});
	},
	showCity: function() {
		var self = this,
			cache = SW.cache;
		var hash = decodeURIComponent(window.location.hash).replace(/^\#/, '');
		var param = self.param2json(hash);

		if(!param || !param.src || param.src && param.src != 'alipay'){
			$('#subway, #citypage, #srhpage').addClass('msubway');
		}

		if (!param) {
			self.subwayFlag = 0;
			return tip.cityChange();
		}
		self.param = param;

		var adcode = param.city && param.city.substr(0, 4);
		if (adcode != '') {
			if (!self.fileNameData[adcode]) {
				// 该城市没有对应地铁图
				self.subwayFlag = 0;
				return tip.cityChange();
			} else {
				self.subwayFlag = 1;
				$('#subway').show()
			}
		} else {
			self.subwayFlag = 0;
			return tip.cityChange();
		}
		$('.city_name').html(self.cityname[adcode]);
		document.title = self.cityname[adcode] + '地铁图';
		// 此城市有地铁
		// tip.hideCitylist();
		if(adcode != cache.curCity.adcode){
			$("#subway-svg,#infowindow-content,#tip-content,.line-caption").remove();
			drwSw.svgReady = false;
			self.loading();
			self.loadData(adcode, function(drwData) {
				self.loadingOver();
				drwSw.draw(drwData, param);
			});
		}else{
			SW.showStation(param);
			SW.showRoute(param);
		}
		// setTimeout(function () {
		// 	SW.showStation(param);
		// },10);
	},
	showStation: function (param) {
		var stationId = param.station;
		if(stationId){
			var station = SW.cache.stations[stationId] || SW.cache.stationspoi[stationId];
			var sid = 'st-' + station.si;

			var obj = $('#' + sid);

            if (drwSw.isNearTip) {
                drwSw.clearNearTip();
            }
            tip.openTip(obj);
            var center = tip.getStCenter(obj);
            tip.setCenter(center);
		}
	},
	showRoute: function (param) {
		var startid = param.startid,
			startname = param.startname,
			destid = param.destid,
			destname = param.destname;
		var start = SW.cache.stations[startid] || SW.cache.stationspoi[startid] || SW.cache.navStations[startname],
			dest = SW.cache.stations[destid] || SW.cache.stationspoi[destid] || SW.cache.navStations[destname];
		if(start && dest){
			startid = start.si;
			var startInfo = {
				'name': start.n,
				'poiid': start.poiid,
				'lon': start.sl.split(',')[0],
				'lat': start.sl.split(',')[1]
			};
			destid = dest.si;
			var destInfo = {
				'name': dest.n,
				'poiid': dest.poiid,
				'lon': dest.sl.split(',')[0],
				'lat': dest.sl.split(',')[1]
			}
			if($('#nav_start .marker-out').length <= 0){
				tip.setStartEnd(startid, 'start', startInfo);
			}
			if($('#nav_end .marker-out').length <= 0){
				tip.setStartEnd(destid, 'end', destInfo);
			}

			document.title = start.n + ' - ' + dest.n;

            tip.route();

            if(param.src && param.src == 'alipay'){
            	$('.filter_btn, .route_close_btn').hide();
            }
		}
	},
	changeCity: function(adcode) {
		var self = this;
		var param = null;
		var selfParam = self.param;
		self.subwayFlag = 1
		$('#subway').show()
		if (selfParam && selfParam.city && (selfParam.city == adcode || selfParam.city.substr(0, 4) == adcode)) {
			param = selfParam;
		} else {
			param = {
				'city': adcode
			};
		}

		$('.city_name').html(self.cityname[adcode]);


		if (tip.routeState) {
			tip.closeRoute();
		}

		if (tip.fromendState) {
			tip.clearMarker('start');
			tip.clearMarker('end');
		}

		self.loading();
		self.loadData(adcode, function(drwData) {
			self.loadingOver();
			drwSw.draw(drwData, param);
		});
	},
	loadCityList: function() {
		var self = this,
			cache = SW.cache;
		if (!cache.citylist || cache.citylist.length <= 0) {
			var requestUrl = "data/citylist.json";
			amapCache.loadData(requestUrl, function(data) {
				cache.citylist = data.citylist;
				for (var i = data.citylist.length - 1; i >= 0; i--) {
					cache.citylistByAdcode[data.citylist[i].adcode] = data.citylist[i];
				};
			});
		}
	},
	loadData: function(adcode, callback) {
		var self = this,
			cache = SW.cache;
		var city_code = adcode;
		// var city_name = cache.citylistByAdcode[adcode].spell;
		var city_name = self.fileNameData[adcode];
		if (cache.cities[city_code]) {
			cache.curCity.adcode = city_code;
			cache.curCity.name = cache.cities[city_code].name;
			cache.curCity.offset = cache.offset[city_code];
			callback(cache.cities[city_code]);
		} else {
			var requestUrl = "data/" + city_code + "_drw_" + city_name + ".json";
			amapCache.loadData(requestUrl, function(data) {
				cache.sug[city_code] = {};
				cache.dataForDrw[data.i] = data;
				cache.cities[data.i] = cache.cities[data.i] || {};
				cache.cities[data.i].name = data.s;
				cache.cities[data.i].id = data.i;
				cache.cities[data.i].offset = data.o;
				cache.cities[data.i].lines = [];
				cache.cities[data.i].linesNamePos = {};
				// cache.cities[data.i].stations = [];
				cache.cities[data.i].stations = {};
				cache.cities[data.i].zolines = {};
				cache.cities[data.i].zostations = [];
				var _offset = data.o.split(',');
				cache.offset[data.i] = cache.offset[data.i] || {};
				var _x = 0,
					_y = 0;
				cache.offset[data.i].x = _offset[0];
				cache.offset[data.i].y = _offset[1];
				_x = 1000 - Number(_offset[0]);
				_y = 1000 - Number(_offset[1]);
				var sugobj = {};
				for (var i = 0; i < data.l.length; i++) {
					if (data.l[i].su == '1') {
						var _coords = data.l[i].c;
						for (var q = 0; q < _coords.length; q++) {
							var _c = _coords[q].split(' ');
							_coords[q] = (Number(_c[0]) + _x) + ' ' + (Number(_c[1]) + _y);
						}
						data.l[i].c = _coords;
						data.l[i].linesNamePos = {};
						data.l[i].linesNamePos[data.l[i].ls] = data.l[i].lp;
						data.l[i].stname = [];

						for (var j = 0; j < data.l[i].st.length; j++) {
							data.l[i].stname.push(data.l[i].st[j].n);
							var _p = data.l[i].st[j].p.split(' ');
							data.l[i].st[j].p = (Number(_p[0]) + _x) + ' ' + (Number(_p[1]) + _y);
							var rsArr = data.l[i].st[j].rs.split('|');
							var newRsArr = []
							for (var h = 0; h < rsArr.length; h++) {
								var rs = rsArr[h].split(' ');
								newRsArr.push((Number(rs[0]) + _x) + ' ' + (Number(rs[1]) + _y))
							}
							data.l[i].st[j].rs = newRsArr.join('|')
							if (data.l[i].st[j].su == '1') {
								var cur = data.l[i].st[j];
								// cache.cities[data.i].stations.push(cur);
								cache.cities[data.i].stations[cur.si] = cur;
								cache.stations[cur.si] = cur;
								sugobj[cur.sp.split(' ').join('').toLowerCase() + '|' + cur.n.toLowerCase()] = cur;
								cache.stationspoi[cur.poiid] = cur;
								cache.navStations[cur.n] = cur;
								cache.navStPixel[cur.p] = cur;
							}
						}

						var _lpo = data.l[i].lp;
						if (_lpo) {
							for (var s = 0; s < _lpo.length; s++) {
								var _lp = _lpo[s].split(' ');
								_lpo[s] = (Number(_lp[0]) + _x) + ' ' + (Number(_lp[1]) + _y);
							}
							data.l[i].lp = _lpo;
						}
						cache.cities[data.i].linesNamePos[data.l[i].ls] = data.l[i].lp;
						cache.cities[data.i].lines.push(data.l[i]);
						cache.lines[data.l[i].ls] = data.l[i]; //写入line

						var busid = data.l[i].li && data.l[i].li.split('|');
						if (busid) {
							for (var n = 0; n < busid.length; n++) {
								cache.navlines[busid[n]] = data.l[i]

							}
						}
					}

				}
				// self.toCache(data, info_data);
				cache.sug[city_code] = sugobj;
				cache.curCity.adcode = city_code;
				cache.curCity.name = cache.cities[city_code].name;
				cache.curCity.offset = cache.offset[city_code];
				callback(cache.cities[city_code]);
			}, function() {
				alert('数据加载失败！');
			});

			requestUrl = "data/" + city_code + "_info_" + city_name + ".json";
			amapCache.loadData(requestUrl, function(info_data) {
				for (var k = 0; k < info_data.l.length; k++) {
					for (var l = 0; l < info_data.l[k].st.length; l++) {
						cache.stationsInfo[info_data.l[k].st[l].si] = info_data.l[k].st[l];
					}
				}
			});
		}
	},
	loading: function() {

		$('.loading-outer').css('position', 'fixed');
		$('.loading-bg').css({
			'position': 'fixed',
			'display': 'block'
		});
		$('.loading-bg .loading').css('top', '-30px');
	},
	loadingOver: function() {
		$('.loading-bg').css('display', 'none');
	},
	param2json: function(str) {
		if (!str || str == '') {
			return null
		} else {
			var strArr = str.split('&');
			var json = {};

			if (strArr.length > 0) {
				for (var i = 0; i < strArr.length; i++) {
					var item = strArr[i].split('=');
					var key = item[0];
					var value = item[1];
					json[key] = value;
				}
			}
			return json
		}
	}
};