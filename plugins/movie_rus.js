function RusMovieMainSource(manifest) {
    request = new Lampa.Reguest(); // сделай request внешней для makeNetworkBlock

    this.main = function (start, done, fail) {
        const today = todayISO();
        const tasks = [];
        const limit = 6;

        // 1. Сейчас в кино
        tasks.push(cb => {
            request.get('movie/now_playing', manifest, res => {
                res.title      = Lampa.Lang.translate('title_now_watch');
                res.collection = true;
                res.line_type  = 'collection';
                cb(res);
            }, cb);
        });

        // 2. Непросмотренные эпизоды (card_episode)
        tasks.push(cb => {
            const results = Lampa.TimeTable.unwatched().slice(0, 20);
            cb({
                source:   SOURCE_TMDB,
                results,
                title:    Lampa.Lang.translate('title_upcoming_episodes'),
                nomore:   true,
                cardClass(item, ep) {
                    return new CardEpisode(item, ep);
                }
            });
        });

        // 3. Тренд дня
        tasks.push(cb => {
            request.get('trending/all/day', manifest, res => {
                res.title = Lampa.Lang.translate('title_trend_day');
                cb(res);
            }, cb);
        });

        // 4. Скоро в кино
        tasks.push(cb => {
            request.get('movie/upcoming', manifest, res => {
                res.title = Lampa.Lang.translate('title_upcoming');
                cb(res);
            }, cb);
        });

        // 5. Русские фильмы (промо‑витрина)
        tasks.push(cb => {
            request.get(
                'discover/movie?vote_average.gte=5&vote_average.lte=9.5' +
                '&with_original_language=ru&sort_by=primary_release_date.desc' +
                '&primary_release_date.lte=' + today,
                manifest,
                res => {
                    res.title = 'Русские фильмы';
                    res.small = true;
                    res.wide  = true;
                    res.results.forEach(m => {
                        m.promo_title = m.promo_title;
                        m.displayName = m.title || m.name;
                    });
                    cb(res);
                },
                cb
            );
        });

        // 6. Русские сериалы
        tasks.push(cb => {
            request.get(
                'discover/tv?with_original_language=ru' +
                '&sort_by=first_air_date.desc&air_date.lte=' + today,
                manifest,
                res => {
                    res.title = 'Русские сериалы';
                    cb(res);
                },
                cb
            );
        });

        // 7. Русские мультфильмы
        tasks.push(cb => {
            request.get(
                'discover/movie?vote_average.gte=5&vote_average.lte=9.5' +
                '&with_genres=16&with_original_language=ru' +
                '&primary_release_date.lte=' + today,
                manifest,
                res => {
                    res.title      = 'Русские мультфильмы';
                    res.collection = true;
                    res.line_type  = 'collection';
                    cb(res);
                },
                cb
            );
        });

        // 8. Популярные фильмы
        tasks.push(cb => {
            request.get('movie/popular', manifest, res => {
                res.title = Lampa.Lang.translate('title_popular_movie');
                cb(res);
            }, cb);
        });

        // 9. Популярные сериалы
        tasks.push(cb => {
            request.get('trending/tv/week', manifest, res => {
                res.title = Lampa.Lang.translate('title_popular_tv');
                cb(res);
            }, cb);
        });

        // 10. Случайная русская подборка по годам (фильмы)
        tasks.push(cb => {
            const years   = randomYearRange();
            const sort    = pickRandom(MOVIE_SORT);
            const url =
                'discover/movie?primary_release_date.gte=' + years.gte +
                '&primary_release_date.lte=' + years.lte +
                '&vote_average.gte=5&vote_average.lte=9.5' +
                '&with_original_language=ru&sort_by=' + encodeURIComponent(sort);

            request.get(url, manifest, res => {
                res.title     = Lampa.Lang.translate('Подборки русских фильмов');
                res.line_type = 'top';
                cb(res);
            }, cb);
        });

        // 11. Вторая случайная подборка (сериалы)
        tasks.push(cb => {
            const years = randomYearRange();
            const sort  = pickRandom(TV_SORT);
            const url =
                'discover/tv?first_air_date.gte=' + years.gte +
                '&first_air_date.lte=' + years.lte +
                '&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5' +
                '&sort_by=' + encodeURIComponent(sort);

            request.get(url, manifest, res => {
                res.title     = Lampa.Lang.translate('Подборки русских сериалов');
                res.line_type = 'top';
                cb(res);
            }, cb);
        });

        // 12. Лента «Русские новинки на главной»
        tasks.push(cb => {
            request.get(
                'discover/movie?vote_average.gte=5&vote_average.lte=9.5' +
                '&with_original_language=ru&primary_release_date.lte=' + today,
                manifest,
                res => {
                    res.title = Lampa.Lang.translate('Русские новинки на главной');
                    res.small = true;
                    res.wide  = true;
                    res.results.forEach(m => {
                        m.promo_title = m.promo_title;
                        m.displayName = m.title || m.name;
                    });
                    cb(res);
                },
                cb
            );
        });

        // 13–20. Онлайн‑кинотеатры и каналы через makeNetworkBlock
        tasks.push(makeNetworkBlock('КиноПоиск', NETWORKS.KINOPOISK));
        tasks.push(makeNetworkBlock('Premier',   NETWORKS.PREMIER));
        tasks.push(makeNetworkBlock('KION',      NETWORKS.KION));
        tasks.push(makeNetworkBlock('Start',     NETWORKS.START));
        tasks.push(makeNetworkBlock('IVI',       NETWORKS.IVI));
        tasks.push(makeNetworkBlock('Okko',      NETWORKS.OKKO, { small: true, wide: true }));
        tasks.push(makeNetworkBlock('Wink',      NETWORKS.WINK, { small: true, wide: true, usePromo: true }));
        tasks.push(makeNetworkBlock('СТС',       NETWORKS.STS));
        tasks.push(makeNetworkBlock('ТНТ',       NETWORKS.TNT, { collection: true, line_type: 'collection' }));

        // 21+. Жанровые подборки (как и раньше)
        if (manifest.genres && Array.isArray(manifest.genres.movies)) {
            manifest.genres.movies.forEach(genre => {
                tasks.push(cb => {
                    const url = 'discover/movie?with_genres=' + genre.id;
                    request.get(url, manifest, res => {
                        const key = genre.name.replace(/[^a-z_]/g, '');
                        res.title = Lampa.Lang.translate(key);
                        cb(res);
                    }, cb);
                });
            });
        }

        // пакетная подгрузка линий
        Lampa.Api.insert(tasks, limit, start, fail);
    };
}
