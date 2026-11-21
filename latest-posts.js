/* Carosello "ultimi post" — legge blog.html (fonte unica) e mostra i primi 5.
   Aggiungi un nuovo post in cima a blog.html e compare da solo in home. */
(function () {
    var MAX = 5;
    var section = document.getElementById('latest');
    var box = document.getElementById('latestCarousel');
    var track = document.getElementById('latestTrack');
    var prev = document.getElementById('latestPrev');
    var next = document.getElementById('latestNext');
    if (!section || !track) return;

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }

    function parse(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var base = new URL('blog.html', location.href);
        return Array.prototype.slice.call(doc.querySelectorAll('.lab-card')).map(function (card) {
            var h3 = card.querySelector('h3');
            var a = card.querySelector('.lab-card-link');
            if (!h3 || !a) return null;
            var title = Array.prototype.filter.call(h3.childNodes, function (n) { return n.nodeType === 3; })
                .map(function (n) { return n.textContent; }).join('').trim();
            var badge = h3.querySelector('.status-tag');
            var chips = Array.prototype.map.call(card.querySelectorAll('.stack-tags span'), function (s) { return s.textContent.trim(); });
            var p = card.querySelector('p');
            return {
                title: title,
                desc: p ? p.textContent.trim() : '',
                date: chips[0] || '',
                tags: chips.slice(1, 3),
                badge: badge ? badge.textContent.trim() : '',
                href: new URL(a.getAttribute('href'), base).href
            };
        }).filter(Boolean).slice(0, MAX);
    }

    function render(posts) {
        posts.forEach(function (p) {
            var card = el('a', 'post-card');
            card.href = p.href;
            var meta = el('div', 'post-meta');
            if (p.date) meta.appendChild(el('span', '', p.date));
            if (p.badge) meta.appendChild(el('span', 'post-badge', p.badge));
            card.appendChild(meta);
            card.appendChild(el('h3', '', p.title));
            if (p.desc) card.appendChild(el('p', '', p.desc));
            var foot = el('div', 'post-foot');
            var tags = el('div', 'stack-tags');
            p.tags.forEach(function (t) { tags.appendChild(el('span', '', t)); });
            foot.appendChild(tags);
            foot.appendChild(el('span', 'post-read'));
            card.appendChild(foot);
            track.appendChild(card);
        });
    }

    function update() {
        var max = track.scrollWidth - track.clientWidth;
        var start = track.scrollLeft <= 2;
        var end = track.scrollLeft >= max - 2;
        box.classList.toggle('is-start', start);
        box.classList.toggle('is-end', end);
        section.classList.toggle('no-scroll', max <= 2);
        if (prev) prev.disabled = start;
        if (next) next.disabled = end;
    }

    function step(dir) {
        var c = track.firstElementChild;
        var w = c ? c.getBoundingClientRect().width + 16 : 300;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }

    fetch('blog.html', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) {
            var posts = parse(html);
            if (!posts.length) return;
            render(posts);
            section.hidden = false;
            update();
            track.addEventListener('scroll', update, { passive: true });
            window.addEventListener('resize', update);
            if (prev) prev.addEventListener('click', function () { step(-1); });
            if (next) next.addEventListener('click', function () { step(1); });
        })
        .catch(function () { /* se blog.html non è raggiungibile la section resta nascosta */ });
})();