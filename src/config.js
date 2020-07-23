// svc/service2这类名字自己定义,一个对应一个配置对象,最终会在全局对象apiSvc中生成访问指定服务器的同名函数
// 网页中调用方法是: apiSvc.svc('svc.act',param,function(){});
// 相同app_id,相同名字的配置内容应该保持一致,否则只有第一次有效.
// 几个特殊的名字不能用于配置名称:
(function (window, HTML5_SANDBOX) {
  'use strict'
  var app_id = 'jsl-3f3f' // 声明本应用的分配的id,服务器之间注册回调url,互相验证等需要.(区分本地和远程,远程有url,本地无,之间调用接口)
  // 整个网站所有config中的同名key必须一致
  // 整个网站只能有一个app_id
  var config = {
    svc: {
      servers: [
        '192.168.1.102:8080/jsl/apiSvc'
      ],
      defaultServer: '192.168.1.102:8080/jsl/apiSvc',
      ssl: false, // 是否https
      // 是否禁用ws,只用ajax的post请求.
      disableWs: false
    }
  }
  config.svc.servers.push(window.location.host + '/jsl/apiSvc')
  // 下边的代码固定不能修改
  function B (t, C, e, y, H, I, J) {
    function z (a) { u.push(a) } function K (a, f, h, d) { var k = a.indexOf('apiSvcLoaded'); if (!(k < 0)) { a = 'apiSvc.__ld.' + d + a.substr(k + 12); k = function (g, c) { D.removeChild(b); f(h, g, c); delete l.__ld[d] }; l.__ld[d] = k; var b = v.createElement('script'); b.text = a; D.appendChild(b) } } function E () { try { return new e.XMLHttpRequest() } catch (a) { } } function F (a, f, h, d, k) {
      function b () {
        try {
          b && c.readyState === 4 && (b = void 0, c.status == 200 ? typeof c.responseText === 'string' && K(c.responseText, f, c.getResponseHeader('Warning'),
            k) : h())
        } catch (n) { h(n) }
      } if (!e.ActiveXObject || /10\.0/.test(e.navigator.userAgent)) var g = E(); else { a: { try { g = new e.ActiveXObject('Microsoft.XMLHTTP'); break a } catch (n) { } g = void 0 } g = g || E() } var c = g; try { c.open('GET', a); try { c.responseType = 'text' } catch (n) { } c.setRequestHeader('Last-Event-ID', d); c.send(null) } catch (n) { h(n); return } c.readyState === 4 ? setTimeout(b, 0) : c.onreadystatechange = b
    } function w (a, f, h) {
      if (f) {
        var d = f[0]; var k = d.name; if (d.defaultServer) var b = d.defaultServer; else {
          b = d.servers; if (!b || b.length <= a) {
            d.Unavailable =
              !0; b = function () { for (var m = arguments, x = m.length, p = 0; p < x; p++) if ({}.toString.call(m[p]) == '[object Function]') m[p](!1, null, { clientErrMsg: 'No available services.' }) }; b.UNA = !0; l[k] = b; for (var g = r[k]; g.length;)b.apply(e, g.shift()); if (f[1]) f[1](!1); w(0, h.shift(), h); return
          } b = b[a]
        } g = d.queryStr; var c = (d.ssl ? 'https://' : 'http://') + b + '/loader.js'; g && (c += '?' + g); g = G.getItem(t); var n = G.getItem(t + '.' + k + '.' + e.location.href); F(c, function (m, x, p) {
          a >= 0 && (d.defaultServer = b); x(e, l, d, t, y, m, r[k], x, p, B, function () {
            w(0, h.shift(),
              h)
          }, f[1], u, F, c)
        }, function (m) { console.log('get [' + c + '] err:' + m, m); a = d.defaultServer ? 0 : a + 1; d.defaultServer = null; w(a, f, h) }, t + '.' + k + '.' + (g || '') + '.' + (n || '') + '.' + (f[2] || '') + '.' + (f[3] || ''), k)
      } else delete l.__as
    } function L (a, f) { f.name = a; r[a] || (r[a] = []); var h = r[a]; l[a] = function () { h.push(Array.prototype.slice.call(arguments, 0)) }; return f } var v = e.document; var D = v.head || v.getElementsByTagName('head')[0] || v.documentElement; var G = e.sessionStorage; var u = []; u.rm = function () {
      y ? e.removeEventListener('message', z, !1) : e.__apiSvc__postMsg =
        void 0; delete u.rm
    }; y ? e.addEventListener('message', z, !1) : e.__apiSvc__postMsg = z; var l = e.apiSvc = e.apiSvc || {}; l.__ld = {}; var q = l.__as; var M = !q; q = l.__as = q || []; var r = l.__mc = l.__mc || {}; var A; for (A in C) q.push([L(A, C[A]), H, I, J]); M && w(0, q.shift(), q)
  } B(app_id, config, window, HTML5_SANDBOX)
})(window, window.HTMLIFrameElement ? 'sandbox' in HTMLIFrameElement.prototype : false)
