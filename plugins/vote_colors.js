(function () {
    'use strict';

    // Режим TV для Lampa
    Lampa.Platform.tv();

    /**
     * Вставка CSS со значками рейтингов и базовыми стилями.
     * Обрати внимание: для inline-иконок используется URL.
     */
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

/* подпись источника рейтинга рядом с иконкой */
.full-start__rate .source--name {
    margin-left: 6px;
    font-size: 0;
}

/* ТВОЙ логотип / кастомный источник */
.rate--lampa .source--name,
.rate--bylampa .source--name,
.rate--cub .source--name {
    background-image: url("image/svg+xml;..."); 
}

/* Иконка IMDb */
.rate--imdb > div:last-child {
    background-image: url("image/svg+xml;...");
}

/* Иконка КиноПоиск */
.rate--kp > div:last-child {
    background-image: url("image/svg+xml;...");
}

/* Иконка TMDB */
.rate--tmdb .source--name {
    background-image: url("image/svg+xml;...");
}
        `.trim();

        if (style.styleSheet) {
            // старые браузеры (IE)
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    }

    /**
     * Возвращает цвет текста по значению рейтинга.
     */
    function getRatingColor(value) {
        if (isNaN(value)) return '';

        if (value >= 0 && value <= 3)   return '#e74c3c'; // красный
        if (value > 3 && value <= 5)   return '#e67e22'; // оранжевый
        if (value > 5 && value <= 6.5) return '#f1c40f'; // жёлтый
        if (value > 6.5 && value < 8)  return '#3498db'; // синий
        if (value >= 8 && value <= 10) return '#2ecc71'; // зелёный

        return '';
    }

    /**
     * Находит элементы рейтингов и красит их в зависимости от значения.
     */
    function updateRatingsColors() {
        const cardVotes = document.querySelectorAll('.card__vote');
        const fullVotes = document.querySelectorAll(
            '.full-start__rate > div:last-child, .info__rate > span'
        );

        const paintNode = (node) => {
            const text = (node.textContent || '').trim();
            const value = parseFloat(text);
            const color = getRatingColor(value);
            if (color) {
                node.style.color = color;
            }
        };

        cardVotes.forEach(paintNode);
        fullVotes.forEach(paintNode);
    }

    /**
     * Наблюдатель за изменениями DOM, чтобы цвета подтягивались
     * и на динамически подгружаемых карточках.
     */
    function observeDom() {
        const observer = new MutationObserver(() => {
            updateRatingsColors();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Основная инициализация.
     * Никаких проверок origin — код запускается в любой сборке.
     */
    function init() {
        injectStyles();
        // даём Lampa время нарисовать карточки
        setTimeout(updateRatingsColors, 500);
        observeDom();
    }

    // Если приложение уже готово – запускаем сразу,
    // иначе ждём системное событие Lampa.
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
