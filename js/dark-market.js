/**
 * Streamer Life — Dark Market catalog
 * Exact costs/effects from design brief. Integrity is spendable.
 * Safe against missing fields / double-clicks.
 */

const DARK_MARKET = {
  BOT_CCV: {
    id: 'BOT_CCV',
    name: 'Bottled CCV',
    cost: 40,
    blurb: 'Buy 12–18 display viewers. Directory sorts by the lie.',
    effects: { integrity: -8, detect: 0.18, heat: 4, ccv_bots: [12, 18] },
  },
  BOT_CHAT: {
    id: 'BOT_CHAT',
    name: 'Chat Farm',
    cost: 70,
    blurb: 'Synthetic density. Looks alive until someone asks a question.',
    effects: { integrity: -10, detect: 0.22, chatters: [6, 10] },
  },
  RAID_POD: {
    id: 'RAID_POD',
    name: 'Raid Pod',
    cost: 25,
    blurb: 'Coordinated drop-in. Trust pays the bill.',
    effects: { trust: -3, heat: 6, ccv_real_burst: [8, 14] },
  },
  SOFT_AIM_SMURF: {
    id: 'SOFT_AIM_SMURF',
    name: 'Soft-Aim Smurf',
    cost: 0,
    blurb: 'Clip bait. Viewer-detect 12%.',
    effects: { clip_quality: 18, integrity: -12, detect: 0.12, detectKind: 'viewer' },
  },
  RAGE_ALT: {
    id: 'RAGE_ALT',
    name: 'Rage Alt',
    cost: 0,
    blurb: 'Unhinged highlight reel. AC-detect 35%.',
    effects: { clip_quality: 35, integrity: -28, detect: 0.35, detectKind: 'ac' },
  },
  DMA_HW: {
    id: 'DMA_HW',
    name: 'DMA Hardware',
    cost: 2500,
    blurb: '8% AC-detect until the wave. Then 55%.',
    effects: { integrity: -40, detect_pre: 0.08, detect_wave: 0.55, detectKind: 'ac' },
  },
  STOLEN_CLIPS: {
    id: 'STOLEN_CLIPS',
    name: 'Stolen Clips',
    cost: 0,
    blurb: "Growth +10. Strike risk 14%. Someone else's face, your funnel.",
    effects: { growth: 10, integrity: -9, strike_risk: 0.14 },
  },
};

function roll(p) {
  return Math.random() < p;
}

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function applyDarkMarket(id, s) {
  try {
    const item = DARK_MARKET[id];
    if (!item) return { ok: false, msg: 'Unknown SKU.' };
    if (!s || typeof s !== 'object') return { ok: false, msg: 'No state.' };

    const { pushLog, getCcvDisplay } = window.SLState;
    const e = item.effects;

    if (item.cost > 0 && n(s.cash) < item.cost) {
      return { ok: false, msg: `Need $${item.cost}. You have $${n(s.cash)}.` };
    }

    if (item.cost > 0) s.cash = n(s.cash) - item.cost;

    let detected = false;
    let note = '';

    switch (id) {
      case 'BOT_CCV': {
        const add = randInt(e.ccv_bots[0], e.ccv_bots[1]);
        s.ccv_bots = n(s.ccv_bots) + add;
        s.integrity = n(s.integrity, 100) + e.integrity;
        s.heat = n(s.heat) + e.heat;
        detected = roll(e.detect);
        note = `+${add} bottled CCV. Display now ${getCcvDisplay(s)} (real ${n(s.ccv_real)}).`;
        if (detected) {
          s.heat = n(s.heat) + 10;
          s.sponsor_safety = Math.max(0, n(s.sponsor_safety, 80) - 15);
          if (s.platforms && s.platforms.twitch) {
            s.platforms.twitch.standing = Math.max(0, n(s.platforms.twitch.standing) - 12);
          }
          s.ccv_bots = 0;
          note += ' DETECTED — display capped to real. Heat +10.';
        }
        break;
      }
      case 'BOT_CHAT': {
        const add = randInt(e.chatters[0], e.chatters[1]);
        s.chatters = n(s.chatters) + add;
        s.integrity = n(s.integrity, 100) + e.integrity;
        detected = roll(e.detect);
        note = `+${add} fake chatters. Density looks fine until a real question.`;
        if (detected) {
          s.heat = n(s.heat) + 8;
          s.trust = Math.max(0, n(s.trust) - 5);
          note += ' DETECTED — trust -5, heat +8.';
        }
        break;
      }
      case 'RAID_POD': {
        const burst = randInt(e.ccv_real_burst[0], e.ccv_real_burst[1]);
        s.ccv_real = n(s.ccv_real) + burst;
        s.trust = Math.max(0, n(s.trust) + e.trust);
        s.heat = n(s.heat) + e.heat;
        note = `Pod raid +${burst} real-looking bodies. Trust ${e.trust}, heat +${e.heat}.`;
        break;
      }
      case 'SOFT_AIM_SMURF': {
        s.clip_quality = n(s.clip_quality) + e.clip_quality;
        s.integrity = n(s.integrity, 100) + e.integrity;
        s.soft_aim = true;
        detected = roll(e.detect);
        note = `clip_quality +${e.clip_quality}. Soft aim on.`;
        if (detected) {
          s.heat = n(s.heat) + 7;
          s.trust = Math.max(0, n(s.trust) - 8);
          note += ' Viewer-detected. Chat is clipping the aimbot.';
        }
        break;
      }
      case 'RAGE_ALT': {
        s.clip_quality = n(s.clip_quality) + e.clip_quality;
        s.integrity = n(s.integrity, 100) + e.integrity;
        s.rage_alt = true;
        detected = roll(e.detect);
        note = `clip_quality +${e.clip_quality}. Rage alt active.`;
        if (detected) {
          s.strikes = n(s.strikes) + 1;
          s.heat = n(s.heat) + 15;
          s.sponsor_safety = Math.max(0, n(s.sponsor_safety, 80) - 25);
          note += ' AC hit. Strike +1.';
        }
        break;
      }
      case 'DMA_HW': {
        s.integrity = n(s.integrity, 100) + e.integrity;
        s.dma_active = true;
        const p = s.dma_wave ? e.detect_wave : e.detect_pre;
        detected = roll(p);
        note = s.dma_wave
          ? `DMA live during WAVE (detect ${Math.round(e.detect_wave * 100)}%).`
          : `DMA installed. Quiet for now (detect ${Math.round(e.detect_pre * 100)}%).`;
        if (detected) {
          s.strikes = n(s.strikes) + 2;
          s.heat = n(s.heat) + 30;
          if (s.platforms && s.platforms.twitch) s.platforms.twitch.standing = 0;
          s.ccv_bots = 0;
          note += ' HARD BAN weather. Standing nuked.';
        }
        break;
      }
      case 'STOLEN_CLIPS': {
        s.growth_mod = n(s.growth_mod) + e.growth;
        s.integrity = n(s.integrity, 100) + e.integrity;
        s.clips_ready = n(s.clips_ready) + 2;
        detected = roll(e.strike_risk);
        note = `growth +${e.growth}, +2 ready clips (not yours).`;
        if (detected) {
          s.strikes = n(s.strikes) + 1;
          s.sponsor_safety = Math.max(0, n(s.sponsor_safety, 80) - 20);
          note += ' Strike risk hit. Copyright claim incoming.';
        }
        break;
      }
      default:
        return { ok: false, msg: 'Unhandled SKU.' };
    }

    s.integrity = Math.max(0, Math.min(100, n(s.integrity, 100)));
    pushLog(s, `[DARK] ${item.name}: ${note}`, detected ? 'danger' : 'warn');
    return {
      ok: true,
      msg: note,
      detected,
      integrity: s.integrity,
      ccv_real: n(s.ccv_real),
      ccv_bots: n(s.ccv_bots),
      ccv_display: getCcvDisplay(s),
      cash: n(s.cash),
      heat: n(s.heat),
    };
  } catch (err) {
    console.error('[DarkMarket]', err);
    return { ok: false, msg: `Dark Market fault: ${err && err.message ? err.message : err}` };
  }
}

function enemyTrollBot(s) {
  s.ccv_bots = n(s.ccv_bots) + randInt(20, 40);
  s.heat = n(s.heat) + 5;
  window.SLState.pushLog(
    s,
    'E_TROLL_BOT: someone bottled YOUR channel. Detection risk is now yours.',
    'danger'
  );
}

function triggerAcWave(s) {
  s.dma_wave = true;
  window.SLState.pushLog(s, 'AC wave. DMA detect jumps to 55%.', 'danger');
}

window.SLDark = {
  DARK_MARKET,
  applyDarkMarket,
  enemyTrollBot,
  triggerAcWave,
};
