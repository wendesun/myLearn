var getstureState = 0;
var el = document.getElementById('drag_handle');
el.style.transformOrigin = "top left";

var tip = {
    host: "http://m.amap.com/",
    verify: "/verify/?from=",
    isHighlight: false,
    isInfoShow: false,
    stationsInfo: SW.cache.stationsInfo,
    stations: SW.cache.stations,
    lines: SW.cache.lines,
    station_w: 26,
    dragObjXY: {}, //拖拽div时的实时xy
    dragX: null,
    dragY: null,
    onePoint: {}, //单手touch时的初始xy
    twoPoint1: {}, //双手touch时的初始x1y1
    twoPoint2: {}, //双手touch时的初始x2y2
    twoOriginPointDis: null, //双手touch时的两手指的初始距离
    touchStatus: null, //当前touch状态：drag, scale
    curScale: 1, //当前缩放级别
    allScale: 1,
    zoomCenter: null, //搜索初始中心点
    dragHandle: $("#drag_handle"), //touch对象
    dragObj: $("#subwaySvg"), //
    svgOffset: {
        left: 0,
        top: 0
    },
    realCenter: {
        x: $(window).width() / 2,
        y: $(window).height() / 2
    },
    subwaySvg: document.getElementById("subway-svg"),
    dragObjOffset: {
        x: null,
        y: null
    },
    opentip: false,
    curopenStation: null,
    routeInfo: { //路线规划起始点信息
        start: null,
        end: null
    },
    routeDtailInfo: {
        start: null,
        end: null
    },
    routeId: {
        start: null,
        end: null
    },
    navDrwData: {
        linesbar: [],
        lines: {},
        stations: []
    },
    transform: {
        translate: {
            x: 0,
            y: 0
        },
        scale: 1
    },
    transformState: { //每次拖动结束后的transform值
        translate: {
            x: 0,
            y: 0
        },
        scale: 1
    },
    transformOrigin: null,
    routeState: false,
    fromendState: false,
    pathData: null,
    init: function() {
        this.bindEvent();
    },
    preventScrollBounce: function(eles) {
        if (!eles.length && !eles.unshift) {
            eles = [eles]
        }

        eles.forEach(function(el) {
            new Hammer.Manager(el, {
                recognizers: [
                    [Hammer.Pinch, {
                        direction: Hammer.DIRECTION_VERTICAL
                    }],
                    [Hammer.Swipe, {
                        direction: Hammer.DIRECTION_VERTICAL
                    }]
                ]
            })
        })

    },
    bindEvent: function() {
        document.addEventListener('touchstart', function() {});

        var self = this;
        var font_size = 12;
        var $subway = $('#subway');
        var $city = $('#citypage');
        var $srh = $('#srhpage');
        var el = document.getElementById('drag_handle');
        var mc = new Hammer.Manager(el, {
            domEvents: true
        });

        mc.add(new Hammer.Pan());
        mc.add(new Hammer.Pinch());

        var enableGesture = true;
        var lastAction = "";
        var hasPenchend = false;

        mc.on("panmove", function(ev) {

            if (!enableGesture) return;

            self.touchStatus = 'pan';
            lastAction = "pan";
            self.mcdragSvg(ev);
        });

        var pinchTimer;
        mc.on("pinchstart pinchmove", function(ev) {

            if (!enableGesture) return;

            self.touchStatus = 'pinch';
            lastAction = "pinch";
            if (ev.type == 'pinchstart') {
                self.svgOffset = drwSw.svgOffset || tip.svgOffset;
                hasPenchend = false;
            }
            self.mcScaleSvg(ev);

        });

        mc.on("pinchend", function(ev) {
            setTimeout(function() {
                if (!hasPenchend) {
                    self.scaleSvgUpdate(self.transform.scale);
                }
            }, 0)
        })
        mc.on("hammer.input", function(ev) {

            if (ev.isFinal) {

                if (lastAction == "pinch") {
                    self.scaleSvgUpdate(self.transform.scale);
                    hasPenchend = true;
                }

                if (lastAction == "pan") {
                    self.svgUpdate(ev);
                }

                enableGesture = false;
                setTimeout(function() {
                    enableGesture = true;
                }, 50);
            }
        });

        $('.light_box').on('touchmove', function(ev) {
            ev.preventDefault();
        });

        $('#loading').on('touchmove', function(ev) {
            ev.preventDefault();
        });

        $subway.on('touchend', 'g', function() {
            if (!self.touchStatus) {
                if ($(this).hasClass('line_name')) {
                    var line_id = $(this).attr('lineid');
                    self.showFilterLine(line_id);
                    var select_obj = $('#g-select');
                    tip.setFitview(select_obj);
                    var center = self.getFilterCenter();
                    self.setCenter(center);
                }
            }
        });

        $subway.on('touchend', '#g-bg', function() {
            if (!tip.routeState) {
                if (!self.touchStatus) {
                    $('#g-select').remove();
                    $('#g-bg').css('display', 'none');
                }
            }
        });

        $subway.on('touchend', '.tip-near', function() {
            drwSw.clearNearTip();
        });

        $subway.on('touchend', function(e) {
            if (!self.touchStatus && !tip.routeState) {
                var target = e.target;
                if (target.getAttribute('class') != 'station_obj' || target.getAttribute('class') != 'nav-img') {
                    tip.closeTip();
                }
            }
        });

        $("#srhlist").on("touchmove", function(e) {
            $("#srh_ipt").blur();
        });

        $subway.on('touchend', '.station_obj', function(e) {
            e.stopPropagation();
            if (!self.touchStatus && !tip.routeState) {
                var id = $(this).attr('station_id');
                window.location.hash = '#city=' + SW.cache.curCity.adcode + '&station=' + id;
                // var obj = $(this);
                // if (drwSw.isNearTip) {
                //     drwSw.clearNearTip();
                // }
                // tip.openTip(obj);
                // var center = tip.getStCenter(obj);
                // tip.setCenter(center);
            }
        });

        $subway.on('touchend', '.nav_marker', function() {
            var type = $(this).attr('type');
            var id = self.routeId[type];
            if (!self.touchStatus) {
                if (id) {
                    var obj = $('#st-' + id);
                    var center = tip.getStCenter(obj);
                    tip.setCenter(center);
                    tip.openTip(obj);
                }
            }
        });

        $subway.on("touchend", ".close_info_btn", function(e) {
            self.closeInfoWindow(e);
        });

        $subway.on('touchend', '.tip_wrap', function(e) {
            e.stopPropagation();
        });

        $subway.on('touchstart', '.tip_wrap', function(e) {
            e.stopPropagation();
        });

        $('.filter_btn').on('touchend', function() {
            if (!tip.routeState) {
                self.openFilter();
            }
        });

        $('.flier_close_btn').on('touchend', function() {
            self.closeFilter();
        });

        $('.light_box').on('touchend', function() {
            self.closeFilter();
        });

        $('.fliter_detail').on('touchend', '.fliter_item', function() {
            if (lockfd) return;
            var line_id = $(this).attr('lineid');
            self.closeFilter();
            self.showFilterLine(line_id);
            var select_obj = $('#g-select');
            tip.setFitview(select_obj);
            var center = self.getFilterCenter();
            self.setCenter(center);
        });
        var fdTimer;
        var lockfd = false;
        $('.fliter_detail').on('touchmove', function(e) {
            e.stopPropagation();
            lockfd = true;
            fdTimer && clearTimeout(fdTimer);
            fdTimer = setTimeout(function() {
                lockfd = false;
            }, 60);
        });

        // // 最后的return false是为了修复Bug https://k3.alibaba-inc.com/issue/8058757?versionId=1323537
        $('.tip_route_btn').on('touchend', function() {
            var type = $(this).attr('type'),
                info = $(this).closest('.tip_wrap'),
                id = info.attr('stid');
            tip.setStartEnd(id, type, info);
            tip.closeTip();
            if (tip.routeInfo && tip.routeInfo.start && tip.routeInfo.end) {
                var param = {
                    'city': SW.cache.curCity.adcode,
                    'startid': tip.routeInfo.start.poiid,
                    'startname': tip.routeInfo.start.name,
                    'destid': tip.routeInfo.end.poiid,
                    'destname': tip.routeInfo.end.name
                }
                setTimeout(function() {
                    window.location.hash = '#' + $.param(param);
                }, 10)
            }
            return false
        });

        $('.city_list_btn').on('touchend', function() {
            tip.cityChange();
        });

        $city.on('touchend', '#back_subway', function() {
            // 如果没有地铁图，点击城市列表后退直接退回路线视图
            if (!SW.subwayFlag) {
                // history.go(-1);
                // var hostname = window.location.origin;
                // window.location.href = hostname + '/navigation/index/';
                window.location.href = tip.host + 'navigation/index/';
            } else {
                $('#subway, .filter_btn').show();
                tip.hideCitylist();
            }
        });

        $city.on('click', '.cityitem', function() {
            var adcode = $(this).attr('adcode');
            // window.location.hash = "#city=" + adcode;
            // $('#tip-content').remove();
            tip.initCity();
            window.location.hash = "#city=" + adcode;
            // SW.changeCity(adcode);
            tip.hideCitylist();
            $('#subway').show();
        });

        $(".route_startend").on('touchend', function() {
            var type = $(this).closest('.route_ipt').attr('srhtype');
            tip.showSrhPage(type);
        })

        $("#setSwitch").on("touchend", function() {
            var start_id = tip.routeId.start,
                end_id = tip.routeId.end;
            if (start_id && end_id) {
                var startInfo = $.extend(true, {}, tip.routeInfo.start),
                    endInfo = $.extend(true, {}, tip.routeInfo.end);
                var typeArr = ['start', 'end'];
                // tip.closeRoute(typeArr);

                tip.setStartEnd(end_id, 'start', endInfo);
                tip.setStartEnd(start_id, 'end', startInfo);

                if (tip.routeInfo && tip.routeInfo.start && tip.routeInfo.end) {
                    var param = {
                        'city': SW.cache.curCity.adcode,
                        'startid': tip.routeInfo.start.poiid,
                        'startname': tip.routeInfo.start.name,
                        'destid': tip.routeInfo.end.poiid,
                        'destname': tip.routeInfo.end.name
                    }
                    window.location.hash = '#' + $.param(param);
                }
            }
        });

        $('.route_close').on('touchend', function() {
            var type = $(this).closest('.route_ipt').attr('srhtype');
            var placeholder = {
                'start': '输入起点',
                'end': '输入终点'
            };
            $('.route_close_' + type).addClass('hidden');
            $('.route_' + type).html(placeholder[type]).addClass('route_placeholder');
            tip.closeRoute([type]);
        })

        $('.route_close_btn').on('touchend', function(e) {
            e.preventDefault();
            var typeArr = ['start', 'end'];
            tip.closeRoute(typeArr);
        });

        $srh.on('input', '#srh_ipt', function() {
            var value = $(this).val();
            tip.getSug(value);
        });

        $srh.on('touchend', '#back_ipt', function() {
            var type = $(this).closest('#srhpage').attr('type');
            tip.hideSrhPage();
        });

        $srh.on('click', '.st_item', function() {
            var $this = $(this);
            var id = $this.data('stid'),
                poiid = $(this).data('poiid'),
                name = $this.data('name'),
                lon = $this.data('lon'),
                lat = $this.data('lat');
            var type = $this.closest('#srhpage').attr('type');
            var info = {
                'name': name,
                'poiid': poiid,
                'lon': lon,
                'lat': lat
            };
            tip.hideSrhPage();
            tip.setStartEnd(id, type, info);
            var center = tip.getStCenter($('#st-' + id));
            tip.setCenter(center);
            tip.closeTip();
            if (tip.routeInfo && tip.routeInfo.start && tip.routeInfo.end) {
                var param = {
                    'city': SW.cache.curCity.adcode,
                    'startid': tip.routeInfo.start.poiid,
                    'startname': tip.routeInfo.start.name,
                    'destid': tip.routeInfo.end.poiid,
                    'destname': tip.routeInfo.end.name
                }
                window.location.hash = '#' + $.param(param);
            }
        });

        $('.tip_name_detail').on('touchend', function(e) {
            e.stopPropagation();
            var href = $(this).attr('detail_href');
            window.location.href = href;
        });

        $('#back_amap').on('touchend', function() {
            tip.goback()
        });

        $('.route_bar').on('click', function() {
            // if(SW.param.src != 'alipay'){
            tip.searchRouteDetail();
            // }
        });
    },

    mcdragSvg: function(ev) {
        var self = this;

        // 降低渲染频率
        if (self.transform.translate.x == ev.deltaX && self.transform.translate.y == ev.deltaY) {
            return
        }

        self.transform.translate.x = ev.deltaX;
        self.transform.translate.y = ev.deltaY;

        self.handleUpdate();
    },

    mcScaleSvg: function(ev) {
        var self = this;
        var scale
        var initScale = 1;
        var center = ev.center; //{x:..,y:..}

        if (ev.type == 'pinchstart') {
            initScale = self.transform.scale || 1;
        }

        // $('#transform').html(self.svgOffset.left + ',' + self.svgOffset.top);
        self.realCenter = {
            'x': Number(center.x) - Number(self.svgOffset.left),
            'y': Number(center.y) - Number(self.svgOffset.top)
        }

        // self.realCenter = {
        //     'x': Number(center.x),
        //     'y': Number(center.y)
        // }

        var tmpscale = ev.scale;
        tip.curScale = tmpscale;

        tmpscale = tmpscale > 2 ? 2 : tmpscale;
        tmpscale = tmpscale < 0.5 ? 0.5 : tmpscale;

        scale = initScale * tmpscale;

        // 渲染频率
        if (self.transformOrigin == center && self.transform.scale == scale) {
            return
        }

        self.transformOrigin = center;

        self.transform.scale = scale

        self.handleUpdate();
    },

    handleUpdate: function() {
        var self = this;
        var value = [
            'translate3d(' + self.transform.translate.x + 'px, ' + self.transform.translate.y + 'px, 0)',
            'scale(' + self.transform.scale + ', ' + self.transform.scale + ')'
        ];

        value = value.join(" ");
        var dragObj = document.querySelector("#drag_handle");

        dragObj.style.webkitTransform = value;
        dragObj.style.transform = value;

        if (self.touchStatus == 'pinch') {
            var originCenter = self.transformOrigin.x + 'px ' + self.transformOrigin.y + 'px';
            dragObj.style.webkitTransformOrigin = originCenter;
            dragObj.style.transformOrigin = originCenter;
        }
    },

    handleReset: function() {
        var self = this;
        self.transform.translate.x = 0;
        self.transform.translate.y = 0;
        self.transform.scale = 1;

        self.handleUpdate();
    },

    svgUpdate: function(ev) {
        var svg_g = $("#svg-g"),
            $svg_body = $('#subwaySvgBody'),
            svg_g_offset = svg_g.offset(),
            svg_g_l = svg_g_offset.left,
            svg_g_t = svg_g_offset.top,
            svg_g_w = svg_g_offset.width,
            svg_g_h = svg_g_offset.height;

        var canUpdate = true;
        if (svg_g_w > drwSw.w) {
            if (Number(svg_g_l) > Number(drwSw.w) / 2 || Math.abs(Number(svg_g_l)) > (Number(svg_g_w - Number(drwSw.w) / 2))) {
                canUpdate = false;
            }
        } else {
            if (svg_g_l + svg_g_w / 2 < 0 || svg_g_l + svg_g_w / 2 > drwSw.w) {
                canUpdate = false;
            }
        }
        if (svg_g_h > drwSw.h) {
            if (Number(svg_g_t) > Number(drwSw.h) / 2 || Math.abs(Number(svg_g_t)) > (Number(svg_g_h - Number(drwSw.h) / 2))) {
                canUpdate = false;
            }
        } else {
            if (svg_g_t + svg_g_h / 2 < 0 || svg_g_t + svg_g_h / 2 > drwSw.h) {
                canUpdate = false;
            }
        }

        if (canUpdate) {
            // var transform_arr = svg_g.attr("transform").match(/(-?\d+(\.\d+)?)/g),
            //     translate_x = Number(transform_arr[0]),
            //     translate_y = Number(transform_arr[1]),
            //     curscale = transform_arr[2];

            // self.transformState.translate.x = self.transform.translate.x;
            // self.transformState.translate.y = self.transform.translate.y;

            var newTranslate_x = tip.transformState.translate.x + ev.deltaX,
                newTranslate_y = tip.transformState.translate.y + ev.deltaY,
                curscale = tip.transformState.scale;



            if (newTranslate_x && newTranslate_y) {
                // $svg_body.css({
                //     "-webkit-transform": "translate(" + newTranslate_x + "px," + newTranslate_y + "px) scale(" + curscale + ")",
                //     "transform": "translate(" + newTranslate_x + "px," + newTranslate_y + "px) scale(" + curscale + ")"
                // });
                // $('#transform').html(newTranslate_x + ',' + newTranslate_y);
                svg_g.attr("transform", "translate(" + newTranslate_x + "," + newTranslate_y + ") scale(" + curscale + ")"); //重置translate
                tip.transformState.translate.x = newTranslate_x;
                tip.transformState.translate.y = newTranslate_y;
            }

            var $overlays = $('.overlays');
            var oldLeft = parseInt($overlays.css('left')) || 0,
                oldTop = parseInt($overlays.css('top')) || 0;
            var newLeft = Number(oldLeft) + Number(ev.deltaX),
                newTop = Number(oldTop) + Number(ev.deltaY);
            $overlays.css({
                left: newLeft + 'px',
                top: newTop + 'px'
            });
        }

        tip.handleReset();

        setTimeout(function() {
            tip.touchStatus = null;
        }, 100);
    },

    scaleSvgUpdate: function(scale, nav) {
        var self = this;

        enableGesture = true;

        var svg_g = $("#svg-g");
        var $svg_body = $("#subwaySvgBody"),
            translate_x = self.transformState.translate.x,
            translate_y = self.transformState.translate.y,
            curscale = self.transformState.scale;

        tip.allScale = tip.allScale * scale;

        var newscale = scale * curscale;
        if (newscale > 1.3) {
            newscale = 1.3;
            tip.allScale = 1.3;
        }
        if (newscale < 0.3) {
            newscale = 0.3;
            tip.allScale = 0.3;
        }
        scale = newscale / curscale;

        var origin_x = tip.realCenter.x,
            origin_y = tip.realCenter.y;

        if (nav) {
            origin_x = $(window).width() / 2,
                origin_y = $(window).height() / 2;
        } else {
            // if (drwSw.specailPhone) {
            //     origin_x = tip.transformOrigin.x,
            //         origin_y = tip.transformOrigin.y;
            // }
        }


        var moveX = (Number(scale) - 1) * (Number(origin_x) - Number(translate_x)),
            moveY = (Number(scale) - 1) * (Number(origin_y) - Number(translate_y));

        // $('#transformOrigin').html(tip.transformOrigin.x + ',' + tip.transformOrigin.y);

        var newTranslate_x = translate_x - moveX,
            newTranslate_y = translate_y - moveY;
        if (newTranslate_x && newTranslate_y) {
            // $svg_body.css({
            //     "-webkit-transform": "translate(" + newTranslate_x + "px," + newTranslate_y + "px) scale(" + newscale + ")",
            //     "transform": "translate(" + newTranslate_x + "px," + newTranslate_y + "px) scale(" + newscale + ")"
            // });
            svg_g.attr("transform", "translate(" + newTranslate_x + "," + newTranslate_y + ") scale(" + newscale + ")");

            self.transformState.translate.x = newTranslate_x;
            self.transformState.translate.y = newTranslate_y;
            self.transformState.scale = newscale;
        }

        tip.handleReset();
        tip.updateTip();
        tip.updateNear();
        tip.updateMarker();
        setTimeout(function() {
            tip.touchStatus = null;
        }, 100);

        setTimeout(function() {
            enableGesture = false;
        }, 100);

    },
    setFitview: function(obj) {
        var self = this;
        self.scaleSvgUpdate(1 / self.transformState.scale, true);
        var obj_width = obj.width(),
            obj_height = obj.height();
        var topbar_height = SW.cache.param && SW.cache.param.src == 'alipay' ? 0 : $('.top_bar').height(),
            bottombar_height = $('.route_bar').height();
        var full_width = $(window).width(),
            full_height = $(window).height() - topbar_height - bottombar_height;
        var w_rate = full_width / obj_width,
            h_rate = full_height / obj_height,
            scale = 1;
        if (w_rate < 1 || h_rate < 1) {
            scale = w_rate < h_rate ? (w_rate - 0.05) : (h_rate - 0.06);
            self.scaleSvgUpdate(scale, true);
        }
    },
    getDistance: function(xy1, xy2) {
        var distance = null;
        if (xy1 && xy2) {
            var x1 = eval(xy1.x),
                y1 = eval(xy1.y),
                x2 = eval(xy2.x),
                y2 = eval(xy2.y);
            var xdiff = x2 - x1,
                ydiff = y2 - y1;
            distance = Math.pow(xdiff * xdiff + ydiff * ydiff, 0.5);
        }
        return distance;
    },
    getScaleCenter: function(xy1, xy2) {
        var center = {};
        if (xy1 && xy2) {
            var x1 = eval(xy1.x),
                y1 = eval(xy1.y),
                x2 = eval(xy2.x),
                y2 = eval(xy2.y);
            center.x = (x1 + x2) / 2;
            center.y = (y1 + y2) / 2;
        }
        return center;
    },
    closeInfoWindow: function(e) {
        var self = this;
        // e.stopPropagation;
        $("#infowindow-content").remove();
        if ($("#tip-content").length > 0) {
            $("#tip-content").css("display", "block").addClass("open");
        }
    },
    closeNearTip: function() {
        var self = this;
        var obj = $(".tip-content");
        if (drwSw.isNearTip) {
            if (obj.hasClass('open')) {
                obj.css("display", "none").removeClass("open");
            }
        }
    },
    openTip: function(obj) {
        if (obj && !tip.routeState) {
            var self = this;
            self.curopenStation = obj;
            //设置站点的id和名称及关联线路id
            var station_name = obj.attr("station_name"),
                station_poiid = obj.attr("station_poiid"),
                station_lon = obj.attr("station_lon"),
                station_lat = obj.attr("station_lat"),
                station_id = obj.attr("station_id");

            //移除当前打开的infowindow
            $('#tip_name').html(station_name);
            $('.tip_wrap').attr('stid', station_id)
                .attr('name', station_name)
                .attr('poiid', station_poiid)
                .attr('lon', station_lon)
                .attr('lat', station_lat);
            $('.tip_name_detail').attr('detail_href', tip.host + 'detail/index/src=subway&poiid=' + station_poiid);
            $('.tip_wrap_out').show();

            self.setTipPos(obj);
            self.opentip = true;
        }
    },
    setTipPos: function(obj) {
        var self = this;
        var tip_content = $('.tip_wrap_out');
        var obj_left = obj && obj.offset() && obj.offset().left,
            obj_top = obj && obj.offset() && obj.offset().top;
        var $overlays = $('.overlays');
        var overlaysLeft = parseInt($overlays.css('left')) || 0,
            overlaysTop = parseInt($overlays.css('top')) || 0;

        infowindow_left = obj_left + self.station_w * self.allScale / 2 - overlaysLeft;
        infowindow_top = obj_top + self.station_w * self.allScale / 2 - overlaysTop;

        tip_content.css({
            top: infowindow_top + 'px',
            left: infowindow_left + 'px'
        });
    },
    closeTip: function(status) {
        $('.tip_wrap_out').hide();
        if (!status) {
            tip.opentip = false;
            // 
        }
        window.location.hash = '#city=' + SW.cache.curCity.adcode;
    },
    setCenter: function(center) {
        var self = this;
        var svg_g = $('#svg-g');
        if (!center) {
            return;
        }
        var center_x = center.x,
            center_y = center.y;
        var translate_x = tip.transformState.translate.x,
            translate_y = tip.transformState.translate.y,
            scale = tip.transformState.scale;
        var screen_w = document.documentElement.clientWidth,
            screen_h = document.documentElement.clientHeight;

        var moveX = center_x - screen_w / 2,
            moveY = center_y - screen_h / 2;

        translate_x = translate_x - moveX;
        translate_y = translate_y - moveY;

        svg_g.attr("transform", "translate(" + translate_x + "," + translate_y + ") scale(" + scale + ")");

        tip.transformState.translate.x = translate_x;
        tip.transformState.translate.y = translate_y;

        var $overlays = $('.overlays');
        var oldLeft = parseInt($overlays.css('left')) || 0,
            oldTop = parseInt($overlays.css('top')) || 0;
        var newLeft = Number(oldLeft) - Number(moveX),
            newTop = Number(oldTop) - Number(moveY);

        $overlays.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });
    },
    openFilter: function() {
        $('.light_box, .filter_content').css('display', 'block');
    },
    closeFilter: function() {
        $('.light_box, .filter_content').css('display', 'none');
    },
    getFilterCenter: function() {
        var self = this;
        var select_g_offset = $('#g-select').offset();
        var select_g_h = document.getElementById("g-select").getBBox().height * self.allScale,
            select_g_w = document.getElementById("g-select").getBBox().width * self.allScale;

        return {
            'x': select_g_offset.left + select_g_w / 2,
            'y': select_g_offset.top + select_g_h / 2
        }
    },
    cityChange: function() {
        $('#subway').hide();
        tip.creatCitylist();
        tip.showCitylist();
    },
    creatCitylist: function() {
        var city = SW.cityListData;
        if (city) {
            var citylist = $('#citylist');
            var cityListHtm = '';
            for (var i = 0; i < city.length; i++) {
                cityListHtm += '<li class="cityitem" adcode="' + city[i].adcode + '"><a href="javascript:void(0)">' + city[i].cityname + '</a></li>';
            }
            citylist.html(cityListHtm);
        }
    },
    initCity: function() {
        var type = ['start', 'end'];
        tip.closeRoute(type);
        tip.allScale = 1;
    },
    showCitylist: function() {
        $('#citypage').show();
    },
    hideCitylist: function() {
        $('#citypage').hide();
    },
    showSrhPage: function(type) {
        $('.filter_btn').hide();
        var placeholder_txt = '输入起点';
        var $srhpage = $('#srhpage');
        if (type == 'end') {
            placeholder_txt = '输入终点'
        }
        $srhpage.attr('type', type);
        $srhpage.find('#srh_ipt').attr('placeholder', placeholder_txt).val('');
        $srhpage.find('#srhlist').html(' ').addClass('hidden');
        $srhpage.find('.sug_err').addClass('hidden');
        $('#subway').hide();
        $srhpage.show();
        $srhpage.find('#srh_ipt').focus();
    },
    hideSrhPage: function() {
        $('.filter_btn').show();
        var $srhpage = $('#srhpage');
        $srhpage.hide();
        $('#subway').show();
    },
    getStCenter: function(obj) {
        if (obj) {
            var st_offset = obj.offset();
            if (st_offset) {
                return {
                    'x': st_offset.left + st_offset.width / 2,
                    'y': st_offset.top + st_offset.height / 2
                }
            }

        }
    },
    getNavCenter: function() {
        var self = this;
        var select_g_offset = $('#g-nav').offset();
        var select_g_h = document.getElementById("g-nav").getBBox().height * self.allScale,
            select_g_w = document.getElementById("g-nav").getBBox().width * self.allScale;

        return {
            'x': select_g_offset.left + select_g_w / 2,
            'y': select_g_offset.top + select_g_h / 2
        }
    },
    showFilterLine: function(id) {
        $('#g-select').remove();
        $('#g-bg').css('display', 'block');
        drwSw.drawSelectLine(SW.cache.lines[id], 'select');

        // var typeArr = ['start', 'end'];
        // $.each(typeArr, function(idx, item) {
        //     tip.clearMarker(item);
        //     tip.clearRouteIpt(item);
        //     tip.resetNavData(item);
        // });
    },
    resetNavData: function(type) {
        tip.routeInfo[type] = null;
        tip.routeId[type] = null;
        tip.navDrwData.linesbar = [];
        tip.navDrwData.lines = {};
        tip.navDrwData.stations = {};
        if (!tip.routeId.start && !tip.routeId.end) {
            tip.fromendState = false;
        }
    },
    createNavDrwData: function(param) {
        var self = this;
        var busList = param.buslist[0];
        var navList = busList.segmentlist;
        var navSt = SW.cache.navStations;
        var navLines = SW.cache.navlines;
        self.routeDtailInfo.start = busList.spoi;
        self.routeDtailInfo.end = busList.epoi;
        var stationName = [];
        for (var i = 0; i < navList.length; i++) {
            var lineid = navList[i].busid;
            var startName = navList[i].startname;
            var endName = navList[i].endname;
            if (navList[i].passdepotname != '') {
                stationName = navList[i].passdepotname.split(' '); //st
            } else {
                stationName = [];
            }
            stationName.unshift(startName);
            stationName.push(endName);

            for (var j = 0; j < stationName.length; j++) {
                self.navDrwData.stations[navSt[stationName[j]].si] = navSt[stationName[j]];
            }
            var navline = $.extend(true, {}, navLines[lineid]);
            var sortedName = self.sortStation(stationName, navline, lineid);
            var coords = self.setLineCoords(sortedName, navline);
            navline.c = coords;
            self.navDrwData.lines[navline.ls] = navline;
            tip.navDrwData.linesbar.push(navline);
        }
    },
    sortStation: function(stationName, navline, lineid) {
        var self = this;
        if (navline) {
            var navSt = navline.stname;
            var startIndx = navSt.indexOf(stationName[0]);
            if (navSt[startIndx] != stationName[1]) {
                return stationName.reverse();
            } else {
                return stationName
            }
        } else {
            $('.route_close').triggerHandler('touchend');

        }
    },
    setLineCoords: function(st, navline) {
        var navStPxl = [],
            navStRs = [],
            navCoord = null,
            navSt = SW.cache.navStations,
            line_id = navline.ls,
            line_coord = [].concat(navline.c),
            line_loop = navline.lo; //1为环线
        for (var m = 0; m < st.length; m++) {
            var _navst = navSt[st[m]];
            navStPxl.push(_navst.p);
            var _navst_rf = _navst.r.split('|');
            var rf_index = _navst_rf.indexOf(line_id);
            navStRs.push(_navst.rs.split('|')[rf_index]);
        }
        var startNavSt = navStRs[0],
            secondNavSt = navStRs[1],
            endNavSt = navStRs[navStRs.length - 1];
        if (line_loop == '1') {
            var line_coord_tmp = [].concat(line_coord);
            line_coord_tmp.shift();
            line_coord = line_coord.concat(line_coord_tmp);
            aa = line_coord;
            var line_slice = [].concat(line_coord);
            var coordStartIndex = line_coord.indexOf(startNavSt);
            if (navStRs.length == 2) {
                var coordEndIndex = line_coord.indexOf(endNavSt, coordStartIndex);
                var dis1 = Math.abs(coordEndIndex - coordStartIndex);
                var coordNextStartIndex = line_coord.indexOf(startNavSt, coordEndIndex);
                var dis2 = Math.abs(coordNextStartIndex - coordEndIndex);
                if (dis1 > dis2) {
                    coordStartIndex = coordEndIndex;
                    coordEndIndex = coordNextStartIndex;
                }
            } else {
                line_coord = line_coord.slice(coordStartIndex);

                var coordStartIndex = line_coord.indexOf(startNavSt),
                    coordSecondIndex = line_coord.indexOf(secondNavSt),
                    coordEndIndex = line_coord.indexOf(endNavSt);

                if (coordSecondIndex > coordEndIndex) {
                    coordStartIndex = coordEndIndex;
                    line_coord = line_coord.slice(coordStartIndex);

                    coordStartIndex = line_coord.indexOf(endNavSt);
                    coordEndIndex = line_coord.indexOf(startNavSt);
                }
            }

        } else {
            var coordStartIndex = line_coord.indexOf(startNavSt),
                coordEndIndex = line_coord.indexOf(endNavSt);
        }

        if (coordStartIndex < coordEndIndex) {
            navCoord = line_coord.slice(coordStartIndex, coordEndIndex + 1)
        } else {
            navCoord = line_coord.slice(coordEndIndex, coordStartIndex + 1)
        }

        return navCoord;
    },
    setStartEnd: function(id, type, info) {
        var self = this;
        var name = info.name || info.attr('name');
        var route_info = {
            'name': name,
            'poiid': info.poiid || info.attr('poiid'),
            'lon': info.lon || info.attr('lon'),
            'lat': info.lat || info.attr('lat')
        };

        if (type == 'end' && tip.routeId.start == id) {
            tip.routeId.start = null;
            tip.routeInfo.start = null;
            tip.clearMarker('start');
            var placeholder = '输入起点';
            $('.route_start').html(placeholder).addClass('route_placeholder');
            tip.routeInfo.end = route_info;
            tip.routeId.end = id;
            $('#setStart').find('.route_close').addClass('hidden');
        } else if (type == 'start' && tip.routeId.end == id) {
            tip.routeId.end = null;
            tip.routeInfo.end = null;
            tip.clearMarker('end');
            var placeholder = '输入终点';
            $('.route_end').html(placeholder).addClass('route_placeholder');
            tip.routeInfo.start = route_info;
            tip.routeId.start = id;
            $('#setEnd').find('.route_close').addClass('hidden');
        } else {
            tip.routeInfo[type] = route_info;
            tip.routeId[type] = id;
        }
        tip.setStartEndIpt(name, type);
        tip.setStartEndIcon(id, type);
    },
    setStartEndIpt: function(name, type) {
        var $srh_item = null;
        if (type == 'start') {
            $srh_item = $('#setStart')
        } else if (type == 'end') {
            $srh_item = $('#setEnd')
        }
        $srh_item.find('.route_startend').html(name).removeClass('route_placeholder');
        $srh_item.find('.route_close').removeClass('hidden');
    },
    setStartEndIcon: function(id, type) {
        var self = this;
        var obj = null;
        if ($('#st-' + id).length > 0) {
            obj = $('#st-' + id)
        } else {
            obj = self.curStation;
        }

        var obj_left = obj && obj.offset().left,
            obj_top = obj && obj.offset().top;

        var $overlays = $('.overlays');
        var overlaysLeft = parseInt($overlays.css('left')) || 0,
            overlaysTop = parseInt($overlays.css('top')) || 0;

        var pos = {
            left: obj_left + self.station_w * self.allScale / 2 - overlaysLeft,
            top: obj_top + self.station_w * self.allScale / 2 - overlaysTop
        };

        self.clearMarker(type);
        self.addMarker(type, pos);
    },
    addMarker: function(type, pos) {
        var self = this;
        var marker_wrap = $('#nav_' + type);
        var marker_out = $('<div class="marker-out">');
        var marker = '<img class="nav-img" src="./img/subway/' + type + '-marker.png"/>';
        marker_wrap.append(marker_out);
        marker_out.append(marker);
        var marker_top = pos.top;
        var marker_left = pos.left;

        marker_wrap.css({
            top: marker_top + 'px',
            left: marker_left + 'px'
        });

        tip.fromendState = true;
    },
    clearMarker: function(type) {
        var self = this;
        if (type) {
            var marker = $('#nav_' + type).find('.marker-out');
            if (marker.length > 0) {
                marker.remove();
            }
        }
    },
    updateMarker: function() {
        if (tip.fromendState) {
            var start_id = tip.routeId.start,
                end_id = tip.routeId.end;
            if (start_id) {
                tip.updateStartEnd(start_id, 'start')
            }
            if (end_id) {
                tip.updateStartEnd(end_id, 'end')
            }
        }
    },
    updateStartEnd: function(id, type) {
        var self = this;
        if (id) {
            var obj = null;

            if ($('#st-' + id).length > 0) {
                obj = $('#st-' + id)
            } else {
                obj = self.curStation;
            }

            var obj_left = obj.offset().left,
                obj_top = obj.offset().top;

            var $overlays = $('.overlays');
            var overlaysLeft = parseInt($overlays.css('left')) || 0,
                overlaysTop = parseInt($overlays.css('top')) || 0;

            var left = obj_left + self.station_w * self.allScale / 2 - overlaysLeft,
                top = obj_top + self.station_w * self.allScale / 2 - overlaysTop;

            var marker_wrap = $('#nav_' + type);

            marker_wrap.css({
                top: top + 'px',
                left: left + 'px'
            });
        }
    },
    updateTip: function() {
        var self = this;
        if (tip.opentip) {
            var obj = tip.curopenStation;

            var obj_left = obj.offset().left,
                obj_top = obj.offset().top;

            var $overlays = $('.overlays');
            var overlaysLeft = parseInt($overlays.css('left')) || 0,
                overlaysTop = parseInt($overlays.css('top')) || 0;

            var left = obj_left + self.station_w * self.allScale / 2 - overlaysLeft,
                top = obj_top + self.station_w * self.allScale / 2 - overlaysTop;

            var tip_wrap = $('.tip_wrap_out');

            tip_wrap.css({
                top: top + 'px',
                left: left + 'px'
            });
        }
    },
    updateNear: function() {
        var self = this;
        if (drwSw.nearId) {
            var obj = $('#near-' + drwSw.nearId);

            if (obj) {
                var obj_left = obj.offset().left,
                    obj_top = obj.offset().top;

                var $overlays = $('.overlays');
                var overlaysLeft = parseInt($overlays.css('left')) || 0,
                    overlaysTop = parseInt($overlays.css('top')) || 0;

                var left = obj_left + 28 * self.allScale / 2 - overlaysLeft,
                    top = obj_top - overlaysTop;

                var tip_wrap = $('.tip-content');

                tip_wrap.css({
                    top: top + 'px',
                    left: left + 'px'
                });
            }
        }
    },
    showRouteTitle: function() {
        var start_name = tip.routeInfo.start.name,
            end_name = tip.routeInfo.end.name;
        $('#start_name_title').html(start_name);
        $('#end_name_title').html(end_name);
        $('.route_title_wrap').css('display', 'inline-block');
        $('.city_name').hide();
    },
    hideRouteTitle: function() {
        $('.route_title_wrap').hide();
        $('.city_name').show();
    },
    showRouteBar: function(data) {
        var bus = data.buslist[0];
        if (bus) {
            var lines = tip.navDrwData.linesbar;
            var line_name_arr = [];
            for (var i = 0; i < lines.length; i++) {
                line_name_arr.push(lines[i].ln);
            }
            var line_name = line_name_arr.join(' > ');
            var fee = bus.expense + '元',
                time = tip.formatTime(bus.expensetime),
                stop_count = 0;
            for (var j = 0; j < bus.segmentlist.length; j++) {
                stop_count += Number(bus.segmentlist[j].passdepotcount) + 1;
            }
            var line_info = time + ' | ' + stop_count + '站 | ' + fee;

            $('.route_line').html(line_name);
            $('.route_info').html(line_info);
            $('.route_bar').show();
        }
    },
    // 过滤地铁数据中重复站名
    uniqSubwayName: function(data) {
        var obj = {}

        data.forEach(function(item) {
            // item.n 是地铁站点名字
            obj[item.n] = 1
        })

        return Object.keys(obj)
    },
    hideRouteBar: function() {
        $('.route_bar').hide();
    },
    formatTime: function(le) {
        if (!le || le == '0') {
            return '';
        }
        le = le / 60;
        if (le <= 60) {
            return parseInt(Math.ceil(le)) + '分钟';
        } else {
            var o = Math.floor(le / 60) + '小时';
            if (le % 60 !== 0) {
                if (Math.floor(le % 60) === 0) {

                } else {
                    o += Math.floor(le % 60) + '分钟';
                }
            }
            return o;
        }
    },
    unableFlite: function() {
        $('.filter_btn').css({
            'z-index': '10'
        })
    },
    ableFilte: function() {
        $('.filter_btn').css({
            'z-index': '20'
        })
    },
    route: function() {
        var self = this;
        if (tip.routeInfo && tip.routeInfo.start && tip.routeInfo.end) {
            $('#g-select').remove();
            $('#g-bg').css('display', 'none');
            tip.clearRoute();
            SW.loading();
            var cbk = function(res) {
                var data = res;
                SW.loadingOver();
                // data.code =  '1';
                // data.result = false;
                // if ((data.code == '1' && data.result == false) && !(location.href.indexOf('%E6%B2%A1%E6%9C%89%E5%8B%BA%E5%AD%90') != -1 && document.referrer.indexOf('amap.com/verify') != -1)) {
                //     //被verify接口block到的请求
                //     window.location.href = location.origin + tip.verify + encodeURIComponent(location.href) + '&channel=mo';

                // } else 
                if (data.count == '1') {
                    tip.pathData = data;
                    tip.createNavDrwData(data);
                    $('#g-bg').css('display', 'block');
                    $('.route_close_btn').removeClass('hidden');
                    drwSw.drawNavLine(tip.navDrwData);
                    // tip.showRouteTitle();
                    tip.showRouteBar(tip.pathData);
                    var nav_obj = $('#g-nav');
                    tip.setFitview(nav_obj);
                    var center = self.getNavCenter();
                    tip.setCenter(center);

                    tip.unableFlite();
                    tip.routeState = true;

                } else {
                    $('.route_close').triggerHandler('touchend')
                    tip.routeState = false;
                }
            };
            tip.getRouteData(cbk);
        }
    },
    clearRouteIpt: function(type) {
        var placeholder = {
            'start': '输入起点',
            'end': '输入终点'
        };
        var $obj = null;
        if (type == 'start') {
            $obj = $('#setStart')
        } else if (type == 'end') {
            $obj = $('#setEnd')
        }
        $obj.find('.route_startend').html(placeholder[type]).addClass('route_placeholder');
        $obj.find('.route_close').addClass('hidden');
    },
    clearRoute: function() {
        $('#g-nav').remove();
        $('#g-bg').css('display', 'none');
        $('.route_close_btn').addClass('hidden');
        tip.navDrwData.linesbar = [];
        tip.navDrwData.lines = {};
        tip.navDrwData.stations = {};
    },
    closeRoute: function(typeArr) {
        $('#g-nav').remove();
        $('#g-bg').css('display', 'none');
        window.location.hash = '#city=' + SW.cache.curCity.adcode;
        $.each(typeArr, function(idx, item) {
            tip.clearMarker(item);
            tip.clearRouteIpt(item);
            tip.resetNavData(item);
        });
        tip.hideRouteTitle();
        tip.hideRouteBar();
        tip.ableFilte();
        $('.route_close_btn').addClass('hidden');
        tip.routeState = false;
    },
    getRouteData: function(cbk) {
        var start_info = tip.routeInfo.start,
            end_info = tip.routeInfo.end;
        $.ajax({
            url: tip.host + 'service/navigation/busExt?',
            data: {
                "x1": start_info.lon,
                "y1": start_info.lat,
                "x2": end_info.lon,
                "y2": end_info.lat,
                "poiid1": start_info.poiid,
                "poiid2": end_info.poiid,
                'uuid': tip.UUID(),
                "type": "6",
                "Ver": 3
            },
            type: 'get',
            method: 'get',
            dataType: "jsonp",

            success: function(data) {
                // debugger
                cbk(data);
            },
            error: function() {
                alert('\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u91cd\u8bd5');
            }
        });

    },
    searchRouteDetail: function() {
        //http://30.28.183.162/navigation/busdetail/saddr=116.401216,39.90778,%E5%A4%A9%E5%AE%89%E9%97%A8%E4%B8%9C(%E5%9C%B0%E9%93%81%E7%AB%99),BV10006499&daddr=116.394193,39.976953,%E5%8C%97%E5%9C%9F%E5%9F%8E(%E5%9C%B0%E9%93%81%E7%AB%99),BV10013465&src=subway
        var detailHost = 'http://m.amap.com',
            detailPath = '/navigation/busdetail/';
        var startPoi = [
                tip.routeDtailInfo.start.x,
                tip.routeDtailInfo.start.y,
                tip.routeInfo.start.name,
                tip.routeInfo.start.poiid
            ],
            endPoi = [
                tip.routeDtailInfo.end.x,
                tip.routeDtailInfo.end.y,
                tip.routeInfo.end.name,
                tip.routeInfo.end.poiid
            ];


        window.location.href = detailHost + detailPath + 'saddr=' + startPoi.join(',') + '&daddr=' + endPoi.join(',') + '&src=subway';
    },
    goback: function() {
        if (tip.routeState) {
            var type = ['start', 'end'];
            tip.closeRoute(type);
        } else {
            // var hostname = window.location.origin;
            // window.location.href = hostname + '/navigation/index/';
            window.location.href = tip.host + 'navigation/index/';
            // history.go()
        }
    },
    getSug: function(sug) {
        var sug = sug.toLowerCase();
        var curAdcode = SW.cache.curCity.adcode;
        var sugArr = SW.cache.sug[curAdcode];
        if (sug != '') {
            if (sugArr) {
                var sug_length = sug.length;
                var new_sug = [];
                for (var key in sugArr) {
                    var keys = key.split('|');
                    for (var i = 0; i < keys.length; i++) {
                        var sug_match = keys[i].substr(0, sug_length);
                        if (sug_match == sug) {
                            new_sug.push(sugArr[key])
                                // 否则会出现两份 exp. T2航站楼
                            break
                        }
                    }
                }
                tip.showSug(new_sug, sug);
            }
        } else {
            $('#srhlist').html(' ').addClass('hidden');
        }
    },
    showSug: function(sugarr, sug) {
        var $suglist = $('#srhlist'),
            $sugerr = $('.sug_err');
        if (sugarr.length > 0) {
            var html = [];
            var lines = SW.cache.lines;
            $.each(sugarr, function(idx, item) {
                var rf = item.r.split('|');
                var subhtml = '';
                $.each(rf, function(subidx, subitem) {
                    var curline = lines[subitem];
                    if (curline) {
                        var knstyle = ''
                        if (!/^\d+$/.test(curline.kn)) {
                            var knstyle = 'knlong'
                        }
                        subhtml += '<li class="rfline ' + knstyle + '" style="background:#' + curline.cl + '">' + curline.ln + '</li>'
                    }
                })
                var name = item.n;
                if (name.indexOf(sug) >= 0) {
                    var sugname = '<b class="match">' + sug + '</b>' + name.substring(sug.length, name.length);
                } else {
                    var sugname = name;
                }

                var lon = item.sl.split(',')[0],
                    lat = item.sl.split(',')[1];

                html.push('<li class="st_item" data-poiid="' + item.poiid + '" data-stid="' + item.si + '" data-name="' + item.n + '" data-lon="' + lon + '" data-lat="' + lat + '" data-rf="' + item.r + '"><div class="st_item_wrap"><span class="st_name">' + sugname + '</span><ul class="st_rfline">' + subhtml + '</ul><div class="clr"></div></div></li>');
            })
            $sugerr.addClass('hidden');
            $suglist.html(' ').removeClass('hidden').html(html.join(''));
        } else {
            $suglist.html(' ').addClass('hidden');
            $sugerr.removeClass('hidden');
        }
    },
    UUID: function() {
        var storage = window.localStorage;
        if(enabledLocalstorage){
           var uuid = storage.getItem('subway-uuid');
        }

        if (!uuid) {
            uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0;
                var v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            if(enabledLocalstorage){
                storage.setItem('subway-uuid', uuid);
            }
            this.uuid = uuid;
        }

        return uuid;

    }
};