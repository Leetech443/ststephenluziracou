(function () {
    'use strict';

    var container = document.getElementById('events-container');
    if (!container) return;

    // State
    var allEvents = [];
    var currentView = 'list';
    var viewDate = new Date();
    var searchQuery = '';
    var isDropdownOpen = false;
    var miniCalDate = new Date();

    // Icons
    var iconSearch = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>';
    var iconLocation = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
    var iconFeatured = '<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--red)" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>';

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    function fail(msg) {
        container.innerHTML = '';
        container.appendChild(el('p', 'empty-state', msg));
    }

    if (location.protocol === 'file:') {
        fail('This page loads its content from a data file, so it must be opened through a web server.');
        return;
    }

    // --- Render Top Bar & Sub Nav ---
    function renderTopBar() {
        var bar = el('div', 'events-top-bar');

        // 1. Search Area
        var form = el('form', 'events-search');
        form.onsubmit = function (e) { e.preventDefault(); };
        
        var searchWrap = el('div', 'search-input-wrap');
        searchWrap.innerHTML = iconSearch;

        var input = el('input');
        input.type = 'text';
        input.placeholder = 'Search for events';
        input.value = searchQuery;
        input.oninput = function (e) { searchQuery = e.target.value.toLowerCase(); };
        input.onkeydown = function (e) {
            if (e.key === 'Enter') { e.preventDefault(); render(); }
        };
        
        searchWrap.appendChild(input);
        form.appendChild(searchWrap);
        bar.appendChild(form);

        // 2. Actions (Find Button + View Toggles)
        var actions = el('div', 'events-actions');

        var findBtn = el('button', 'btn btn-find', 'Find Events');
        findBtn.onclick = function (e) { e.preventDefault(); render(); };
        actions.appendChild(findBtn);

        var views = el('div', 'events-views');
        var btnList = el('button', 'view-btn' + (currentView === 'list' ? ' active' : ''), 'List');
        btnList.onclick = function () { currentView = 'list'; render(); };

        var btnMonth = el('button', 'view-btn' + (currentView === 'month' ? ' active' : ''), 'Month');
        btnMonth.onclick = function () { currentView = 'month'; render(); };

        var btnDay = el('button', 'view-btn' + (currentView === 'day' ? ' active' : ''), 'Day');
        btnDay.onclick = function () { currentView = 'day'; render(); };

        views.appendChild(btnList);
        views.appendChild(btnMonth);
        views.appendChild(btnDay);
        actions.appendChild(views);

        bar.appendChild(actions);
        return bar;
    }

    function renderSubNav() {
        var nav = el('div', 'events-sub-nav');

        // Arrows
        var arrows = el('div', 'nav-arrows');
        var prev = el('button'); 
        prev.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
        prev.onclick = function () {
            if (currentView === 'month') viewDate.setMonth(viewDate.getMonth() - 1);
            else viewDate.setDate(viewDate.getDate() - 1);
            render();
        };
        var next = el('button'); 
        next.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
        next.onclick = function () {
            if (currentView === 'month') viewDate.setMonth(viewDate.getMonth() + 1);
            else viewDate.setDate(viewDate.getDate() + 1);
            render();
        };
        arrows.appendChild(prev); arrows.appendChild(next);
        nav.appendChild(arrows);

        // Today Button
        var todayBtn = el('button', 'btn-today', 'Today');
        todayBtn.onclick = function () { viewDate = new Date(); miniCalDate = new Date(); render(); };
        nav.appendChild(todayBtn);

        // Dropdown Toggle
        var label = el('button', 'nav-dropdown');
        var text = 'Upcoming';
        if (currentView === 'month') text = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (currentView === 'day') text = viewDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });

        label.innerHTML = '<span>' + text + '</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

        // The Dropdown Wrapper
        var dropdownWrap = el('div', 'dropdown-wrap');
        dropdownWrap.appendChild(label);

        if (isDropdownOpen) {
            dropdownWrap.appendChild(buildMiniCalendar());
        }

        label.onclick = function (e) {
            e.stopPropagation();
            isDropdownOpen = !isDropdownOpen;
            render();
        };

        nav.appendChild(dropdownWrap);

        document.addEventListener('click', function closeDropdown(e) {
            if (isDropdownOpen && !dropdownWrap.contains(e.target)) {
                isDropdownOpen = false;
                render();
            }
        }, { once: true });

        return nav;
    }

    // --- Mini Calendar Dropdown Builder ---
    function buildMiniCalendar() {
        var wrap = el('div', 'mini-cal');
        var header = el('div', 'mini-cal-header');

        var prev = el('button');
        prev.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
        prev.onclick = function (e) { e.stopPropagation(); miniCalDate.setMonth(miniCalDate.getMonth() - 1); render(); };

        var next = el('button');
        next.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
        next.onclick = function (e) { e.stopPropagation(); miniCalDate.setMonth(miniCalDate.getMonth() + 1); render(); };

        var title = el('span');
        title.textContent = miniCalDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        header.appendChild(prev);
        header.appendChild(title);
        header.appendChild(next);
        wrap.appendChild(header);

        // Build the Grid
        var year = miniCalDate.getFullYear();
        var month = miniCalDate.getMonth();
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();

        var grid = el('div', 'mini-cal-grid');
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function(d) { grid.appendChild(el('div', 'mini-dow', d)); });

        // Empty cells
        for (var i = 0; i < firstDay; i++) {
            grid.appendChild(el('div', 'mini-day empty'));
        }

        // Day cells
        for (var day = 1; day <= daysInMonth; day++) {
            var cell = el('div', 'mini-day', day);
            
            var today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }

            cell.onclick = function (d) {
                return function (e) {
                    e.stopPropagation();
                    viewDate = new Date(year, month, d);
                    currentView = 'day';
                    isDropdownOpen = false;
                    render();
                };
            }(day);

            grid.appendChild(cell);
        }

        wrap.appendChild(grid);
        return wrap;
    }

    // --- Core Render Logic ---
    function buildEventRow(ev) {
        var d = new Date(ev.date);
        var article = el('article', 'event-row');

        var dateBox = el('div', 'event-date-box');
        dateBox.appendChild(el('span', 'event-day-str', d.toLocaleString('default', { weekday: 'short' }).toUpperCase()));
        dateBox.appendChild(el('span', 'event-day-num', d.getDate()));
        article.appendChild(dateBox);

        var contentWrap = el('div', 'event-content-wrap');
        var title = el('h4', 'event-title');
        var titleLink = el('a', null, ev.title);
        titleLink.href = ev.url || '#';
        title.appendChild(titleLink);
        contentWrap.appendChild(title);

        var meta = el('div', 'event-meta');
        if (ev.featured) {
            var featSpan = el('span', 'meta-item featured');
            featSpan.innerHTML = iconFeatured + ' Featured';
            meta.appendChild(featSpan);
        }
        if (ev.time) {
            var timeSpan = el('span', 'meta-item');
            timeSpan.textContent = ev.time;
            meta.appendChild(timeSpan);
        }
        contentWrap.appendChild(meta);

        var loc = el('div', 'event-location');
        loc.innerHTML = iconLocation + ' ' + ev.location;
        contentWrap.appendChild(loc);

        if (ev.excerpt) contentWrap.appendChild(el('p', 'event-excerpt', ev.excerpt));
        article.appendChild(contentWrap);

        var imgBox = el('div', 'event-img');
        imgBox.setAttribute('role', 'img');
        imgBox.setAttribute('aria-label', ev.title);
        if (ev.image) imgBox.style.backgroundImage = 'url("' + ev.image + '")';
        article.appendChild(imgBox);

        return article;
    }

    function getFilteredEvents() {
        return allEvents.filter(function (ev) {
            if (!searchQuery) return true;
            return ev.title.toLowerCase().includes(searchQuery) ||
                (ev.excerpt && ev.excerpt.toLowerCase().includes(searchQuery));
        }).sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    }

    function renderListView() {
        var wrap = el('div', 'events-list-wrap');
        var events = getFilteredEvents();

        if (!events.length) {
            wrap.appendChild(el('p', 'empty-state', 'No events found matching your criteria.'));
            return wrap;
        }

        var groups = {};
        events.forEach(function (ev) {
            var d = new Date(ev.date);
            var key = d.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
            if (!groups[key]) groups[key] = [];
            groups[key].push(ev);
        });

        for (var monthYear in groups) {
            wrap.appendChild(el('h3', 'event-month-sep', monthYear));
            groups[monthYear].forEach(function (ev) { wrap.appendChild(buildEventRow(ev)); });
        }
        return wrap;
    }

    function renderMonthView() {
        var wrap = el('div', 'calendar-wrap');
        var year = viewDate.getFullYear();
        var month = viewDate.getMonth();
        var events = getFilteredEvents();
        var grid = el('div', 'calendar-grid');

        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (day) {
            grid.appendChild(el('div', 'cal-header', day));
        });

        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();

        for (var i = 0; i < firstDay; i++) grid.appendChild(el('div', 'cal-day empty'));

        for (var day = 1; day <= daysInMonth; day++) {
            var dayCell = el('div', 'cal-day');
            dayCell.appendChild(el('span', 'cal-num', day));

            var dayEvents = events.filter(function (ev) {
                var d = new Date(ev.date);
                return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            });

            dayEvents.forEach(function (ev) {
                var chip = el('div', 'cal-event');
                chip.textContent = ev.title;
                chip.title = ev.title;
                dayCell.appendChild(chip);
            });

            grid.appendChild(dayCell);
        }

        wrap.appendChild(grid);
        return wrap;
    }

    function renderDayView() {
        var wrap = el('div', 'events-list-wrap');
        var events = getFilteredEvents();

        var dayEvents = events.filter(function (ev) {
            var d = new Date(ev.date);
            return d.getDate() === viewDate.getDate() &&
                d.getMonth() === viewDate.getMonth() &&
                d.getFullYear() === viewDate.getFullYear();
        });

        if (!dayEvents.length) {
            wrap.appendChild(el('p', 'empty-state', 'No events scheduled for this day.'));
            return wrap;
        }

        dayEvents.forEach(function (ev) { wrap.appendChild(buildEventRow(ev)); });
        return wrap;
    }

    function render() {
        container.innerHTML = '';
        container.appendChild(renderTopBar());
        container.appendChild(renderSubNav());

        if (currentView === 'list') container.appendChild(renderListView());
        else if (currentView === 'month') container.appendChild(renderMonthView());
        else if (currentView === 'day') container.appendChild(renderDayView());
    }

    // Init
    fetch('data/events.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) { allEvents = data || []; render(); })
        .catch(function () { fail('Sorry, the events could not be loaded.'); });
})();