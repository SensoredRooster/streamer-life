/**
 * Streamer Life — Coach / guided playthrough
 * Speaks plain English. Recommends one next move. Can execute it.
 */

function questStatus(s, id) {
  return (s.quests && s.quests[id] && s.quests[id].status) || 'locked';
}

function firstOpenQuest(s) {
  const order = ['Q00','Q01','Q02','Q03','Q04','Q05','Q06','Q07','Q08','Q09','Q10'];
  for (const id of order) {
    const st = questStatus(s, id);
    if (st === 'available') return id;
    if (st === 'locked') return id; // next locked is the wall — coach will explain how to unlock
  }
  return null;
}

/**
 * Returns { id, title, why, how, screen, action }
 * action is a string key executed by runCoachAction
 */
function getCoachAdvice(s) {
  if (!s) {
    return {
      id: 'boot',
      title: 'Boot the day',
      why: 'State missing.',
      how: 'Reload the page.',
      screen: 'ops',
      action: null,
    };
  }

  // Crash / energy emergencies first
  if (s.decision_quality < 1) {
    return {
      id: 'crash',
      title: 'You are in post-stream crash',
      why: 'You streamed hard. Decision quality is wrecked for a bit.',
      how: 'Rest / sleep on Ops — do not Dark Market impulse-buy while crashed.',
      screen: 'ops',
      action: 'rest',
    };
  }
  if ((s.energy || 0) < 25) {
    return {
      id: 'energy',
      title: 'Energy is critically low',
      why: 'Live and clips will tank if you push.',
      how: 'Rest / sleep, then come back.',
      screen: 'ops',
      action: 'rest',
    };
  }

  const q00 = questStatus(s, 'Q00');
  if (q00 !== 'done') {
    return {
      id: 'Q00',
      title: 'Next: Clock in (side job)',
      why: 'Rent exists. Streaming unpaid with $0 runway is how runs die Day 1.',
      how: 'On Ops, hit Side job shift / Run Q00. +$65, unlocks First Light.',
      screen: 'ops',
      action: 'q00_job',
    };
  }

  const q01 = questStatus(s, 'Q01');
  if (q01 !== 'done') {
    if (!s.live) {
      return {
        id: 'Q01',
        title: 'Next: Go live (~90 min factory)',
        why: 'Act 1 needs a real session before clips matter.',
        how: 'Ops → Go Live → let the timer tick. End stream when energy_spent feels real.',
        screen: 'live',
        action: 'go_live',
      };
    }
    return {
      id: 'Q01b',
      title: 'You are live — let it cook',
      why: 'First Light is about hours in the factory, not panic-clicking.',
      how: 'Watch CCV Real vs Display. When ready: End stream, then cut a clip.',
      screen: 'live',
      action: null,
    };
  }

  if ((s.clips_ready || 0) < 1 && questStatus(s, 'Q04') !== 'done') {
    return {
      id: 'clip',
      title: 'Next: Cut a clip',
      why: 'Live is the factory. Clips are the storefront. Empty storefront = no discovery.',
      how: 'Ops → Cut a clip (or Clip Factory).',
      screen: 'ops',
      action: 'cut_clip',
    };
  }

  if ((s.clips_ready || 0) > 0 && questStatus(s, 'Q04') !== 'done') {
    return {
      id: 'Q04',
      title: 'Next: Post a clip to discovery',
      why: 'One converting clip teaches the funnel better than ten rant streams.',
      how: 'Ops → Post to discovery. Watch impressions → CTR → follows → live clicks.',
      screen: 'ops',
      action: 'post_clip',
    };
  }

  if (questStatus(s, 'Q05') === 'available' || (questStatus(s, 'Q04') === 'done' && questStatus(s, 'Q05') === 'locked')) {
    return {
      id: 'Q05',
      title: 'Next: The Empty Peak (integrity choice)',
      why: 'A $40 bot offer will appear. This is the moral tutorial.',
      how: 'Open Dark Market. Coach recommends REFUSE (keeps integrity). Accepting is the lie.',
      screen: 'dark',
      action: 'q05_refuse',
    };
  }

  if (questStatus(s, 'Q06') !== 'done') {
    return {
      id: 'Q06',
      title: 'Next: Train the chat creature',
      why: 'Chat is a trained animal. Last 10 replies shape the room.',
      how: 'Chat Creature tab → Warm / Mod a few times → Seed 10 unique + first mod.',
      screen: 'chat',
      action: 'q06_seed',
    };
  }

  if (questStatus(s, 'Q07') !== 'done') {
    return {
      id: 'Q07',
      title: 'Next: Read the funnel (do not yell shadowban)',
      why: 'Most “shadowban” feelings are bad packaging + niche mush.',
      how: 'Open Funnel, read the numbers, mark Q07 done.',
      screen: 'funnel',
      action: 'q07_done',
    };
  }

  if ((s.cash || 0) < 40 && (s.energy || 0) > 40) {
    return {
      id: 'money',
      title: 'Cash is tight',
      why: 'Dark Market and downtime both need runway.',
      how: 'Side job shift, or advance day after a rest.',
      screen: 'ops',
      action: 'q00_job',
    };
  }

  return {
    id: 'explore',
    title: 'Act 1 spine is clear — explore systems',
    why: 'You know the loop: Live → Clip → Post → Community → Money/Heat → Rest.',
    how: 'Try Body/Soul (ending score), Platform Contracts, or advance a day. Coach stays for emergencies.',
    screen: 'body',
    action: null,
  };
}

function goScreen(id) {
  if (window.SLUI && typeof window.SLUI.route === 'function') window.SLUI.route(id);
}
function paint() {
  if (window.SLUI && typeof window.SLUI.renderScreen === 'function') window.SLUI.renderScreen();
  if (window.SLCoach) window.SLCoach.renderCoachBar();
}

function runCoachAction(action) {
  const s = window.SLState.STATE;
  if (!action) return { ok: false, msg: 'No auto-action — follow the How text.' };

  switch (action) {
    case 'rest': {
      s.energy = Math.min(100, (s.energy || 0) + 35);
      s.sleep_debt = Math.max(0, (s.sleep_debt || 0) - 20);
      s.burnout = Math.max(0, (s.burnout || 0) - 8);
      s.hour = Math.min(23, (s.hour || 0) + 8);
      window.SLState.refreshDecisionQuality(s);
      window.SLState.pushLog(s, 'Coach: Rest taken. Come back sharper.', 'teal');
      goScreen('ops');
      return { ok: true };
    }
    case 'q00_job': {
      s.cash = (s.cash || 0) + 65;
      s.energy = Math.max(0, (s.energy || 0) - 25);
      s.energy_spent = (s.energy_spent || 0) + 25;
      s.hour = Math.min(23, (s.hour || 0) + 4);
      if (s.quests.Q00) s.quests.Q00.status = 'done';
      if (s.quests.Q01 && s.quests.Q01.status === 'locked') s.quests.Q01.status = 'available';
      window.SLState.pushLog(s, 'Coach ran Q00 CLOCK IN: +$65. First Light unlocked.', 'teal');
      goScreen('ops');
      return { ok: true };
    }
    case 'go_live': {
      if (s.quests.Q01 && s.quests.Q01.status === 'locked') s.quests.Q01.status = 'available';
      goScreen('live');
      if (window.SLUI && window.SLUI.startLive) window.SLUI.startLive();
      // Guided playthrough: count first live as Q01 progress complete
      if (s.quests.Q01) s.quests.Q01.status = 'done';
      if (s.quests.Q02 && s.quests.Q02.status === 'locked') s.quests.Q02.status = 'available';
      window.SLState.pushLog(s, 'Coach: Went live (Q01 First Light). Watch Real vs Display CCV.', 'teal');
      return { ok: true };
    }
    case 'cut_clip': {
      s.clips_ready = (s.clips_ready || 0) + 1;
      s.energy = Math.max(0, (s.energy || 0) - 5);
      s.energy_spent = (s.energy_spent || 0) + 5;
      window.SLState.pushLog(s, 'Coach: Cut a clip. Storefront inventory +1.', 'info');
      goScreen('ops');
      return { ok: true };
    }
    case 'post_clip': {
      if ((s.clips_ready || 0) <= 0) return { ok: false, msg: 'No clips — cut one first.' };
      const r = window.SLFormulas.simulateClipPost(s);
      if (s.quests.Q04) s.quests.Q04.status = 'done';
      if (s.quests.Q05 && s.quests.Q05.status === 'locked') s.quests.Q05.status = 'available';
      window.SLState.pushLog(
        s,
        `Coach posted clip: +${(r.follows ?? r.follows ?? 0)} follows · ${(r.liveClicks ?? r.live_clicks ?? 0)} live clicks. Empty Peak unlocked.`,
        'teal'
      );
      goScreen('funnel');
      return { ok: true };
    }
    case 'q05_refuse': {
      s.integrity = Math.min(100, (s.integrity || 100) + 2);
      if (s.quests.Q05) s.quests.Q05.status = 'done';
      if (s.quests.Q06 && s.quests.Q06.status === 'locked') s.quests.Q06.status = 'available';
      window.SLState.pushLog(s, 'Coach: Refused bottled CCV. Integrity +2. Chat Creature unlocked.', 'teal');
      goScreen('chat');
      return { ok: true };
    }
    case 'q06_seed': {
      s.unique_chatters_today = 10;
      s.mods = Math.max(1, s.mods || 0);
      if (s.quests.Q06) s.quests.Q06.status = 'done';
      if (s.quests.Q07 && s.quests.Q07.status === 'locked') s.quests.Q07.status = 'available';
      window.SLState.pushLog(s, 'Coach: Seeded 10 chatters + first mod. Funnel lesson next.', 'teal');
      goScreen('funnel');
      return { ok: true };
    }
    case 'q07_done': {
      if (s.quests.Q07) s.quests.Q07.status = 'done';
      window.SLState.pushLog(s, 'Coach: Funnel read. Shadowban was ego.', 'teal');
      goScreen('funnel');
      return { ok: true };
    }
    default:
      return { ok: false, msg: 'Unknown coach action.' };
  }
}

function renderCoachBar() {
  const host = document.getElementById('coach-bar');
  if (!host || !window.SLState) return;
  const s = window.SLState.STATE;
  const tip = getCoachAdvice(s);
  const guided = !!s.coach_guided;

  host.innerHTML = `
    <div class="coach-inner">
      <div class="coach-badge">COACH</div>
      <div class="coach-body">
        <div class="coach-title">${tip.title}</div>
        <div class="coach-why">${tip.why}</div>
        <div class="coach-how"><b>Do this:</b> ${tip.how}</div>
      </div>
      <div class="coach-actions">
        <button type="button" class="btn primary coach-continue" id="coach-continue">CONTINUE</button>
        <button type="button" class="btn tiny" id="coach-goto">Open ${tip.screen}</button>
        ${
          tip.action
            ? `<button type="button" class="btn tiny" id="coach-do">Do it for me</button>`
            : `<button type="button" class="btn tiny ghost" id="coach-do" disabled>Manual step</button>`
        }
        <button type="button" class="btn tiny ${guided ? 'primary' : ''}" id="coach-guided">${
          guided ? 'Guided ON' : 'Guided OFF'
        }</button>
      </div>
    </div>
  `;

  const cont = document.getElementById('coach-continue');
  const goto = document.getElementById('coach-goto');
  const doit = document.getElementById('coach-do');
  const gbtn = document.getElementById('coach-guided');
  if (cont) {
    cont.onclick = () => {
      if (window.SLShell && window.SLShell.continueFromCoach) window.SLShell.continueFromCoach();
      else if (tip.action) runCoachAction(tip.action);
      else if (tip.screen) window.SLUI.route(tip.screen);
      renderCoachBar();
      if (window.SLUI.renderScreen) window.SLUI.renderScreen();
    };
  }
  if (goto) {
    goto.onclick = () => {
      window.SLUI.route(tip.screen);
    };
  }
  if (doit && tip.action) {
    doit.onclick = () => {
      const r = runCoachAction(tip.action);
      if (!r.ok) window.SLState.pushLog(s, r.msg || 'Coach could not run that.', 'warn');
      renderCoachBar();
      window.SLUI.renderScreen();
    };
  }
  if (gbtn) {
    gbtn.onclick = () => {
      s.coach_guided = !s.coach_guided;
      window.SLState.pushLog(
        s,
        s.coach_guided
          ? 'Guided playthrough ON — follow the Coach bar. Prefer “Do it for me”.'
          : 'Guided playthrough OFF — Coach still advises.',
        'info'
      );
      renderCoachBar();
    };
  }
}

window.SLCoach = {
  getCoachAdvice,
  runCoachAction,
  renderCoachBar,
};
