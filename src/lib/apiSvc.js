import XXH64 from "./xxhash64";

let dbg = true; //调试
let appid = null;
let callbacks = {}, _count = 0;
let keepAliveSN = {}; // keepAlive的sn
let keepAliveChkerID = null;
let data_id = GetRandomNum(0, 10000);// ws分包发送的包序号
let msgPt = /^(pkg[0-9]+) ([0-9]+) ([0-9]+);/;
let xh64 = XXH64();

// 签名
function sign(sn, noise, data) {
    return xh64.update(sn).update(noise).update(data).digest().toString(36);
}

function genSn() {
    return String(_count++);
}

function GetRandomNum(Min, Max) {
    let Range = Max - Min;
    let Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

function isType(type) {
    return function(obj) {
        return {}.toString.call(obj) == "[object " + type + "]"
    }
}

let isObject = isType("Object")
let isString = isType("String")
let isFunction = isType("Function")

function doChkKeepAlive() {
    for (let k1 in keepAliveSN) {
        let cb = callbacks[k1];
        if (cb) {
            let ctx = cb[3];
            if (ctx.chkKeepAlive) {
                continue;
            }
            ctx.chkKeepAlive = true;
            let sn = genSn();
            callbacks[sn] = [function() {
                ctx.chkKeepAlive = false;
            }, sn, null, ctx];
            pkg(ctx, "keep,alive", {}, sn, function(s) {
                post(ctx, s);
            });
        }
    }
    keepAliveChkerID = null;
    chkKeepAlive();
}
function chkKeepAlive() {
    if (keepAliveChkerID === null && Object.keys(keepAliveSN).length > 0) {
        keepAliveChkerID = setTimeout(doChkKeepAlive, 1000);
    }
}

// file:File对象,cb:进度条
// 返回Promise,功能的参数是服务器端的临时文件全路径
function upldFun(file, cb) {
    if (!file) {
        return Promise.reject({ "msg": "参数错误." });
    }
    let controller = new AbortController();
    let signal = controller.signal;
    let filename = file.name;
    return svcFun.call(this, "upload").then(([rslt, ext]) => {
        if (rslt.count == -1) { //
            let body = new FormData();
            body.append("f", file);
            return fetch(this.url + "/upld/" + rslt.sn, {
                method: "POST",
                body,
                signal
            }).then(res => res.text()).catch(e => {
                throw {
                    "msg": "上传文件失败",
                    "error": e
                }
            });
        } else { // 相当于进度条
            if (dbg) {
                console.log("上传" + filename + ": " + rslt.count + "/" + rslt.total, ext);
            }
            if (cb) {
                cb(filename, rslt.count, rslt.total);
            }
        }
    });
}
// 有cb回调函数则返回undefined,无则返回Promise对象
// cb函数的参数是3个元素的数组:[ok,rslt,ext]
// Promise的resolve参数是2个元素的数组:[rslt,ext], reject参数是ext对象
function svcFun(act, param, cb, timeout) {
    let a = arguments.length, errMsg;
    if (a == 1) {
        param = {};
    } else if (a == 2) {
        if (isFunction(param)) {
            cb = param;
            param = {};
        }
    } else if (a == 3) {
        if (isFunction(param)) {
            timeout = cb;
            cb = param;
            param = {};
        } else if (!isFunction(cb)) {
            timeout = cb;
            cb = null;
        }
    }
    if (!param) {
        param = {};
    }

    if (!act || !isString(act) || !isObject(param)) {
        errMsg = this.name + "()参数错误";
    }
    if (!errMsg && !this.url) {
        if (this.cache) {
            return cacheFun.call(this, act, param, cb, timeout);
        } else {
            errMsg = this.name + ": 服务不可用."
            if (this.cacheLen === undefined) {
                if (!this.trying) {
                    // 重新初始化一次网络
                    this.trying = 1;
                    Promise.all(oneSvc(this.svcs, this.name, this.urls)).then(() => {
                        this.trying = 0;
                    });
                }
            } else {
                this.cacheLen--;
                if (this.cacheLen == 0) {
                    delete this.cacheLen;
                }
            }
        }
    }
    if (errMsg) {
        if (!isFunction(cb)) {
            let a = arguments, b = a.length;
            for (let i = 0; i < b; i++) {
                if (isFunction(a[i])) {
                    cb = a[i];
                }
            }
        }
        if (isFunction(cb)) {
            cb([0, null, {
                "msg": errMsg
            }]);
            return;
        }
        return Promise.reject({
            "msg": errMsg
        });
    }

    let svc = act.split(".");
    act = svc.pop();

    let s = "";
    for (let i = 0, l = svc.length; i < l; i++) {
        if (i > 0) {
            s += ".";
        }
        a = svc[i].charAt(0);
        if (a >= "A" && a <= "Z") {
            s += a.toLowerCase() + svc[i].substr(1);
        } else {
            s += svc[i];
        }
    }
    s += ",";
    a = act.charAt(0);
    if (a >= "A" && a <= "Z") {
        s += a.toLowerCase() + act.substr(1);
    } else {
        s += act;
    }

    let rt;
    if (!cb || !isFunction(cb)) {
        let the_onFulfilled;
        let promise = new Promise((resolve, reject) => {
            let flag = 0;
            cb = ([ok, rslt, ext]) => {
                if (ok) {
                    if (flag) { // 重复调用回调
                        if (the_onFulfilled) {
                            the_onFulfilled([rslt, ext]);
                        }
                    } else { // 第一次直接resolve
                        flag = 1;
                        resolve([rslt, ext]);
                    }
                } else {
                    reject(ext);
                }
            };
        });
        rt = {
            then(onFulfilled, onRejected) {
                the_onFulfilled = onFulfilled;
                return promise.then(onFulfilled, onRejected);
            },
            catch(onRejected) {
                return promise.catch(onRejected);
            },
            finally(onFinally) {
                the_onFulfilled = onFinally;
                return promise.finally(onFinally);
            }
        };
    }
    let ncb = (v) => {
        let ext = v[2];
        if (!v[0] && ext && ext["refresh"]) {
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            Promise.all(oneSvc(this.svcs, this.name, this.urls)).then(() => {
                return this.svcs[this.name](svc.join(".") + "." + act, param, cb, timeout);
            }).catch(e => {
                console.log("不应该:", e);
            });
        } else {
            cb(v);
        }
    };

    let sn = genSn();
    callbacks[sn] = [ncb, sn, null, this];

    if (timeout > 0) { // 处理超时
        setTimeout(function() {
            let a = callbacks[sn];
            if (a) {
                delete callbacks[sn];
                a = a[2];
                if (a) {
                    a.abort(); // post请求取消
                }
                cb([0, null, { "timeout": true, "msg": "timeout" }]);
            }
        }, timeout);
    }

    request(this, s, param, sn, timeout);

    return rt;
}
function request(ctx, act, param, sn, timeout) {
    if (ctx.ws === undefined) {
        wsConnect(ctx, function() {
            request(ctx, act, param, sn, timeout);
        }, function(e) {
            let cb = callbacks[sn];
            if (cb) {
                cb[0]([0, null, {
                    "msg": "网络错误",
                    "error": e
                }]);
                delete callbacks[sn];
            }
        });
    } else {
        pkg(ctx, act, param, sn, function(s) {
            if (ctx.ws === null) { // ws失败,使用post
                ctx.isPost = true;
                post(ctx, s, timeout, sn);
            } else {
                wsSend(ctx, s);
            }
        });
    }
}
function post(ctx, s, timeout, sn) {
    let init = {
        method: "POST",
        headers: {
            "Content-Type": "text/plain; charset=UTF-8",
        },
        body: s
    };
    if (timeout > 0) {
        let controller = new AbortController();
        init.signal = controller.signal;
        callbacks[sn][2] = controller; // 超时后取消请求用
    }
    fetch(ctx.url, init).then(res => {
        if (res.ok) {
            procRslt(ctx, res.text());
        } else {
            throw new Error(res);
        }
    }).catch(e => {
        let cb = callbacks[sn];
        if (cb) {
            cb[0]([0, null, {
                "msg": "网络错误",
                "error": e
            }]);
            delete callbacks[sn];
        }
    });
}
function wsConnect(ctx, cb, ecb) {
    try {
        let url = "ws" + ctx.url.substr(4) + "/_ws"; // http:// ==> ws:// https:// ==> wss://
        let ws = new WebSocket(url);
        ws.onopen = function() {
            ctx.ws = ws;
            cb();
        };
        ws.onerror = function(ev) {
            if (dbg) {
                console.log("ws.onerror", ev);
            }
            ecb(ev);
        };
        ws.onclose = function(ev) {
            if (dbg) {
                console.log("ws.onclose: " + ev.reason)
            }
            ctx.ws = undefined; // 允许断开后重连
        }
        ws.onmessage = function(ev) {
            wsProcRslt(ctx, ev.data);
        }
    } catch (e) {
        if (dbg) {
            console.log("wsConnect:" + e);
        }
        ctx.ws = null; // ws异常
        cb();
    }
}
// ws分包发送
function wsSend(ctx, x) {
    let len = x.length;
    if (len > 1024) {
        // 分包发送
        let cnt = Math.ceil(len / 1000), cnt2 = cnt - 1, l2 = len - cnt2 * 1000;
        let s = "pkg" + (data_id++) + " " + cnt + " ";
        for (let i = 0; i < cnt2; i++) { // 满包
            ctx.ws.send(s + i + ";" + x.substr(i * 1000, 1000));
        }
        if (l2 > 0) {
            ctx.ws.send(s + cnt2 + ";" + x.substr(cnt2 * 1000, l2));
        }
    } else {
        // 直接发送
        ctx.ws.send(x);
    }
}
// ws处理分包
function wsProcRslt(ctx, msg) {
    if (!msg)
        msg = "";
    let m = msg.match(msgPt);
    if (!m) {
        procRslt(ctx, msg);
        return;
    }
    let total = m[2], index = m[3];
    if (index == 0) {
        ctx.msgTmp = msg.substr(m[0].length);
    } else {
        ctx.msgTmp += msg.substr(m[0].length);
    }
    if (index == total - 1) {
        procRslt(ctx, ctx.msgTmp);
        ctx.msgTmp = null;
    }
}
// 支持一次性收到多条消息,格式是单条消息的字符串的数组
// ["sn,sign;[]","sn,sign;[]"]
function procRslt(ctx, rslt) {
    if (rslt.charAt(0) == "[") {
        try {
            let ss = JSON.parse(rslt);
            for (let i = 0, l = ss.length; i < l; i++) {
                procRslt0(ctx, ss[i]); // 依次处理每条消息
            }
        } catch (e) {
            if (dbg)
                console.log("返回值格式错误:" + e + ", 值:" + rslt, e);
            return;
        }
    } else {
        procRslt0(ctx, rslt);
    }
}

// 处理收到的单条消息
// sn,sign;[]
function procRslt0(ctx, rslt) {
    let ind = rslt.indexOf(";");
    if (ind < 3) {
        if (dbg)
            console.log("返回值格式错误:" + rslt);
        return;
    }
    let sn = rslt.substr(0, ind).split(","); // sn,sign
    if (sn.length < 2) {
        if (dbg)
            console.log("返回值格式错误:" + rslt);
        return;
    }
    let cb = callbacks[sn[0]];
    if (cb == null) {
        if (dbg)
            console.log("返回值错误参数:" + rslt);
        return;
    }
    rslt = rslt.substr(ind + 1);
    ind = sn[1];
    if (ind == "ERR") { // 错误信息,忽略验签
        if (rslt[0] == "[" && rslt[1] == "0" && rslt[2] == ",") { // 错误信息,忽略验签
            ind = true; // 下一步处理rslt
        } else { // 返回值格式错误
            cb[0]([0, null, {
                "msg": "返回值格式错误",
                "data": rslt
            }]);
            delete callbacks[cb[1]];
            return;
        }
    } else {
        let sig0 = sign(sn[0], ctx.noise, rslt);
        if (sig0 != sn[1]) {
            cb[0]([0, null, {
                "msg": "验签失败",
                "data": rslt
            }]);
            delete callbacks[cb[1]];
            return;
        }
    }
    // 验签通过,调用回调
    try {
        ind = JSON.parse(rslt);
    } catch (e) {
        if (dbg)
            console.log(rslt, e);
        cb[0]([0, null, {
            "msg": "返回值格式错误",
            "error": e,
            "data": rslt
        }]);
        delete callbacks[cb[1]];
        return;
    }
    sn = ind[2];
    cb[0](ind); // 参数改成一个数组
    if (sn == null || !sn["keepAlive"]) { // 如果需要保留连接,则不清除回调函数
        cb = cb[1];
        delete callbacks[cb];
        if (keepAliveSN[cb]) {
            delete keepAliveSN[cb];
        }
    } else if (sn["keepAlive"] && ctx.isPost) {
        keepAliveSN[cb[1]] = 1;
        chkKeepAlive();
    }
}

// 签名,序列号,打包....
// Nv,getList,sid,sn,sign;{}
function pkg(ctx, act, param, sn, cb) {
    let cnt = -1;
    for (let i in param) {
        cnt++;
        trans(param, i, function() {
            setTimeout(function() {
                cnt--;
                if (cnt < 0) {
                    let data = JSON.stringify(param);
                    cb(act + "," + ctx.pid + "," + sn + "," + sign(sn, ctx.noise, data) + ";" + data);
                }
            }, 0);
        });
    }
    if (cnt < 0) {
        let data = JSON.stringify(param);
        cb(act + "," + ctx.pid + "," + sn + "," + sign(sn, ctx.noise, data) + ";" + data);
    }
}
function trans(obj, key, cb) {
    let v = obj[key];
    switch (Object.prototype.toString.call(v)) {
        case "[object Array]": {
            if (v.length == 0) {// 处理空数组
                break;
            }
            let cnt = 0;
            for (let i = 0; i < v.length; i++) {
                cnt++;
                trans(v, i, function() {
                    setTimeout(function() {
                        cnt--;
                        if (cnt == 0) {
                            cb();
                        }
                    }, 0);
                });
            }
            return;
        }
        case "[object Object]": {
            let cnt = -1;
            for (let i in v) {
                cnt = 0;
                break;
            }
            if (cnt < 0) { // 处理空对象
                break;
            }
            for (let i in v) {
                cnt++;
                trans(v, i, function() {
                    setTimeout(function() {
                        cnt--;
                        if (cnt == 0) {
                            cb();
                        }
                    }, 0);
                });
            }
            return;
        }
        case "[object Blob]":
        case "[object File]": // 转换成base64
            try {
                if (v.size < 1000 * 1000) { // 1M以内大小,直接base64编码后上传
                    // https://blog.csdn.net/Take_Dream_as_Horse/article/details/70153646
                    let fileReader = new FileReader();
                    fileReader.readAsDataURL(v);
                    fileReader.onload = function() {
                        obj[key] = { "name": v.name || "blob", "type": v.type, "base64": this.result }; // base64数据
                        cb();
                    }
                } else { // 1M以上大小,独立上传,这里上传的是文件信息
                    ctx.upload(v).then(r => {
                        obj[key] = { "name": v.name || "blob", "type": v.type, "file": r };
                    }).catch(e => {
                        obj[key] = { "name": v.name || "blob", "type": v.type, "error": e.msg };
                    }).then(() => {
                        cb();
                    });
                }
                return;
            } catch (e) {
                // 忽略,丢弃内容
                if (dbg)
                    console.log("格式错误,丢弃内容:" + e, e);
                obj[key] = null;
                break;
            }
        case "[object Undefined]":
            obj[key] = null;
        default:
    }
    cb();
}

function invalidSvc(svc) {
    return invalidSvcFun.bind({ "name": svc });
}

function invalidSvcFun() {
    let a = arguments, b = a.length;
    for (let i = 0; i < b; i++) {
        if (isFunction(a[i])) { // 如果参数中有回调函数,直接返回
            a[i]([0, null, {
                "msg": "服务未配置:" + this.name
            }]);
            return;
        }
    }

    return Promise.reject({
        "msg": "服务未配置:" + this.name
    });
}

function cacheFun() {
    let a = arguments, b = a.length;
    for (let i = 0; i < b; i++) {
        if (isFunction(a[i])) { // 如果参数中有回调函数,直接返回
            this.cache.push(Array.prototype.slice.call(arguments, 0));// 复制参数数组
            return;
        }
    }

    let cb;
    let rt = new Promise((resolve, reject) => {
        cb = (v) => {
            if (v[0]) {
                resolve([v[1], v[2]]);
            } else {
                reject(v[2]);
            }
        };
    });

    if (b == 1) {
        this.cache.push([a[0], {}, cb, 0]);
    } else if (b == 2) {
        this.cache.push([a[0], a[1], cb, 0]);
    } else {
        this.cache.push([a[0], a[1], cb, a[2]]);
    }

    return rt;
}

// 读本地保存的信息
function getLEID(name) {
    let storage = window.sessionStorage;
    let loc = window.location;
    let aid = storage.getItem(appid) || "";
    let pid = storage.getItem(appid + "." + name + "." + loc.origin + loc.pathname) || "";
    return appid + "." + name + "." + aid + "." + pid + ".."
}
// 信息存入本地
function saveWarning(w, ctx) {
    let a = w.indexOf(",");
    if (a > 0) {
        w = w.substring(0, a);
    }
    w = w.split(".");

    let storage = window.sessionStorage;
    let loc = window.location;
    a = appid + "." + ctx.name + "." + loc.origin + loc.pathname;
    storage.setItem(appid, w[2]);
    storage.setItem(a, w[0]);
    storage.setItem("n." + a, w[1]);
    ctx.noise = w[1];
    ctx.aid = w[2];
    ctx.pid = w[0];
}

function oneSvc(svcs, name, urls) {
    let controller = new AbortController();
    let signal = controller.signal;
    let count = urls.length;

    const headers = {
        "Last-Event-ID": getLEID(name)
    };

    let ctx = svcs[name].ctx;
    ctx.url = null;

    let rt = [];
    for (let u of urls) {
        rt.push(fetch(u + "/loader.json", { method: "GET", headers, signal }).then(res => {
            count--;
            if (!ctx.url) {
                if (res.ok) {
                    let w = res.headers.get("Warning");
                    if (w && w.indexOf("199 P") >= 0) {
                        ctx.url = res.url.substring(0, res.url.length - 12);
                        saveWarning(w.substr(w.indexOf("199 P") + 4), ctx);
                        count = 9; // 
                        // 取消所有其他请求
                        controller.abort();

                        let ch = ctx.cache;
                        if (ch && ch.length) {
                            for (let c of ch) {
                                svcFun.apply(ctx, c);
                            }
                            delete ctx.cache;
                        }
                        return;
                    }
                }
            }
            if (count <= 0) {
                let ch = ctx.cache;
                if (ch) {
                    delete ctx.cache;
                    if (ch.length) {
                        ctx.cacheLen = ch.length;
                        for (let c of ch) {
                            svcFun.apply(ctx, c);
                        }
                    }
                }
            }
        }).catch(e => {
            if (dbg) {
                console.log(name, u, e);
            }
            count--;
            if (count <= 0) {
                let ch = ctx.cache;
                if (ch) {
                    delete ctx.cache;
                    if (ch.length) {
                        ctx.cacheLen = ch.length;
                        for (let c of ch) {
                            svcFun.apply(ctx, c);
                        }
                    }
                }
            }
        }));
    }
    return rt;
}

// 解析config内容,生成apiSvc方法
function initApiSvc(conf) {
    appid = conf["appId"] || "default";
    let config = conf["apiSvc"] || {};

    let svcs = { "$config": conf }; // 原始的config内容
    for (let s in config) {
        let ctx = { name: s, urls: config[s], svcs, cache: [] };
        ctx.upload = upldFun.bind(ctx);
        svcs[s] = svcFun.bind(ctx);
        svcs[s].ctx = ctx;
        svcs[s].upload = ctx.upload;
        oneSvc(svcs, s, ctx.urls);
    }

    return svcs;
}

// 根据url获取config.json内容,并解析,生成apiSvc方法
async function initApiSvcByUrl(conf_url) {
    return fetch(conf_url)
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(res);
            }
        }).then(conf => {
            return initApiSvc(conf);
        });
}

export { initApiSvc, initApiSvcByUrl, invalidSvc };