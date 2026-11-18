(function () {
  var body = document.getElementById('cBody'), nameEl = document.getElementById('cName'),
      crumb = document.getElementById('cCrumb'), more = document.getElementById('cMore'),
      others = document.getElementById('cOthers');
      
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e }
  function fail(msg) { body.innerHTML = ''; body.appendChild(el('p', '', msg)); var b = el('a', 'btn', 'Back to Committee'); b.href = 'about.html#committee'; body.appendChild(b) }

  var id = new URLSearchParams(location.search).get('id');
  if (location.protocol === 'file:') { fail('This page loads its content from a data file, so it must be opened through a web server.'); return }

  fetch('data/committee.json').then(function (r) { if (!r.ok) throw 0; return r.json() }).then(function (list) {
    var p = list.filter(function (x) { return x.id === id })[0];
    if (!p) { fail('Sorry, we could not find that profile.'); return }

    document.title = p.name + ' | St Stephen Luzira C.O.U';
    nameEl.textContent = p.name; crumb.textContent = p.name;

    var wrap = el('div', 'cd'), pic = el('div', 'cd-photo'), txt = el('div', 'cd-text');
    pic.setAttribute('role', 'img'); pic.setAttribute('aria-label', 'Photo of ' + p.name);
    
    // Use p.photo or p.image
    var imgSrc = p.photo || p.image;
    if (imgSrc) pic.style.setProperty('--bg', 'url("' + imgSrc + '")');

    txt.appendChild(el('div', 'role', p.role));
    txt.appendChild(el('h2', '', p.name));

    if (p.facts && p.facts.length) {
      var dl = el('dl', 'facts');
      p.facts.forEach(function (f) {
        var d = el('div');
        d.appendChild(el('dt', '', f[0]));
        var dd = el('dd');
        dd.innerHTML = f[1]; 
        d.appendChild(dd);
        dl.appendChild(d);
      });
      txt.appendChild(dl);
    }

    if (p.bio) {
      p.bio.forEach(function (section) {
        if (section.heading) {
          txt.appendChild(el('h3', 'bio-heading', section.heading));
        }
        if (section.content) {
          var div = el('div', 'bio-content');
          div.innerHTML = section.content; 
          txt.appendChild(div);
        }
      });
    }

    var back = el('a', 'btn line', '← Back to Committee'); back.href = 'about.html#committee'; back.style.marginTop = '24px';
    txt.appendChild(back);

    wrap.appendChild(pic); wrap.appendChild(txt); body.innerHTML = ''; body.appendChild(wrap);

    var rest = list.filter(function (x) { return x.id !== id });
    if (rest.length) {
      rest.slice(0, 3).forEach(function (x) {
        var c = el('div', 'card-c'), ph = el('div', 'ph-c'), inn = el('div', 'in');
        var restImgSrc = x.photo || x.image;
        if (restImgSrc) ph.style.setProperty('--bg', 'url("' + restImgSrc + '")');
        inn.appendChild(el('h3', '', x.name)); inn.appendChild(el('div', 'role', x.role));
        var a = el('a', 'more', 'View profile →'); a.href = 'committee-profile.html?id=' + encodeURIComponent(x.id); inn.appendChild(a);
        c.appendChild(ph); c.appendChild(inn); others.appendChild(c);
      });
      more.hidden = false;
    }
  }).catch(function () { fail('Sorry, this profile could not be loaded. Please try again later.') });
})();