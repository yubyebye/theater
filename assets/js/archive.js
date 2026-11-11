/* ============================================================
   剧目库页：卡片渲染 / 关键词搜索 / 题材筛选 / 详情弹窗
   ============================================================ */
(function () {
  'use strict';

  var J = window.JSD;
  var PLAYS = window.PLAYS || [];
  if (!J || !PLAYS.length) return;

  var $ = J.$, $$ = J.$$, esc = J.esc, highlight = J.highlight;

  var cardsEl = $('#cards');
  var emptyEl = $('#empty');
  var searchEl = $('#search');
  var clearEl = $('#searchClear');
  var countEl = $('#resultCount');
  var chipsEl = $('#chips');
  if (!cardsEl) return;

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
    var hay = [play.title, play.subtitle, play.school, play.theme, (play.tags || []).join(' '), play.synopsis]
      .join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (k) {
      return hay.indexOf(k) !== -1;
    });
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
    searchTimer = setTimeout(function () { state.q = v; render(); }, 90);
  });

  searchEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { searchEl.value = ''; state.q = ''; render(); }
  });

  clearEl.addEventListener('click', function () {
    searchEl.value = ''; state.q = ''; render(); searchEl.focus();
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && modal.hidden) {
      e.preventDefault();
      searchEl.focus();
      searchEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });

  /* ---------- 详情弹窗 ---------- */
  var modal = $('#modal');
  var lastFocused = null;

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
    if (modal.hidden) return;
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

  render();
})();
