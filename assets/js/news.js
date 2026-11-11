/* ============================================================
   活动动态页：倒序新闻列表 + 评论（localStorage 本地保存）
   ============================================================ */
(function () {
  'use strict';

  var J = window.JSD;
  var NEWS = window.NEWS || [];
  if (!J) return;

  var $ = J.$, esc = J.esc;
  var newsEl = $('#newsList');
  if (!newsEl) return;

  var STORE_KEY = 'jsd-comments-v1';
  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function loadComments() {
    try {
      var data = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
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

  function renderComments(newsId) {
    var list = comments[newsId] || [];
    var ul = $('#cl-' + newsId);
    if (!ul) return;

    ul.innerHTML = list.length
      ? list.map(function (c) {
          return '<li class="comment">' +
            '<span class="avatar" aria-hidden="true">' + esc(c.name.slice(0, 1)) + '</span>' +
            '<div><div class="comment-head"><strong>' + esc(c.name) + '</strong>' +
            '<time datetime="' + new Date(c.ts).toISOString() + '">' + timeAgo(c.ts) + '</time></div>' +
            '<p>' + esc(c.text) + '</p></div>' +
          '</li>';
        }).join('')
      : '<li class="comment-empty">还没有人说话。第一句，留给你。</li>';

    var counter = $('[data-comment-for="' + newsId + '"] .count');
    if (counter) counter.textContent = list.length ? '(' + list.length + ')' : '';
  }

  function renderNews() {
    var sorted = NEWS.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    newsEl.innerHTML = sorted.map(function (n, i) {
      var d = new Date(n.date + 'T09:00:00');
      var ym = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return '<li class="news-item reveal">' +
        '<div class="news-date"><b>' + day + '</b><span>' + ym + ' · ' + WEEK[d.getDay()] + '</span></div>' +
        '<div class="news-main">' +
          '<span class="news-tag">' + (i === 0 ? '最新 · ' : '') + esc(n.tag) + '</span>' +
          '<h3 class="news-title">' + esc(n.title) + '</h3>' +
          '<p class="news-summary">' + esc(n.summary) + '</p>' +
          '<div class="news-actions">' +
            '<button class="btn-comment" type="button" data-comment-for="' + esc(n.id) + '" ' +
              'aria-expanded="false" aria-controls="cm-' + esc(n.id) + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
              '<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.6-5.4A8 8 0 1 1 21 12z"></path></svg>' +
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
    var ta = form.querySelector('textarea[name="text"]');
    var nameInput = form.querySelector('input[name="name"]');
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

  renderNews();
})();
