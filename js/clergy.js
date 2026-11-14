// Loads one clergy member's full profile from data/clergy.json using the ?id= in the page address.
(function () {
  var body = document.getElementById('cBody'), nameEl = document.getElementById('cName'),
    crumb = document.getElementById('cCrumb'), more = document.getElementById('cMore'),
    others = document.getElementById('cOthers');
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e }
  function fail(msg) { body.innerHTML = ''; body.appendChild(el('p', '', msg)); var b = el('a', 'btn', 'Back to our clergy'); b.href = 'about.html#clergy'; body.appendChild(b) }

  var id = new URLSearchParams(location.search).get('id');
  if (location.protocol === 'file:') { fail('This page loads its content from a data file, so it must be opened through a web server or after uploading to your host (double-clicking the file will not work).'); return }

  fetch('data/clergy.json').then(function (r) { if (!r.ok) throw 0; return r.json() }).then(function (list) {
    var p = list.filter(function (x) { return x.id === id })[0];
    if (!p) { fail('Sorry, we could not find that profile.'); return }

    document.title = p.name + ' | St Stephen Luzira C.O.U';
    nameEl.textContent = p.name; crumb.textContent = p.name;

    var wrap = el('div', 'cd'), pic = el('div', 'cd-photo'), txt = el('div', 'cd-text');
    pic.setAttribute('role', 'img'); pic.setAttribute('aria-label', 'Photo of ' + p.name);
    if (p.photo) pic.style.setProperty('--bg', 'url("' + p.photo + '")');

    txt.appendChild(el('div', 'role', p.role));
    txt.appendChild(el('h2', '', p.name));

    if (p.facts && p.facts.length) {
      var dl = el('dl', 'facts');
      p.facts.forEach(function (f) {
        var d = el('div');
        d.appendChild(el('dt', '', f[0]));
        var dd = el('dd');
        dd.innerHTML = f[1]; // Changed to innerHTML to support line breaks (<br>)
        d.appendChild(dd);
        dl.appendChild(d);
      });
      txt.appendChild(dl);
    }

    // Render the new bio sections (Headings + HTML content)
    if (p.bio) {
      p.bio.forEach(function (section) {
        if (section.heading) {
          txt.appendChild(el('h3', 'bio-heading', section.heading));
        }
        if (section.content) {
          var div = el('div', 'bio-content');
          div.innerHTML = section.content; // Renders the <p>, <ul>, and <li> tags
          txt.appendChild(div);
        }
      });
    }

    var back = el('a', 'btn line', '← Back to our clergy'); back.href = 'about.html#clergy'; back.style.marginTop = '24px';
    txt.appendChild(back);

    wrap.appendChild(pic); wrap.appendChild(txt); body.innerHTML = ''; body.appendChild(wrap);

    var rest = list.filter(function (x) { return x.id !== id });
    if (rest.length) {
      rest.forEach(function (x) {
        var c = el('div', 'card-c'), ph = el('div', 'ph-c'), inn = el('div', 'in');
        if (x.photo) ph.style.setProperty('--bg', 'url("' + x.photo + '")');
        inn.appendChild(el('h3', '', x.name)); inn.appendChild(el('div', 'role', x.role));
        var a = el('a', 'more', 'View profile →'); a.href = 'clergy.html?id=' + encodeURIComponent(x.id); inn.appendChild(a);
        c.appendChild(ph); c.appendChild(inn); others.appendChild(c);
      });
      more.hidden = false;
    }
  }).catch(function () { fail('Sorry, this profile could not be loaded. Please try again later.') });
})();