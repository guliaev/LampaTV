/* jshint esversion: 6 */
(function () {
    'use strict';

    // Защита от повторного запуска
    if (window.plugin_rus_mod_ready) return;
    window.plugin_rus_mod_ready = true;

    var today = new Date().toISOString().substr(0, 10);
    var currentYear = new Date().getFullYear();

    /**
     * Конфиг всех коллекций для главной
     */
    var collectionsConfig = [
        //
        // 🔥 Общие подборки (не только RU)
        //
        {
            id: 'now_playing_movies',
            emoji: '🎞',
            name_key: 'rus_mod_c_now_playing',
            request: 'movie/now_playing'
        },
        {
            id: 'trending_all_day',
            emoji: '📈',
            name_key: 'rus_mod_c_trend_day',
            request: 'trending/all/day'
        },
        {
            id: 'trending_all_week',
            emoji: '📊',
            name_key: 'rus_mod_c_trend_week',
            request: 'trending/all/week'
        },
        {
            id: 'popular_movies',
            emoji: '⭐',
            name_key: 'rus_mod_c_popular_movie',
            request: 'movie/popular'
        },
        {
            id: 'popular_tv',
            emoji: '📺',
            name_key: 'rus_mod_c_popular_tv',
            request: 'trending/tv/week'
        },

        //
        // 📆 Специальная локальная подборка — расписание (TimeTable)
        //
        {
            id: 'timetable_upcoming',
            emoji: '⏰',
            name_key: 'rus_mod_c_timetable',
            special: 'timetable'   // обрабатывается отдельно, без TMDB-запроса
        },

        //
        // 🎬 Русские фильмы
        //
        {
            id: 'rus_movies_new',
            emoji: '🎬',
            name_key: 'rus_mod_c_rus_movies_new',
            request: 'discover/movie?vote_average.gte=5&vote_average.lte=9.5' +
                     '&with_original_language=ru' +
                     '&sort_by=primary_release_date.desc' +
                     '&primary_release_date.lte=' + today
        },
        {
            id: 'rus_cartoons',
            emoji: '🐻',
            name_key: 'rus_mod_c_rus_cartoons',
            request: 'discover/movie?vote_average.gte=5&vote_average.lte=9.5' +
                     '&with_genres=16' +
                     '&with_original_language=ru' +
                     '&primary_release_date.lte=' + today
        },

        //
        // 📺 Русские сериалы
        //
        {
            id: 'rus_tv_all',
            emoji: '📺',
            name_key: 'rus_mod_c_rus_tv_all',
            request: 'discover/tv?with_original_language=ru' +
                     '&sort_by=first_air_date.desc' +
                     '&air_date.lte=' + today
        },

        //
        // 📡 Платформы (оригиналы)
        //
        {
            id: 'start_platform',
            emoji: '⭐',
            name_key: 'rus_mod_c_start',
            request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'okko_platform',
            emoji: '⭕',
            name_key: 'rus_mod_c_okko',
            request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'premier_platform',
            emoji: '🎭',
            name_key: 'rus_mod_c_premier',
            request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'wink_platform',
            emoji: '📡',
            name_key: 'rus_mod_c_wink',
            request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'kion_platform',
            emoji: '🎞',
            name_key: 'rus_mod_c_kion',
            request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'ivi_platform',
            emoji: '🍿',
            name_key: 'rus_mod_c_ivi',
            request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'kinopoisk_platform',
            emoji: '🎬',
            name_key: 'rus_mod_c_kinopoisk',
            request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'cts_platform',
            emoji: '📺',
            name_key: 'rus_mod_c_cts',
            request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today
        },
        {
            id: 'tnt_platform',
            emoji: '🔥',
            name_key: 'rus_mod_c_tnt',
            request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today
        }
    ];

    // Настройки по умолчанию
    var pluginSettings = {
        enabled: true,
        collections: collectionsConfig.reduce(function (acc, c) {
            acc[c.id] = true;
            return acc;
        }, {})
    };

    function loadSettings() {
        if (!Lampa.Storage) return pluginSettings;

        pluginSettings.enabled = Lampa.Storage.get('rus_mod_enabled', true);

        collectionsConfig.forEach(function (cfg) {
            var key = 'rus_mod_collection_' + cfg.id;
            pluginSettings.collections[cfg.id] = Lampa.Storage.get(key, true);
        });

        return pluginSettings;
    }

    function saveSettings() {
        if (!Lampa.Storage) return;

        Lampa.Storage.set('rus_mod_enabled', pluginSettings.enabled);

        collectionsConfig.forEach(function (cfg) {
            var key = 'rus_mod_collection_' + cfg.id;
            Lampa.Storage.set(key, pluginSettings.collections[cfg.id]);
        });
    }

    function addTranslations() {
        if (!Lampa.Lang) return;

        Lampa.Lang.add({
            // Общие
            rus_mod_plugin_name: {
                ru: 'Русские подборки TMDB'
            },
            rus_mod_toggle_name: {
                ru: 'Включить русские подборки на главной'
            },
            rus_mod_toggle_desc: {
                ru: 'Показывать русские и популярные подборки на главной (источник TMDB)'
            },
            rus_mod_noty_reload: {
                ru: 'Перезагрузите главную страницу, чтобы применить изменения'
            },
            rus_mod_show_collection: {
                ru: 'Показывать подборку'
            },

            // Общие подборки
            rus_mod_c_now_playing:  { ru: 'Сейчас в кино' },
            rus_mod_c_trend_day:    { ru: 'Тренды за день' },
            rus_mod_c_trend_week:   { ru: 'Тренды за неделю' },
            rus_mod_c_popular_movie:{ ru: 'Популярные фильмы' },
            rus_mod_c_popular_tv:   { ru: 'Популярные сериалы' },
            rus_mod_c_timetable:    { ru: 'Скоро в онлайне (расписание)' },

            // Русский контент
            rus_mod_c_rus_movies_new: { ru: 'Новинки русского кино' },
            rus_mod_c_rus_cartoons:   { ru: 'Русские мультфильмы' },
            rus_mod_c_rus_tv_all:     { ru: 'Русские сериалы' },

            // Платформы
            rus_mod_c_start:     { ru: 'START Originals' },
            rus_mod_c_okko:      { ru: 'OKKO Originals' },
            rus_mod_c_premier:   { ru: 'Premier Originals' },
            rus_mod_c_wink:      { ru: 'Wink Originals' },
            rus_mod_c_kion:      { ru: 'KION Originals' },
            rus_mod_c_ivi:       { ru: 'ИВИ Originals' },
            rus_mod_c_kinopoisk: { ru: 'КиноПоиск Originals' },
            rus_mod_c_cts:       { ru: 'СТС Originals' },
            rus_mod_c_tnt:       { ru: 'ТНТ Originals' }
        });
    }

    /**
     * main для главной: тянет все включённые коллекции
     */
    function createRusDiscoveryMain(parent) {
        return function () {
            var args = arguments;
            var params = args.length > 0 && args[0] !== undefined ? args[0] : {};
            var oncomplete = args.length > 1 ? args[1] : undefined;
            var onerror = args.length > 2 ? args[2] : undefined;

            var settings = loadSettings();

            var active = collectionsConfig.filter(function (c) {
                return settings.collections[c.id];
            });

            if (!active.length) {
                if (onerror) onerror();
                return function () {};
            }

            var hasSequentials = Lampa.Api && typeof Lampa.Api.sequentials === 'function';
            var hasPartNext = Lampa.Api && typeof Lampa.Api.partNext === 'function';

            if (!hasSequentials && !hasPartNext) {
                if (onerror) onerror();
                return function () {};
            }

            var loaders = [];

            active.forEach(function (cfg) {
                // Особый случай: расписание из TimeTable
                if (cfg.special === 'timetable') {
                    loaders.push(function (call) {
                        var title = Lampa.Lang.translate(cfg.name_key);
                        var full = cfg.emoji ? cfg.emoji + ' ' + title : title;

                        var results = [];
                        if (Lampa.TimeTable && typeof Lampa.TimeTable.get === 'function') {
                            results = Lampa.TimeTable.get().slice(0, 20);
                        }

                        call({
                            source: 'tmdb',
                            results: results,
                            title: full,
                            nomore: true
                        });
                    });
                    return;
                }

                // Обычный TMDB-запрос
                loaders.push(function (call) {
                    parent.get(cfg.request, params, function (json) {
                        var title = Lampa.Lang.translate(cfg.name_key);
                        json.title = cfg.emoji ? cfg.emoji + ' ' + title : title;

                        if (Lampa.Utils && Lampa.Utils.addSource) {
                            Lampa.Utils.addSource(json, 'tmdb');
                        } else {
                            json.source = 'tmdb';
                        }

                        call(json);
                    }, function () {
                        var title = Lampa.Lang.translate(cfg.name_key);
                        var full = cfg.emoji ? cfg.emoji + ' ' + title : title;
                        call({ source: 'tmdb', results: [], title: full });
                    });
                });
            });

            var total = loaders.length;
            var runner = Lampa.Api.sequentials || Lampa.Api.partNext;
            runner(loaders, total, oncomplete, onerror);

            return function () {};
        };
    }

    function addSettingsPage() {
        loadSettings();

        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'rus_mod',
            name: Lampa.Lang.translate('rus_mod_plugin_name'),
            icon:
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
                'viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>' +
                '<polyline points="17 2 12 7 7 2"></polyline></svg>'
        });

        // Главный переключатель плагина
        Lampa.SettingsApi.addParam({
            component: 'rus_mod',
            param: { name: 'rus_mod_enabled', type: 'trigger', default: true },
            field: {
                name: Lampa.Lang.translate('rus_mod_toggle_name'),
                description: Lampa.Lang.translate('rus_mod_toggle_desc')
            },
            onChange: function (val) {
                pluginSettings.enabled = val;
                saveSettings();
                Lampa.Noty.show(Lampa.Lang.translate('rus_mod_noty_reload'));
            }
        });

        // Переключатели по каждой коллекции
        collectionsConfig.forEach(function (cfg) {
            var name = Lampa.Lang.translate(cfg.name_key);
            var fullName = cfg.emoji ? cfg.emoji + ' ' + name : name;

            Lampa.SettingsApi.addParam({
                component: 'rus_mod',
                param: {
                    name: 'rus_mod_collection_' + cfg.id,
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: fullName,
                    description:
                        Lampa.Lang.translate('rus_mod_show_collection') +
                        ' "' + name + '"'
                },
                onChange: function (val) {
                    pluginSettings.collections[cfg.id] = val;
                    saveSettings();
                    Lampa.Noty.show(Lampa.Lang.translate('rus_mod_noty_reload'));
                }
            });
        });

        if (Lampa.Settings && Lampa.Settings.listener) {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name !== 'rus_mod') return;

                setTimeout(function () {
                    document
                        .querySelectorAll('[data-name="rus_mod_enabled"]')
                        .forEach(function (el) {
                            if (el.type === 'checkbox') {
                                el.checked = pluginSettings.enabled;
                            }
                        });

                    collectionsConfig.forEach(function (cfg) {
                        document
                            .querySelectorAll(
                                '[data-name="rus_mod_collection_' + cfg.id + '"]'
                            )
                            .forEach(function (el) {
                                if (el.type === 'checkbox') {
                                    el.checked = pluginSettings.collections[cfg.id];
                                }
                            });
                    });
                }, 100);
            });
        }
    }

    // Обёртка над tmdb.main c проверкой Manifest.app.source === 'tmdb'
    function initPlugin() {
        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) return false;

        var tmdbSource = Lampa.Api.sources.tmdb;
        if (!tmdbSource || !tmdbSource.main) return false;

        var originalMain = tmdbSource.main;

        tmdbSource.main = function () {
            var args = Array.prototype.slice.call(arguments);
            var settings = loadSettings();

            // Страницы "Фильмы" и "Сериалы" не трогаем
            if (this.type === 'movie' || this.type === 'tv') {
                return originalMain.apply(this, args);
            }

            // Жёсткая проверка TMDB как основного источника
            if (!Lampa.Manifest || !Lampa.Manifest.app ||
                Lampa.Manifest.app.source !== 'tmdb') {
                return originalMain.apply(this, args);
            }

            if (!settings.enabled) {
                return originalMain.apply(this, args);
            }

            return createRusDiscoveryMain(tmdbSource).apply(this, args);
        };

        return true;
    }

    function waitForApp() {
        function onReady() {
            addTranslations();
            initPlugin();
            addSettingsPage();
        }

        if (window.appready) {
            onReady();
        } else if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') onReady();
            });
        } else {
            setTimeout(waitForApp, 1000);
        }
    }

    waitForApp();
})();
