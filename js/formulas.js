/**
 * Streamer Life — Market formulas (from design brief)
 */

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function impressions(s) {
  return Math.floor(
    s.reach *
      s.niche_clarity *
      s.packaging *
      s.platform_blessing *
      (1 - s.slop_penalty) *
      (1 + (s.growth_mod || 0) / 100)
  );
}

function ctr(s, genericPenalty = 0.02) {
  return clamp(
    0.02 + s.thumb_skill * 0.08 + s.title_skill * 0.05 - genericPenalty,
    0.01,
    0.22
  );
}

function retention(s, tilt = 0) {
  return clamp(
    0.18 + s.entertainment * 0.25 + s.game_skill * 0.1 - tilt * 0.15,
    0.08,
    0.72
  );
}

function followConv(s, ret) {
  return ret * (s.trust / 100) * 0.04 * s.clip_to_live_quality;
}

function chatDensity(s) {
  const disp = window.SLState.getCcvDisplay(s);
  return s.chatters / Math.max(disp, 1);
}

function takeHomeSub(price, platformSplit, processorFee = 0.029, taxWithhold = 0.24) {
  return price * platformSplit * (1 - processorFee) * (1 - taxWithhold);
}

function simulateClipPost(s) {
  const imp = impressions(s) * (0.8 + Math.random() * 0.5);
  const c = ctr(s);
  const clicks = Math.floor(imp * c);
  const ret = retention(s, s.burnout > 40 ? 0.3 : 0.05);
  const follows = Math.max(0, Math.floor(clicks * followConv(s, ret) * s.decision_quality));
  const liveClicks = Math.max(0, Math.floor(follows * 0.35 * s.clip_to_live_quality));

  s.last_impressions = Math.floor(imp);
  s.last_ctr = c;
  s.last_retention = ret;
  s.last_follows = follows;
  s.followers += follows;
  s.reach += Math.floor(follows * 0.5 + liveClicks);
  if (s.clips_ready > 0) s.clips_ready -= 1;

  return { impressions: Math.floor(imp), ctr: c, clicks, retention: ret, follows, liveClicks };
}

function simulateLiveTick(s) {
  // Organic CCV drift; bots sit on top via ccv_bots
  const base =
    1 +
    Math.floor(s.followers * 0.02 * s.niche_clarity) +
    Math.floor(s.trust / 40) +
    (s.packaging > 0.4 ? 1 : 0);
  const noise = Math.floor(Math.random() * 3) - 1;
  const crash = s.decision_quality < 1 ? 0.7 : 1;
  s.ccv_real = Math.max(0, Math.floor((base + noise) * crash * (0.85 + Math.random() * 0.3)));
  if (s.ccv_bots > 0 && Math.random() < 0.05) {
    // Bot decay / silent cull
    s.ccv_bots = Math.max(0, s.ccv_bots - Math.ceil(s.ccv_bots * 0.1));
  }
  // Chatters roughly track real + some bot noise
  s.chatters = Math.max(
    0,
    Math.floor(s.ccv_real * (0.15 + Math.random() * 0.25) + (s.ccv_bots > 0 ? Math.random() * 2 : 0))
  );
  s.live_minutes += 5;
  s.energy = Math.max(0, s.energy - 2);
  s.energy_spent += 2;
  s.burnout = Math.min(120, s.burnout + 0.4);
  s.watch_hours += (window.SLState.getCcvDisplay(s) * 5) / 60;
}

function endStream(s) {
  s.live = false;
  const spent = s.energy_spent;
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
    s.unique_stream_days += 1;
    s.streamed_today = true;
  }
  s.live_minutes = 0;
  s.ccv_real = 0;
  // bots may linger until detected
  s.chatters = 0;
  s.energy_spent = 0;
  s.watch_hours = Math.round(s.watch_hours * 10) / 10;
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
