(function () {
    'use strict';

    // Для TV-режима
    Lampa.Platform.tv();

    /**
     * Карточка эпизода / элемента (упрощённый, читаемый аналог _0x2786cb)
     */
    function RusEpisodeCard(item, episode) {
        const data = item || {};
        const episodeData = episode || {};

        // Источник по умолчанию — tmdb
        if (data.source == null) {
            data.source = 'tmdb';
        }

        // Подготовка служебной инфы (год, локализация и т.п.)
        Lampa.Info.build(data, {
            title: data.title,
            original_title: data.original_name,
            release_date: data.release_date
        });

        // Год релиза
        data.release_year = String(data.release_date || '0000').slice(0, 4);

        // Удаление узла, если он не нужен
        function safeRemove(el) {
            if (el && el.remove) el.remove();
        }

        // Создание DOM карточки по шаблону
        this.create = function () {
            this.card = Lampa.Template.js('card_episode');
            this.img_poster = this.card.querySelector('.card__img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img') || {};

            // Заголовок
            this.card.querySelector('.card__title').innerText = data.title;
            // Описание
            this.card.querySelector('.card__subtitle').innerText = data.overview || '';

            // Если передали данные эпизода — заполняем их
            if (episodeData && episodeData.air_date) {
                this.card.querySelector('.full-episode__title').innerText =
                    episodeData.title || Lampa.Lang.translate('noname');
                this.card.querySelector('.full-episode__num').innerText =
                    episodeData.episode_number || '';
                this.card.querySelector('.full-episode__date').innerText =
                    episodeData.air_date
                        ? Lampa.Time.parseTime(episodeData.air_date).full
                        : '----';
            }

            // Возрастной рейтинг или скрытие блока
            if (data.release_year === '0000') {
                safeRemove(this.card.querySelector('.card__age'));
            } else {
                this.card.querySelector('.card__age').innerText = data.release_year;
            }

            // Подписка на события
            this.card.addEventListener('visible', this.visible.bind(this));

            return this.card;
        };

        // Загрузка постеров и обработка ошибок
        this.loadImages = function () {
            const imgPoster = this.img_poster;
            const imgEpisode = this.img_episode;
            const broken = './img/img_broken.svg';

            // Постер
            imgPoster.onerror = function () {};
            imgPoster.onload = function () {};
            if (data.poster_path) {
                imgPoster.src = Lampa.Api.img(data.poster_path);
            } else if (data.profile_path) {
                imgPoster.src = Lampa.Api.img(data.profile_path);
            } else if (data.poster) {
                imgPoster.src = data.poster;
            } else if (data.img) {
                imgPoster.src = data.img;
            } else {
                imgPoster.src = broken;
            }

            // Кадр
            imgEpisode.onerror = function () {
                const bg = this.card.querySelector('.full-episode__img');
                if (bg && bg.classList) {
                    bg.classList.add('img_broken');
                }
            }.bind(this);

            imgEpisode.onload = function () {
                imgEpisode.src = broken;
            };

            if (episodeData.still_path) {
                imgEpisode.src = Lampa.Api.img(episodeData.still_path, 'w300');
            } else if (data.backdrop_path) {
                imgEpisode.src = Lampa.Api.img(data.backdrop_path, 'w300');
            } else if (episodeData.img) {
                imgEpisode.src = episodeData.img;
            } else if (data.img) {
                imgEpisode.src = data.img;
            } else {
                imgEpisode.src = broken;
            }

            if (this.onVisible) {
                this.onVisible(this.card, data);
            }
        };

        // Инициализация / привязка обработчиков
        this.build = function () {
            this.create();

            this.card.addEventListener('hover:enter', () => {
                if (this.onEnter) this.onEnter(this.card, data);
            });

            this.card.addEventListener('hover:hover', () => {
                if (this.onFocus) this.onFocus(this.card, data);
            });

            this.card.addEventListener('hover:focus', () => {
                if (this.onFocus) this.onFocus(this.card, data);
            });

            this.loadImages();
            return this.card;
        };

        // Уничтожение
        this.destroy = function () {
            if (!this.card) return;

            this.img_poster.onerror = null;
            this.img_poster.onload = null;
            this.img_episode.onerror = null;
            this.img_episode.onload = null;

            this.img_poster.src = '';
            this.img_episode.src = '';

            safeRemove(this.card);
            this.card = null;
            this.img_poster = null;
            this.img_episode = null;
        };

        this.getCard = function (asNode) {
            return asNode ? this.card : $(this.card);
        };
    }

    /**
     * Основной источник «Русские новинки» (аналог _0x11cb3c)
     * Оборачивает tmdb-источник и добавляет свои подборки.
     */
    function RusMovieMainSource(baseSource) {
        this.request = new Lampa.Reguest();

        /**
         * Главный метод: наполняет главную экраном блоками русских фильмов/сериалов.
         * params – параметры запроса TMDB
         * onReady – коллбек, когда данные загружены
         * onEnd – коллбек по завершении
         */
        this.main = function main(params = {}, onReady, onEnd) {
            const today = new Date().toISOString().substr(0, 10);

            // Набор функций-загрузчиков блоков (по смыслу совпадает с оригиналом)
            const loaders = [];

            // Сейчас смотрят (кино)
            loaders.push(cb => {
                this.get('movie/now_playing', params, data => {
                    data.title = Lampa.Lang.translate('title_now_watch');
                    data.nomore = true;
                    data.line_type = 'collection';
                    cb(data);
                }, cb);
            });

            // Расписание по TimeTable (локальные данные Lampa)
            loaders.push(cb => {
                cb({
                    source: 'tmdb',
                    results: Lampa.TimeTable.get().slice(0, 20),
                    title: Lampa.Lang.translate('title_upcoming_episodes'),
                    nomore: true,
                    cardClass: (item, ep) => new RusEpisodeCard(item, ep)
                });
            });

            // Тренды за день (все)
            loaders.push(cb => {
                this.get('trending/all/day', params, data => {
                    data.title = Lampa.Lang.translate('title_trend_day');
                    cb(data);
                }, cb);
            });

            // Тренды за неделю (все)
            loaders.push(cb => {
                this.get('trending/all/week', params, data => {
                    data.title = Lampa.Lang.translate('title_upcoming');
                    cb(data);
                }, cb);
            });

            // Русские фильмы (discover/movie, ru, рейтинг 5–9.5)
            loaders.push(cb => {
                const url =
                    'discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru' +
                    '&sort_by=primary_release_date.desc&primary_release_date.lte=' + today;
                this.get(url, params, data => {
                    data.title = Lampa.Lang.translate('Подборки русских фильмов');
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(it => {
                        it.promo = it.promo_title;
                        it.card_title = it.title || it.name;
                    });
                    cb(data);
                }, cb);
            });

            // Русские сериалы (discover/tv, ru)
            loaders.push(cb => {
                const url =
                    'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today;
                this.get(url, params, data => {
                    data.title = 'Русские сериалы';
                    cb(data);
                }, cb);
            });

            // Русские мультфильмы (discover/movie, ru, жанр 16)
            loaders.push(cb => {
                const url =
                    'discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16' +
                    '&with_original_language=ru&primary_release_date.lte=' + today;
                this.get(url, params, data => {
                    data.title = Lampa.Lang.translate('Русские мультфильмы');
                    data.small = true;
                    data.line_type = 'small';
                    cb(data);
                }, cb);
            });

            // Популярные фильмы
            loaders.push(cb => {
                this.get('movie/popular', params, data => {
                    data.title = Lampa.Lang.translate('title_popular_movie');
                    cb(data);
                }, cb);
            });

            // Популярные сериалы
            loaders.push(cb => {
                this.get('trending/tv/week', params, data => {
                    data.title = Lampa.Lang.translate('title_popular_tv');
                    cb(data);
                }, cb);
            });

            // Подборки российских онлайн‑сервисов (Start, Okko, ИВИ, Wink, Кинопоиск, Premier, СТС, ТНТ, KION и т.п.)
            // Каждый блок — discover/tv с соответствующим network id и sort_by=first_air_date.desc

            const networkBlocks = [
                { id: 5806, title: 'Start' },
                { id: 3827, title: 'Okko' },
                { id: 806,  title: 'СТС' },
                { id: 2493, title: 'IVI' },
                { id: 2859, title: 'Wink' },
                { id: 1191, title: 'ТНТ' },
                { id: 3923, title: 'KION' },
                { id: 4085, title: 'КиноПоиск' },
                { id: 3871, title: 'Premier' }
            ];

            networkBlocks.forEach(block => {
                loaders.push(cb => {
                    const url =
                        'discover/tv?with_networks=' + block.id +
                        '&sort_by=first_air_date.desc&air_date.lte=' + today;
                    this.get(url, params, data => {
                        data.title = Lampa.Lang.translate(block.title);
                        data.wide = true;
                        cb(data);
                    }, cb);
                });
            });

            // Параметры параллельности
            const parallel = 6;

            // Запуск пачками
            Lampa.Arrays.insert(
                loaders,
                0,
                Lampa.Api.partPersons(loaders, parallel, 'results', loaders.length + 1)
            );

            function run(next, done) {
                Lampa.Api.partNext(loaders, parallel, next, done);
            }

            return run(onReady, onEnd);
        };

        // Обёртка над this.request.get
        this.get = function (url, params, onSuccess, onError) {
            this.request.get(url, params, onSuccess, onError);
        };
    }

    /**
     * Инициализация интерфейса: пункт настроек и запуск по готовности приложения.
     * Сохраняем проверку, что выбранный источник — tmdb.
     */
    function initRusMovieMain() {
        // Проверка источника — ОСТАВЛЯЕМ
        if (Lampa.Manifest.app.source !== 'tmdb') {
            Lampa.Noty.show('Плагин русских новинок работает только с источником TMDB');
            return;
        }

        // Регистрация параметра в настройках интерфейса
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'rus_movie_main',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Русские новинки на главной',
                description:
                    'Показывать подборки русских новинок на главной странице. ' +
                    'После изменения параметра приложение нужно перезапустить (работает только с TMDB).'
            },
            onRender: function () {
                setTimeout(function () {
                    $('div[data-name="rus_movie_main"]').insertAfter(
                        'div[data-name="Manifest"]'
                    );
                }, 0);
            }
        });

        // Здесь же можно добавить элемент в левое меню/главный экран, если нужно
        // ...
    }

    /**
     * Регистрируем источник на TMDB БЕЗ проверки Lampa.Storage.get('bylampa').
     * Раньше здесь была проверка bylampa !== false, теперь её нет.
     */
    if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb) {
        Object.assign(
            Lampa.Api.sources.tmdb,
            new RusMovieMainSource(Lampa.Api.sources.tmdb)
        );
    }

    // Запуск интерфейсной части после готовности приложения
    if (window.app) {
        initRusMovieMain();
    } else {
        Lampa.Listener.follow('app', 'ready', function (e) {
            if (e.name === 'ready') initRusMovieMain();
        });
    }
})();
