/* Injects the site header, footer and search overlay from JSON files.
   Dispatches `layout:ready` on <html> when done so main.js can bind safely. */
(function () {
  'use strict';

  var currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function pagePart(url) {
    if (!url) return '';
    var p = url.split('#')[0].toLowerCase();
    return p || 'index.html';
  }

  function isActive(item) {
    if ((item.pages || []).map(function (p) { return p.toLowerCase(); }).indexOf(currentPage) !== -1) return true;
    if (item.url && pagePart(item.url) === currentPage) return true;
    if (item.children) {
      for (var k = 0; k < item.children.length; k++) if (isActive(item.children[k])) return true;
    }
    return false;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildBrand(b) {
    var a = el('a', 'logo');
    a.href = b.url || 'index.html';
    var img = el('img');
    img.src = b.logo || 'assets/favicon.png';
    img.alt = '';
    img.width = 40;
    img.height = 40;
    var span = el('span', null, b.name || '');
    if (b.tagline) span.appendChild(el('small', null, b.tagline));
    a.appendChild(img);
    a.appendChild(span);
    return a;
  }

  function buildNavItem(item) {
    var li = el('li');
    var active = isActive(item);
    if (item.children && item.children.length) {
      var btn = el('button', 'nv' + (active ? ' on' : ''), item.label);
      btn.type = 'button';
      var dd = el('div', 'dd');
      item.children.forEach(function (c) {
        var a = el('a', null, c.label);
        a.href = c.url;
        if ((c.pages || []).map(function (p) { return p.toLowerCase(); }).indexOf(currentPage) !== -1) {
          a.setAttribute('aria-current', 'page');
        }
        dd.appendChild(a);
      });
      li.appendChild(btn);
      li.appendChild(dd);
    } else {
      var a2 = el('a', active ? 'on' : null, item.label);
      a2.href = item.url;
      if (active) a2.setAttribute('aria-current', 'page');
      li.appendChild(a2);
    }
    return li;
  }

  function buildHeader(menu) {
    var hdr = document.getElementById('site-header');
    if (!hdr || !menu) return;
    hdr.innerHTML = '';
    var wrap = el('div', 'wrap');
    wrap.appendChild(buildBrand(menu.brand || {}));

    var nav = el('nav');
    nav.id = 'nav';
    nav.setAttribute('aria-label', 'Main');
    var ul = el('ul');
    (menu.items || []).forEach(function (it) { ul.appendChild(buildNavItem(it)); });
    nav.appendChild(ul);
    wrap.appendChild(nav);

    var right = el('div', 'right');
    var sb = el('button', 'ico');
    sb.id = 'sb';
    sb.type = 'button';
    sb.setAttribute('aria-label', 'Search');
    sb.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
    right.appendChild(sb);

    if (menu.cta && menu.cta.url) {
      var cta = el('a', 'btn', menu.cta.label);
      cta.href = menu.cta.url;
      right.appendChild(cta);
    }

    var mb = el('button', null, 'Menu');
    mb.id = 'mb';
    mb.type = 'button';
    mb.setAttribute('aria-label', 'Menu');
    mb.setAttribute('aria-expanded', 'false');
    right.appendChild(mb);

    wrap.appendChild(right);
    hdr.appendChild(wrap);
  }

  function buildFooter(data, brand) {
    var foot = document.getElementById('site-footer');
    if (!foot || !data) return;
    foot.innerHTML = '';
    var wrap = el('div', 'wrap');
    var fg = el('div', 'fg');

    (data.columns || []).forEach(function (col) {
      var cell = el('div');
      if (col.type === 'brand') {
        cell.appendChild(buildBrand(brand || {}));
      } else if (col.type === 'links') {
        cell.appendChild(el('h4', null, col.title));
        var ul = el('ul');
        (col.items || []).forEach(function (it) {
          var li = el('li');
          var a = el('a', null, it.label);
          a.href = it.url;
          li.appendChild(a);
          ul.appendChild(li);
        });
        cell.appendChild(ul);
      } else if (col.type === 'text') {
        cell.appendChild(el('h4', null, col.title));
        var ul2 = el('ul');
        (col.lines || []).forEach(function (line) { ul2.appendChild(el('li', null, line)); });
        cell.appendChild(ul2);
      } else if (col.type === 'social') {
        cell.appendChild(el('h4', null, col.title));
        if (col.text) cell.appendChild(el('p', null, col.text));
        var soc = el('div', 'soc');
        (col.items || []).forEach(function (it) {
          var a = el('a', null, it.label);
          a.href = it.url;
          if (/^https?:/.test(it.url)) { a.target = '_blank'; a.rel = 'noopener'; }
          soc.appendChild(a);
        });
        cell.appendChild(soc);
      }
      fg.appendChild(cell);
    });

    wrap.appendChild(fg);

    var copy = el('div', 'copy');
    copy.appendChild(el('span', null, data.copyright || ''));
    if (data.legal && data.legal.url) {
      var la = el('a', null, data.legal.label);
      la.href = data.legal.url;
      copy.appendChild(la);
    }
    wrap.appendChild(copy);
    foot.appendChild(wrap);
  }

  function buildSearchOverlay() {
    if (document.getElementById('sr')) return;
    var sr = el('div', 'sr');
    sr.id = 'sr';
    sr.hidden = true;

    var form = el('form');
    form.id = 'sf';
    form.setAttribute('role', 'search');
    var input = el('input');
    input.id = 'sq';
    input.type = 'search';
    input.placeholder = 'Search this site...';
    input.setAttribute('aria-label', 'Search');
    var go = el('button', 'btn', 'Search');
    go.type = 'submit';
    form.appendChild(input);
    form.appendChild(go);

    var close = el('button', 'ico', '✕');
    close.id = 'sx';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close search');

    sr.appendChild(form);
    sr.appendChild(close);
    document.body.appendChild(sr);
  }

  function showHeaderError(msg) {
    var hdr = document.getElementById('site-header');
    if (!hdr) return;
    var p = el('p', null, msg);
    p.style.cssText = 'padding:16px 24px;margin:0;background:#b4242c;color:#fff;font-size:.9rem';
    hdr.appendChild(p);
  }
  function showFooterError(msg) {
    var foot = document.getElementById('site-footer');
    if (!foot) return;
    var p = el('p', null, msg);
    p.style.cssText = 'padding:16px 24px;margin:0;color:#fff;font-size:.9rem';
    foot.appendChild(p);
  }

  function ready() {
    document.documentElement.setAttribute('data-layout-ready', '');
    document.dispatchEvent(new CustomEvent('layout:ready'));
  }

  function loadJSON(url) {
    if (location.protocol === 'file:') return Promise.reject('file');
    return fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); });
  }

  function msg() {
    return location.protocol === 'file:'
      ? 'This section loads from JSON and needs a web server. Open the site through VS Code Live Server or run `npx serve`.'
      : 'Sorry, this section could not be loaded. Please try again later.';
  }

  buildSearchOverlay();

  Promise.all([
    loadJSON('data/menu.json').catch(function () { return null; }),
    loadJSON('data/footer.json').catch(function () { return null; })
  ]).then(function (res) {
    var menu = res[0], footer = res[1];
    if (menu) buildHeader(menu); else showHeaderError(msg());
    if (footer) buildFooter(footer, menu && menu.brand); else showFooterError(msg());
    ready();
  });
})();