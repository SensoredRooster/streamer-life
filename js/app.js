/**
 * Streamer Life — Boot (app shell)
 */
function boot() {
  try {
    if (!window.SLState || !window.SLUI || !window.SLFormulas || !window.SLDark || !window.SLShell) {
      throw new Error('Engine modules failed to load');
    }
    window.SLShell.wireShell();

    // Prepare UI behind splash (nav exists but shell hidden until Enter)
    window.SLUI.renderNav();
    window.SLUI.route('ops');
    if (window.SLCoach) {
      window.SLState.STATE.coach_guided = true;
      window.SLCoach.renderCoachBar();
    }

    document.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('app-mode')) return;
      if (e.target.matches('input, textarea, select')) return;
      // number keys only for unlocked screens
      const idx = e.key === '0' ? 9 : parseInt(e.key, 10) - 1;
      if (Number.isFinite(idx) && idx >= 0 && idx < window.SLUI.SCREENS.length) {
        const id = window.SLUI.SCREENS[idx].id;
        if (window.SLShell.isScreenUnlocked(id)) window.SLUI.route(id);
      }
    });

    console.info('[Streamer Life] shell ready — waiting for Enter on splash');
  } catch (err) {
    console.error('[Streamer Life boot]', err);
    const main = document.getElementById('screen') || document.body;
    const pre = document.createElement('pre');
    pre.style.cssText = 'color:#FF3B5C;padding:16px;white-space:pre-wrap;font-family:monospace';
    pre.textContent = 'Streamer Life failed to boot:\\n' + (err && err.stack ? err.stack : err);
    main.prepend(pre);
  }
}

document.addEventListener('DOMContentLoaded', boot);
