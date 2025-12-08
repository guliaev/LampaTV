(function () {
    'use strict';

    Lampa.Platform.tv();

    const SETTING_KEY = 'color_ratings_enabled';

    /**
     * Текущее состояние флага «цветные рейтинги».
     * В хранилище лежит строка 'true' / 'false'.
     */
    function isColorsEnabled() {
        const stored = Lampa.Storage.get(SETTING_KEY, 'true');
        return stored === 'true';
    }

    /**
     * Зарегистрировать пункт в настройках (пример).
     * Если API в твоей сборке отличается, адаптируй объект под свою Lampa.
     */
    function registerSetting() {
        if (!Lampa.Settings || !Lampa.Settings.add) return;

        Lampa.Settings.add({
            // отображаемое имя
            title: 'Цветные рейтинги',
            // в каком разделе показывать (часто используют 'plugins' или 'parser')
            component: 'plugins',
            // внутреннее имя настройки
            name: 'color_ratings_enabled',
            // произвольная категория/группа
            category: 'interface',
            // тип — переключатель / список, зависит от реализации Settings
            type: 'toggle',
            values: [
                { title: 'Включено',  value: 'true'  },
                { title: 'Выключено', value: 'false' }
            ],
            default: 'true',
            onChange: function (value) {
                // сохраняем флаг
                Lampa.Storage.set(SETTING_KEY, value);
                // тут можно добавить Lampa.Noty.show('Перезапустите Lampa для применения');
            }
        });

        // чтобы изменения отобразились в UI
        if (Lampa.Settings.update) Lampa.Settings.update();
    }

    /**
     * Вставка CSS со значками рейтингов и базовыми стилями.
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

/* сюда подставь свои реальные image/svg+xml,... из исходника */

/* Твой логотип / кастомный источник */
.rate--lampa .source--name,
.rate--bylampa .source--name,
.rate--cub .source--name {
    background-image: url("image/svg+xml,...");
}

/* Иконка IMDb */
.rate--imdb > div:last-child {
    background-image: url("image/svg+xml,...");
}

/* Иконка КиноПоиск */
.rate--kp > div:last-child {
    background-image: url("image/svg+xml,...");
}

/* Иконка TMDB */
.rate--tmdb .source--name {
    background-image: url("image/svg+xml,...");
}
        `.trim();

        if (style.styleSheet) {
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

        if (value >= 0 && value <= 3)   return '#e74c3c';
        if (value > 3 && value <= 5)   return '#e67e22';
        if (value > 5 && value <= 6.5) return '#f1c40f';
        if (value > 6.5 && value < 8)  return '#3498db';
        if (value >= 8 && value <= 10) return '#2ecc71';

        return '';
    }

    /**
     * Красит все найденные элементы рейтингов.
     */
    function updateRatingsColors() {
        if (!isColorsEnabled()) return;

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
     * Наблюдатель за DOM — обновляет цвета на динамически добавленных карточках.
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
     */
    function init() {
        registerSetting(); // просто регистрирует пункт в настройках

        // если пользователь выключил — ничего не делаем
        if (!isColorsEnabled()) return;

        injectStyles();
        setTimeout(updateRatingsColors, 500);
        observeDom();
    }

    if
