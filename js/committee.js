(function () {
    'use strict';

    var container = document.getElementById('committee-grid');
    if (!container) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    if (location.protocol === 'file:') {
        container.innerHTML = '<p>This section loads content from a data file. Please view through a web server.</p>';
        return;
    }

    fetch('data/committee.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';
            
            data.forEach(function (member) {
                var card = el('div', 'committee-card');
                
                // Image
                var img = el('img');
                img.src = member.image || member.photo;
                img.alt = member.name;
                img.loading = 'lazy';
                card.appendChild(img);

                // Name
                card.appendChild(el('h3', '', member.name));
                
                // Role
                card.appendChild(el('span', '', member.role));

                // Read More Link
                var moreLink = el('a', 'more', 'View Profile →');
                moreLink.href = 'committee-profile.html?id=' + encodeURIComponent(member.id);
                card.appendChild(moreLink);

                container.appendChild(card);
            });
        })
        .catch(function () {
            container.innerHTML = '<p>Sorry, the committee members could not be loaded at this time.</p>';
        });
})();