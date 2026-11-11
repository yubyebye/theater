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

  /* 上半部分固定、导航条切换下半部分面板 */
  function initTabs() {
    var tabs = JSD.$$('.tab');
    var bar = JSD.$('#tabBar');
    if (!tabs.length || !bar) return;

    var panels = {};
    tabs.forEach(function (t) {
      var p = JSD.$('#panel-' + t.dataset.tab);
      if (p) panels[t.dataset.tab] = p;
    });

    function activate(name, scroll) {
      if (!panels[name]) name = Object.keys(panels)[0];
      tabs.forEach(function (t) {
        var on = t.dataset.tab === name;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-current', on ? 'true' : 'false');
      });
      Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
      initReveal(); /* 新面板首次显示时触发滚动显现 */
      if (scroll && window.scrollY > bar.offsetTop) {
        bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var name = t.dataset.tab;
        if (location.hash !== '#' + name) {
          location.hash = name; /* 触发 hashchange → activate */
        } else {
          activate(name, true);
        }
      });
    });

    window.addEventListener('hashchange', function () {
      activate(location.hash.replace('#', ''), true);
    });

    activate((location.hash || '#archive').replace('#', ''), false);
  }
  JSD.initTabs = initTabs;

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initTabs();
    var y = JSD.$('#year');
    if (y) y.textContent = new Date().getFullYear();
  });

  window.JSD = JSD;
})();
