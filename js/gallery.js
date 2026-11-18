(function () {
    'use strict';

    var container = document.getElementById('gallery-container');
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var closeBtn = document.querySelector('.lightbox-close');

    if (!container) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    // --- Lightbox Logic ---
    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.hidden = false;
        setTimeout(function () {
            lightbox.classList.add('open');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () {
            lightbox.hidden = true;
            lightboxImg.src = '';
        }, 300);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });

    // --- Fetch and Render Gallery ---
    if (location.protocol === 'file:') {
        container.innerHTML = '<p>This page loads content from a data file. Please view through a web server.</p>';
        return;
    }

    fetch('data/gallery.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';

            data.forEach(function (album) {
                var albumSection = el('div', 'album-section');

                // Header for the Event
                var albumHeader = el('div', 'album-header');
                albumHeader.appendChild(el('h2', 'album-title', album.event));
                albumHeader.appendChild(el('span', 'album-date', album.date));
                if (album.description) {
                    albumHeader.appendChild(el('p', 'album-desc', album.description));
                }
                albumSection.appendChild(albumHeader);

                // Image Grid
                var grid = el('div', 'album-grid');
                album.images.forEach(function (imgSrc, index) {
                    var imgWrap = el('button', 'album-img-wrap');
                    imgWrap.setAttribute('aria-label', 'View image ' + (index + 1) + ' from ' + album.event);
                    
                    var img = el('img');
                    img.src = imgSrc;
                    img.alt = album.event + ' photo ' + (index + 1);
                    img.loading = 'lazy';
                    
                    imgWrap.appendChild(img);
                    
                    imgWrap.onclick = function () {
                        openLightbox(imgSrc, img.alt);
                    };
                    
                    grid.appendChild(imgWrap);
                });
                albumSection.appendChild(grid);

                container.appendChild(albumSection);
            });
        })
        .catch(function () {
            container.innerHTML = '<p>Sorry, the gallery could not be loaded at this time.</p>';
        });
})();