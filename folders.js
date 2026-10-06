/* «Дві папки»: тема, портрет, вкладки (перемикаються без звуку). Підключається на index.html і blog.html. */
(function () {
  var root = document.documentElement;

  /* ---- тумблер теми: короткий синтезований клацок ---- */
  var ctx = null;
  function clack() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var len = Math.floor(ctx.sampleRate * 0.035), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 1.2; g.gain.value = 0.5;
      src.buffer = buf; src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    } catch (e) {}
  }

  /* ---- портрет з кепкою (є тільки в портфоліо) ---- */
  var FRAME_COUNT = 38;
  var DURATION = 900;
  var box = document.getElementById('portrait');
  var imgs = [];
  var dark = root.dataset.theme === 'dark';
  var current = dark ? FRAME_COUNT - 1 : 0, target = current, raf = null, last = null;
  if (box) {
    for (var i = 1; i <= FRAME_COUNT; i++) {
      var im = new Image();
      im.src = '/frames/hat_' + String(i).padStart(3, '0') + '.webp';
      im.alt = i === 1 ? 'Іван Мандровний' : '';
      if (i - 1 === current) im.className = 'on';
      box.appendChild(im);
      imgs.push(im);
    }
  }
  function show(idx) { var k = Math.round(idx); imgs.forEach(function (im, j) { im.classList.toggle('on', j === k); }); }
  function tick(ts) {
    if (last === null) last = ts;
    var step = (FRAME_COUNT - 1) * ((ts - last) / DURATION);
    last = ts;
    if (current < target) current = Math.min(target, current + step);
    else if (current > target) current = Math.max(target, current - step);
    show(current);
    if (current !== target) raf = requestAnimationFrame(tick);
    else { raf = null; last = null; }
  }
  function setTheme(isDark) {
    root.dataset.theme = isDark ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    target = isDark ? FRAME_COUNT - 1 : 0;
    if (box && !raf) { last = null; raf = requestAnimationFrame(tick); }
  }
  /* обидва тумблери (у портфоліо й у блозі) — один перемикач */
  document.querySelectorAll('.toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      clack();
      setTheme(root.dataset.theme !== 'dark');
    });
  });

  /* ---- вкладки: / і /blog ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var active = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
  /* режим перегляду (?preview) і «очима відвідувача» (?live) зберігаються при перемиканні папок */
  var params = new URLSearchParams(location.search);
  var mode = params.has('preview') ? '?preview' : params.has('live') ? '?live' : '';
  if (mode) tabs.forEach(function (t) { if (t.href) t.href = t.getAttribute('href') + mode; });

  function go(i) {
    if (i === active || !tabs[i] || !tabs[i].href) return;
    try { sessionStorage.setItem('folder-nav', '1'); } catch (e) {}
    location.href = tabs[i].href;
  }
  /* вкладка відкритого кейсу — не посилання (у ній свій «×»), її не чіпаємо */
  tabs.forEach(function (t, i) {
    if (!t.href) return;
    t.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      go(i);
    });
  });

  /* без View Transitions між сторінками — проста анімація виїзду папки */
  try {
    if (sessionStorage.getItem('folder-nav')) {
      sessionStorage.removeItem('folder-nav');
      var front = document.querySelector('.sheet.front');
      if (front && !('onpagereveal' in window)) front.classList.add('enter');
    }
  } catch (e) {}

  /* лічильник «Блог» без чернеток (чернетки рахуються лише в режимі перегляду) */
  var blogCount = document.getElementById('blogCount');
  if (blogCount && window.visiblePosts) blogCount.textContent = window.visiblePosts().length;

  /* ---- клавіатура: C — написати, ←/→ — папки ---- */
  var contactBtn = document.getElementById('contactBtn');
  function write() { window.location.href = 'mailto:mandrovnyi@gmail.com'; }
  if (contactBtn) contactBtn.addEventListener('click', write);
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
    if (document.querySelector('dialog[open]')) return;
    if (contactBtn && (e.key === 'c' || e.key === 'с')) write();
    if (e.key === 'ArrowRight') go(active + 1);
    if (e.key === 'ArrowLeft') go(active - 1);
  });
})();
