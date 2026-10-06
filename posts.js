/* Статті блогу. Новіші — зверху.
   draft: true — чернетка: видно тільки в режимі перегляду (localhost або ?preview в адресі).
   Щоб опублікувати: draft: false, вписати date і url сторінки статті.
   type: roz — розбір, ese — есе, prov — провокація.
   cover: { big: '10' } або { word: 'Слово' } — типографічна на --sunk;
          { brand: 'Назва', bg: '#колір' } — назва бренду на кольорі бренду. */
window.POSTS = [
  { n: 7, type: 'ese',  draft: true, title: 'Як я б проводив тестове для креативників', cover: { word: 'Тестове' } },
  { n: 6, type: 'prov', draft: true, title: 'Як безкоштовно відправити що завгодно Новою поштою', cover: { big: '0 ₴' } },
  { n: 5, type: 'roz',  draft: true, title: 'ПриватБанк на молодіжній тусовці', cover: { brand: 'ПриватБанк', bg: '#7dbb2f' } },
  { n: 4, type: 'ese',  draft: true, title: 'Чому в українській рекламі немає імен авторів', cover: { word: 'Імена' } },
  { n: 3, type: 'roz',  draft: true, title: 'Новорічні заголовки Сільпо', cover: { brand: 'Сільпо', bg: '#f36f21' } },
  { n: 2, type: 'roz',  draft: true, title: 'Реклама mono в метро Києва', cover: { brand: 'mono', bg: '#111113' } },
  { n: 1, type: 'prov', draft: false, free: true, date: '22.08.2026', url: '/blog-10-priyomiv',
    title: '10 пробивних текстових прийомів, після яких читач стає покупцем', cover: { big: '10' } },
];

window.POST_TYPES = {
  roz:  ['Розбір', 'Розбори'],
  ese:  ['Есе', 'Есе'],
  prov: ['Провокація', 'Провокації'],
};

/* Режим перегляду: localhost або ?preview. ?live — подивитись сайт очима відвідувача навіть на localhost. */
window.PREVIEW = (function () {
  var q = new URLSearchParams(location.search);
  if (q.has('live')) return false;
  if (q.has('preview')) return true;
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /\.localhost$/.test(location.hostname);
})();

window.visiblePosts = function () {
  return window.POSTS.filter(function (p) { return window.PREVIEW || !p.draft; });
};

window.postNo = function (n) { return '№ ' + String(n).padStart(3, '0'); };

window.postUrl = function (p) {
  if (!p.draft) return p.url;
  var q = new URLSearchParams(location.search).has('preview') ? '&preview' : '';
  return '/draft?n=' + p.n + q;
};
