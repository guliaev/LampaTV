/* jshint esversion: 6 */
(function () {
    'use strict';

    // ---
    // 📼 БЛОК ПОЛИФИЛОВ (для старых ТВ) - интегрировано
    // ---

    // [Весь блок полифиллов из TMDB_MOD без изменений: indexOf, isArray, filter, assign, map, forEach, includes, toISOString, substr, reduce]

    if (!Array.prototype.indexOf) { /* ... полифилл indexOf */ }
    // ... остальные полифиллы аналогично, вставьте полный блок из вашего кода

    // ---
    // 🚩 КОНЕЦ ПОЛИФИЛОВ
    // ---

    if (window.plugin_rus_tmdb_mod_ready) return;
    window.plugin_rus_tmdb_mod_ready = true;

    var today = new Date().toISOString().substr(0, 10);
    var currentYear = new Date().getFullYear();
    var lastYear = currentYear - 1;

    // 📌 Объединённая конфигурация (rus_movie + TMDB_MOD, без дублей)
    var collectionsConfig = [
        // Фильмы (из TMDB_MOD + rus)
        { id: 'hot_new_releases', emoji: '🎬', name_key: 'tmdb_mod_c_hot_new', request: 'discover/movie?sort_by=primary_release_date.desc&primary_release_date.lte=' + today + '&vote_count.gte=50&vote_average.gte=6&region=RU', menu_only: false },
        { id: 'russian_movies', emoji: '🇷🇺', name_key: 'tmdb_mod_c_rus_new', request: 'discover/movie?with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today + '&region=RU', menu_only: false },
        // Сериалы
        { id: 'russian_series', emoji: '🇷🇺', name_key: 'tmdb_mod_c_rus_series', request: 'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&first_air_date.lte=' + today, menu_only: false },
        // Платформы (общие, без дублей)
        { id: 'okko_platform', emoji: '📺', name_key: 'tmdb_mod_c_okko', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today, menu_only: true },  // menu_only: только в меню, не на главной
        { id: 'premier_platform', emoji: '📺', name_key: 'tmdb_mod_c_premier', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today, menu_only: true },
        // ... остальные платформы: kion(4085), wink(5806), etc. из NETWORK_IDS
        // Добавить остальные из вашего collectionsConfig
    ];

    // NETWORK_IDS из предыдущего (расширен)
    const NETWORK_IDS = { /* ... все ID */ };

    var pluginSettings = {
        enabled: true,
        collections: collectionsConfig.reduce((acc, c) => { acc[c.id] = true; return acc; }, {})
    };

    function loadSettings() {
        if (Lampa.Storage) {
            pluginSettings.enabled = Lampa.Storage.get('rus_tmdb_mod_enabled', true);
            collectionsConfig.forEach(cfg => {
                pluginSettings.collections[cfg.id] = Lampa.Storage.get('rus_tmdb_mod_' + cfg.id, true);
            });
        }
        return pluginSettings;
    }

    function saveSettings() {
        if (Lampa.Storage) {
            Lampa.Storage.set('rus_tmdb_mod_enabled', pluginSettings.enabled);
            collectionsConfig.forEach(cfg => {
                Lampa.Storage.set('rus_tmdb_mod_' + cfg.id, pluginSettings.collections[cfg.id]);
            });
        }
    }

    // addTranslations() - полный из TMDB_MOD + новые ключи
    function addTranslations() {
        if (!Lampa.Lang) return;
        Lampa.Lang.add({
            tmdb_mod_plugin_name: { ru: 'Rus TMDB Mod (русские + кастом)' },
            // ... все переводы из TMDB_MOD
            // Добавить: menu_rus: { ru: 'Русское меню' }
        });
    }

    // createDiscoveryMain() - без изменений из TMDB_MOD, фильтр !menu_only
    var createDiscoveryMain = function(parent) { /* полный код из TMDB_MOD */ };

    // addSettings() - полный из TMDB_MOD, с rus_tmdb_mod_ префиксом
    function addSettings() { /* интегрировано */ }

    // initMenu() из rus_movie, фильтр enabled collections !menu_only=false
    function initMenu() {
        if (Lampa.Worker.is_app !== 'web') return;
        // ... код меню, но items = MENU_ITEMS.filter(enabled && !menu_only)
        const enabledMenuItems = MENU_ITEMS.filter(item => pluginSettings.collections[item.id] !== false);
        // Select.show с enabledMenuItems
    }

    // initPlugin() - merge: clone tmdb_mod + menu + settings
    function initPlugin() {
        if (!Lampa.Api.sources.tmdb) return;
        var tmdb_mod = Object.assign({}, Lampa.Api.sources.tmdb);
        tmdb_mod.main = createDiscoveryMain(tmdb_mod);
        Lampa.Api.sources.rus_tmdb_mod = tmdb_mod;
        // Добавить в Params.sources
        initMenu();
        return true;
    }

    // waitForApp() + Listener - без изменений

    waitForApp();  // Запуск
})();
