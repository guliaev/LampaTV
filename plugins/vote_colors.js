(function() {
  'use strict';

  function startPlugin() {
    var manifest = {
      type: 'other',
      version: '0.1.0',
      name: 'Цвета рейтинга',
      description: 'Плагин для окрашивания рейтинга в зависимости от значения',
      component: 'vote_colors',
    };
    Lampa.Manifest.plugins = manifest;

    function updateVoteColors() {
      document.querySelectorAll(".card__vote").forEach(voteElement => {
        const vote = parseFloat(voteElement.textContent.trim());
        
        if (vote >= 0 && vote <= 3) {
          voteElement.style.color = "red";
        } else if (vote >= 3 && vote <= 5.9) {
          voteElement.style.color = "orange";
        } else if (vote >= 6 && vote <= 7.9) {
          voteElement.style.color = "cornflowerblue";
        } else if (vote >= 8 && vote <= 10) {
          voteElement.style.color = "lawngreen";
        }
      });
    }

    // Инициализация при загрузке
    Lampa.Listener.follow('app', function(e) {
      if (e.type === 'ready') {
        setTimeout(updateVoteColors, 500);
      }
    });

    // Следим за изменениями в DOM
    const observer = new MutationObserver(updateVoteColors);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function(e) {
      if (e.type === 'ready') {
        startPlugin();
      }
    });
  }
})();
