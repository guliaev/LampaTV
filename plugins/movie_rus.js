    function RusMovieMainSource(manifest) {
        const request = new Lampa.Reguest();

        this.main = function (start, done, fail) {
            const today   = todayISO();
            const self    = this;
            const limit   = 6; // сколько линий грузить пачкой

            const tasks = [];

            // 1. Сейчас в кино
            tasks.push(cb => {
                request.get('movie/now_playing', manifest, res => {
                    res.title     = Lampa.Lang.translate('title_now_watch');
                    res.collection = true;
                    res.line_type = 'collection';
                    cb(res);
                }, cb);
            });

            // 2. Мои непросмотренные (TimeTable)
            tasks.push(cb => {
                const results = Lampa.TimeTable.unwatched().slice(0, 20);
                cb({
                    source:   SOURCE_TMDB,
                    results:  results,
                    title:    Lampa.Lang.translate('title_upcoming_episodes'),
                    nomore:   true,
                    cardClass(item, episode) {
                        return new CardEpisode(item, episode);
                    }
                });
            });

            // 3. В тренде за день
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

            // 5. Русские фильмы (промо)
            tasks.push(cb => {
                request.get(
                    'discover/movie?vote_average.gte=5&vote_average.lte=9.5'
                    + '&with_original_language=ru'
                    + '&sort_by=primary_release_date.desc'
                    + '&primary_release_date.lte=' + today,
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
                    'discover/tv?with_original_language=ru'
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
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
                    'discover/movie?vote_average.gte=5&vote_average.lte=9.5'
                    + '&with_genres=16'
                    + '&with_original_language=ru'
                    + '&primary_release_date.lte=' + today,
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

            // 10. Свежие релизы (по датам диапазона)
            tasks.push(cb => {
                // в оригинале рандомили диапазон дат и sort_by, здесь опущено
                request.get(
                    'discover/movie?primary_release_date.lte=' + today
                    + '&vote_average.gte=5&vote_average.lte=9.5'
                    + '&with_original_language=ru'
                    + '&sort_by=primary_release_date.desc',
                    manifest,
                    res => {
                        res.title     = Lampa.Lang.translate('Подборки русских фильмов');
                        res.line_type = 'top';
                        cb(res);
                    },
                    cb
                );
            });

            // 11. Лента «Русские новинки» (фильмы)
            tasks.push(cb => {
                request.get(
                    'discover/movie?vote_average.gte=5&vote_average.lte=9.5'
                    + '&with_original_language=ru'
                    + '&primary_release_date.lte=' + today,
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

            // 12. Wink
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.WINK
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'Wink';
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

            // 13. Start
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.START
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'Start';
                        cb(res);
                    },
                    cb
                );
            });

            // 14. КиноПоиск
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.KINOPOISK
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'КиноПоиск';
                        cb(res);
                    },
                    cb
                );
            });

            // 15. Okko
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.OKKO
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'Okko';
                        cb(res);
                    },
                    cb
                );
            });

            // 16. IVI
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.IVI
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'IVI';
                        cb(res);
                    },
                    cb
                );
            });

            // 17. СТС
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.STS
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'СТС';
                        cb(res);
                    },
                    cb
                );
            });

            // 18. ТНТ
            tasks.push(cb => {
                request.get(
                    'discover/tv?with_networks=' + NETWORKS.TNT
                    + '&sort_by=first_air_date.desc'
                    + '&air_date.lte=' + today,
                    manifest,
                    res => {
                        res.title = 'ТНТ';
                        res.collection = true;
                        res.line_type  = 'collection';
                        cb(res);
                    },
                    cb
                );
            });

            // 19+. Жанровые подборки (по manifest.genres.movies)
            if (manifest.genres && Array.isArray(manifest.genres.movies)) {
                manifest.genres.movies.forEach(genre => {
                    tasks.push(cb => {
                        request.get(
                            'discover/movie?with_genres=' + genre.id,
                            manifest,
                            res => {
                                const key = genre.name.replace(/[^a-z_]/g, '');
                                res.title = Lampa.Lang.translate(key);
                                cb(res);
                            },
                            cb
                        );
                    });
                });
            }

            // Пакетная загрузка линий
            Lampa.Api.insert(tasks, limit, start, fail);
        };
    }
