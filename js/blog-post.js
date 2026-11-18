(function () {
    'use strict';
    var id = new URLSearchParams(location.search).get('id');
    
    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    fetch('data/blog.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            var post = data.filter(function (x) { return x.id === id; })[0];
            if (!post) return;

            document.title = post.title + ' | St. Stephen\'s Luzira C.O.U';
            
            document.getElementById('post-category').textContent = post.category;
            document.getElementById('post-title').textContent = post.title;
            document.getElementById('post-author').textContent = post.author;
            document.getElementById('post-date').textContent = post.date;
            
            // Avatar initial
            document.getElementById('post-avatar').textContent = post.author.charAt(0);

            var img = document.getElementById('post-hero-img');
            img.src = post.image;
            img.alt = post.title;

            var content = document.getElementById('post-content');
            content.innerHTML = post.content;
        })
        .catch(function () {
            document.getElementById('post-title').textContent = "Article not found.";
        });
})();