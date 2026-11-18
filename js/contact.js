(function () {
    'use strict';

    var container = document.getElementById('staff-list');
    if (!container) return;

    var iconPhone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';
    var iconMail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>';

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    if (location.protocol === 'file:') {
        container.innerHTML = '<p>Requires a web server to load contacts.</p>';
        return;
    }

    fetch('data/staff.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';

            data.forEach(function (staff) {
                var card = el('div', 'staff-card');

                // Initial for Avatar
                var initial = staff.name.replace(/^(Rev\.|Ven\.|Mr\.|Mrs\.|Ms\.|Dr\.|Counsel|Arch\.|Eng\.|Owek\.|Mub\.)\s+/i, '').charAt(0);
                card.appendChild(el('div', 'staff-icon', initial));

                var info = el('div', 'staff-info');
                info.appendChild(el('h3', '', staff.name));
                info.appendChild(el('div', 'role', staff.role));

                // Phone
                if (staff.phone) {
                    var phoneItem = el('div', 'staff-contact-item');
                    phoneItem.innerHTML = iconPhone + ' <a href="tel:' + staff.phone.replace(/\s/g, '') + '">' + staff.phone + '</a>';
                    info.appendChild(phoneItem);
                }

                // Email
                if (staff.email) {
                    var emailItem = el('div', 'staff-contact-item');
                    emailItem.innerHTML = iconMail + ' <a href="mailto:' + staff.email + '">' + staff.email + '</a>';
                    info.appendChild(emailItem);
                }

                card.appendChild(info);
                container.appendChild(card);
            });
        })
        .catch(function () {
            container.innerHTML = '<p>Sorry, staff contacts could not be loaded at this time.</p>';
        });
})();