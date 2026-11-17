(function () {
    'use strict';

    var container = document.getElementById('evCar');
    if (!container) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    if (location.protocol === 'file:') {
        container.innerHTML = '<p style="color:white;">Requires a web server to load events.</p>';
        return;
    }

    fetch('data/events.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            // 1. Sort the events: Featured first, then chronological
            data.sort(function (a, b) {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(a.date) - new Date(b.date);
            });

            // 2. Limit to the top 5 events to keep the home page clean
            var displayEvents = data.slice(0, 5);

            container.innerHTML = '';

            // 3. Build the HTML for each flyer
            displayEvents.forEach(function (ev) {
                var card = el('a', 'flyer');
                card.href = ev.url || 'events.html';
                
                // Set dynamic background image if provided
                if (ev.image) {
                    card.style.background = "linear-gradient(180deg, transparent 30%, var(--purple) 100%), url('" + ev.image + "') center/cover, var(--purple)";
                }

                card.appendChild(el('b', '', ev.title));
                
                var timeStr = ev.time ? ev.time : new Date(ev.date).toLocaleDateString();
                card.appendChild(el('span', '', timeStr));

                container.appendChild(card);
            });

            // 4. Initialize the carousel slider now that the DOM elements exist
            if (typeof window.autoCarousel === 'function') {
                window.autoCarousel('evCar');
            }
        })
        .catch(function () {
            container.innerHTML = '<p style="color:white;">Events could not be loaded at this time.</p>';
        });
})();