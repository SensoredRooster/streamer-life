/**
 * Streamer Life — Market formulas (locked brief)
 * Uses canonical SLState field names.
 */

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function impressions(s) {
  return Math.floor(
    num(s.reach) *
      num(s.niche_clarity, 0.2) *
      num(s.packaging, 0.2) *
      num(s.platform_blessing, 0.5) *
      (1 - clamp(num(s.slop_penalty), 0, 0.9)) *
      (1 + num(s.growth_mod) / 100)
  );
}

function ctr(s, genericPenalty = 0.02) {
  return clamp(
    0.02 + num(s.thumb_skill) * 0.08 + num(s.title_skill) * 0.05 - genericPenalty,
    0.01,
    0.22
  );
}

function retention(s, tilt = 0) {
  return clamp(
    0.18 + num(s.entertainment) * 0.25 + num(s.game_skill) * 0.1 - tilt * 0.15,
    0.08,
    0.72
  );
}

function followConv(s, ret) {
  return num(ret) * (num(s.trust) / 100) * 0.04 * num(s.clip_to_live_quality, 0.4);
}

function chatDensity(s) {
  const disp = window.SLState.getCcvDisplay(s);
  return num(s.chatters) / Math.max(disp, 1);
}

function takeHomeSub(price, platformSplit, processorFee = 0.029, taxWithhold = 0.24) {
  return num(price) * num(platformSplit, 0.5) * (1 - processorFee) * (1 - taxWithhold);
}

function simulateClipPost(s) {
  const imp = impressions(s) * (0.8 + Math.random() * 0.5);
  const c = ctr(s);
  const clicks = Math.floor(imp * c);
  const ret = retention(s, num(s.burnout) > 40 ? 0.3 : 0.05);
  const dq = num(s.decision_quality, 1);
  const follows = Math.max(0, Math.floor(clicks * followConv(s, ret) * dq));
  const liveClicks = Math.max(
    0,
    Math.floor(follows * 0.35 * num(s.clip_to_live_quality, 0.4))
  );

  s.last_impressions = Math.floor(imp);
  s.last_ctr = c;
  s.last_retention = ret;
  s.last_follows = follows;
  s.followers = num(s.followers) + follows;
  s.reach = num(s.reach) + Math.floor(follows * 0.5 + liveClicks);
  if (num(s.clips_ready) > 0) s.clips_ready = num(s.clips_ready) - 1;

  return {
    impressions: Math.floor(imp),
    ctr: c,
    clicks,
    retention: ret,
    follows,
    liveClicks,
  };
}

function simulateLiveTick(s) {
  const base =
    1 +
    Math.floor(num(s.followers) * 0.02 * num(s.niche_clarity, 0.2)) +
    Math.floor(num(s.trust) / 40) +
    (num(s.packaging) > 0.4 ? 1 : 0);
  const noise = Math.floor(Math.random() * 3) - 1;
  const crash = num(s.decision_quality, 1) < 1 ? 0.7 : 1;
  s.ccv_real = Math.max(
    0,
    Math.floor((base + noise) * crash * (0.85 + Math.random() * 0.3))
  );
  if (num(s.ccv_bots) > 0 && Math.random() < 0.05) {
    s.ccv_bots = Math.max(0, num(s.ccv_bots) - Math.ceil(num(s.ccv_bots) * 0.1));
  }
  s.chatters = Math.max(
    0,
    Math.floor(
      num(s.ccv_real) * (0.15 + Math.random() * 0.25) +
        (num(s.ccv_bots) > 0 ? Math.random() * 2 : 0)
    )
  );
  s.live_minutes = num(s.live_minutes) + 5;
  s.energy = Math.max(0, num(s.energy) - 2);
  s.energy_spent = num(s.energy_spent) + 2;
  s.burnout = Math.min(120, num(s.burnout) + 0.4);
  s.watch_hours =
    num(s.watch_hours) + (window.SLState.getCcvDisplay(s) * 5) / 60;
}

function endStream(s) {
  s.live = false;
  const spent = num(s.energy_spent);
  if (spent > 40) {
    const until = window.SLState.getMinuteStamp(s) + 90;
    s.crash_until = until;
    s.decision_quality = 0.65;
    window.SLState.pushLog(
      s,
      `Post-stream crash: energy_spent ${spent} > 40. decision_quality *= 0.65 for 90 min.`,
      'warn'
    );
  }
  if (!s.streamed_today) {
    s.unique_stream_days = num(s.unique_stream_days) + 1;
    s.streamed_today = true;
  }
  s.live_minutes = 0;
  s.ccv_real = 0;
  s.chatters = 0;
  s.energy_spent = 0;
  s.watch_hours = Math.round(num(s.watch_hours) * 10) / 10;
}

window.SLFormulas = {
  clamp,
  impressions,
  ctr,
  retention,
  followConv,
  chatDensity,
  takeHomeSub,
  simulateClipPost,
  simulateLiveTick,
  endStream,
};
