var $ = function (s) { return document.querySelector(s) }, $$ = function (s) { return document.querySelectorAll(s) };
// Header turns solid on scroll; back-to-top button
var hdr = $('.hdr'), topBtn = $('#top');
function sc() { var y = window.scrollY; hdr.classList.toggle('solid', y > 60); topBtn.classList.toggle('show', y > 600) }
window.addEventListener('scroll', sc, { passive: true }); sc();
topBtn.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }) };
// Mobile menu
var nav = $('#nav'), mb = $('#mb');
mb.onclick = function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o) };
nav.onclick = function (e) { if (e.target.tagName === 'A') nav.classList.remove('open') };
// Hero slideshow + rotating headline
var sl = $$('.slide'), i = 0, h = $('#rot'), words = ['Passion for God', 'Establishing the Kingdom', 'Empowering Lives'], w = 0;
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () { sl[i].classList.remove('on'); i = (i + 1) % sl.length; sl[i].classList.add('on') }, 5500);
    setInterval(function () { h.classList.add('out'); setTimeout(function () { w = (w + 1) % words.length; h.textContent = words[w]; h.classList.remove('out') }, 500) }, 3600)
}
// Scroll reveal
var rv = $$('.rv');
if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }) }, { threshold: .12 }); rv.forEach(function (e) { io.observe(e) }) } else rv.forEach(function (e) { e.classList.add('in') });
// Plan-your-visit bubble
var bub = $('#bub'), pan = $('#pan');
bub.onclick = function () { var o = pan.classList.toggle('open'); bub.setAttribute('aria-expanded', o) };
// Forms are placeholders: connect to your email service or form backend
$$('form[data-ok]').forEach(function (f) { f.onsubmit = function (e) { e.preventDefault(); f.innerHTML = '<strong>' + f.dataset.ok + '</strong>' } });

// Search: opens an overlay and searches your site on Google. Change SITE to your real domain.
var SITE = 'yourchurch.org', sr = $('#sr'), sq = $('#sq');
$('#sb').onclick = function () { sr.hidden = false; sq.focus() };
$('#sx').onclick = function () { sr.hidden = true };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') sr.hidden = true });
$('#sf').onsubmit = function (e) { e.preventDefault(); var q = sq.value.trim(); if (q) window.open('https://www.google.com/search?q=site:' + SITE + '+' + encodeURIComponent(q), '_blank') };
// Safety net: never leave sections hidden if the reveal effect fails
setTimeout(function () { rv.forEach(function (e) { e.classList.add('in') }) }, 2500);

// Events carousel: auto-scroll, pause on touch/hover, clickable dots
// Auto-scrolling carousels (events + ministries): auto-advance, pause on hover/touch, dots
function autoCarousel(id) {
    var tr = document.getElementById(id); if (!tr) return;
    var items = tr.children, dots = document.createElement('div'), pages = 1, cur = 0, timer, raf;
    dots.className = 'dots'; tr.parentNode.insertBefore(dots, tr.nextSibling);
    function metrics() {
        var max = tr.scrollWidth - tr.clientWidth;
        var step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : tr.clientWidth;
        return { max: max, step: step };
    }
    function go(i) { var m = metrics(); tr.scrollTo({ left: Math.min(i * m.step, m.max), behavior: 'smooth' }) }
    function mark() {
        var m = metrics();
        cur = tr.scrollLeft >= m.max - 4 ? pages - 1 : Math.round(tr.scrollLeft / m.step);
        cur = Math.max(0, Math.min(cur, pages - 1));
        for (var k = 0; k < dots.children.length; k++)dots.children[k].classList.toggle('on', k === cur);
    }
    function build() {
        var m = metrics(); pages = m.max > 4 ? Math.round(m.max / m.step) + 1 : 1;
        dots.innerHTML = ''; dots.style.display = pages < 2 ? 'none' : 'flex';
        for (var k = 0; k < pages; k++) {
            (function (i) {
                var b = document.createElement('button'); b.type = 'button';
                b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                b.onclick = function () { go(i); restart() }; dots.appendChild(b);
            })(k)
        }
        mark();
    }
    function stop() { clearInterval(timer) }
    function start() {
        stop();
        if (pages < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer = setInterval(function () { go((cur + 1) % pages) }, 4000);
    }
    function restart() { stop(); start() }
    tr.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark) }, { passive: true });
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (e) { tr.addEventListener(e, stop, { passive: true }) });
    ['mouseleave', 'touchend', 'focusout'].forEach(function (e) { tr.addEventListener(e, start, { passive: true }) });
    window.addEventListener('resize', function () { build(); restart() });
    window.addEventListener('load', function () { build(); restart() });
    build(); start();
}
autoCarousel('evCar');

// Looping carousel: one card in view, next one peeking, seamless repeat
function loopCarousel(id){
  var tr=document.getElementById(id); if(!tr) return;
  var real=Array.prototype.slice.call(tr.children), n=real.length; if(n<2) return;
  var clone=real[0].cloneNode(true), cs=getComputedStyle(real[0]), cur=0, timer;
  clone.setAttribute('aria-hidden','true'); clone.tabIndex=-1;
  ['backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat'].forEach(function(p){clone.style[p]=cs[p]});
  tr.appendChild(clone);
  var dots=document.createElement('div'); dots.className='dots'; tr.parentNode.insertBefore(dots,tr.nextSibling);
  function step(){return real[1].offsetLeft-real[0].offsetLeft}
  function go(i){tr.scrollTo({left:i*step(),behavior:'smooth'})}
  for(var k=0;k<n;k++){(function(i){
    var b=document.createElement('button'); b.type='button';
    b.setAttribute('aria-label','Go to slide '+(i+1));
    b.onclick=function(){go(i);restart()}; dots.appendChild(b);
  })(k)}
  function mark(){
    var s=step(); if(tr.scrollLeft>=n*s-2) tr.scrollLeft=0;
    cur=Math.round(tr.scrollLeft/s)%n;
    for(var k=0;k<n;k++) dots.children[k].classList.toggle('on',k===cur);
  }
  function stop(){clearInterval(timer)}
  function start(){
    stop();
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer=setInterval(function(){go(cur+1)},4000);
  }
  function restart(){stop();start()}
  var raf; tr.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(mark)},{passive:true});
  ['mouseenter','touchstart','focusin'].forEach(function(e){tr.addEventListener(e,stop,{passive:true})});
  ['mouseleave','touchend','focusout'].forEach(function(e){tr.addEventListener(e,start,{passive:true})});
  window.addEventListener('resize',mark);
  mark(); start();
}
loopCarousel('minCar');
