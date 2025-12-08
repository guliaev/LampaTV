(function() {
    'use strict';

    Lampa.Platform.tv();

    // Константы строк
    const STRINGS = {
        NOVINKI: 'Новинки',
        PREMIERY: 'Премьеры',
        SERIALY: 'Сериалы',
        PREMIER: 'Premier',
        KION: 'KION',
        START: 'Start',
        IVI: 'ИВИ',
        OKKO: 'Okko',
        WINK: 'Wink',
        STS: 'СТС',
        TNT: 'ТНТ',
        KINOPOISK: 'КиноПоиск',
        // ... другие
        TITLE_RUS_FILMY: 'Русские фильмы',
        TITLE_RUS_SERIALY: 'Русские сериалы',
        ERROR_PLATFORM: 'Плагин работает только на ТВ платформе',
        IMG_BROKEN: './img/img_broken.svg'
    };

    // ID сетей TMDB (реальные значения из кода)
    const NETWORK_IDS = {
        PREMIER: 219,
        KION: 3871,  // из кода _0x24a ?
        START: 2493,
        IVI: 3827,
        OKKO: 4085,
        WINK: 2859,
        STS: 806,
        TNT: 5806  // пример, уточнить по TMDB
        // Дополнить по необходимости
    };

    // Элемент меню
    const MENU_ICON = `
        <div class="settings-folder" style="padding:0!important">
            <div style="width:2.2em;height:1.7em;padding-right:.5em">
                <!-- SVG иконка для русских фильмов/сериалов -->
                <svg>...</svg>
            </div>
            <div style="font-size:1.3em">Русские фильмы</div>
        </div>
    `;

    // Объект пунктов меню с network_id
    const MENU_ITEMS = [
        { title: STRINGS.NOVINKI, url: `discover/tv?primary_release_date.lte=${getCurrentYear()}&sort_by=primary_release_date.desc`, component: 'category_full', card_type: true },
        { title: STRINGS.PREMIERY, url: `discover/tv?first_air_date.lte=${getCurrentYear()}&sort_by=first_air_date.desc`, component: 'category_full', card_type: true },
        { title: STRINGS.SERIALY, url: `discover/tv?${getCurrentYear()}`, component: 'catalog', source: 'tmdb' },
        { title: STRINGS.PREMIER, url: `discover/tv?networks=${NETWORK_IDS.PREMIER}&sort_by=first_air_date.desc&air_date.lte=${getCurrentYear()}`, networks: NETWORK_IDS.PREMIER },
        { title: STRINGS.KION, url: `discover/tv?networks=${NETWORK_IDS.KION}&sort_by=revenue.desc&air_date.lte=${getCurrentYear()}`, networks: NETWORK_IDS.KION },
        // ... остальные пункты аналогично: Start, IVI, Okko, Wink, STS, TNT, Kinopoisk
        { title: STRINGS.KINOPOISK, url: `discover/tv?networks=...&sort_by=first_air_date.desc&air_date.lte=${getCurrentYear()}`, networks: NETWORK_IDS.KINOPOISK }
    ];

    function getCurrentYear() {
        return new Date().toISOString().substr(0, 10);
    }

    function initMenu() {
        if (Lampa.Worker.is_app !== 'web') {
            Lampa.Noty.show(STRINGS.ERROR_PLATFORM);
            return;
        }

        const $menuBtn = $(MENU_ICON);
        $('.settings:eq(0)').append($menuBtn);

        $menuBtn.on('hover:enter', () => {
            Lampa.Select.show({
                title: Lampa.Lang.translate('menu_rus'),
                items: MENU_ITEMS,
                onSelect: (item) => {
                    Lampa.Activity.push({
                        url: item.url,
                        title: item.title,
                        component: item.component || 'catalog',
                        source: 'tmdb',
                        card_type: item.card_type || true,
                        page: 1,
                        sort_by: item.sort_by || 'first_air_date.desc'
                    });
                },
                onBack: () => {
                    Lampa.Activity.back();
                }
            });
        });
    }

    // Рефакторинг card_episode для баннера/постера/текста
    class CardEpisode {
        constructor(data) {
            this.data = data || data.card || data;
            this.data.source = this.data.source || 'tmdb';
            Lampa.TMDB.api_clear();
            Lampa.TMDB.api_movie(this.data);
            this.data.release_year = (this.data.release_date || '0000').slice(0, 4);
        }

        create() {
            this.card = Lampa.Template.get('card', {});  // или custom template
            this.img_poster = this.card.querySelector('.card__img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img') || {};
            this.card.querySelector('.card__title').innerText = this.data.title;
            this.card.querySelectorAll('.card__network')[0].innerText = this.data.name || '';
            // Улучшения: баннер, постер, текст эпизода
            if (this.data.episode_data && this.data.episode_data.name) {
                this.card.querySelector('.full-episode__title').innerText = this.data.episode_data.name;
                this.card.querySelector('.full-episode__num').innerText = this.data.episode_data.episode_number || '';
                this.card.querySelector('.full-episode__date').innerText = this.data.episode_data.air_date ? Lampa.Date.parse(this.data.episode_data.air_date).toDate() : '----';
            }
            if (this.data.release_year == '0000') {
                this.card.querySelector('.card__age').remove();
            } else {
                this.card.querySelector('.card__age').innerText = this.data.release_year;
            }
            this.card.render(true, Lampa.TM.is_visible(this));
            return this;
        }

        // Методы onEnter, destroy, etc. аналогично оригиналу, но чище
        onEnter() { /* логика */ }
        destroy() { /* очистка */ }
    }

    // Основной компонент RusMovieMain
    class RusMovieMain {
        constructor() {
            this.view = new Lampa.Empty();
            this.main();  // Перенос request.get в main
        }

        main(params = {}, next = null, call = null, total = 6) {
            const year = getCurrentYear();
            const categories = [
                // Функции для now_playing, timetable, upcoming, etc.
                (cb) => Lampa.Api.get(`movie/now_playing`, params, (data) => {
                    data.title = Lampa.Lang.translate('title_now_watch');
                    data.card_type = 'collection';
                    cb(data);
                }, cb),
                (cb) => cb({ source: 'tmdb', results: Lampa.TimeTable.get()[].slice(0,20), title: Lampa.Lang.translate('title_timetable'), nomore: true, cardClass: CardEpisode }),
                // ... все 20+ категорий из кода, с рандомизацией дат, жанров (16=анимация), etc.
                // Русские фильмы, сериалы, мультфильмы по языку ru, genres=16
                (cb) => Lampa.Api.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${year}`, params, (data) => {
                    data.title = Lampa.Lang.translate('rus_films');
                    data.small = data.wide = true;
                    data.results.forEach(item => {
                        item.promo_title = item.title;
                        item.title = item.name || item.title;
                    });
                    cb(data);
                }, cb)
            ];

            // Динамически добавляем жанры
            Lampa.Api.genres.genres.forEach(genre => {
                categories.push((cb) => {
                    Lampa.Api.get(`discover/movie?with_genres=${genre.id}`, params, (data) => {
                        data.title = Lampa.Lang.translate(genre.name.replace(/[^a-z_]/g, ''));
                        cb(data);
                    }, cb);
                });
            });

            Lampa.Api.partNext(categories, 0, Lampa.Api.partPersons(categories, total, true, categories.length + 1));
            if (next) next(call);
        }
    }

    // Регистрация компонента
    if (Lampa.Storage.get('source') !== false) {
        Object.assign(Lampa.Api.sources.tmdb, new RusMovieMain(Lampa.Api.sources.tmdb));
    }

    // Добавление в интерфейс
    Lampa.Interfaces.add('interface', {
        component: 'interface',
        param: {
            name: 'rus_movie_main',
            type: 'settings',
            'default': true
        },
        field: {
            name: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)',
        },
        onRender: () => {
            setTimeout(() => {
                $('div[data-name="rus_movie_main"]').removeClass('hide');
            }, 0);
        }
    });

    // Инициализация
    if (window.AppReady) initMenu();
    else Lampa.Listener.follow('AppReady', (e) => { if (e.type == 'ready') initMenu(); });

})();
