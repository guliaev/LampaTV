// rus_movie_main.js — упрощённый и отформатированный вариант
(function () {
    'use strict';

    Lampa.Platform.tv();

    const SOURCE_TMDB = 'tmdb';
    const TOGGLE_KEY  = 'rus_movie_main';

    // Простая проверка, что основной источник – TMDB
    function isTmdbSource() {
        return Lampa.Storage.get('source') === SOURCE_TMDB;
    }

    function todayISO() {
        return new Date().toISOString().slice(0, 10);
    }

    // Удобный хелпер для открытия категории
    function openCategory(params) {
        Lampa.Activity.push(Object.assign({
            component: 'category_full',
            source:    SOURCE_TMDB,
            card_type: 'true',
            page:      1
        }, params));
    }

    // Пункты меню в «Русском» (слева) и их параметры TMDB
    const MENU_ITEMS = [
        {
            title: 'Русские фильмы',
            build: () => openCategory({
                url: 'discover/movie?vote_average.gte=5&vote_average.lte=9.5'
                   + '&with_original_language=ru'
                   + '&sort_by=primary_release_date.desc'
                   + '&primary_release_date.lte=' + todayISO(),
                title: 'Русские фильмы'
            })
        },
        {
            title: 'Русские сериалы',
            build: () => openCategory({
                url: 'discover/tv?with_original_language=ru'
                   + '&sort_by=first_air_date.desc'
                   + '&air_date.lte=' + todayISO(),
                title: 'Русские сериалы'
            })
        },
        {
            title: 'Русские мультфильмы',
            build: () => openCategory({
                url: 'discover/movie?vote_average.gte=5&vote_average.lte=9.5'
                   + '&with_genres=16'
                   + '&with_original_language=ru'
                   + '&primary_release_date.lte=' + todayISO(),
                title: 'Русские мультфильмы'
            })
        },

        // Ниже – витрины онлайн‑кинотеатров по их TMDB network_id.
        // ID возьми из оригинального плагина, здесь показан шаблон.
        {
            title: 'Start',
            build: () => openCategory({
                url:      'discover/tv?with_networks=2493'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'Start',
                networks: '2493'
            })
        },
        {
            title: 'Premier',
            build: () => openCategory({
                url:      'discover/tv?with_networks=5806'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'Premier',
                networks: '5806'
            })
        },
        {
            title: 'KION',
            build: () => openCategory({
                url:      'discover/tv?with_networks=4085'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'KION',
                networks: '4085'
            })
        },
        {
            title: 'IVI',
            build: () => openCategory({
                url:      'discover/tv?with_networks=1191'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'IVI',
                networks: '1191'
            })
        },
        {
            title: 'Okko',
            build: () => openCategory({
                url:      'discover/tv?with_networks=3871'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'Okko',
                networks: '3871'
            })
        },
        {
            title: 'КиноПоиск',
            build: () => openCategory({
                url:      'discover/tv?with_networks=2859'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'КиноПоиск',
                networks: '2859'
            })
        },
        {
            title: 'Wink',
            build: () => openCategory({
                url:      'discover/tv?with_networks=3923'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'Wink',
                networks: '3923'
            })
        },
        {
            title: 'СТС',
            build: () => openCategory({
                url:      'discover/tv?with_networks=806'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'СТС',
                networks: '806'
            })
        },
        {
            title: 'ТНТ',
            build: () => openCategory({
                url:      'discover/tv?with_networks=4085'
                        + '&sort_by=first_air_date.desc'
                        + '&air_date.lte=' + todayISO(),
                title:    'ТНТ',
                networks: '4085'
            })
        }
    ];

    // Кнопка в настройках (слева в меню)
    function registerSettingsFolder() {
        const manifestName = 'rus_movie_main';

        const $folder = $(`
            <div class="settings-folder" data-name="${manifestName}">
                <!-- здесь можно вставить любой SVG‑иконку -->
                <div style="width:2.2em;height:1.7em;padding-right:.5em">
                    <!-- SVG -->
                </div>
                <div style="font-size:1.3em">Русское</div>
            </div>
        `);

        $folder.on('hover:enter', () => {
            Lampa.Select.show({
                title: Lampa.Lang.translate('Русские новинки'),
                items: MENU_ITEMS.map(i => ({ title: i.title })),
                onSelect(item) {
                    const found = MENU_ITEMS.find(i => i.title === item.title);
                    if (found) found.build();
                },
                onBack() {
                    Lampa.Controller.back();
                }
            });
        });

        $('.settings-folder').eq(0).append($folder);
    }

    // Источник для TMDB, который собирает ленты для главной
    function RusMovieMainSource(manifest) {
        const request = new Lampa.Reguest();

        this.main = function (start, done, fail) {
            const date = todayISO();
            const tasks = [];

            // Сейчас в плагине много таких блоков, ниже пара примеров.

            // «Сейчас в кино»
            tasks.push(cb => {
                request.get('movie/now_playing', manifest, res => {
                    res.title      = Lampa.Lang.translate('title_now_watch');
                    res.collection = true;
                    res.line_type  = 'collection';
                    cb(res);
                }, cb);
            });

            // «Популярное за неделю»
            tasks.push(cb => {
                request.get('trending/all/week', manifest, res => {
                    res.title = Lampa.Lang.translate('title_trend_week');
                    cb(res);
                }, cb);
            });

            // «Русские фильмы» (пример промо‑витрины)
            tasks.push(cb => {
                request.get(
                    'discover/movie?vote_average.gte=5&vote_average.lte=9.5'
                    + '&with_original_language=ru'
                    + '&sort_by=primary_release_date.desc'
                    + '&primary_release_date.lte=' + date,
                    manifest,
                    res => {
                        res.title = Lampa.Lang.translate('Русские фильмы');
                        res.small = true;
                        res.wide  = true;
                        res.results.forEach(m => {
                            m.promo       = m.promo_title;
                            m.displayName = m.title || m.name;
                        });
                        cb(res);
                    },
                    cb
                );
            });

            // В оригинале ещё блоки по жанрам, по сервисам (Start, IVI и т.п.),
            // а также цикл по жанрам из manifest.genres.movies – их можно
            // добавить аналогичными request.get(...) в массив tasks.

            const limit = 6; // сколько витрин грузить за раз
            Lampa.Api.insert(tasks, limit, start, fail);
        };
    }

    // Инициализация всего плагина
    function init() {
        if (!isTmdbSource()) {
            Lampa.Noty.show('Плагин «Русские новинки» работает только с источником TMDB.');
            return;
        }

        if (Lampa.Storage.get(TOGGLE_KEY) !== false) {
            // Регистрируем источник TMDB
            Lampa.Api.sources.tmdb = new RusMovieMainSource(Lampa.Api.sources.tmdb);
            // Добавляем папку в настройки
            registerSettingsFolder();
        }
    }

    // Пункт в «Настройки → Остальное»
    Lampa.Manifest.field({
        component: 'interface',
        param: {
            name:    TOGGLE_KEY,
            type:    'toggle',
            default: true
        },
        field: {
            name:        'Русские новинки на главной',
            description: 'Показывать подборки русских новинок на главной странице. '
                       + 'После изменения параметра приложение нужно перезапустить (работает только с TMDB).'
        },
        onRender() {
            // В оригинале тут элемент немного двигают/подсвечивают
            // при помощи jQuery, при желании можно повторить.
        }
    });

    // Ждём готовности приложения
    if (window.app) {
        init();
    } else {
        Lampa.Listener.follow('ready', e => {
            if (e.name === 'app') init();
        });
    }
})();
