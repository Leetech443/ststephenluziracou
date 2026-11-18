(function () {
    'use strict';

    var container = document.getElementById('services-container');
    if (!container) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    if (location.protocol === 'file:') {
        container.innerHTML = '<p>This page loads content from a data file. Please view through a web server.</p>';
        return;
    }

    fetch('data/services.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';

            // 1. Render Sunday Services
            if (data.sunday && data.sunday.length > 0) {
                container.appendChild(buildSection('Sunday Services', data.sunday));
            }

            // 2. Render Mid-week Services
            if (data.midweek && data.midweek.length > 0) {
                container.appendChild(buildSection('Mid-Week Services', data.midweek));
            }

            // 3. Render Special Services (ONLY if they exist)
            if (data.special && data.special.length > 0) {
                container.appendChild(buildSection('Special Services', data.special));
            }
        })
        .catch(function () {
            container.innerHTML = '<p>Sorry, the services could not be loaded at this time.</p>';
        });

    function buildSection(title, servicesArray) {
        var sectionWrap = el('div', 'service-category');

        // Header
        var header = el('div', 'service-header');
        header.appendChild(el('h2', '', title));
        sectionWrap.appendChild(header);

        // Grid of cards
        var grid = el('div', 'services-grid');
        
        servicesArray.forEach(function (svc) {
            var card = el('div', 'service-block');
            card.appendChild(el('h3', '', svc.title));
            card.appendChild(el('div', 'service-time', svc.time));
            card.appendChild(el('p', 'service-desc', svc.description));
            grid.appendChild(card);
        });

        sectionWrap.appendChild(grid);
        return sectionWrap;
    }
})();