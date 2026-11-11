/* ============================================================
   江苏省科学家精神戏剧展示 —— 交互
   剧目搜索 / 题材筛选 / 详情弹窗 / 动态评论（localStorage）
   ============================================================ */
(function () {
  'use strict';

  var PLAYS = window.PLAYS || [];
  var NEWS = window.NEWS || [];
  var STORE_KEY = 'jsd-comments-v1';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escRe(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    try {
      return safe.replace(new RegExp('(' + escRe(esc(q)) + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) { return safe; }
  }

  /* ---------------------------------------------------------
     01 剧目库
     --------------------------------------------------------- */
  var cardsEl = $('#cards');
  var emptyEl = $('#empty');
  var searchEl = $('#search');
  var clearEl = $('#searchClear');
  var countEl = $('#resultCount');
  var chipsEl = $('#chips');

  var state = { q: '', tag: '全部' };

  var categories = ['全部'];
  PLAYS.forEach(function (p) {
    var c = p.tags && p.tags[0];
    if (c && categories.indexOf(c) === -1) categories.push(c);
  });

  chipsEl.innerHTML = categories.map(function (c) {
    return '<button type="button" class="chip" data-tag="' + esc(c) + '" aria-pressed="' +
      (c === '全部') + '">' + esc(c) + '</button>';
  }).join('');

  chipsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    state.tag = btn.dataset.tag;
    $$('.chip', chipsEl).forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.tag === state.tag));
    });
    render();
  });

  function matched(play, q) {
    if (!q) return true;
    var hay = [play.title, play.subtitle, play.school, play.theme, play.tags.join(' '), play.synopsis]
      .join(' ').toLowerCase();
    var keys = q.toLowerCase().split(/\s+/).filter(Boolean);
    return keys.every(function (k) { return hay.indexOf(k) !== -1; });
  }

  function render() {
    var q = state.q.trim();
    var list = PLAYS.filter(function (p) {
      return matched(p, q) && (state.tag === '全部' || (p.tags || []).indexOf(state.tag) !== -1);
    });

    cardsEl.innerHTML = list.map(function (p, i) {
      var proto = (p.facts && p.facts[0]) ? p.facts[0][1] : '';
      return '' +
        '<article class="card" role="button" tabindex="0" data-id="' + esc(p.id) + '" ' +
        'aria-label="查看剧目《' + esc(p.title) + '》详情" style="animation-delay:' + (i * 55) + 'ms">' +
          '<div class="card-media">' +
            '<img src="' + esc(p.still) + '" alt="《' + esc(p.title) + '》剧照占位图" width="800" height="500" loading="lazy" decoding="async">' +
            '<span class="school-tag">' + highlight(p.school, q) + '</span>' +
            '<span class="card-no">NO. ' + esc(p.no) + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<p class="card-theme">' + highlight(p.theme, q) + '</p>' +
            '<h3 class="card-title">' + highlight(p.title, q) +
              '<span class="sub">' + highlight(p.subtitle, q) + '</span></h3>' +
            '<p class="card-synopsis">' + highlight(p.synopsis, q) + '</p>' +
            '<div class="card-foot">' +
              '<span class="tag-mini">' + esc(proto) + '</span>' +
              '<span class="more">查看详情 <i>→</i></span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    emptyEl.hidden = list.length !== 0;
    cardsEl.hidden = list.length === 0;
    countEl.innerHTML = (q || state.tag !== '全部' ? '找到 ' : '共 ') + '<b>' + list.length + '</b> 部';
    clearEl.hidden = !q;
  }

  var searchTimer;
  searchEl.addEventListener('input', function () {
    clearTimeout(searchTimer);
    var v = searchEl.value;
    searchTimer = setTimeout(function () {
      state.q = v;
      render();
    }, 90);
  });

  searchEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { searchEl.value = ''; state.q = ''; render(); }
  });

  clearEl.addEventListener('click', function () {
    searchEl.value = ''; state.q = ''; render(); searchEl.focus();
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && !modalOpen()) {
      e.preventDefault();
      searchEl.focus();
      searchEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });

  /* ---------------------------------------------------------
     02 剧目详情弹窗
     --------------------------------------------------------- */
  var modal = $('#modal');
  var lastFocused = null;

  function modalOpen() { return !modal.hidden; }

  function openModal(id) {
    var p = PLAYS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    lastFocused = document.activeElement;

    $('#modalImg').src = p.still;
    $('#modalImg').alt = '《' + p.title + '》剧照（占位图）';
    $('#modalSchool').textContent = p.school + '　|　NO. ' + p.no;
    $('#modalTitle').textContent = '《' + p.title + '》';
    $('#modalSub').textContent = p.subtitle;
    $('#modalTheme').textContent = p.theme;
    $('#modalSynopsis').textContent = p.synopsis;
    $('#modalFacts').innerHTML = (p.facts || []).map(function (f) {
      return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
    }).join('');
    $('#modalNote').textContent = p.note || '';
    $('#modalNote').hidden = !p.note;
    $('#modalSource').textContent = '资料来源：' + (p.source || '公开报道');

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-body', modal).scrollTop = 0;
    $('.modal-close', modal).focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  cardsEl.addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (card) openModal(card.dataset.id);
  });

  cardsEl.addEventListener('keydown', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      openModal(card.dataset.id);
    }
  });

  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (!modalOpen()) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var focusables = $$('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------------------------------------------------
     03 活动动态 + 评论
     --------------------------------------------------------- */
  var newsEl = $('#newsList');

  function loadComments() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      return (data && typeof data === 'object') ? data : {};
    } catch (e) { return {}; }
  }

  function saveComments(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* 隐私模式忽略 */ }
  }

  var comments = loadComments();

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前';
    var d = new Date(ts);
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }

  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function renderComments(newsId) {
    var list = comments[newsId] || [];
    var ul = $('#cl-' + newsId);
    if (!ul) return;
    if (!list.length) {
      ul.innerHTML = '<li class="comment-empty">还没有人说话。第一句，留给你。</li>';
    } else {
      ul.innerHTML = list.map(function (c) {
        return '<li class="comment">' +
          '<span class="avatar" aria-hidden="true">' + esc(c.name.slice(0, 1)) + '</span>' +
          '<div><div class="comment-head"><strong>' + esc(c.name) + '</strong>' +
          '<time datetime="' + new Date(c.ts).toISOString() + '">' + timeAgo(c.ts) + '</time></div>' +
          '<p>' + esc(c.text) + '</p></div>' +
        '</li>';
      }).join('');
    }
    var btn = $('[data-comment-for="' + newsId + '"] .count');
    if (btn) btn.textContent = list.length ? '(' + list.length + ')' : '';
  }

  function renderNews() {
    var sorted = NEWS.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    newsEl.innerHTML = sorted.map(function (n, i) {
      var d = new Date(n.date + 'T09:00:00');
      var ymd = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return '<li class="news-item reveal">' +
        '<div class="news-date"><b>' + day + '</b><span>' + ymd + ' · ' + WEEK[d.getDay()] + '</span></div>' +
        '<div class="news-main">' +
          '<span class="news-tag">' + (i === 0 ? '最新 · ' : '') + esc(n.tag) + '</span>' +
          '<h3 class="news-title">' + esc(n.title) + '</h3>' +
          '<p class="news-summary">' + esc(n.summary) + '</p>' +
          '<div class="news-actions">' +
            '<button class="btn-comment" type="button" data-comment-for="' + esc(n.id) + '" ' +
              'aria-expanded="false" aria-controls="cm-' + esc(n.id) + '">' +
              '评论 <span class="count"></span></button>' +
          '</div>' +
          '<div class="comments" id="cm-' + esc(n.id) + '">' +
            '<ul class="comment-list" id="cl-' + esc(n.id) + '"></ul>' +
            '<form class="comment-form" data-form-for="' + esc(n.id) + '">' +
              '<input type="text" name="name" maxlength="12" placeholder="昵称（选填）" aria-label="昵称">' +
              '<textarea name="text" maxlength="200" placeholder="说说你的观后感，或一句想对台上的他们说的话…" aria-label="评论内容" required></textarea>' +
              '<button type="submit">发布</button>' +
              '<p class="form-hint">发布后保存在本机浏览器，仅你可见；请勿填写个人敏感信息。</p>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</li>';
    }).join('');

    sorted.forEach(function (n) { renderComments(n.id); });
  }

  newsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-comment');
    if (!btn) return;
    var id = btn.dataset.commentFor;
    var panel = $('#cm-' + id);
    var open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      var ta = $('textarea', panel);
      if (ta) setTimeout(function () { ta.focus(); }, 60);
    }
  });

  newsEl.addEventListener('submit', function (e) {
    var form = e.target.closest('.comment-form');
    if (!form) return;
    e.preventDefault();
    var id = form.dataset.formFor;
    var nameInput = form.querySelector('input[name="name"]');
    var ta = form.querySelector('textarea[name="text"]');
    var text = ta.value.trim();
    if (!text) { ta.focus(); return; }
    var name = (nameInput.value || '').trim() || '匿名观众';

    comments[id] = comments[id] || [];
    comments[id].push({ name: name.slice(0, 12), text: text.slice(0, 200), ts: Date.now() });
    saveComments(comments);

    ta.value = '';
    renderComments(id);
    var btn = $('[data-comment-for="' + id + '"]');
    if (btn) btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     04 滚动显现 / 导航高亮 / 年份
     --------------------------------------------------------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    items.forEach(function (el) { io.observe(el); });
  }

  function initNavSpy() {
    var links = $$('.nav-links a');
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* 初始化 */
  render();
  renderNews();
  initReveal();
  initNavSpy();
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
