/**
 * Streamer Life — immersive shell hooks (nav locks, coach refresh, capture sim)
 * Load AFTER js/ui.js
 */
(function () {
  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => [...document.querySelectorAll(sel)];

  function captureSimHtml(s) {
    const type = s.content_type || 'Ranked';
    const live = !!s.live;
    const escapeHtml = (window.SLUI && window.SLUI.escapeHtml) || ((t) => String(t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
    const frames = {
      Ranked: { title: 'SIM · RANKED MATCH', lines: ['map: // bind_harbor  |  round 2/3', 'K/D/A  12 / 9 / 4   ·  econ +240', live ? 'input: WASD + aim  ·  fake feed' : 'paused — press Start stream'] },
      Variety: { title: 'SIM · VARIETY BOOT', lines: ['title screen loop', 'mod menu: off', live ? 'controller: XInput fake' : 'waiting for Go Live'] },
      'Just Chatting': { title: 'SIM · JUST CHATTING', lines: ['desktop wallpaper + notepad', 'no game capture (by design)', live ? 'talk track hot' : 'offline'] },
      IRL: { title: 'SIM · IRL / STREET', lines: ['phone gimbal placeholder', 'location: [redacted city]', live ? 'noise floor high' : 'cam bag closed'] },
      Speedrun: { title: 'SIM · SPEEDRUN TIMER', lines: ['PB 1:12:04.12', 'split +0.8 gold', live ? 'timer running' : 'timer stopped'] },
      Gambling: { title: 'SIM · GAMBLE OVERLAY', lines: ['BRAND DEATH RISK', 'fake slots — not real money UI', live ? 'chat is unhinged' : 'do not start'] },
      Reaction: { title: 'SIM · REACTION WINDOW', lines: ['copyright minefield', 'side-by-side placeholder', live ? 'reacting to clip' : 'idle'] },
      Horror: { title: 'SIM · HORROR RUN', lines: ['flashlight battery 34%', 'sanity meter', live ? 'jumpscare armed' : 'menu'] },
      Educational: { title: 'SIM · LESSON BOARD', lines: ['slides 3/12', 'whiteboard placeholder', live ? 'teaching mode' : 'prep'] },
      Drama: { title: 'SIM · CALLOUT DOC', lines: ['timeline.md open', 'receipts folder', live ? 'reading live' : 'draft'] },
      ASMR: { title: 'SIM · ASMR DESK', lines: ['mic waveform fake', 'tap / scratch loop', live ? 'whisper gain +6dB' : 'muted'] },
      Collab: { title: 'SIM · COLLAB LAYOUT', lines: ['guest tile empty', 'layout 50/50', live ? 'waiting on Discord' : 'offline'] },
      Charity: { title: 'SIM · SUBATHON METER', lines: ['goal $0 / $500', 'timer 0:00', live ? 'incentives board' : 'not live'] },
    };
    const f = frames[type] || frames.Ranked;
    return `<div class="capture-sim" aria-hidden="true">
    <div class="sim-title">${f.title}</div>
    ${f.lines.map((l) => `<div class="${l.includes('fake') || l.includes('placeholder') || l.includes('by design') ? 'sim-muted' : ''}">${escapeHtml(l)}</div>`).join('')}
    <div class="sim-bar"><i></i></div>
    <div class="sim-muted" style="margin-top:0.5rem">Not real video — management sim feed for <b>${escapeHtml(type)}</b></div>
  </div>`;
  }

  function patch() {
    const ui = window.SLUI;
    if (!ui) return;
    const origTop = ui.renderTopBar;
    const origRoute = ui.route;

    if (typeof origTop === 'function') {
      ui.renderTopBar = function patchedTopBar() {
        if (window.SLCoach) window.SLCoach.renderCoachBar();
        return origTop.apply(this, arguments);
      };
    }

    ui.renderNav = function patchedNav() {
      const SCREENS = ui.SCREENS || [];
      const s = window.SLState.STATE;
      const currentScreen = ui.getCurrentScreen ? ui.getCurrentScreen() : (window.__slCurrentScreen || 'ops');
      const unlock = (id) => !window.SLShell || window.SLShell.isScreenUnlocked(id, s);
      const nav = document.querySelector('#nav');
      if (!nav) return;
      nav.innerHTML = SCREENS.map((sc) => {
        const open = unlock(sc.id);
        const active = sc.id === currentScreen ? 'active' : '';
        const locked = open ? '' : 'locked';
        const pip = open ? '' : '<span class="lock-pip" title="Locked until Coach unlocks">🔒</span>';
        const aria = open ? '' : 'aria-disabled=true';
        return `<button type="button" class="nav-btn ${active} ${locked}" data-screen="${sc.id}" data-locked="${open ? '0' : '1'}" ${aria}>${sc.label}${pip}</button>`;
      }).join('');
      [...nav.querySelectorAll('.nav-btn')].forEach((btn) => {
        btn.onclick = () => {
          if (btn.dataset.locked === '1') {
            window.SLState.pushLog(s, `Tab locked: ${btn.dataset.screen}. Follow CONTINUE / Coach until it unlocks.`, 'warn');
            if (window.SLCoach) window.SLCoach.renderCoachBar();
            return;
          }
          (ui.route || origRoute)(btn.dataset.screen);
        };
      });
    };

    if (typeof origRoute === 'function') {
      ui.route = function patchedRoute(id) {
        if (!id) return;
        const s = window.SLState.STATE;
        if (window.SLShell && !window.SLShell.isScreenUnlocked(id, s)) {
          window.SLState.pushLog(s, `Cannot open ${id} yet — still locked.`, 'warn');
          id = 'ops';
        }
        window.__slCurrentScreen = id;
        const ret = origRoute.call(this, id);
        try { ui.renderNav(); } catch (_) {}
        if (window.SLCoach) window.SLCoach.renderCoachBar();
        if (window.SLShell) window.SLShell.updateShellChrome();
        return ret;
      };
    }

    if (typeof origTop === 'function') {
      const origScreen = ui.renderScreen;
      if (typeof origScreen === 'function') {
        ui.renderScreen = function patchedScreen() {
          const ret = origScreen.apply(this, arguments);
          try { ui.renderNav(); } catch (_) {}
          if (window.SLCoach) window.SLCoach.renderCoachBar();
          return ret;
        };
      }
    }

    window.SLCaptureSim = { captureSimHtml };
    console.info('[Streamer Life] ui-shell-hooks loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
})();
