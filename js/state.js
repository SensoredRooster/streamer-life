/**
 * Streamer Life — Player state (canonical schema used by UI)
 * Dual CCV is sacred: never collapse ccv_real and ccv_display.
 * ending_score excludes vanity followers and bottled CCV.
 */

const INITIAL_STATE = {
  day: 1,
  hour: 10,
  cash: 180,
  pending_payouts: 0,
  followers: 12,
  ccv_real: 0,
  ccv_bots: 0,
  watch_hours: 0,
  clips_ready: 0,
  strikes: 0,
  plus_points: 0,
  sponsor_safety: 80,
  owned_audience: 3,

  // Body
  energy: 78,
  sleep_debt: 12,
  voice: 90,
  rsi: 8,
  hunger: 40,
  caffeine: 30,
  health: 1.0,
  energy_spent: 0,

  // Craft (0–1)
  game_skill: 0.35,
  commentary: 0.28,
  entertainment: 0.3,
  packaging: 0.25,
  thumb_skill: 0.22,
  title_skill: 0.24,
  tech_obs: 0.4,
  community_craft: 0.2,
  clip_quality: 40,
  clip_to_live_quality: 0.55,

  // Market
  reach: 40,
  trust: 55,
  heat: 5,
  niche_clarity: 0.35,
  platform_standing: 40,
  platform_blessing: 0.7,
  slop_penalty: 0.05,
  growth_mod: 0,

  // Soul
  burnout: 8,
  authenticity_gap: 10,
  isolation: 15,
  metrics_obsession: 20,
  integrity: 100,
  parasocial_debt: 0,

  // Live
  live: false,
  live_minutes: 0,
  stream_title: 'just vibing ranked (maybe)',
  content_type: 'Ranked',
  chatters: 0,
  unique_chatters_today: 0,
  mods: 0,
  unique_stream_days: 0,
  streamed_today: false,

  // Funnel snapshot
  last_impressions: 0,
  last_ctr: 0,
  last_retention: 0,
  last_follows: 0,

  // Dark / builds
  dma_active: false,
  dma_wave: false,
  soft_aim: false,
  rage_alt: false,
  detective: false,

  // Post-stream crash
  crash_until: 0,
  decision_quality: 1.0,

  webcam_on: false,
  coach_guided: true,
  app_entered: false,
  media_kit_lie: true,

  quests: {
    Q00: { status: 'available', label: 'CLOCK IN' },
    Q01: { status: 'locked', label: 'FIRST LIGHT' },
    Q02: { status: 'locked', label: 'NAME THE ROOM' },
    Q03: { status: 'locked', label: 'FOUR DAY RITE' },
    Q04: { status: 'locked', label: 'ONE CLIP THAT CONVERTS' },
    Q05: { status: 'locked', label: 'THE EMPTY PEAK' },
    Q06: { status: 'locked', label: 'CHAT CREATURE' },
    Q07: { status: 'locked', label: 'FUNNEL LESSON' },
    Q08: { status: 'locked', label: 'PAYOUT FICTION' },
    Q09: { status: 'locked', label: 'RIVAL PING' },
    Q10: { status: 'locked', label: 'REST OR LIE' },
  },

  reply_history: [],

  platforms: {
    twitch: { standing: 35, affiliate: false, split: 0.5 },
    youtube: { standing: 20, ypp: false, watch_hours: 0, views_90d: 0 },
    shorts: { standing: 15, views_90d: 0 },
    kick: { standing: 10, partner_toggle: false },
    owned: { discord: 2, email: 1, patreon: 0 },
  },

  log: [],
};

function createState() {
  return typeof structuredClone === 'function'
    ? structuredClone(INITIAL_STATE)
    : JSON.parse(JSON.stringify(INITIAL_STATE));
}

function getCcvDisplay(s) {
  return (Number(s.ccv_real) || 0) + (Number(s.ccv_bots) || 0);
}

function getEndingScore(s) {
  const integrity = Math.max(0, Math.min(100, Number(s.integrity) || 0));
  const burnout = Math.max(0, Number(s.burnout) || 0);
  const health = Math.max(0, Number(s.health) || 0);
  const owned = Math.max(0, Number(s.owned_audience) || 0);
  return owned * (integrity / 100) * (1 - burnout / 120) * health;
}

function getMinuteStamp(s) {
  return (Number(s.day) || 0) * 1440 + (Number(s.hour) || 0) * 60;
}

function refreshDecisionQuality(s) {
  const now = getMinuteStamp(s);
  if (s.crash_until && now < s.crash_until) {
    s.decision_quality = 0.65;
  } else {
    s.decision_quality = 1.0;
    if (s.crash_until && now >= s.crash_until) s.crash_until = 0;
  }
}

function pushLog(s, msg, kind = 'info') {
  if (!s.log) s.log = [];
  s.log.unshift({
    t: `D${s.day} ${String(s.hour).padStart(2, '0')}:00`,
    msg: String(msg),
    kind: kind || 'info',
  });
  if (s.log.length > 40) s.log.length = 40;
}

function recomputeOwned(s) {
  const o = (s.platforms && s.platforms.owned) || {};
  s.owned_audience = (o.discord || 0) + (o.email || 0) + (o.patreon || 0);
}

let STATE = createState();

window.SLState = {
  INITIAL_STATE,
  createState,
  getCcvDisplay,
  getEndingScore,
  getMinuteStamp,
  refreshDecisionQuality,
  pushLog,
  recomputeOwned,
  get STATE() {
    return STATE;
  },
  set STATE(v) {
    STATE = v;
  },
  reset() {
    STATE = createState();
    return STATE;
  },
};
