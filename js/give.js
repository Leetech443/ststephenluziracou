(function () {
    'use strict';

    var container = document.getElementById('giving-container');
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

    fetch('data/giving.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
            container.innerHTML = '';

            // 1. Render Active Methods
            if (data.activeMethods && data.activeMethods.length > 0) {
                data.activeMethods.forEach(function (method) {
                    var block = el('div', 'giving-block');
                    
                    var header = el('div', 'giving-header');
                    header.appendChild(el('h3', '', method.name));
                    header.appendChild(el('span', 'badge-active', 'Active'));
                    block.appendChild(header);

                    var grid = el('div', 'giving-grid');

                    // Left Side: Details
                    var details = el('div', 'giving-details');
                    details.appendChild(el('p', 'detail-label', 'Account Name'));
                    details.appendChild(el('p', 'detail-value', method.accountName));
                    
                    details.appendChild(el('p', 'detail-label', 'Merchant Code'));
                    var codeBox = el('div', 'code-box');
                    codeBox.appendChild(el('span', 'code-text', method.merchantCode));
                    
                    var copyBtn = el('button', 'copy-btn', 'Copy');
                    copyBtn.onclick = function () {
                        navigator.clipboard.writeText(method.merchantCode);
                        copyBtn.textContent = 'Copied!';
                        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
                    };
                    codeBox.appendChild(copyBtn);
                    details.appendChild(codeBox);

                    grid.appendChild(details);

                    // Right Side: Instructions
                    var inst = el('div', 'giving-instructions');
                    inst.appendChild(el('h4', '', 'How to Give'));
                    var ol = el('ol', 'step-list');
                    method.instructions.forEach(function (step) {
                        var li = el('li');
                        li.innerHTML = step; // Using innerHTML to allow <strong> tags in JSON
                        ol.appendChild(li);
                    });
                    inst.appendChild(ol);
                    grid.appendChild(inst);

                    block.appendChild(grid);
                    container.appendChild(block);
                });
            }

            // 2. Render Future Methods
            if (data.futureMethods && data.futureMethods.length > 0) {
                var futureBlock = el('div', 'future-block');
                futureBlock.appendChild(el('h3', '', 'Coming Soon'));
                futureBlock.appendChild(el('p', 'future-sub', 'We are working hard to provide you with more convenient ways to give. Soon you will be able to give via:'));

                var futureGrid = el('div', 'future-grid');
                data.futureMethods.forEach(function (item) {
                    var tag = el('div', 'future-tag');
                    tag.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ' + item;
                    futureGrid.appendChild(tag);
                });
                futureBlock.appendChild(futureGrid);
                container.appendChild(futureBlock);
            }

        })
        .catch(function () {
            container.innerHTML = '<p>Sorry, the giving options could not be loaded at this time.</p>';
        });
})();