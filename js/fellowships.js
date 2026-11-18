(function () {
    'use strict';

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    function fail(container, msg) {
        container.innerHTML = '';
        container.appendChild(el('p', '', msg));
    }

    if (location.protocol === 'file:') {
        var c = document.getElementById('fellowships-grid') || document.getElementById('fellowship-detail');
        if (c) fail(c, 'This page loads content from a data file. Please view through a web server.');
        return;
    }

    fetch('data/fellowships.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            var gridContainer = document.getElementById('fellowships-grid');
            var detailContainer = document.getElementById('fellowship-detail');

            if (gridContainer) {
                renderGrid(gridContainer, data);
            } else if (detailContainer) {
                renderDetail(detailContainer, data);
            }
        })
        .catch(function () {
            var c = document.getElementById('fellowships-grid') || document.getElementById('fellowship-detail');
            if (c) fail(c, 'Sorry, the fellowships could not be loaded at this time.');
        });

    // --- Render Directory Grid ---
    function renderGrid(container, data) {
        container.innerHTML = '';
        data.forEach(function (fell) {
            var card = el('a', 'fellowship-card');
            card.href = 'fellowship.html?id=' + encodeURIComponent(fell.id);

            // Apply a bottom-only dark gradient + the image so text is readable
            if (fell.image) {
                card.style.background = "linear-gradient(to top, rgba(14,16,32,0.95) 0%, rgba(14,16,32,0) 65%), url('" + fell.image + "') center/cover";
            }

            var content = el('div', 'fellowship-content');

            // 1. Title
            content.appendChild(el('h3', '', fell.title));

            // 2. Short text from JSON
            if (fell.short) {
                content.appendChild(el('p', 'fellowship-short-text', fell.short));
            }

            // 3. Button
            var btn = el('span', 'btn-fellowship', 'Learn More');
            content.appendChild(btn);

            card.appendChild(content);
            container.appendChild(card);
        });
    }

    // --- Render Detail Page ---
    function renderDetail(container, data) {
        var id = new URLSearchParams(location.search).get('id');
        var fell = data.filter(function (x) { return x.id === id; })[0];

        if (!fell) {
            fail(container, 'Sorry, we could not find that fellowship.');
            return;
        }

        document.title = fell.title + ' | St. Stephen\'s Luzira C.O.U';
        document.getElementById('fellowship-hero-title').textContent = fell.title;
        document.getElementById('fellowship-hero-bread').textContent = fell.title;

        container.innerHTML = '';

        var textWrap = el('div', 'detail-text');

        // 1. Chairperson Profile
        if (fell.chairperson) {
            var profileCard = el('div', 'chairperson-profile');

            if (fell.chairperson_image) {
                var img = el('img', 'chairperson-img');
                img.src = fell.chairperson_image;
                img.alt = fell.chairperson;
                profileCard.appendChild(img);
            } else {
                var fallback = el('div', 'chairperson-img fallback');
                fallback.textContent = fell.chairperson.charAt(0);
                profileCard.appendChild(fallback);
            }

            var profileText = el('div', 'chairperson-text');
            profileText.appendChild(el('span', 'chairperson-role', 'Fellowship Chairperson'));
            profileText.appendChild(el('h3', 'chairperson-name', fell.chairperson));
            profileCard.appendChild(profileText);

            textWrap.appendChild(profileCard);
        }

        // 2. Content Blocks
        if (fell.content && fell.content.length) {
            fell.content.forEach(function (section) {
                if (section.heading) {
                    textWrap.appendChild(el('h3', 'section-heading', section.heading));
                }
                if (section.html) {
                    var block = el('div', 'section-block');
                    block.innerHTML = section.html;
                    textWrap.appendChild(block);
                }
            });
        }

        // Back Button
        var backBtn = el('a', 'btn line', '← Back to Fellowships');
        backBtn.href = 'fellowships.html';
        backBtn.style.marginTop = '40px';
        textWrap.appendChild(backBtn);

        // 3. Gallery
        var galleryWrap = el('div', 'detail-gallery-wrap');
        galleryWrap.appendChild(el('h3', 'gallery-heading', 'Fellowship Gallery'));

        var gallery = el('div', 'detail-gallery');
        if (fell.gallery && fell.gallery.length) {
            var images = fell.gallery.slice(0, 10);
            images.forEach(function (imgUrl) {
                var img = el('img');
                img.src = imgUrl;
                img.alt = fell.title + ' Gallery Photo';
                img.loading = 'lazy';
                gallery.appendChild(img);
            });
        } else {
            gallery.appendChild(el('p', '', 'No photos available.'));
        }
        galleryWrap.appendChild(gallery);

        container.appendChild(textWrap);
        container.appendChild(galleryWrap);
    }
})();