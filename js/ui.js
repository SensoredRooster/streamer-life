/**
 * Streamer Life — Screen routing, meters, dual CCV display
 * Live stage = gameplay capture placeholder + overlay chrome + typography.
 * No mascot. Webcam default OFF.
 */

const SCREENS = [
  { id: 'ops', label: 'Ops Command' },
  { id: 'live', label: 'Live Session' },
  { id: 'funnel', label: 'Funnel' },
  { id: 'clips', label: 'Clip Factory' },
  { id: 'dark', label: 'Dark Market' },
  { id: 'contracts', label: 'Platform Contracts' },
  { id: 'chat', label: 'Chat Creature' },
  { id: 'body', label: 'Body / Soul' },
  { id: 'calendar', label: 'Calendar / Meta' },
  { id: 'mediakit', label: 'Media Kit' },
];

let currentScreen = 'ops';
let liveTimer = null;
let actionLock = false;
let actionLockTimer = null;

function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return [...document.querySelectorAll(sel)];
}

/** Prevent double-fire crashes when the player mashes buttons. */
function withAction(fn) {
  return function wrappedAction(ev) {
    if (actionLock) return;
    actionLock = true;
    if (actionLockTimer) clearTimeout(actionLockTimer);
    try {
      fn(ev);
    } catch (err) {
      console.error('[Streamer Life UI]', err);
      try {
        const s = window.SLState && window.SLState.STATE;
        if (s && window.SLState.pushLog) {
          window.SLState.pushLog(
            s,
            `UI fault caught: ${err && err.message ? err.message : err}`,
            'danger'
          );
        }
      } catch (_) {}
      try {
        renderTopBar();
      } catch (_) {}
    } finally {
      actionLockTimer = setTimeout(() => {
        actionLock = false;
        actionLockTimer = null;
      }, 120);
    }
  };
}

function bindClick(sel, fn) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) return;
  el.onclick = withAction(fn);
}

function fmt(n, d = 0) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return n.toFixed(d);
}

function meterBar(pct, cls = '') {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="meter ${cls}"><div class="meter-fill" style="width:${p}%"></div></div>`;
}

function renderTopBar() {
  const s = window.SLState.STATE;
  const display = window.SLState.getCcvDisplay(s);
  const ending = window.SLState.getEndingScore(s);
  const crash =
    s.decision_quality < 1
      ? `<span class="pill warn">CRASH · dq ${s.decision_quality}</span>`
      : '';

  $('#top-stats').innerHTML = `
    <div class="stat"><span class="k">Cash</span><span class="v">$${fmt(s.cash, 0)}</span></div>
    <div class="stat dual">
      <span class="k">CCV Real</span><span class="v teal">${fmt(s.ccv_real, 0)}</span>
    </div>
    <div class="stat dual">
      <span class="k">CCV Display</span><span class="v ${s.ccv_bots > 0 ? 'bottled' : ''}">${fmt(display, 0)}</span>
      ${s.ccv_bots > 0 ? `<span class="sub">bots ${s.ccv_bots}</span>` : ''}
    </div>
    <div class="stat"><span class="k">Integrity</span><span class="v ${s.integrity < 50 ? 'danger' : ''}">${fmt(s.integrity, 0)}</span></div>
    <div class="stat"><span class="k">Heat</span><span class="v warn">${fmt(s.heat, 0)}</span></div>
    <div class="stat"><span class="k">Owned</span><span class="v">${fmt(s.owned_audience, 0)}</span></div>
    <div class="stat"><span class="k">Ending</span><span class="v teal">${fmt(ending, 1)}</span></div>
    <div class="stat"><span class="k">Day</span><span class="v">D${s.day}</span></div>
    ${crash}
  `;
}

function renderNav() {
  $('#nav').innerHTML = SCREENS.map(
    (sc) =>
      `<button class="nav-btn ${sc.id === currentScreen ? 'active' : ''}" data-screen="${sc.id}">${sc.label}</button>`
  ).join('');
  $all('.nav-btn').forEach((btn) => {
    btn.onclick = () => route(btn.dataset.screen);
  });
}

function route(id) {
  if (!id) return;
  currentScreen = id;
  try {
    renderNav();
    renderScreen();
  } catch (err) {
    console.error('[Streamer Life route]', err);
  }
}

function renderScreen() {
  try {
    renderTopBar();
  } catch (err) {
    console.error('[Streamer Life top]', err);
  }
  const root = $('#screen');
  if (!root) return;
  const map = {
    ops: renderOps,
    live: renderLive,
    funnel: renderFunnel,
    clips: renderClips,
    dark: renderDark,
    contracts: renderContracts,
    chat: renderChat,
    body: renderBody,
    calendar: renderCalendar,
    mediakit: renderMediaKit,
  };
  try {
    (map[currentScreen] || renderOps)(root);
  } catch (err) {
    console.error('[Streamer Life screen]', currentScreen, err);
    root.innerHTML = `<section class="panel"><h2>Screen fault</h2><p class="danger mono">${String(
      err && err.message ? err.message : err
    )}</p><button class="btn" id="btn-recover">Back to Ops</button></section>`;
    const b = $('#btn-recover');
    if (b) b.onclick = withAction(() => route('ops'));
  }
}

/* ─── OPS COMMAND ─── */
function renderOps(root) {
  const s = window.SLState.STATE;
  const questRows = Object.entries(s.quests)
    .map(
      ([id, q]) =>
        `<tr><td class="mono">${id}</td><td>${q.label}</td><td><span class="pill ${q.status}">${q.status}</span></td></tr>`
    )
    .join('');

  root.innerHTML = `
    <header class="screen-h">
      <h1>OPS COMMAND</h1>
      <p class="sub">30% on camera · 70% ops. If you only press Go Live you stall at ~4 viewers.</p>
    </header>
    <div class="grid-2">
      <section class="panel">
        <h2>Day board · D${s.day}</h2>
        <p class="muted">Work split: clips, titles, thumbs, replies, mods, taxes. Live is the factory; shorts are the storefront.</p>
        <div class="btn-row">
          <button class="btn primary" id="btn-golive">Go Live</button>
          <button class="btn" id="btn-clip">Cut a clip</button>
          <button class="btn" id="btn-post">Post to discovery</button>
          <button class="btn" id="btn-rest">Rest / sleep</button>
          <button class="btn" id="btn-job">Side job shift</button>
          <button class="btn ghost" id="btn-advance">Advance day</button>
        </div>
        <div class="log" id="ops-log">${s.log
          .slice(0, 8)
          .map((l) => `<div class="log-line ${l.kind}"><span class="t">${l.t}</span> ${l.msg}</div>`)
          .join('') || '<div class="muted">No ops yet. Clock in.</div>'}</div>
      </section>
      <section class="panel">
        <h2>Act 1 · first 14 days</h2>
        <table class="data">${questRows}</table>
        <div class="btn-row mt">
          <button class="btn" id="btn-q00">Run Q00 CLOCK IN</button>
          <button class="btn" id="btn-q05">Trigger Q05 Empty Peak</button>
        </div>
      </section>
    </div>
  `;

  $('#btn-golive').onclick = () => {
    route('live');
    startLive();
  };
  $('#btn-clip').onclick = () => {
    s.clips_ready += 1;
    s.energy = Math.max(0, s.energy - 5);
    s.energy_spent += 5;
    window.SLState.pushLog(s, `Clip cut. clips_ready=${s.clips_ready}. Packaging still mid.`, 'info');
    renderScreen();
  };
  $('#btn-post').onclick = () => {
    if (s.clips_ready <= 0) {
      window.SLState.pushLog(s, 'No clips ready. Factory first.', 'warn');
      renderScreen();
      return;
    }
    const r = window.SLFormulas.simulateClipPost(s);
    window.SLState.pushLog(
      s,
      `Posted: imp ${r.impressions} · CTR ${(r.ctr * 100).toFixed(1)}% · +${r.follows} follows · ${r.liveClicks} live clicks`,
      'teal'
    );
    renderScreen();
  };
  $('#btn-rest').onclick = () => {
    s.energy = Math.min(100, s.energy + 35);
    s.sleep_debt = Math.max(0, s.sleep_debt - 20);
    s.burnout = Math.max(0, s.burnout - 8);
    s.hour = Math.min(23, s.hour + 8);
    window.SLState.pushLog(s, 'Rested. Burnout down. Graph did not grow.', 'info');
    renderScreen();
  };
  $('#btn-job').onclick = () => {
    s.cash += 65;
    s.energy = Math.max(0, s.energy - 25);
    s.energy_spent += 25;
    s.hour = Math.min(23, s.hour + 4);
    s.quests.Q00.status = 'done';
    if (s.quests.Q01.status === 'locked') s.quests.Q01.status = 'available';
    window.SLState.pushLog(s, 'Q00 CLOCK IN: +$65. Knees hate you. Stream window open.', 'teal');
    renderScreen();
  };
  $('#btn-advance').onclick = () => {
    s.day += 1;
    s.hour = 10;
    s.streamed_today = false;
    s.energy = Math.min(100, s.energy + 15);
    window.SLState.refreshDecisionQuality(s);
    window.SLState.pushLog(s, `Day ${s.day}. Platforms still do not care.`, 'info');
    renderScreen();
  };
  $('#btn-q00').onclick = () => $('#btn-job').click();
  $('#btn-q05').onclick = () => {
    s.quests.Q05.status = 'available';
    route('dark');
    window.SLState.pushLog(s, 'Q05 THE EMPTY PEAK: $40 bot offer on the table. Refuse or accept the lie.', 'warn');
  };
}

/* ─── LIVE SESSION ─── */
function startLive() {
  const s = window.SLState.STATE;
  if (!s || s.live) return;
  s.live = true;
  s.energy_spent = 0;
  s.ccv_real = Math.max(1, Math.floor(1 + s.followers * 0.015));
  window.SLState.pushLog(s, `Live: "${s.stream_title}". Factory open.`, 'teal');
  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
  }
  liveTimer = setInterval(() => {
    try {
      const st = window.SLState.STATE;
      if (!st || !st.live) {
        clearInterval(liveTimer);
        liveTimer = null;
        return;
      }
      window.SLFormulas.simulateLiveTick(st);
      if (currentScreen === 'live') renderScreen();
      else renderTopBar();
    } catch (err) {
      console.error('[Streamer Life live tick]', err);
      clearInterval(liveTimer);
      liveTimer = null;
    }
  }, 2000);
}

function stopLive() {
  const s = window.SLState.STATE;
  if (!s.live) return;
  window.SLFormulas.endStream(s);
  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
  }
  renderScreen();
}

function renderLive(root) {
  const s = window.SLState.STATE;
  const display = window.SLState.getCcvDisplay(s);
  const density = window.SLFormulas.chatDensity(s);

  root.innerHTML = `
    <header class="screen-h">
      <h1>LIVE SESSION HUD</h1>
      <p class="sub">Gameplay capture + overlay chrome. Not a character.</p>
    </header>
    <div class="live-stage panel">
      <div class="capture">
        <div class="capture-grid"></div>
        <div class="capture-label">GAMEPLAY CAPTURE · PLACEHOLDER</div>
        <div class="overlay-chrome">
          <div class="ow wordmark">STREAMER LIFE</div>
          <div class="ow title">${escapeHtml(s.stream_title)}</div>
          <div class="ow meters">
            <span>REAL <b>${s.ccv_real}</b></span>
            <span class="${s.ccv_bots ? 'bottled' : ''}">DISPLAY <b>${display}</b></span>
            <span>CHAT <b>${s.chatters}</b></span>
          </div>
        </div>
        ${
          s.webcam_on
            ? `<div class="webcam-tile"><div class="webcam-inner">CAM</div><button class="btn tiny" id="cam-off">OFF</button></div>`
            : `<button class="btn tiny cam-toggle" id="cam-on">Webcam OFF · toggle</button>`
        }
      </div>
      <aside class="live-side">
        <h2>Session</h2>
        <p class="mono">t=${s.live_minutes}m · energy_spent=${s.energy_spent}</p>
        ${meterBar(s.energy, s.energy < 30 ? 'danger' : '')}
        <p class="muted">Energy ${fmt(s.energy, 0)}</p>
        <p>chat_density <b>${fmt(density, 2)}</b></p>
        <p>Integrity <b class="${s.integrity < 50 ? 'danger' : ''}">${s.integrity}</b></p>
        ${
          s.energy_spent > 40
            ? `<div class="callout warn">Post-stream crash armed: energy_spent &gt; 40. End stream → dq×0.65 / 90m.</div>`
            : `<div class="callout muted">Crash threshold: energy_spent &gt; 40</div>`
        }
        <div class="btn-row">
          ${
            s.live
              ? `<button class="btn danger" id="btn-end">End stream</button>`
              : `<button class="btn primary" id="btn-start">Start stream</button>`
          }
          <button class="btn" id="btn-title">Retitle</button>
        </div>
        <label class="field">Content type
          <select id="content-type">
            ${[
              'Ranked',
              'Variety',
              'Just Chatting',
              'IRL',
              'Speedrun',
              'Gambling',
              'Reaction',
              'Horror',
              'Educational',
              'Drama',
              'ASMR',
              'Collab',
              'Charity',
            ]
              .map((t) => `<option ${t === s.content_type ? 'selected' : ''}>${t}</option>`)
              .join('')}
          </select>
        </label>
      </aside>
    </div>
  `;

  const start = $('#btn-start');
  const end = $('#btn-end');
  if (start) start.onclick = () => { startLive(); renderScreen(); };
  if (end) end.onclick = () => stopLive();
  $('#btn-title').onclick = () => {
    const titles = [
      'ranked until the graph moves',
      'ONE clip or we go dark',
      'affiliate grind (numbers only)',
      'chat decides the queue',
      'post-crash ranked (dq 0.65)',
    ];
    s.stream_title = titles[Math.floor(Math.random() * titles.length)];
    renderScreen();
  };
  $('#content-type').onchange = (e) => {
    s.content_type = e.target.value;
    if (s.content_type === 'Gambling') {
      s.sponsor_safety = Math.max(0, s.sponsor_safety - 10);
      window.SLState.pushLog(s, 'Gambling content: brand death risk up.', 'warn');
    }
  };
  const camOn = $('#cam-on');
  const camOff = $('#cam-off');
  if (camOn) camOn.onclick = () => { s.webcam_on = true; renderScreen(); };
  if (camOff) camOff.onclick = () => { s.webcam_on = false; renderScreen(); };
}

/* ─── FUNNEL ─── */
function renderFunnel(root) {
  const s = window.SLState.STATE;
  const imp = window.SLFormulas.impressions(s);
  const c = window.SLFormulas.ctr(s);
  const ret = window.SLFormulas.retention(s);
  const fc = window.SLFormulas.followConv(s, ret);

  root.innerHTML = `
    <header class="screen-h">
      <h1>FUNNEL</h1>
      <p class="sub">impressions → CTR → AVD → follow → live click. Do not yell shadowban.</p>
    </header>
    <div class="funnel panel">
      <div class="funnel-step"><span class="n">${imp}</span><span class="l">Impressions</span><span class="f">reach × niche × packaging × blessing × (1−slop)</span></div>
      <div class="funnel-arrow">↓</div>
      <div class="funnel-step"><span class="n">${(c * 100).toFixed(1)}%</span><span class="l">CTR</span><span class="f">clamp(0.02 + thumb×0.08 + title×0.05 − generic)</span></div>
      <div class="funnel-arrow">↓</div>
      <div class="funnel-step"><span class="n">${(ret * 100).toFixed(1)}%</span><span class="l">Retention / AVD</span><span class="f">entertainment · game_skill · tilt</span></div>
      <div class="funnel-arrow">↓</div>
      <div class="funnel-step"><span class="n">${(fc * 100).toFixed(2)}%</span><span class="l">Follow conv</span><span class="f">retention × trust × 0.04 × clip→live</span></div>
      <div class="funnel-arrow">↓</div>
      <div class="funnel-step"><span class="n">${s.last_follows || 0}</span><span class="l">Last follows</span><span class="f">from last post</span></div>
    </div>
    <div class="grid-3 mt">
      <div class="panel mono">reach ${s.reach}<br>niche ${s.niche_clarity}<br>packaging ${s.packaging}<br>blessing ${s.platform_blessing}<br>slop ${s.slop_penalty}</div>
      <div class="panel mono">thumb ${s.thumb_skill}<br>title ${s.title_skill}<br>entertainment ${s.entertainment}<br>game_skill ${s.game_skill}</div>
      <div class="panel mono">trust ${s.trust}<br>clip_to_live ${s.clip_to_live_quality}<br>growth_mod ${s.growth_mod}<br>dq ${s.decision_quality}</div>
    </div>
    <div class="btn-row mt">
      <button class="btn" id="btn-practice-pack">Practice packaging (+)</button>
      <button class="btn" id="btn-q07">Mark Q07 FUNNEL LESSON</button>
    </div>
  `;
  $('#btn-practice-pack').onclick = () => {
    s.packaging = Math.min(1, s.packaging + 0.03);
    s.thumb_skill = Math.min(1, s.thumb_skill + 0.02);
    s.title_skill = Math.min(1, s.title_skill + 0.02);
    s.energy = Math.max(0, s.energy - 8);
    window.SLState.pushLog(s, 'Packaging drilled. Still not a GPU upgrade.', 'info');
    renderScreen();
  };
  $('#btn-q07').onclick = () => {
    s.quests.Q07.status = 'done';
    window.SLState.pushLog(s, 'Q07: You read the funnel. Shadowban was ego.', 'teal');
    renderScreen();
  };
}

/* ─── CLIP FACTORY ─── */
function renderClips(root) {
  const s = window.SLState.STATE;
  root.innerHTML = `
    <header class="screen-h">
      <h1>CLIP FACTORY</h1>
      <p class="sub">Storefront. Hook in 1.2s or the FYP is a grave.</p>
    </header>
    <div class="grid-2">
      <section class="panel">
        <h2>Queue</h2>
        <p>clips_ready <b>${s.clips_ready}</b> · clip_quality <b>${s.clip_quality}</b></p>
        ${meterBar(s.clip_quality)}
        <div class="btn-row">
          <button class="btn primary" id="btn-factory">Render clip (−energy)</button>
          <button class="btn" id="btn-ship">Ship to Shorts/TikTok/Reels</button>
        </div>
      </section>
      <section class="panel">
        <h2>Risk tags</h2>
        <ul class="plain">
          <li>Reaction → copyright</li>
          <li>Stolen face → strike weather</li>
          <li>Soft-aim / rage alt → detect on the highlight</li>
        </ul>
        <p class="muted">soft_aim=${s.soft_aim} · rage_alt=${s.rage_alt}</p>
      </section>
    </div>
  `;
  $('#btn-factory').onclick = () => {
    s.clips_ready += 1;
    s.energy = Math.max(0, s.energy - 6);
    s.clip_to_live_quality = Math.min(1, s.clip_to_live_quality + 0.01);
    window.SLState.pushLog(s, 'Factory tick. One more storefront brick.', 'info');
    renderScreen();
  };
  $('#btn-ship').onclick = () => {
    if (s.clips_ready <= 0) {
      window.SLState.pushLog(s, 'Empty factory.', 'warn');
      renderScreen();
      return;
    }
    const r = window.SLFormulas.simulateClipPost(s);
    s.platforms.shorts.views_90d += r.impressions;
    window.SLState.pushLog(
      s,
      `Shipped: ${r.impressions} imp · +${r.follows} follows · live clicks ${r.liveClicks}`,
      'teal'
    );
    if (s.quests.Q04.status !== 'done' && r.liveClicks >= 1 && s.clips_ready >= 0) {
      s.quests.Q04.status = 'done';
    }
    renderScreen();
  };
}

/* ─── DARK MARKET ─── */
function renderDark(root) {
  const s = window.SLState.STATE;
  const cards = Object.values(window.SLDark.DARK_MARKET)
    .map((item) => {
      const e = item.effects;
      const costLabel = item.cost > 0 ? `$${item.cost}` : 'skill / risk';
      let effectLines = '';
      if (e.integrity) effectLines += `integrity ${e.integrity} · `;
      if (e.heat) effectLines += `heat +${e.heat} · `;
      if (e.detect) effectLines += `detect ${Math.round(e.detect * 100)}% · `;
      if (e.detect_pre) effectLines += `detect ${Math.round(e.detect_pre * 100)}%→${Math.round(e.detect_wave * 100)}% · `;
      if (e.clip_quality) effectLines += `clip_quality +${e.clip_quality} · `;
      if (e.growth) effectLines += `growth +${e.growth} · `;
      if (e.strike_risk) effectLines += `strike ${Math.round(e.strike_risk * 100)}% · `;
      if (e.trust) effectLines += `trust ${e.trust} · `;
      return `
        <article class="dm-card panel">
          <div class="dm-head">
            <h3 class="mono">${item.id}</h3>
            <span class="pill danger">${costLabel}</span>
          </div>
          <p>${item.blurb}</p>
          <p class="muted tiny">${effectLines.slice(0, -3)}</p>
          <button class="btn danger" data-dm="${item.id}">Purchase / activate</button>
        </article>`;
    })
    .join('');

  root.innerHTML = `
    <header class="screen-h">
      <h1>DARK MARKET</h1>
      <p class="sub">Integrity is spendable. Fraud works — then detonates. Q05 lives here.</p>
    </header>
    <div class="callout warn">
      Dual CCV after any BOT_CCV buy: Real <b>${s.ccv_real}</b> · Display <b>${window.SLState.getCcvDisplay(s)}</b> · bots <b>${s.ccv_bots}</b> · integrity <b>${s.integrity}</b>
    </div>
    <div class="dm-grid">${cards}</div>
    <div class="btn-row mt">
      <button class="btn ghost" id="btn-troll">Simulate E_TROLL_BOT on you</button>
      <button class="btn ghost" id="btn-wave">Trigger AC wave (DMA)</button>
      <button class="btn" id="btn-refuse">Q05: Refuse the $40 bot</button>
    </div>
  `;

  $all('[data-dm]').forEach((btn) => {
    bindClick(btn, () => {
      const res = window.SLDark.applyDarkMarket(btn.dataset.dm, s);
      if (!res || !res.ok) {
        window.SLState.pushLog(s, (res && res.msg) || 'Dark Market failed.', 'warn');
      } else if (btn.dataset.dm === 'BOT_CCV' && s.quests.Q05.status === 'available') {
        s.quests.Q05.status = 'done';
        window.SLState.pushLog(s, 'Q05: You accepted the lie. ending_score already feels it.', 'danger');
      }
      renderScreen();
    });
  });
  $('#btn-troll').onclick = () => {
    window.SLDark.enemyTrollBot(s);
    renderScreen();
  };
  $('#btn-wave').onclick = () => {
    window.SLDark.triggerAcWave(s);
    renderScreen();
  };
  $('#btn-refuse').onclick = () => {
    s.integrity = Math.min(100, s.integrity + 2);
    s.quests.Q05.status = 'done';
    window.SLState.pushLog(s, 'Q05: Refused $40 bottled CCV. Empty peak stands. Integrity +2.', 'teal');
    renderScreen();
  };
}

/* ─── PLATFORM CONTRACTS ─── */
function renderContracts(root) {
  const s = window.SLState.STATE;
  const tw = s.platforms.twitch;
  const yt = s.platforms.youtube;
  const kick = s.platforms.kick;
  const sub = window.SLFormulas.takeHomeSub(4.99, tw.split);

  root.innerHTML = `
    <header class="screen-h">
      <h1>PLATFORM CONTRACTS</h1>
      <p class="sub">Factions. None is a complete business. Owned land is the bunker.</p>
    </header>
    <div class="grid-2">
      <section class="panel">
        <h2>Twitch · home base</h2>
        <p>Directory sorts by CCV — small = buried. Affiliate ~25 followers / 4h / 4 unique days / avg 3 CCV.</p>
        <p class="mono">followers ${s.followers} · unique_days ${s.unique_stream_days} · standing ${tw.standing} · affiliate ${tw.affiliate}</p>
        <p>Sub take-home @ $4.99 / ${tw.split * 100}% split: <b>$${sub.toFixed(2)}</b> (processor + tax withhold).</p>
        <p class="muted">Plus ladder 60/40 then 70/30 from PAID subs only. Bot penalty caps display to historical real.</p>
        <button class="btn" id="btn-aff">Check Affiliate gate</button>
      </section>
      <section class="panel">
        <h2>YouTube · archive that pays later</h2>
        <p>YPP: 8000 watch hours OR 20M Shorts / 90d. Silent kill = yellow dollar.</p>
        <p class="mono">watch_hours ${fmt(s.watch_hours, 1)} · Shorts 90d ${yt.views_90d || s.platforms.shorts.views_90d} · ypp ${yt.ypp}</p>
      </section>
      <section class="panel">
        <h2>Kick · 95/5 headline</h2>
        <p>Thinner city. Partner multi-stream toggle can cut that session ~50%.</p>
        <p class="mono">standing ${kick.standing} · partner_toggle ${kick.partner_toggle}</p>
        <button class="btn" id="btn-kick">Toggle multi-stream cut</button>
      </section>
      <section class="panel">
        <h2>Owned land · bunker</h2>
        <p class="mono">Discord ${s.platforms.owned.discord} · email ${s.platforms.owned.email} · Patreon ${s.platforms.owned.patreon}</p>
        <p>owned_audience = <b>${s.owned_audience}</b> (feeds ending_score)</p>
        <div class="btn-row">
          <button class="btn" id="btn-disc">+1 Discord</button>
          <button class="btn" id="btn-email">+1 Email</button>
          <button class="btn" id="btn-pat">+1 Patreon</button>
        </div>
      </section>
    </div>
  `;
  $('#btn-aff').onclick = () => {
    if (s.followers >= 25 && s.unique_stream_days >= 4 && s.watch_hours >= 4) {
      tw.affiliate = true;
      window.SLState.pushLog(s, 'Affiliate gate cleared. Split still 50/50. Congrats on the leash.', 'teal');
    } else {
      window.SLState.pushLog(s, 'Affiliate: not yet. Numbers, not vibes.', 'warn');
    }
    renderScreen();
  };
  $('#btn-kick').onclick = () => {
    kick.partner_toggle = !kick.partner_toggle;
    window.SLState.pushLog(
      s,
      kick.partner_toggle ? 'Kick multi-stream: session payout −50%.' : 'Kick toggle off.',
      'warn'
    );
    renderScreen();
  };
  $('#btn-disc').onclick = () => {
    s.platforms.owned.discord += 1;
    window.SLState.recomputeOwned(s);
    renderScreen();
  };
  $('#btn-email').onclick = () => {
    s.platforms.owned.email += 1;
    window.SLState.recomputeOwned(s);
    renderScreen();
  };
  $('#btn-pat').onclick = () => {
    s.platforms.owned.patreon += 1;
    window.SLState.recomputeOwned(s);
    s.cash += 3;
    renderScreen();
  };
}

/* ─── CHAT CREATURE ─── */
const CHAT_TYPES = [
  'lurker',
  'chatter',
  'clip goblin',
  'whale',
  'parasocial spouse',
  'backseat cop',
  'hater who stays',
  'raid tourist',
  'bot',
  'fellow streamer scout',
  'brand intern',
];

function renderChat(root) {
  const s = window.SLState.STATE;
  const hist = s.reply_history.slice(-10);
  root.innerHTML = `
    <header class="screen-h">
      <h1>CHAT CREATURE</h1>
      <p class="sub">You train the room with your last 10 replies.</p>
    </header>
    <div class="grid-2">
      <section class="panel">
        <h2>Population mix</h2>
        <ul class="plain">${CHAT_TYPES.map((t) => `<li>${t}</li>`).join('')}</ul>
        <p class="mono">chatters now ${s.chatters} · unique today ${s.unique_chatters_today} · mods ${s.mods}</p>
      </section>
      <section class="panel">
        <h2>Reply training</h2>
        <div class="btn-row">
          <button class="btn" data-tone="warm">Warm</button>
          <button class="btn" data-tone="roast">Roast</button>
          <button class="btn" data-tone="ignore">Ignore</button>
          <button class="btn" data-tone="mod">Mod hammer</button>
          <button class="btn" data-tone="parasocial">Feed parasocial</button>
        </div>
        <p class="muted">Last 10: ${hist.join(', ') || '—'}</p>
        <button class="btn primary mt" id="btn-q06">Seed 10 unique + first mod (Q06)</button>
      </section>
    </div>
  `;
  $all('[data-tone]').forEach((btn) => {
    btn.onclick = () => {
      const tone = btn.dataset.tone;
      s.reply_history.push(tone);
      if (s.reply_history.length > 10) s.reply_history.shift();
      if (tone === 'warm') {
        s.trust = Math.min(100, s.trust + 1);
        s.community_craft = Math.min(1, s.community_craft + 0.01);
      }
      if (tone === 'roast') {
        s.entertainment = Math.min(1, s.entertainment + 0.02);
        s.sponsor_safety = Math.max(0, s.sponsor_safety - 1);
      }
      if (tone === 'ignore') s.isolation = Math.min(100, s.isolation + 2);
      if (tone === 'mod') {
        s.heat = Math.max(0, s.heat - 1);
        s.trust = Math.min(100, s.trust + 0.5);
      }
      if (tone === 'parasocial') {
        s.parasocial_debt += 3;
        s.owned_audience += 0; // vanity elsewhere
        s.platforms.owned.discord += Math.random() < 0.3 ? 1 : 0;
        window.SLState.recomputeOwned(s);
      }
      window.SLState.pushLog(s, `Reply tone: ${tone}. Creature learns.`, 'info');
      renderScreen();
    };
  });
  $('#btn-q06').onclick = () => {
    s.unique_chatters_today = 10;
    s.mods = 1;
    s.quests.Q06.status = 'done';
    window.SLState.pushLog(s, 'Q06 CHAT CREATURE: 10 unique, first mod hired. Room has a spine.', 'teal');
    renderScreen();
  };
}

/* ─── BODY / SOUL ─── */
function renderBody(root) {
  const s = window.SLState.STATE;
  const ending = window.SLState.getEndingScore(s);
  root.innerHTML = `
    <header class="screen-h">
      <h1>BODY / SOUL</h1>
      <p class="sub">Burnout can beat a green graph. ending_score ignores bottled CCV.</p>
    </header>
    <div class="grid-2">
      <section class="panel">
        <h2>Body</h2>
        <label>Energy ${s.energy}${meterBar(s.energy)}</label>
        <label>Sleep debt ${s.sleep_debt}${meterBar(s.sleep_debt, 'warn')}</label>
        <label>Voice ${s.voice}${meterBar(s.voice)}</label>
        <label>RSI ${s.rsi}${meterBar(s.rsi, 'danger')}</label>
        <label>Hunger ${s.hunger}${meterBar(s.hunger, 'warn')}</label>
        <label>Caffeine ${s.caffeine}${meterBar(s.caffeine)}</label>
        <p class="mono">health multiplier ${s.health}</p>
      </section>
      <section class="panel">
        <h2>Soul</h2>
        <label>Burnout ${fmt(s.burnout, 1)}${meterBar((s.burnout / 120) * 100, 'danger')}</label>
        <label>Integrity ${s.integrity}${meterBar(s.integrity, s.integrity < 50 ? 'danger' : 'teal')}</label>
        <label>Authenticity gap ${s.authenticity_gap}${meterBar(s.authenticity_gap, 'warn')}</label>
        <label>Isolation ${s.isolation}${meterBar(s.isolation)}</label>
        <label>Metrics obsession ${s.metrics_obsession}${meterBar(s.metrics_obsession, 'warn')}</label>
        <label>Parasocial debt ${s.parasocial_debt}${meterBar(Math.min(100, s.parasocial_debt))}</label>
        <div class="callout teal mt">
          <div class="mono">ending_score = owned_audience × (integrity/100) × (1 − burnout/120) × health</div>
          <div class="big">${fmt(ending, 2)}</div>
          <div class="muted">= ${s.owned_audience} × (${s.integrity}/100) × (1 − ${fmt(s.burnout, 1)}/120) × ${s.health}</div>
        </div>
        <div class="btn-row mt">
          <button class="btn" id="btn-q10-rest">Q10: Dark day (rest)</button>
          <button class="btn danger" id="btn-q10-lie">Q10: Stream through crash</button>
        </div>
      </section>
    </div>
  `;
  $('#btn-q10-rest').onclick = () => {
    s.burnout = Math.max(25, s.burnout);
    s.burnout = Math.max(0, s.burnout - 15);
    s.energy = 90;
    s.quests.Q10.status = 'done';
    window.SLState.pushLog(s, 'Q10 REST: Dark day. Graph flat. ending_score breathes.', 'teal');
    renderScreen();
  };
  $('#btn-q10-lie').onclick = () => {
    s.burnout = Math.max(25, s.burnout + 10);
    s.crash_until = window.SLState.getMinuteStamp(s) + 90;
    s.decision_quality = 0.65;
    s.authenticity_gap += 8;
    s.quests.Q10.status = 'done';
    window.SLState.pushLog(s, 'Q10 LIE: Streamed through crash. Funny until it isn\'t.', 'danger');
    startLive();
    route('live');
  };
}

/* ─── CALENDAR / META ─── */
function renderCalendar(root) {
  const s = window.SLState.STATE;
  const good = ['E_RAID_DOWN', 'E_FYP_SPIKE', 'E_KEY_DROP', 'E_QUIET_WHALE', 'E_COLLAB_OFFER', 'E_BLESSING_WEEK'];
  const bad = ['E_UPLINK_DIE', 'E_VOD_MUTE', 'E_FALSE_BAN', 'E_TROLL_BOT', 'E_MOD_NUKE', 'E_BRAND_GHOST', 'E_RATE_CUT', 'E_STOLEN_FACE', 'E_DOOR'];
  const ugly = ['E_REACT_FUNERAL', 'E_GAMBLE_SPONSOR', 'E_ONE_TIME_CHEAT', 'E_LEAK_DISCORD', 'E_FAKE_BREAKDOWN', 'E_STREAM_THROUGH_PANIC'];
  const builds = ['Clip brain', 'Parasocial sponge', 'One-trick', 'Wholesome', 'Unfiltered', 'Ops monster', 'Detective', 'Dark market'];

  root.innerHTML = `
    <header class="screen-h">
      <h1>CALENDAR / META</h1>
      <p class="sub">Event weather · builds · moral memory</p>
    </header>
    <div class="grid-3">
      <section class="panel"><h2 class="teal">GOOD</h2><ul class="plain mono">${good.map((e) => `<li>${e}</li>`).join('')}</ul></section>
      <section class="panel"><h2 class="warn">BAD</h2><ul class="plain mono">${bad.map((e) => `<li>${e}</li>`).join('')}</ul></section>
      <section class="panel"><h2 class="danger">UGLY</h2><ul class="plain mono">${ugly.map((e) => `<li>${e}</li>`).join('')}</ul></section>
    </div>
    <section class="panel mt">
      <h2>Builds</h2>
      <div class="btn-row">${builds.map((b) => `<button class="btn" data-build="${b}">${b}</button>`).join('')}</div>
      <p class="muted mt">Detective shows bottled CCV in a different color. Dark market unlocks SKUs early.</p>
    </section>
    <div class="btn-row mt">
      <button class="btn" id="btn-event">Roll random event</button>
      <button class="btn ghost" id="btn-reset">Reset save (integrity returns; memory doesn't)</button>
    </div>
  `;
  $all('[data-build]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.build === 'Detective') {
        s.detective = true;
        window.SLState.pushLog(s, 'Build: Detective. Bottled CCV highlighted.', 'teal');
      }
      if (btn.dataset.build === 'Dark market') {
        s.cash += 40;
        window.SLState.pushLog(s, 'Build: Dark market. First $40 feels free.', 'warn');
      }
      renderScreen();
    };
  });
  $('#btn-event').onclick = () => {
    const pool = [...good, ...bad, ...ugly];
    const ev = pool[Math.floor(Math.random() * pool.length)];
    if (ev === 'E_TROLL_BOT') window.SLDark.enemyTrollBot(s);
    else if (ev === 'E_FYP_SPIKE') {
      s.reach += 50;
      s.platforms.shorts.views_90d += 5000;
    } else if (ev === 'E_FALSE_BAN') {
      s.strikes += 1;
      s.heat += 20;
    } else if (ev === 'E_QUIET_WHALE') {
      s.cash += 50;
      s.pending_payouts += 120;
    } else if (ev === 'E_RATE_CUT') {
      s.platforms.twitch.split = Math.max(0.3, s.platforms.twitch.split - 0.1);
    }
    window.SLState.pushLog(s, `Event ${ev}`, good.includes(ev) ? 'teal' : 'danger');
    renderScreen();
  };
  $('#btn-reset').onclick = () => {
    window.SLState.reset();
    window.SLState.pushLog(window.SLState.STATE, 'New save. Moral memory wiped — for now.', 'warn');
    renderScreen();
  };
}

/* ─── MEDIA KIT ─── */
function renderMediaKit(root) {
  const s = window.SLState.STATE;
  const display = window.SLState.getCcvDisplay(s);
  const polite = s.media_kit_lie;
  root.innerHTML = `
    <header class="screen-h">
      <h1>MEDIA KIT</h1>
      <p class="sub">The polite lie you send brands. Toggle honesty.</p>
    </header>
    <section class="panel media-kit">
      <div class="wordmark">STREAMER LIFE</div>
      <h2>Creator one-pager</h2>
      <div class="grid-3">
        <div><span class="k">Avg CCV</span><div class="big ${polite ? 'bottled' : 'teal'}">${polite ? Math.max(display, s.ccv_real + 40) : s.ccv_real}</div><div class="muted tiny">${polite ? 'display-flavored' : 'real only'}</div></div>
        <div><span class="k">Followers</span><div class="big">${s.followers}${polite ? '+' : ''}</div></div>
        <div><span class="k">Sponsor safety</span><div class="big">${s.sponsor_safety}</div></div>
      </div>
      <p class="mt">${polite ? 'Engaged community · brand-safe moments · cross-platform reach.' : `Integrity ${s.integrity}. Heat ${s.heat}. Strikes ${s.strikes}. Owned ${s.owned_audience}. Bottled CCV ${s.ccv_bots}.`}</p>
      <div class="btn-row">
        <button class="btn" id="btn-lie">${polite ? 'Show honest numbers' : 'Restore polite lie'}</button>
      </div>
    </section>
  `;
  $('#btn-lie').onclick = () => {
    s.media_kit_lie = !s.media_kit_lie;
    renderScreen();
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.SLUI = {
  SCREENS,
  route,
  renderScreen,
  renderTopBar,
  renderNav,
  startLive,
  stopLive,
  withAction,
  bindClick,
};
