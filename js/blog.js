(function () {
    'use strict';
    var container = document.getElementById('blog-grid');
    if (!container) return;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    fetch('data/blog.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';
            data.forEach(function (post) {
                var card = el('div', 'blog-card');
                
                // 1. Image Wrapper & Image
                var imgWrap = el('a', 'blog-card-img-wrap');
                imgWrap.href = 'blog-post.html?id=' + encodeURIComponent(post.id);
                
                var img = el('img');
                img.src = post.image;
                img.alt = post.title;
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                
                card.appendChild(imgWrap);

                // 2. Content Area
                var content = el('div', 'blog-card-content');
                
                var meta = el('div', 'blog-card-meta');
                meta.appendChild(el('span', 'badge', post.category));
                meta.appendChild(el('span', 'date', post.date));
                content.appendChild(meta);

                var title = el('h3', 'blog-card-title');
                var titleLink = el('a', '', post.title);
                titleLink.href = 'blog-post.html?id=' + encodeURIComponent(post.id);
                title.appendChild(titleLink);
                content.appendChild(title);

                var more = el('a', 'blog-card-more', 'Read More');
                more.href = 'blog-post.html?id=' + encodeURIComponent(post.id);
                content.appendChild(more);

                card.appendChild(content);
                container.appendChild(card);
            });
        })
        .catch(function () {
            container.innerHTML = '<p>Sorry, articles could not be loaded.</p>';
        });
})();