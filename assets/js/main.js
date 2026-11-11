/* ============================================================
   公共脚本：工具函数 / 滚动显现 / 年份
   三页共用（index.html、news.html、about.html）
   ============================================================ */
(function () {
  'use strict';

  var JSD = window.JSD || {};

  JSD.$ = function (sel, root) { return (root || document).querySelector(sel); };
  JSD.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  JSD.esc = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  JSD.escRe = function (str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  /* 关键词高亮（先转义再包 mark，避免注入） */
  JSD.highlight = function (text, q) {
    var safe = JSD.esc(text);
    if (!q) return safe;
    try {
      return safe.replace(new RegExp('(' + JSD.escRe(JSD.esc(q)) + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) { return safe; }
  };

  /* 滚动显现 */
  function initReveal() {
    var items = JSD.$$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px' });
    items.forEach(function (el) { io.observe(el); });
  }
  JSD.initReveal = initReveal;

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    var y = JSD.$('#year');
    if (y) y.textContent = new Date().getFullYear();
  });

  window.JSD = JSD;
})();
