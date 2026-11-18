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
        var c = document.getElementById('departments-grid') || document.getElementById('department-detail');
        if (c) fail(c, 'This page loads content from a data file. Please view through a web server.');
        return;
    }

    fetch('data/departments.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            var gridContainer = document.getElementById('departments-grid');
            var detailContainer = document.getElementById('department-detail');

            if (gridContainer) {
                renderGrid(gridContainer, data);
            } else if (detailContainer) {
                renderDetail(detailContainer, data);
            }
        })
        .catch(function () {
            var c = document.getElementById('departments-grid') || document.getElementById('department-detail');
            if (c) fail(c, 'Sorry, the departments could not be loaded at this time.');
        });

    // --- Render Directory Grid ---
    function renderGrid(container, data) {
        container.innerHTML = '';
        data.forEach(function (dep) {
            var card = el('a', 'department-card');
            card.href = 'department.html?id=' + encodeURIComponent(dep.id);

            // Apply a bottom-only dark gradient + the image so the text is readable
            if (dep.image) {
                card.style.background = "linear-gradient(to top, rgba(14,16,32,0.95) 0%, rgba(14,16,32,0) 60%), url('" + dep.image + "') center/cover";
            }

            var content = el('div', 'department-content');

            // 1. Title
            content.appendChild(el('h3', '', dep.title));

            // 2. Short text from JSON
            if (dep.short) {
                var shortText = el('p', 'dept-short-text', dep.short);
                content.appendChild(shortText);
            }

            // 3. Button
            var btn = el('span', 'btn-department', 'View More');
            content.appendChild(btn);

            card.appendChild(content);
            container.appendChild(card);
        });
    }

    // --- Render Detail Page ---
    function renderDetail(container, data) {
        var id = new URLSearchParams(location.search).get('id');
        var dep = data.filter(function (x) { return x.id === id; })[0];

        if (!dep) {
            fail(container, 'Sorry, we could not find that department.');
            return;
        }

        // Update Page Title & Hero Text
        document.title = dep.title + ' | St. Stephen\'s Luzira C.O.U';
        document.getElementById('department-hero-title').textContent = dep.title;
        document.getElementById('department-hero-bread').textContent = dep.title;

        container.innerHTML = '';

        // Build the Text Content Area
        var textWrap = el('div', 'detail-text');

        // 1. Chairperson Profile Header (New Layout)
        if (dep.chairperson) {
            var profileCard = el('div', 'chairperson-profile');

            if (dep.chairperson_image) {
                var img = el('img', 'chairperson-img');
                img.src = dep.chairperson_image;
                img.alt = dep.chairperson;
                profileCard.appendChild(img);
            } else {
                // Fallback if no image is provided
                var fallback = el('div', 'chairperson-img fallback');
                fallback.textContent = dep.chairperson.charAt(0);
                profileCard.appendChild(fallback);
            }

            var profileText = el('div', 'chairperson-text');
            profileText.appendChild(el('span', 'chairperson-role', 'Department Chairperson'));
            profileText.appendChild(el('h3', 'chairperson-name', dep.chairperson));
            profileCard.appendChild(profileText);

            textWrap.appendChild(profileCard);
        }

        // 2. Content Blocks (Justified via CSS)
        if (dep.content && dep.content.length) {
            dep.content.forEach(function (section) {
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
        var backBtn = el('a', 'btn line', '← Back to Departments');
        backBtn.href = 'departments.html';
        backBtn.style.marginTop = '40px';
        textWrap.appendChild(backBtn);

        // Build the Gallery Area
        var galleryWrap = el('div', 'detail-gallery-wrap');
        galleryWrap.appendChild(el('h3', 'gallery-heading', 'Department Gallery'));

        var gallery = el('div', 'detail-gallery');
        if (dep.gallery && dep.gallery.length) {
            var images = dep.gallery.slice(0, 10); // Max 10 images
            images.forEach(function (imgUrl) {
                var img = el('img');
                img.src = imgUrl;
                img.alt = dep.title + ' Gallery Photo';
                img.loading = 'lazy';
                gallery.appendChild(img);
            });
        } else {
            gallery.appendChild(el('p', '', 'No photos available.'));
        }
        galleryWrap.appendChild(gallery);

        // Append Text and Gallery to the Main Container
        container.appendChild(textWrap);
        container.appendChild(galleryWrap);
    }
})();