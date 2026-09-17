/**
 * Streamer Life — Boot
 */
function boot() {
  try {
    if (!window.SLState || !window.SLUI || !window.SLFormulas || !window.SLDark) {
      throw new Error('Engine modules failed to load');
    }
    const s = window.SLState.STATE;
    window.SLState.pushLog(
      s,
      'Streamer Life online. Fame is a hostile market. Dual CCV armed.',
      'teal'
    );
    window.SLUI.renderNav();
    window.SLUI.route('ops');

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      const idx = e.key === '0' ? 9 : parseInt(e.key, 10) - 1;
      if (Number.isFinite(idx) && idx >= 0 && idx < window.SLUI.SCREENS.length) {
        window.SLUI.route(window.SLUI.SCREENS[idx].id);
      }
    });

    console.info(
      '[Streamer Life] ending_score =',
      window.SLState.getEndingScore(s),
      '| CCV real/display',
      s.ccv_real,
      window.SLState.getCcvDisplay(s)
    );
  } catch (err) {
    console.error('[Streamer Life boot]', err);
    const main = document.getElementById('screen') || document.body;
    const pre = document.createElement('pre');
    pre.style.cssText = 'color:#FF3B5C;padding:16px;white-space:pre-wrap;font-family:monospace';
    pre.textContent = 'Streamer Life failed to boot:\n' + (err && err.stack ? err.stack : err);
    main.prepend(pre);
  }
}

document.addEventListener('DOMContentLoaded', boot);
