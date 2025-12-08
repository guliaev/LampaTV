(function () {
    'use strict';

    // Телевизионный режим Lampa
    Lampa.Platform.tv();

    /**
     * Проверка, что плагин запущен в нужном origin.
     */
    function checkAccess() {
        if (Lampa.Manifest.origin !== 'bylampa') {
            Lampa.app.show('Ошибка доступа');
            return false;
        }
        return true;
    }

    /**
     * Вставка CSS со значками рейтингов и базовыми стилями.
     * В SVG оставлены те же data URI, что и в исходном коде.
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

/* Логотип вашего источника (bylampa / cub / lampa и т.п.) */
.rate--lampa .source--name,
.rate--bylampa .source--name,
.rate--cub .source--name {
    /* сюда подставьте нужный SVG data URI */
    background-image: url("image/svg+xml;..."); /* TMDB / свой логотип */
}

/* Иконка IMDb */
.rate--imdb > div:last-child {
    background-image: url("image/svg+xml;..."); /* квадратный логотип IMDb */
}

/* Иконка КиноПоиск / «оценка по шкале» */
.rate--kp > div:last-child {
    background-image: url("image/svg+xml;..."); /* жёлтая «полоска» рейтинга */
}

/* Иконка TMDB (градиентный текст TM / DB) */
.rate--tmdb .source--name {
    background-image: url("image/svg+xml;..."); /* градиентный TMDB */
}
        `.trim();

        if (style.styleSheet) {
            // IE-стиль (на всякий случай)
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    }

    /**
     * Определение цвета текста рейтинга по его значению.
     * Диапазоны взяты из оригинального кода.
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
     * Применяет цвета ко всем найденным элементам рейтинга.
     */
    function updateRatingsColors() {
        const cardVotes = document.querySelectorAll('.card__vote');
        const fullVotes = document.querySelectorAll('.full-start__rate > div:last-child, .info__rate > span');

        function paintNode(node) {
            const text = (node.textContent || '').trim();
            const value = parseFloat(text);
            const color = getRatingColor(value);

            if (color) {
                node.style.color = color;
            }
        }

        cardVotes.forEach(paintNode);
        fullVotes.forEach(paintNode);
    }

    /**
     * Настройка MutationObserver, чтобы обновлять цвета при изменениях DOM.
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
     * Основная инициализация плагина.
     */
    function init() {
        if (!checkAccess()) return;

        injectStyles();
        // Немного отложим первый прогон, чтобы Lampa успела отрисовать карточки
        setTimeout(updateRatingsColors, 500);
        observeDom();
    }

    // Если приложение уже готово – запускаем сразу,
    // иначе ждём события Lampa.Listener 'appready'
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
