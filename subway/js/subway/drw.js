var drwSw = {
	currLines: {},
	w: document.documentElement.clientWidth,
	h: document.documentElement.clientHeight,
	t_top: 0,
	t_left: 0,
	moveX: 0,
	moveY: 0,
	font_size: 12,
	nearHightLight: 14,
	isNearTip: false,
	label_angle: {
		'0': [0, -1],
		'1': [1, -1],
		'2': [1, 0],
		'3': [1, 1],
		'4': [0, 1],
		'5': [-1, 1],
		'6': [-1, 0],
		'7': [-1, -1]
	},
	specailPhone: false,
	curOffset: {},
	sortline: null,
	ns_svg: "http://www.w3.org/2000/svg",
	nearId: null,
	svgReady: false,
	svgOffset: {
		left: 0,
		top: 0
	},
	isSpecailPhone: function() {
		var self = this;
		var ua = navigator.userAgent.toLowerCase();
	},
	initDraw: function(drwData, param) {
		var self = this;
		self.t_left = 0;
		self.t_top = 0;
		var screenX = parseInt(self.w / 2),
			screenY = parseInt(self.h / 2),
			originX,
			originY,
			ox,
			oy,
			lightStation = {},
			adcode = drwData.id,
			detail = param.detail;
		if (detail == 'true') {
			var detailStation = self.getDetailStation(drwData, param);
			lightStation.id = detailStation;
			lightStation.detail = true;
			if (detailStation) {
				var offset = SW.cache.stations[detailStation].p;
				ox = parseInt(offset.split(' ')[0]);
				oy = parseInt(offset.split(' ')[1]);
			} else {
				ox = SW.cache.curCity.offset.x;
				oy = SW.cache.curCity.offset.y;
			}
		} else {
			//'4401':广州
			//'2102':大连
			//'3205':苏州
			var nearStation = self.getNearStation(drwData, param);
			lightStation.id = nearStation;
			lightStation.detail = false;
			self.nearId = nearStation;
			if (nearStation) {
				var offset = SW.cache.stations[nearStation].p;
				ox = parseInt(offset.split(' ')[0]);
				oy = parseInt(offset.split(' ')[1]);
			} else {
				ox = SW.cache.curCity.offset.x;
				oy = SW.cache.curCity.offset.y;
			}
		}
		originX = ox;
		originY = oy;
		var moveX = Number(screenX) - Number(originX);
		var moveY = Number(screenY) - Number(originY);
		drwSw.moveX = moveX;
		drwSw.moveY = moveY;
		self.deletInProgress(drwData);
		self.drawSvgSubway(drwData, lightStation, param);
	},
	draw: function(drwData, param) {
		$('#subway-svg').remove();
		this.currLines = {};
		if(!this.svgReady){
			this.initDraw(drwData, param);
		}
	},
	drawSvgSubway: function(drwData, station, param) {
		var self = this;
		$('#subwayCanvas').css('display', 'none');
		$('.station-out-box').css('display', 'none');
		$('#subwaySvg').css('display', 'block');
		var adcode = drwData.id;
		self.drwSwBox(drwData);
		setTimeout(function() {
			self.drawSvg(drwData, station, param);
			self.svgReady = true;
		}, 10)
	},
	drwSwBox: function(drwData) {
		var self = this;
		var subway_svg = document.getElementById("subwaySvg");
		var subway_content = document.createElementNS(self.ns_svg, 'svg');
		subway_content.setAttribute("class", "subway-content");
		subway_content.setAttribute("id", "subway-svg");
		subway_content.setAttribute("adcode", drwData.id);
		subway_content.style.width = "2000px";
		subway_content.style.height = "2000px";
		subway_content.setAttribute('width', "2000px");
		subway_content.setAttribute('height', "2000px");
		subway_svg.appendChild(subway_content);
		var subway_box = document.createElementNS(self.ns_svg, 'g');
		var svg_g = document.createElementNS(self.ns_svg, 'g');
		setTimeout(function() {
			var svgW = $('#subway-svg').offset().width;
			// if (svgW != 2000) {
			// 	self.specailPhone = true;
			// 	subway_content.setAttribute("viewBox", "0 0 " + self.w + " " + self.h);
			// 	subway_content.style.width = self.w + "px";
			// 	subway_content.style.height = self.h + "px";
			// 	subway_box.setAttribute("id", "subway-box");
			// 	subway_content.appendChild(subway_box);

			// 	svg_g.setAttribute("id", "svg-g");
			// 	var top, left;
			// 	top = self.t_top;
			// 	left = self.t_left;
			// 	svg_g.setAttribute("transform", "translate(" + drwSw.moveX + ", " + drwSw.moveY + ") scale(1)");
			// 	subway_box.appendChild(svg_g);
			// } else {
				subway_content.style.left = -1000 + self.w / 2 + "px";
				subway_content.style.top = -1000 + self.h / 2 + "px";
				self.svgOffset.left = -1000 + self.w / 2;
				self.svgOffset.top = -1000 + self.h / 2;
				subway_box.setAttribute("id", "subway-box");
				subway_content.appendChild(subway_box);
				svg_g.setAttribute("id", "svg-g");
				var top, left;
				top = self.t_top;
				left = self.t_left;
				svg_g.setAttribute("transform", "translate(0,0) scale(1)");
				subway_box.appendChild(svg_g);
			// }
		}, 0)
	},
	deletInProgress: function(drwData) {
		var self = this;
		var j = 0;
		for (var i = 0; i < drwData.lines.length; i++) {
			if (drwData.lines[i].su != "3") {
				self.currLines[drwData.lines[i].ls] = drwData.lines[i];
			}
		}
	},
	lineSort: function() {
		var self = this;
		self.sortline = [];
		var id;
		for (id in self.currLines) {
			var index = parseInt(self.currLines[id].x);
			var line_id = self.currLines[id].ls;
			self.sortline[index - 1] = line_id;
		}
	},
	addCaption: function(drwData) {
		var self = this;
		var subway_caption = $('#subway-caption');
		for (var i = 0; i < self.sortline.length; i++) {
			var caption_item = $('<div class="line-caption"></div>');
			var la = SW.cache.lines[self.sortline[i]].la;
			var html = '';
			if (!la || la == '') {
				html = SW.cache.lines[self.sortline[i]].ln;
			} else {
				html = SW.cache.lines[self.sortline[i]].ln + '<div class="caption_la">( ' + SW.cache.lines[self.sortline[i]].la + ' )</div>'
			}
			caption_item.html(html);
			caption_item.attr('id', 'caption-' + self.sortline[i]);
			caption_item.attr('lineid', self.sortline[i]);
			caption_item.css('background', '#' + SW.cache.lines[self.sortline[i]].cl);
			subway_caption.append(caption_item);
		}
	},
	addFilter: function(drwData) {
		var self = this;
		var subway_caption = $('.fliter_detail');
		subway_caption.html(' ');
		for (var i = 0; i < self.sortline.length; i++) {
			var caption_item = $('<li class="fliter_item"></li>');
			if (i == self.sortline.length - 1) {
				caption_item = $('<li class="fliter_item fliter_item_last"></li>');
			}
			var la = SW.cache.lines[self.sortline[i]].la;
			var html = '',
				line_name = '';
			if (!la || la == '') {
				line_name = SW.cache.lines[self.sortline[i]].ln;
			} else {
				line_name = SW.cache.lines[self.sortline[i]].ln + '<b class="line_name_la">( ' + SW.cache.lines[self.sortline[i]].la + ' )</b>';
			}
			html = '<span class="line_color" style="background:#' + SW.cache.lines[self.sortline[i]].cl + '"></span><span class="line_name">' + line_name + '</span>';
			caption_item.html(html);
			caption_item.attr('id', 'caption-' + self.sortline[i]);
			caption_item.attr('lineid', self.sortline[i]);
			subway_caption.append(caption_item);
		}

		$('.filter_btn').show().css({
			'z-index': '20'
		});
	},
	drawSvg: function(drwData, station, param) {
		var self = this;
		var status = 'normal';
		self.lineSort();
		self.drwSwLines(self.currLines, status);
		self.drwSwStations(drwData, status, station);
		self.drwSwStationsName(drwData, status, 12, 20); //缩小为0.5，第二个参数为24
		self.drwSwLinesName(drwData, status);
		self.drawBg(self.currLines);
		self.addFilter(self.currLines);
		var nearObj = $('.near-station');
		if (nearObj.length > 0) {
			var center = tip.getStCenter(nearObj);
			tip.setCenter(center);
		}
		SW.showStation(param);
		SW.showRoute(param);
	},
	drawBg: function() {
		var self = this;
		var svg_g = document.getElementById("svg-g");
		var subway_bg = document.createElementNS(self.ns_svg, 'g');
		subway_bg.setAttribute("id", "g-bg");
		svg_g.appendChild(subway_bg);
		var bg_rect = document.createElementNS(self.ns_svg, 'rect');
		bg_rect.setAttribute('id', 'select_bg');
		bg_rect.setAttribute('x', 0);
		bg_rect.setAttribute('y', 0);
		bg_rect.setAttribute('width', 2000);
		bg_rect.setAttribute('height', 2000);
		subway_bg.appendChild(bg_rect);
	},
	drawSelectLine: function(drwData) {
		var self = this;
		var status = 'select';
		var svg_g = document.getElementById("svg-g");
		var subway_select_g = document.createElementNS(self.ns_svg, 'g');
		subway_select_g.setAttribute("id", "g-select");
		svg_g.appendChild(subway_select_g);
		self.drwSwLines(drwData, status);
		self.drwSwStations(drwData, status);
		self.drwSwStationsName(drwData, status, 12, 20); //缩小为0.5，第二个参数为24
		self.drwSwLinesName(drwData, status);
	},
	drawNavLine: function(drwData) {
		var self = this;
		var status = 'nav';
		var svg_g = document.getElementById("svg-g");
		var subway_nav_g = document.createElementNS(self.ns_svg, 'g');
		subway_nav_g.setAttribute("id", "g-nav");
		svg_g.appendChild(subway_nav_g);
		self.drwSwLines(drwData.lines, status);
		self.drwSwStations(drwData, status);
		self.drwSwStationsName(drwData, status, 12, 20); //缩小为0.5，第二个参数为24
	},
	// 绘制地铁线路
	drwSwLines: function(drwData, status) {
		var self = this;
		var svg_g = document.getElementById("svg-g");
		var subway_line = document.createElementNS(self.ns_svg, 'g');
		subway_line.setAttribute("id", "g-line-" + status);
		if (status == 'normal') {
			svg_g.appendChild(subway_line);
			for (var id in drwData) {
				var dataset_line_arr = drwData[id].c;
				var node_first = 'M' + dataset_line_arr[0].split(' ').join(',');
				var path = node_first + 'L' + dataset_line_arr.join('L');
				var line_path = document.createElementNS(self.ns_svg, 'path');
				line_path.setAttribute("id", "line-" + drwData[id].ls);
				line_path.setAttribute("name", drwData[id].ls);
				line_path.setAttribute("stroke", "#" + drwData[id].cl);
				line_path.setAttribute("d", path);
				subway_line.appendChild(line_path);
			}
		} else if (status == 'select') {
			var svg_select = document.getElementById("g-select");
			svg_select.appendChild(subway_line);
			var dataset_line_arr = drwData.c;
			var node_first = 'M' + dataset_line_arr[0].split(' ').join(',');
			var path = node_first + 'L' + dataset_line_arr.join('L');
			var line_path = document.createElementNS(self.ns_svg, 'path');
			line_path.setAttribute("id", "line-" + drwData.ls);
			line_path.setAttribute("name", drwData.ls);
			line_path.setAttribute("stroke", "#" + drwData.cl);
			line_path.setAttribute("d", path);
			subway_line.appendChild(line_path);
		} else if (status == 'nav') {
			var svg_nav = document.getElementById("g-nav");
			svg_nav.appendChild(subway_line);
			for (var id in drwData) {
				var dataset_line_arr = drwData[id].c;
				var node_first = 'M' + dataset_line_arr[0].split(' ').join(',');
				var path = node_first + 'L' + dataset_line_arr.join('L');
				var line_path = document.createElementNS(self.ns_svg, 'path');
				line_path.setAttribute("id", "line-" + drwData[id].ls);
				line_path.setAttribute("name", drwData[id].ls);
				line_path.setAttribute("stroke", "#" + drwData[id].cl);
				line_path.setAttribute("d", path);
				subway_line.appendChild(line_path);
			}
		}
	},
	//绘制地铁线路名
	drwSwLinesName: function(drwData, status) {
		var self = this;
		var data = drwData.linesNamePos;
		var svg_g = document.getElementById("svg-g");
		var subway_line_name = document.createElementNS(self.ns_svg, 'g');
		subway_line_name.setAttribute("id", "g-line-name");
		if (status == 'normal') {
			svg_g.appendChild(subway_line_name);
		} else if (status == 'select') {
			var svg_select = document.getElementById("g-select");
			svg_select.appendChild(subway_line_name);
		}
		for (var id in data) {
			if (data[id] != null) {
				for (var i = 0; i < data[id].length; i++) {
					var line_name = SW.cache.lines[id].ln;
					var line_name_w = line_name.length * self.font_size + 6;
					var line_name_h = 20;
					var line_color = SW.cache.lines[id].cl;
					var line_name_x = parseInt(data[id][i].split(" ")[0]);
					var line_name_y = parseInt(data[id][i].split(" ")[1]) - 15;
					var _line_name = document.getElementById("g-line-name");
					var line_name_g = document.createElementNS(self.ns_svg, 'g');
					line_name_g.setAttribute('transform', 'translate(' + line_name_x + ',' + line_name_y + ')');
					line_name_g.setAttribute('class', 'line_name');
					line_name_g.setAttribute("lineid", id);
					var line_namr_bg = document.createElementNS(self.ns_svg, 'rect');
					line_namr_bg.setAttribute("rx", 3);
					line_namr_bg.setAttribute("ry", 3);
					line_namr_bg.setAttribute("width", line_name_w);
					line_namr_bg.setAttribute("height", line_name_h);
					line_namr_bg.setAttribute("fill", "#" + line_color);
					line_name_g.appendChild(line_namr_bg);
					var line_name_text = document.createElementNS(self.ns_svg, 'text');
					line_name_text.setAttribute("class", "line_name_txt");
					line_name_text.setAttribute("lineid", id);
					line_name_text.setAttribute("height", 20);
					line_name_text.setAttribute("x", line_name_w / 2);
					line_name_text.setAttribute("y", line_name_h / 2);
					line_name_text.setAttribute("dy", 4);
					line_name_text.setAttribute("fill", "#fff");
					line_name_text.setAttribute("text-anchor", "middle");
					line_name_text.textContent = line_name;
					line_name_g.appendChild(line_name_text);
					subway_line_name.appendChild(line_name_g);
				}
			}
		}
	},
	// 绘制地铁站点
	drwSwStations: function(drwData, status, lightstation) {
		var self = this;
		var svg_g = document.getElementById("svg-g");
		var subway_station_g = document.createElementNS(self.ns_svg, 'g');
		subway_station_g.setAttribute("id", "g-station-" + status);
		if (status == 'normal') {
			svg_g.appendChild(subway_station_g);
		} else if (status == 'select') {
			var svg_select = document.getElementById("g-select");
			svg_select.appendChild(subway_station_g);
		} else if (status == 'nav') {
			var svg_nav = document.getElementById("g-nav");
			svg_nav.appendChild(subway_station_g);
		}
		var station = drwData.stations || drwData.st;
		$.each(station, function (idx, item) {
			if (item.su == "1") {
				var subway_circle_g = document.createElementNS(self.ns_svg, 'g');
				subway_circle_g.setAttribute("id", "g-" + item.si);
				subway_circle_g.setAttribute("class", "g-station");
				subway_station_g.appendChild(subway_circle_g);

				if (item.t == "0") {

					var subway_station = document.createElementNS(self.ns_svg, 'circle');
					subway_station.setAttribute("cx", parseInt(item.p.split(" ")[0]));
					subway_station.setAttribute("cy", parseInt(item.p.split(" ")[1]));
					subway_station.setAttribute("r", 7);
					subway_station.setAttribute("fill", "#FFF");
					subway_station.setAttribute("stroke-width", 2);
					subway_station.setAttribute("stroke", "#000");
					subway_circle_g.appendChild(subway_station);
				} else if ((item.t == "1")) {
					var subway_station_transfer = document.createElementNS(self.ns_svg, 'image');
					subway_station_transfer.setAttribute("x", parseInt(item.p.split(" ")[0]) - 13);
					subway_station_transfer.setAttribute("y", parseInt(item.p.split(" ")[1]) - 13);
					subway_station_transfer.setAttribute("width", 26);
					subway_station_transfer.setAttribute("height", 26);
					subway_station_transfer.setAttributeNS('http://www.w3.org/1999/xlink', "xlink:href", "./img/subway/transfer-station.png");
					subway_circle_g.appendChild(subway_station_transfer);
				}
				//高亮显示站点
				var lightId = lightstation && lightstation.id;
				if (lightId) {
					if (item.si == lightId) {
						var data = SW.cache.stations[lightId];
						var subway_station = document.createElementNS(self.ns_svg, 'circle');
						subway_station.setAttribute("id", "near-" + lightId);
						subway_station.setAttribute("class", "near-station");
						subway_station.setAttribute("cx", parseInt(data.p.split(" ")[0]));
						subway_station.setAttribute("cy", parseInt(data.p.split(" ")[1]));
						subway_station.setAttribute("r", 14);
						subway_station.setAttribute("fill", "#007aff");
						subway_station.setAttribute("fill-opacity", 0.4);
						subway_circle_g.appendChild(subway_station);
						if (!lightstation.detail) {
							if (!($("#tip-content").length > 0)) {
								self.nearTip(lightId);
								$("#tip-content").addClass("open");
							}
						}
					}
				} else {
					self.clearNearTip();
				}


				var subway_station_out = document.createElementNS(self.ns_svg, 'circle');
				subway_station_out.setAttribute("id", 'st-' + item.si);
				subway_station_out.setAttribute("class", 'station_obj');
				subway_station_out.setAttribute("cx", parseInt(item.p.split(" ")[0]));
				subway_station_out.setAttribute("cy", parseInt(item.p.split(" ")[1]));
				subway_station_out.setAttribute("line_id", item.r.split("|")[0]);
				subway_station_out.setAttribute("station_id", item.si);
				subway_station_out.setAttribute("station_name", item.n);
				subway_station_out.setAttribute("station_poiid", item.poiid);
				subway_station_out.setAttribute("station_lon", item.sl.split(',')[0]);
				subway_station_out.setAttribute("station_lat", item.sl.split(',')[1]);
				subway_station_out.setAttribute("r", 13);
				subway_station_out.setAttribute("fill", "#FFF");
				subway_station_out.setAttribute("fill-opacity", "0");
				subway_circle_g.appendChild(subway_station_out);
			}
		})
	},

	// 绘制地铁站点名称
	drwSwStationsName: function(drwData, status, fontSize, h) {
		var self = this;
		var data = drwData.stations || drwData.st || drwData;
		var svg_g = document.getElementById("svg-g");
		var subway_station_name_g = document.createElementNS(self.ns_svg, 'g');
		subway_station_name_g.setAttribute("id", "g-station-name-" + status);
		if (status == 'normal') {
			svg_g.appendChild(subway_station_name_g);
		} else if (status == 'select') {
			var svg_select = document.getElementById("g-select");
			svg_select.appendChild(subway_station_name_g);
		} else if (status == 'nav') {
			var svg_nav = document.getElementById("g-nav");
			svg_nav.appendChild(subway_station_name_g);
		}
		var subway_station_name = document.createElementNS(self.ns_svg, 'g');
		subway_station_name.setAttribute("id", "g-name");
		subway_station_name_g.appendChild(subway_station_name);

		$.each(data ,function (idx, item) {
			if (item.su == "1") {
				if (item.t != "2") {
					var station_name = document.createElementNS(self.ns_svg, 'text');
					station_name.style.fontSize = fontSize + "px";
					station_name.setAttribute("id", "name-" + item.si);
					station_name.setAttribute("name", item.n);
					station_name.textContent = item.n;
					var direct = item.lg,
						text_anchor, x, y;
					if (direct == "0" || direct == "4") {
						text_anchor = "middle";
					} else {
						text_anchor = "left";
					}
					station_name.setAttribute("text-anchor", text_anchor);
					if (direct == "0" || direct == "4") {
						x = parseInt(item.p.split(" ")[0]);
					} else if (direct == "5" || direct == "6" || direct == "7") {
						x = parseInt(item.p.split(" ")[0]) - item.n.length * fontSize - 10;
					} else if (direct == "1" || direct == "2" || direct == "3") {
						x = parseInt(item.p.split(" ")[0]) + 10;
					}
					if (direct == "2" || direct == "6") {
						y = parseInt(item.p.split(" ")[1]) + 5;
					} else if (direct == "0" || direct == "1" || direct == "7") {
						y = parseInt(item.p.split(" ")[1]) - 10;
					} else if (direct == "3" || direct == "4" || direct == "5") {
						y = parseInt(item.p.split(" ")[1]) + h; //缩小为最小级别是为30，其他为20
					}
					station_name.setAttribute("x", x);
					station_name.setAttribute("y", y);
					subway_station_name.appendChild(station_name);
				}
			}
		})
	},
	//离我最近TIP
	nearTip: function(id) {
		var self = this;
		//生成窗体
		var subway_box = $('.overlays');
		var tip_w = 172,
			tip_h = 73;
		var obj = $("#near-" + id);
		var obj_left = obj.offset().left,
			obj_top = obj.offset().top;
		var tip_left, tip_top;
		var type = 't';
		var tip_content = $('<div class="tip-content" id="tip-content"><div class="tip-near tip-' + type + '"><img class="near-img" width=100 src="./img/subway/near_' + type + '.png"/></div></div>');
		subway_box.append(tip_content);
		var $overlays = $('.overlays');
		var overlaysLeft = parseInt($overlays.css('left')) || 0,
			overlaysTop = parseInt($overlays.css('top')) || 0;

		tip_left = obj_left + 28 * tip.allScale / 2 - overlaysLeft,
			tip_top = obj_top - overlaysTop;

		$('.tip-content').css({
			top: tip_top + 'px',
			left: tip_left + 'px'
		});
		self.isNearTip = true;
	},
	clearNearTip: function() {
		var self = this;
		var tip = $('.tip-content');
		if (tip.length > 0) {
			tip.remove();
		}
	},
	//getDistance 获得两点的距离
	getDistance: function(a, b) { //a是当前位置
		var self = this;
		var R = 6378137, // earth radius in meters
			d2r = Math.PI / 180,
			dLat = (b.lat - a.lat) * d2r,
			dLon = (b.lng - a.lng) * d2r,
			lat1 = a.lat * d2r,
			lat2 = b.lat * d2r,
			sin1 = Math.sin(dLat / 2),
			sin2 = Math.sin(dLon / 2);
		var c = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);
		return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
	},
	toLnglat: function(param) {
		var self = this;
		if (!param) {
			return false;
		}
		var tmp = param.split(',');
		var lng = tmp[0];
		var lat = tmp[1];

		return {
			lng: lng,
			lat: lat
		}
	},
	getDetailStation: function(drwData, param) {
		var self = this,
			poiid = param.poiid,
			lnglat = param.lnglat,
			station = SW.cache.stationspoi[poiid];
		if (station) {
			return station.si;
		} else {
			return self.getNearStation(drwData, param);
		}
	},
	getNearStation: function(drwData, param) {
		var self = this;
		var lnglat = param.lnglat;
		var minDistance = -1,
			curDistance = 0;
		var stations = drwData.stations;
		var curPos = self.toLnglat(lnglat),
			stationPos;
		var minId, curId;
		$.each(stations, function (idx, item) {
			stationPos = self.toLnglat(item.sl);
			curId = item.si;
			if (item.sl != '') {
				curDistance = self.getDistance(curPos, stationPos);
			} else {
				curDistance = 100000
			}
			if (minDistance == -1 || curDistance < minDistance) {
				minDistance = curDistance;
				minId = curId;
			}
		})
		if (minDistance < 10000) {
			return minId;
		} else {
			return false;
		}
	}
};