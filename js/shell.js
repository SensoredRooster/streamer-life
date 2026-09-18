/**
 * Streamer Life — Immersive app shell
 * Splash, fullscreen, PWA install, Continue CTA, progressive screen unlocks.
 */

const SCREEN_UNLOCK = {
  ops: () => true,
  live: () => true,
  clips: (s) => questDone(s, 'Q01') || questDone(s, 'Q00'),
  funnel: (s) => questDone(s, 'Q01') || (s.clips_ready || 0) > 0 || questDone(s, 'Q04'),
  dark: (s) => questDone(s, 'Q04') || questStatus(s, 'Q05') === 'available' || questDone(s, 'Q05'),
  chat: (s) => questDone(s, 'Q05') || questStatus(s, 'Q06') === 'available' || questDone(s, 'Q06'),
  body: (s) => questDone(s, 'Q01'),
  contracts: (s) => (s.day || 1) >= 3 || questDone(s, 'Q03') || questDone(s, 'Q06'),
  calendar: (s) => (s.day || 1) >= 2 || questDone(s, 'Q02'),
  mediakit: (s) => questDone(s, 'Q06') || questDone(s, 'Q07'),
};

function questStatus(s, id) {
  return (s.quests && s.quests[id] && s.quests[id].status) || 'locked';
}
function questDone(s, id) {
  return questStatus(s, id) === 'done';
}

function isScreenUnlocked(id, s) {
  const fn = SCREEN_UNLOCK[id];
  return fn ? !!fn(s || window.SLState.STATE) : true;
}

function enterAppShell(opts = {}) {
  const s = window.SLState.STATE;
  s.app_entered = true;
  document.body.classList.add('app-mode');
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 450);
  }
  if (opts.fullscreen && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  if (window.SLCoach) {
    s.coach_guided = true;
    window.SLCoach.renderCoachBar();
  }
  if (window.SLUI) {
    window.SLUI.renderNav();
    window.SLUI.route('ops');
  }
  window.SLState.pushLog(s, 'App shell online. Follow CONTINUE — tabs unlock as you progress.', 'teal');
  updateShellChrome();
}

function updateShellChrome() {
  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) {
    fsBtn.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  }
  const installBtn = document.getElementById('btn-install');
  if (installBtn) {
    installBtn.hidden = !window.__slDeferredPrompt;
  }
}

function continueFromCoach() {
  if (!window.SLCoach) return;
  const s = window.SLState.STATE;
  const tip = window.SLCoach.getCoachAdvice(s);
  if (tip.action) {
    const r = window.SLCoach.runCoachAction(tip.action);
    if (!r.ok) window.SLState.pushLog(s, r.msg || 'Coach could not continue.', 'warn');
  } else if (tip.screen) {
    window.SLUI.route(tip.screen);
  }
  window.SLCoach.renderCoachBar();
  if (window.SLUI.renderScreen) window.SLUI.renderScreen();
  updateShellChrome();
}

function wireShell() {
  const enter = document.getElementById('btn-enter');
  const enterFs = document.getElementById('btn-enter-fs');
  if (enter) enter.onclick = () => enterAppShell({ fullscreen: false });
  if (enterFs) enterFs.onclick = () => enterAppShell({ fullscreen: true });

  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) {
    fsBtn.onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => {});
    };
  }
  document.addEventListener('fullscreenchange', updateShellChrome);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__slDeferredPrompt = e;
    updateShellChrome();
  });
  const installBtn = document.getElementById('btn-install');
  if (installBtn) {
    installBtn.onclick = async () => {
      const p = window.__slDeferredPrompt;
      if (!p) return;
      p.prompt();
      await p.userChoice;
      window.__slDeferredPrompt = null;
      updateShellChrome();
    };
  }

  // Space / Enter = Continue when in app mode
  document.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('app-mode')) return;
    if (e.target.matches('input, textarea, select')) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      if (e.code === 'Space') e.preventDefault();
      // Don't steal Enter from buttons already focused
      if (e.code === 'Enter' && e.target.closest('button, a')) return;
      continueFromCoach();
    }
    if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => {});
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

window.SLShell = {
  enterAppShell,
  continueFromCoach,
  isScreenUnlocked,
  updateShellChrome,
  SCREEN_UNLOCK,
  wireShell,
};
