(function() {
    var b = location.href + "";
    var d = window;
    var a = document.body;
    var e = d.navigator;
    var c = document.documentElement;
    window.DSPUIIFRTest = {
        values: {
            infr: function() {
                return self === top ? 1 : 0
            },
            cross: function() {
                try {
                    top.location.toString()
                } catch(f) {
                    return 1
                }
                return 0
            },
            drs: function() {
                var f = {
                    uninitialized: 0,
                    loading: 1,
                    loaded: 2,
                    interactive: 3,
                    complete: 4
                };
                return function() {
                    try {
                        return f[document.readyState]
                    } catch(g) {
                        return - 1
                    }
                }
            } (),
            pcs: function() {
                return [d.innerWidth || Math.max(c.clientWidth, a.clientWidth), d.innerHeight || Math.max(c.clientHeight, a.clientHeight)].join("x")
            },
            pss: function() {
                return [Math.max(a.scrollWidth, c.scrollWidth, a.offsetWidth, c.offsetWidth, c.clientWidth), Math.max(a.scrollHeight, c.scrollHeight, a.offsetHeight, c.offsetHeight, c.clientHeight)].join("x")
            },
            cfv: function() {
                var g = 0;
                try {
                    if (e.plugins && e.mimeTypes.length) {
                        var h = e.plugins["Shockwave Flash"];
                        if (match && match.description) {
                            g = match.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s)+r/, ".") + ".0"
                        }
                    }
                    if (g === 0 && (d.ActiveXObject || d.hasOwnProperty("ActiveXObject"))) {
                        for (var f = 30; f >= 2; f--) {
                            try {
                                var l = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + f);
                                if (l) {
                                    var k = l.GetVariable("$version");
                                    g = k.replace(/WIN/g, "").replace(/,/g, ".");
                                    if (g > 0) {
                                        break
                                    }
                                }
                            } catch(j) {}
                        }
                    }
                    g = parseInt(g, 10)
                } catch(j) {
                    g = 0
                }
                return g
            },
            cpl: function() {
                return e.plugins.length || 0
            },
            chi: function() {
                return d.history.length || 0
            },
            cce: function() {
                return e.cookieEnabled ? 1 : 0
            },
            cec: function() {
                return (document.characterSet || document.charset || "").replace(/[^0-9a-z]/ig, "")
            },
            tlm: function() {
                return Date.parse(document.lastModified) / 1000
            },
            ecd: function() {
                return !! window.postMessage ? 1 : 0
            }
        },
        getCode: function(g, f) {
            var h = this.values,
                j = "",
                k = [];
            for (var i in h) {
                j = h[i]();
                k.push(i + ":" + j)
            }
            k.push("adw:" + g + "x" + f);
            return k.join("_")
        }
    }
})(); (function(h, a) {
    var f = function(e) {
            return typeof e == "string" ? document.getElementById(e) : e
        },
        i = function() {
            var e = +new Date;
            return function() {
                return (++e) + ""
            }
        } (),
        b = function(e) {
            return typeof e == "string" ? typeof e.trim == "function" ? e.trim() : e.replace(/^(\u3000|\s|\t|\u00A0)*|(\u3000|\s|\t|\u00A0)*$/g, "") : false
        },
        d = function(l, k, e) {
            if ((l = f(l)) && typeof e == "function") {
                return l.attachEvent ? l.attachEvent("on" + k, e) : l.addEventListener ? l.addEventListener(k, e, false) : l["on" + k] = e
            }
        },
        j = function(e, k) {
            for (var l in k) {
                e[l] = k[l]
            }
            return e
        };
    try {
        h.navigator.name = ""
    } catch(g) {}
    function c(e, l, k) {
        this.EVENT = {};
        this.QUEUE = [];
        this.hand = 0;
        this.target = e;
        this.ifrTarget = this.inIFR ? h: e;
        if (typeof l == "function") {
            this.on("__recive", l)
        }
        if (typeof k == "function") {
            k(this)
        }
        this.bind(this);
        this.shaked = true
    }
    c.prototype = {
        bind: function(k) {
            if (h.postMessage) {
                d(h, "message",
                    function(e) {
                        k.hanlder(e || h.event)
                    })
            } else {
                this.isPollfill = true;
                this.hash = "";
                this.target = this.ifrTarget = h.navigator;
                this.cache = {};
                try {
                    this.ifrTarget.name = "";
                    this.pollfill(k.ifrTarget, "name")
                } catch(l) {}
            }
        },
        inIFR: function(l) {
            try {
                l = top.location !== location
            } catch(k) {}
            return l === a ? true: l
        } (),
        handshake: function() {
            var m = this,
                k = m.QUEUE,
                l = m.inIFR,
                e = l ? 1 : 2;
            m.on("shake",
                function(n) {
                    if (!m.shaked) {
                        if (++m.hand >= e) {
                            m.shaked = true;
                            if (k.length) {
                                m.post()
                            }
                        }
                        if (l || !m.shaked) {
                            m.send("shake", {
                                number: m.hand,
                                iframe: l
                            })
                        }
                    }
                });
            if (m.inIFR) {
                m.send("shake", {
                    number: m.hand,
                    iframe: l
                })
            }
        },
        post: function() {
            var e = h.postMessage ?
                function(k) {
                    k.target.postMessage(k.message, "*")
                }: function(l, k) {
                return l.target.name = k.hash = l.prefix + l.message
            };
            return function() {
                var l = this,
                    m, k = l.QUEUE;
                if (k.length) {
                    if (l.isPollfill) {
                        if (l.recevied !== false) {
                            if (m = k.shift()) {
                                l.hash = e(m, l)
                            }
                        }
                    } else {
                        if (m = k.shift()) {
                            e(m);
                            l.post()
                        }
                    }
                }
            }
        } (),
        hanlder: function(e) {
            var k = e || h.event,
                l = this.decode(unescape(k.data || ""));
            this.emit("__recive", l);
            this.emit(l.__method__, l)
        },
        pollfill: function(l, k) {
            var e = this,
                m;
            setInterval(function() {
                    try {
                        if (m = (l[k] + "")) {
                            if (e.hash != m) {
                                var n = (m.split("^").pop()) + "";
                                if (n) {
                                    n = n.split("&");
                                    if (n.length > 1) {
                                        e.hanlder({
                                            domain: n[0],
                                            data: n[1]
                                        })
                                    }
                                }
                                e.hash = m
                            }
                        }
                    } catch(o) {
                        if (typeof DSPUIBase != "undefined") {
                            if (o.message && !e.logopool) {
                                DSPUIBase.log({
                                    fm: "tool",
                                    r_type: "ifrpoolerror",
                                    e: o.message
                                });
                                e.logopool = true
                            }
                        }
                    }
                },
                13)
        },
        send: function(n, l) {
            var e = this;
            var m = h.location.href.match(/ifrid=([^&$]+)/i);
            m = m ? m[1] : "";
            var k = j(l || {},
                {
                    ifrid: m,
                    __method__: n,
                    time: +new Date
                });
            e.QUEUE.push({
                target: e.isPollfill ? e.ifrTarget: e.target,
                method: n,
                data: l,
                message: escape(e.encode(k)),
                prefix: e.isPollfill ? i() + "^" + document.domain + "&": ""
            });
            if (e.shaked || n === "shake") {
                e.post()
            }
        },
        encode: function(k) {
            var e = [],
                l;
            if (typeof k == "object") {
                for (var m in k) {
                    l = typeof(l = k[m]) == "boolean" ? l ^ 0 : l;
                    if (k.hasOwnProperty(m) && (l instanceof Array || l.toString() == l)) {
                        e.push(m + "=" + encodeURIComponent(k[m].toString()))
                    }
                }
            }
            return e.join("&")
        },
        decode: function(n) {
            var m = null,
                k = 0,
                l, o, e = {};
            n = ("" + b(n)).split("&");
            while (m = n[k++]) {
                l = m.split("=");
                if (l && l.length) {
                    if (o = l[1]) {
                        e[l[0]] = o ^ 0 == o ? parseInt(o, 10) : o.split(",").length == 1 ? o: o.split(",")
                    }
                }
            }
            return e
        },
        on: function(k, e) {
            this.EVENT[k] || (this.EVENT[k] = []);
            this.EVENT[k].push(e)
        },
        emit: function(o, n, k) {
            if ((k = this.EVENT[o]) && k.length) {
                for (var m = 0,
                         e = k.length; m < e; m++) {
                    k[m](n)
                }
            }
        }
    };
    h.DSPUIIFRcross = c
})(window); (function(b) {
    var a = {
        init: function() {
            this.data = [];
            this.iframeurl = (window.DSPUIIFRAMEURI || "http://entry.baidu.com/rp/home") + "?";
            this.iframes = {};
            this.script();
            this.render();
            for (var c in this.iframes) {
                this.bindEvent(false, this.iframes[c])
            }
        },
        render: function(d) {
            if (this.data.length) {
                for (var e = 0,
                         c = this.data.length; e < c; e++) {
                    this.done(this.data[e])
                }
            }
        },
        getParam: function(c) {
            var g = [];
            c.di = c.psid + "_icon";
            c.title = document.title;
            c.mobile = true;
            if (window.cpro_phdata) {
                for (var f in cpro_phdata) {
                    c[f] = cpro_phdata[f]
                }
            }
            try {
                if (typeof DSPUIIFRTest !== "undefined") {
                    c.ifr = DSPUIIFRTest.getCode(c.rsi0, c.rsi1)
                }
            } catch(d) {}
            c.t = +new Date;
            c.ltu = window.location + "";
            c.ref = document.referrer;
            for (var f in c) {
                if (typeof c[f] !== "object") {
                    g.push(f + "=" + encodeURIComponent(c[f]))
                }
            }
            return g
        },
        done: function(g) {
            var k = document.createElement("div"),
                f = document.createElement("iframe"),
                d,
                c = parseInt(g.psheight || "", 10);
            k.style.height = "auto";
            k.style.display = "block";
            k.style.fontSize = "0";
            try {
                g.script.parentNode.insertBefore(k, g.script);
                d = (!g.pswidth || g.pswidth === "auto") ? Math.min(k.getBoundingClientRect().width, k.offsetWidth) : g.pswidth;
                if (g.pswidth !== "auto") {
                    k.style.width = g.pswidth + "px"
                }
                g.rsi0 = d;
                g.rsi1 = c = c < 12 ? d * c: c;
                var j = "BAIDUDSPCPRO_WRAP_" + g.psid + "_" + ( + new Date());
                g.ifrid = j;
                var i = document.createElement("iframe");
                i.setAttribute("id", j);
                i.setAttribute("src", this.iframeurl + this.getParam(g).join("&"));
                i.style.cssText = "*width: 100%;width:1px;min-width:100%";
                i.setAttribute("height", c);
                i.setAttribute("scrolling", "no");
                i.setAttribute("frameborder", "0");
                i.setAttribute("allowtransparency", true);
                k.appendChild(i);
                this.iframes[j] = {
                    id: j,
                    iframe: i
                }
            } catch(h) {}
        },
        script: function() {
            var c = document.getElementsByTagName("script"),
                e,
                g,
                h,
                k,
                j;
            for (var f = 0,
                     d = c.length; f < d; f++) {
                e = c[f];
                if (!e.getAttribute("src")) {
                    g = e.innerHTML.replace(/\/\/[^\n]+/g, "").replace(/\n/g, ";").replace(/\/\*.+\*\//ig, "").replace(/[\s\uFEFF\xA0\t]/ig, "");
                    if (!e.id) {
                        h = this.getMatch("psid", g);
                        k = this.getMatch("pswidth", g);
                        j = this.getMatch("psheight", g);
                        if (h && k && j) {
                            e.id = "BDEMBED_PSID" + h;
                            this.data.push({
                                script: e,
                                psid: h,
                                pswidth: k,
                                psheight: j
                            })
                        }
                    }
                }
            }
        },
        getMatch: function() {
            var c = {
                psid: /cpro_phid[\s\uFEFF\xA0]*=[\s\uFEFF\xA0]*['"]([a-z0-9_]{4,20})/i,
                pswidth: /cpro_phwidth[\s\uFEFF\xA0]*=[\s\uFEFF\xA0]*['"]*([0-9a-z]{1,10})/i,
                psheight: /cpro_phheight[\s\uFEFF\xA0]*=[\s\uFEFF\xA0]*['"]*([0-9]{1,10})/i
            };
            return function(e, f) {
                var d = f.match(c[e]);
                if (d) {
                    return d[1]
                }
            }
        } (),
        bindEvent: function(g, f) {
            var c = this;
            if (!f.recived) {
                try {
                    c.bindIFR(f)
                } catch(h) {
                    var d = f.iframe;
                    d.onload = d.onerror = function() {
                        d.onload = d.onerror = null;
                        try {
                            if (f.recived) {
                                c.bindIFR(f)
                            }
                        } catch(i) {}
                    };
                    if (!g) {
                        setTimeout(function() {
                                if (f.recived) {
                                    c.bindEvent(true, f)
                                }
                            },
                            100)
                    }
                }
            }
        },
        bindIFR: function(f) {
            var c = this;
            var e = f.iframe;
            var d = new b(e.contentWindow,
                function(g) {
                    f.recived = true;
                    var h = c.iframes[g.ifrid];
                    if (h && g.ifrid === f.id) {
                        switch (g.__method__) {
                            case "colse":
                                c.colseIFR(h);
                                break;
                            case "resetHeight":
                                c.resetHeight(h, g.height);
                                break
                        }
                    }
                });
            this.iframes[f.id].ifrcross = d
        },
        resetHeight: function(e, c) {
            var d = e.iframe;
            d.style.height = c + "px";
            d.parentNode.style.height = c + "px";
            d.setAttribute("height", c)
        },
        colseIFR: function(d) {
            var c = d.iframe;
            c.style.display = "none"
        }
    };
    a.init()
})(DSPUIIFRcross);