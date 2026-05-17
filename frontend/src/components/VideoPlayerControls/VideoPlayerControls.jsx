import "./VideoPlayerControls.scss";

function VideoPlayerControls({
  episodesCount,
  translations,
  currentEpisode,
  currentTranslation,
  onEpisodeChange,
  onTranslationChange,
}) {
  return (
    <div className="video-controls">
      <div className="video-controls__container">
        <div className="video-controls-title">Настройки плеера</div>

        {/* Плеер */}
        <details className="video-control">
          <summary>Плеер</summary>
          <div className="video-control-options">
            <label className="video-control-checkbox disabled">
              <input type="radio" name="player" value="kodik" checked disabled />
              Kodik
            </label>
          </div>
        </details>

        {/* Озвучка */}
        <details className="video-control">
          <summary>Озвучка</summary>
          <div className="video-control-options">
            {translations.map((t) => (
              <label key={t.id} className="video-control-checkbox">
                <input
                  type="radio"
                  name="translation"
                  value={String(t.id)}
                  checked={currentTranslation?.id === t.id}
                  onChange={() => onTranslationChange(String(t.id))}
                />
                {t.title} {t.type === "subtitles" ? "(субтитры)" : ""}
              </label>
            ))}
          </div>
        </details>

        {/* Серия */}
        {episodesCount > 0 && (
          <details className="video-control">
            <summary>Серия</summary>
            <div className="video-control-options scrollable">
              {[...Array(episodesCount).keys()].map((i) => (
                <label key={i + 1} className="video-control-checkbox">
                  <input
                    type="radio"
                    name="episode"
                    value={i + 1}
                    checked={currentEpisode === i + 1}
                    onChange={() => onEpisodeChange(i + 1)}
                  />
                  Серия {i + 1}
                </label>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default VideoPlayerControls;