/* jshint esversion: 6 */
(function () {
    'use strict';

    // --- ПОЛИФИЛЫ (как в TMDB_MOD) ---

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return -1;
            }
            k = fromIndex | 0;
            if (k < 0) {
                k += len;
                if (k < 0) k = 0;
            }
            for (; k < len; k++) {
                if (k in o && o[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            var array = this;
            var result = [];
            for (var i = 0; i < array.length; i++) {
                if (callback.call(thisArg, array[i], i, array)) {
                    result.push(array[i]);
                }
            }
            return result;
        };
    }

    if (!Object.assign) {
        Object.assign = function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };
    }

    if (!Array.prototype.map) {
        Array.prototype.map = function(callback, thisArg) {
            var array = this;
            var result = [];
            for (var i = 0; i < array.length; i++) {
                result.push(callback.call(thisArg, array[i], i, array));
            }
            return result;
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var array = this;
            for (var i = 0; i < array.length; i++) {
                callback.call(thisArg, array[i], i, array);
            }
        };
    }

    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement) {
            return this.indexOf(searchElement) !== -1;
        };
    }

    if (!Date.prototype.toISOString) {
        Date.prototype.toISOString = function() {
            var pad = function(num) {
                return (num < 10 ? '0' : '') + num;
            };
            return (
                this.getUTCFullYear() +
                '-' +
                pad(this.getUTCMonth() + 1) +
                '-' +
                pad(this.getUTCDate()) +
                'T' +
                pad(this.getUTCHours()) +
                ':' +
                pad(this.getUTCMinutes()) +
                ':' +
                pad(this.getUTCSeconds()) +
                '.' +
                (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
                'Z'
            );
        };
    }

    if (!String.prototype.substr) {
        String.prototype.substr = function(start, length) {
            return this.slice(start, start + length);
        };
    }

    if (!Array.prototype.reduce) {
        Array.prototype.reduce = function(callback) {
            if (this == null) {
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            var k = 0;
            var value;
            if (arguments.length >= 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in o)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = o[k++];
            }
            while (k < len) {
                if (k in o) {
                    value = callback(value, o[k], k, o);
                }
                k++;
            }
            return value;
        };
    }

    // --- ГАРД ---
    if (window.plugin_tmdb_rus_ready) return;
    window.plugin_tmdb_rus_ready = true;

    var today = new Date().toISOString().substr(0, 10);

    // --- КОНФИГ КОЛЛЕКЦИЙ ДЛЯ TMDB_RUS ---

    var collectionsConfig = [
        // Общие подборки
        { id: 'now_playing_movies', emoji: '🎞', name_key: 'rus_mod_c_now_playing',   request: 'movie/now_playing' },
        { id: 'trending_all_day',   emoji: '📈', name_key: 'rus_mod_c_trend_day',     request: 'trending/all/day' },
        { id: 'trending_all_week',  emoji: '📊', name_key: 'rus_mod_c_trend_week',    request: 'trending/all/week' },
        { id: 'popular_movies',     emoji: '⭐',  name_key: 'rus_mod_c_popular_movie', request: 'movie/popular' },
        { id: 'popular_tv',         emoji: '📺', name_key: 'rus_mod_c_popular_tv',    request: 'trending/tv/week' },

        // Локальная подборка по TimeTable
        { id: 'timetable_upcoming', emoji: '⏰', name_key: 'rus_mod_c_timetable',     special: 'timetable' },

        // Русские фильмы
        { id: 'rus_movies_new', emoji: '🎬', name_key: 'rus_mod_c_rus_movies_new',
          request: 'discover/movie?vote_average.gte=5&vote_average.lte=9.5' +
                   '&with_original_language=ru' +
                   '&sort_by=primary_release_date.desc' +
                   '&primary_release_date.lte=' + today },

        { id: 'rus_cartoons',   emoji: '🐻', name_key: 'rus_mod_c_rus_cartoons',
          request: 'discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16' +
                   '&with_original_language=ru&primary_release_date.lte=' + today },

        // Русские сериалы
        { id: 'rus_tv_all', emoji: '📺', name_key: 'rus_mod_c_rus_tv_all',
          request: 'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today },

        // Платформы
        { id: 'start_platform',   emoji: '⭐',  name_key: 'rus_mod_c_start',
          request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'okko_platform',    emoji: '⭕',  name_key: 'rus_mod_c_okko',
          request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'premier_platform', emoji: '🎭',  name_key: 'rus_mod_c_premier',
          request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'wink_platform',    emoji: '📡',  name_key: 'rus_mod_c_wink',
          request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'kion_platform',    emoji: '🎞',  name_key: 'rus_mod_c_kion',
          request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'ivi_platform',     emoji: '🍿',  name_key: 'rus_mod_c_ivi',
          request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'kinopoisk_platform', emoji: '🎬', name_key: 'rus_mod_c_kinopoisk',
          request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'cts_platform',     emoji: '📺',  name_key: 'rus_mod_c_cts',
          request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today },

        { id: 'tnt_platform',     emoji: '🔥',  name_key: 'rus_mod_c_tnt',
          request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today }
    ];

    // Настройки
    var pluginSettings = {
        enabled: true,
        collections: collectionsConfig.reduce(function (acc, c) {
            acc[c.id] = true;
            return acc;
        }, {})
    };

    function loadSettings() {
        if (!Lampa.Storage) return pluginSettings;

        pluginSettings.enabled = Lampa.Storage.get('tmdb_rus_enabled', true);

        collectionsConfig.forEach(function (cfg) {
            var key = 'tmdb_rus_collection_' + cfg.id;
            pluginSettings.collections[cfg.id] = Lampa.Storage.get(key, true);
        });

        return pluginSettings;
    }

    function saveSettings() {
        if (!Lampa.Storage) return;

        Lampa.Storage.set('tmdb_rus_enabled', pluginSettings.enabled);

        collectionsConfig.forEach(function (cfg) {
            var key = 'tmdb_rus_collection_' + cfg.id;
            Lampa.Storage.set(key, pluginSettings.collections[cfg.id]);
        });
    }

    function addTranslations() {
        if (!Lampa.Lang) return;

        Lampa.Lang.add({
            // Общие
            rus_mod_plugin_name: {
                ru: 'TMDB_RUS (русские подборки)'
            },
            rus_mod_toggle_name: {
                ru: 'Включить TMDB_RUS подборки'
            },
            rus_mod_toggle_desc: {
                ru: 'Показывать русские и популярные подборки на главной для источника TMDB_RUS'
            },
            rus_mod_noty_reload: {
                ru: 'Перезагрузите главную страницу, чтобы применить изменения'
            },
            rus_mod_show_collection: {
                ru: 'Показывать подборку'
            },

            // Общие подборки
            rus_mod_c_now_playing:   { ru: 'Сейчас в кино' },
            rus_mod_c_trend_day:     { ru: 'Тренды за день' },
            rus_mod_c_trend_week:    { ru: 'Тренды за неделю' },
            rus_mod_c_popular_movie: { ru: 'Популярные фильмы' },
            rus_mod_c_popular_tv:    { ru: 'Популярные сериалы' },
            rus_mod_c_timetable:     { ru: 'Скоро в онлайне (расписание)' },

            // Русский контент
            rus_mod_c_rus_movies_new:{ ru: 'Новинки русского кино' },
            rus_mod_c_rus_cartoons:  { ru: 'Русские мультфильмы' },
            rus_mod_c_rus_tv_all:    { ru: 'Русские сериалы' },

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

    // main для главной TMDB_RUS
    function createRusDiscoveryMain(parentSource) {
        return function () {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var oncomplete = arguments.length > 1 ? arguments[1] : undefined;
            var onerror = arguments.length > 2 ? arguments[2] : undefined;

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
                // локальная подборка по TimeTable
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

                // обычный TMDB-запрос
                loaders.push(function (call) {
                    parentSource.get(cfg.request, params, function (json) {
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

    // Страница настроек TMDB_RUS
    function addSettingsPage() {
        loadSettings();

        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'tmdb_rus',
            name: Lampa.Lang.translate('rus_mod_plugin_name'),
            icon:
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
                'viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>' +
                '<polyline points="17 2 12 7 7 2"></polyline></svg>'
        });

        // Главный триггер
        Lampa.SettingsApi.addParam({
            component: 'tmdb_rus',
            param: { name: 'tmdb_rus_enabled', type: 'trigger', default: true },
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

        // Переключатели по коллекциям
        collectionsConfig.forEach(function (cfg) {
            var name = Lampa.Lang.translate(cfg.name_key);
            var fullName = cfg.emoji ? cfg.emoji + ' ' + name : name;

            Lampa.SettingsApi.addParam({
                component: 'tmdb_rus',
                param: {
                    name: 'tmdb_rus_collection_' + cfg.id,
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
                if (e.name !== 'tmdb_rus') return;

                setTimeout(function () {
                    var els = document.querySelectorAll('[data-name="tmdb_rus_enabled"]');
                    Array.prototype.forEach.call(els, function (el) {
                        if (el.type === 'checkbox') el.checked = pluginSettings.enabled;
                    });

                    collectionsConfig.forEach(function (cfg) {
                        var q = '[data-name="tmdb_rus_collection_' + cfg.id + '"]';
                        var list = document.querySelectorAll(q);
                        Array.prototype.forEach.call(list, function (el) {
                            if (el.type === 'checkbox') {
                                el.checked = pluginSettings.collections[cfg.id];
                            }
                        });
                    });
                }, 100);
            });
        }
    }

    // Инициализация: создаём отдельный источник tmdb_rus, как tmdb_mod в TMDB_MOD
    function initPlugin() {
        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) return false;

        var originalTMDB = Lampa.Api.sources.tmdb;
        if (!originalTMDB || !originalTMDB.main) return false;

        var tmdb_rus = Object.assign({}, originalTMDB);
        Lampa.Api.sources.tmdb_rus = tmdb_rus;

        // на всякий случай — геттер, как в tmdb_mod
        try {
            Object.defineProperty(Lampa.Api.sources, 'tmdb_rus', {
                get: function get() { return tmdb_rus; }
            });
        } catch (e) {}

        var originalMain = originalTMDB.main;

        tmdb_rus.main = function () {
            var args = Array.prototype.slice.call(arguments);

            // если плагин включён и это не раздел movie/tv → даём свои подборки
            if (loadSettings().enabled && this.type !== 'movie' && this.type !== 'tv') {
                return createRusDiscoveryMain(tmdb_rus).apply(this, args);
            }

            // иначе стандартный main TMDB
            return originalMain.apply(this, args);
        };

        // Добавляем TMDB_RUS в список источников (Настройки → Остальное → Источник)
        if (Lampa.Params && Lampa.Params.select) {
            try {
                var sources = (Lampa.Params.values && Lampa.Params.values.source) ?
                    Lampa.Params.values.source : {};

                if (!sources.tmdb_rus) {
                    sources.tmdb_rus = 'TMDB_RUS';
                    // по умолчанию оставляем tmdb, чтобы не ломать текущую настройку
                    Lampa.Params.select('source', sources, 'tmdb');
                }
            } catch (e) {}
        }

        return true;
    }

    // Ожидание готовности Lampa
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
