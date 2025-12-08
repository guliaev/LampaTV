(function () {
    'use strict';

    Lampa.Platform.tv();

    function injectStyles() {
        const style = document.createElement('style');
        style.type = 'text/css';

        const baseSelectors = [
            '.full-start__rate > div:last-child',
            '.info__rate > span',
            '.card__vote'
        ].join(', ');

        const css = `
${baseSelectors} {
    margin-left: 6px;
    font-size: 0;
    display: inline-block;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    color: transparent;
}

@media (min-width: 481px) {
    ${baseSelectors} {
        width: 28px;
        height: 28px;
    }
}

.full-start__rate .source--name {
    margin-left: 6px;
    font-size: 0;
}

/* тут подставь свои URI как раньше */
.rate--lampa .source--name,
.rate--bylampa .source--name,
.rate--cub .source--name {
    background-image: url("image/svg+xml;..."); 
}

.rate--imdb > div:last-child {
    background-image: url("image/svg+xml;...");
}

.rate--kp > div:last-child {
    background-image: url("image/svg+xml;...");
}

.rate--tmdb .source--name {
    background-image: url("image/svg+xml;...");
}
        `.trim();

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    }

    function getRatingColor(value) {
        if (isNaN(value)) return '';

        if (value >= 0 && value <= 3)   return '#e74c3c';
        if (value > 3 && value <= 5)   return '#e67e22';
        if (value > 5 && value <= 6.5) return '#f1c40f';
        if (value > 6.5 && value < 8)  return '#3498db';
        if (value >= 8 && value <= 10) return '#2ecc71';

        return '';
    }

    function updateRatingsColors() {
        const cardVotes = document.querySelectorAll('.card__vote');
        const fullVotes = document.querySelectorAll('.full-start__rate > div:last-child, .info__rate > span');

        const paintNode = (node) => {
            const text = (node.textContent || '').trim();
            const value = parseFloat(text);
            const color = getRatingColor(value);
            if (color) node.style.color = color;
        };

        cardVotes.forEach(paintNode);
        fullVotes.forEach(paintNode);
    }

    function observeDom() {
        const observer = new MutationObserver(() => {
            updateRatingsColors();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        injectStyles();
        setTimeout(updateRatingsColors, 500);
        observeDom();
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('appready', (event) => {
            if (event.type === 'ready') {
                init();
            }
        });
    }
})();
