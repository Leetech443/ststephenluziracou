(function () {
    'use strict';

    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var closeBtn = document.querySelector('.lightbox-close');
    var galleryItems = document.querySelectorAll('.gallery-item img');

    if (!lightbox || !lightboxImg || !galleryItems.length) return;

    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.hidden = false;
        // Small delay to allow the hidden attribute to apply before adding the class for transition
        setTimeout(function () {
            lightbox.classList.add('open');
        }, 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        
        // Wait for transition to finish before hiding
        setTimeout(function () {
            lightbox.hidden = true;
            lightboxImg.src = '';
        }, 300);
    }

    galleryItems.forEach(function (img) {
        img.parentElement.addEventListener('click', function (e) {
            e.preventDefault();
            openLightbox(img.src, img.alt);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Close when clicking outside the image
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !lightbox.hidden) {
            closeLightbox();
        }
    });
})();