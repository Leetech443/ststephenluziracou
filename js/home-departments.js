(function () {
    'use strict';

    var container = document.getElementById('minCar');
    if (!container) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    if (location.protocol === 'file:') {
        container.innerHTML = '<p style="color:white;">Requires a web server to load departments.</p>';
        return;
    }

    fetch('data/departments.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';

            // Slice to the first 5 departments for the home page carousel
            var displayDeps = data.slice(0, 5);

            displayDeps.forEach(function (dep) {
                // Create the card link
                var card = el('a', 'mc');
                card.href = 'department.html?id=' + encodeURIComponent(dep.id);
                
                // Apply the background image dynamically
                if (dep.image) {
                    card.style.background = "linear-gradient(180deg, transparent 30%, var(--purple) 100%), url('" + dep.image + "') center/cover, var(--purple)";
                }

                // Add the title
                card.appendChild(el('h3', '', dep.title));
                
                // Add the category label (defaults to 'Department' if not specified)
                var category = dep.category || 'Department';
                card.appendChild(el('span', '', category));

                container.appendChild(card);
            });

            // Initialize the looping carousel now that elements exist
            if (typeof window.loopCarousel === 'function') {
                window.loopCarousel('minCar');
            }
        })
        .catch(function () {
            container.innerHTML = '<p style="color:white;">Departments could not be loaded at this time.</p>';
        });
})();