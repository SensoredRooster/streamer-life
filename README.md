# Streamer Life

**Streamer Life** is a numbers-first streamer-life simulation about 2026 creator reality. It is not a cartoon life sim about buying a GPU and getting rich. It is a hostile-market sim where live is a factory, shorts are a storefront, owned audience is a bunker, integrity is a spendable currency, and burnout can beat a green graph.

This repository contains:

1. A **playable HTML/CSS/JS prototype** (open `index.html`) with working dual CCV, Dark Market mutations, funnel, clip factory, and the full no-avatar screen set.
2. **Design documentation**: locked brief, Act 1 script (Q00–Q10), and Godot-first architecture with a Unity appendix.
3. Stable **IDs, formulas, palette, and art locks** intended to survive into a real engine build.

Thank you to **Sensored Rooster** for the design brief this project implements.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Design thesis](#design-thesis)
3. [Art lock (non-negotiable)](#art-lock-non-negotiable)
4. [Visual system / palette](#visual-system--palette)
5. [Core loop](#core-loop)
6. [Hidden ending score](#hidden-ending-score)
7. [Dual CCV (sacred rule)](#dual-ccv-sacred-rule)
8. [Stats model](#stats-model)
9. [Currencies](#currencies)
10. [Formulas](#formulas)
11. [Platforms (factions)](#platforms-factions)
12. [Dark Market catalog](#dark-market-catalog)
13. [Content types](#content-types)
14. [Chat is a creature](#chat-is-a-creature)
15. [GUI screens](#gui-screens)
16. [Act 1 quests (Q00–Q10)](#act-1-quests-q00q10)
17. [Event IDs](#event-ids)
18. [Builds / playstyles](#builds--playstyles)
19. [Prototype map (this repo)](#prototype-map-this-repo)
20. [How the HTML prototype works](#how-the-html-prototype-works)
21. [Post-stream crash](#post-stream-crash)
22. [What this is not](#what-this-is-not)
23. [Engine path (Godot / Unity)](#engine-path-godot--unity)
24. [Stability contract](#stability-contract)
25. [Credits & license notes](#credits--license-notes)

---

## Quick start

### Play the prototype

1. Open `index.html` in a modern browser (Chrome, Firefox, or Safari).
2. Or serve locally:

```bash
cd streamer-life
python3 -m http.server 8080
# visit http://localhost:8080
```

No build step. No package manager. Vanilla HTML/CSS/JS.

### Read the design docs

| Doc | Path | Purpose |
|-----|------|---------|
| Locked brief | `docs/design-brief.md` | Source of truth for systems, IDs, tone |
| Act 1 script | `docs/act1-script.md` | Q00–Q10 dialogue, choices, outcomes |
| Architecture | `docs/architecture.md` | Godot-first scenes, save schema, Unity notes |

### Verify Dark Market works

1. Open the prototype → **Dark Market** screen.
2. Buy **Bottled CCV** (`BOT_CCV`, $40).
3. Confirm:
   - `integrity` drops (e.g. 100 → 92)
   - `cash` drops by $40
   - `heat` rises
   - **CCV Real** and **CCV Display** stay separate (`ccv_display = ccv_real + ccv_bots`)

---

## Design thesis

Fame is a **hostile market**.

| Metaphor | Game meaning |
|----------|----------------|
| Live | Factory (production of hours and moments) |
| Shorts / clips | Storefront (discovery packaging) |
| Owned audience | Bunker (Discord + email + Patreon survive ToS weather) |
| Integrity | Spendable currency (fraud works, then detonates) |
| Burnout | Can beat a green graph |

**Work split shown in UI:** ~30% on camera, ~70% ops (clips, titles, thumbs, replies, mods, taxes).

**Failure mode of “only Go Live”:** eternal ~4 real viewers. The directory does not care about your vibes.

**Tone:** funny until it isn’t. Numbers-first. No motivational fluff. Never let “buy a better GPU” be the whole game.

---

## Art lock (non-negotiable)

These rules are final for the management GUI and prototype chrome:

- **No** cartoon humanoid
- **No** VTuber body in the management GUI
- **No** robot / mascot character in the GUI
- Live stage = **gameplay capture placeholder** + **overlay chrome** + **typography**
- Brand = wordmark **`STREAMER LIFE`**, teal on black, meters — **not a character**
- Optional tiny **webcam** tile may exist and must be **togglable**; **default OFF**
- VTuber may exist as an optional *content type* later; it still must not become a mascot in the ops UI

If a future asset pass violates this lock, the asset is wrong — not the lock.

---

## Visual system / palette

Exact tokens (CSS variables in `css/styles.css`):

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#07090C` | Page background |
| `panel` | `#10161C` | Cards / panels |
| `teal` | `#1EE6C5` | Brand, primary meters, wordmark |
| `teal_dim` | `#0E6F62` | Secondary teal / dim states |
| `danger` | `#FF3B5C` | Strikes, detection, integrity wounds |
| `warn` | `#F5C542` | Caution, payout delay, demonetization hints |
| `muted` | `#7A8894` | Secondary labels |
| `text` | `#E8F0F4` | Primary text |

**Typography intent:** monospace for wordmark / meters / IDs; clean sans for body. Numbers should feel like a trading terminal for attention, not a cozy life sim.

**Bottled CCV** (when Detective perk is on) should read in a distinct accent (prototype uses a purple “bottled” accent) so the lie is visible to the player who earned that sight.

---

## Core loop

```text
LIVE (factory)
  → CLIP (storefront)
  → POST (discovery)
  → COMMUNITY (retention)
  → MONEY / REP / HEAT
  → REST / LIFE
```

Each step has tradeoffs. Skipping ops (clips/titles/community) starves discovery. Skipping rest feeds burnout. Skipping integrity purchases growth that later deletes the save’s moral room to maneuver.

---

## Hidden ending score

Vanity followers and bottled CCV are **excluded**.

```text
ending_score = owned_audience * (integrity / 100) * (1 - burnout / 120) * health
```

| Term | Meaning |
|------|---------|
| `owned_audience` | Discord + email + Patreon (bunker count) |
| `integrity` | 0–100+ spendable moral capital |
| `burnout` | Soft-caps the score; at 120 the multiplier hits 0 |
| `health` | Body multiplier (prototype uses `1.0` scale) |

The score exists so “famous but hollow” is not a silent win.

Implementation: `js/state.js` → ending score helpers. UI surfaces it in the header / Body-Soul style panels.

---

## Dual CCV (sacred rule)

**Never collapse real and display into one number.**

```text
ccv_display = ccv_real + ccv_bots
```

| Field | Meaning |
|-------|---------|
| `ccv_real` | Actual concurrent humans (approx) |
| `ccv_bots` | Bottled / synthetic viewers |
| `ccv_display` | What directories and casual observers see |

UI must always show **both**. Dark Market `BOT_CCV` mutates bots/display, not “the” CCV.

Twitch-style bot penalty (brief): on detection, cap display toward historical real (prototype clears bottled CCV and spikes heat).

---

## Stats model

### Body

| Stat | Role |
|------|------|
| `energy` | Session fuel |
| `sleep_debt` | Accumulates; taxes future sessions |
| `voice` | Commentary quality / soft fail if wrecked |
| `rsi` | Input pain; long grind cost |
| `hunger` / `caffeine` | Short-loop body comedy with real penalties |
| `health` | Ending-score multiplier |
| `energy_spent` | Drives post-stream crash |

### Craft (0–1 skill fields in prototype)

| Stat | Role |
|------|------|
| `game_skill` | Per-title skill (prototype: general) |
| `commentary` | Talk track |
| `entertainment` | Timing / bits / pacing |
| `packaging` / `thumb_skill` / `title_skill` | Storefront craft |
| `tech_obs` | Stability of the factory |
| `community_craft` | Mods, replies, culture |
| `clip_quality` / `clip_to_live_quality` | Clip factory → live conversion |

### Market

| Stat | Role |
|------|------|
| `reach` | Top-of-funnel potential |
| `trust` | Conversion & retention glue |
| `heat` | Attention toxicity / scrutiny |
| `niche_clarity` | Multiplies impressions |
| `platform_standing` / `platform_blessing` | Faction weather |
| `sponsor_safety` | Brand kit honesty vs funny |
| `slop_penalty` | Generic content tax |
| `growth_mod` | Temporary growth hacks (incl. stolen clips) |

### Soul

| Stat | Role |
|------|------|
| `burnout` | Soft-ends the run’s meaning |
| `authenticity_gap` | Performance vs self |
| `isolation` | Life outside chat |
| `metrics_obsession` | Decision poison |
| `integrity` | Spendable; Dark Market tax |
| `parasocial_debt` | What the room thinks it owns |

---

## Currencies

| Currency | Notes |
|----------|-------|
| `cash` | Liquid |
| `pending_payouts` | **NET-15 to NET-120 delay is a mechanic** — fame without liquidity |
| `followers` | Vanity-adjacent; not ending-score |
| `ccv_real` / `ccv_bots` / display | See dual CCV |
| `watch_hours` | Platform gate fuel (YouTube-like) |
| `clips_ready` | Storefront inventory |
| `strikes` | Platform / copyright / ToS scars |
| `plus_points` | Paid-sub ladder progress (platform fiction) |
| `sponsor_safety` | Media kit credibility |
| `owned_audience` | Ending-score bunker |

Starting prototype cash is intentionally small (`$180`) so Dark Market choices hurt.

---

## Formulas

Canonical discovery / conversion math (also in `js/formulas.js`):

```text
impressions = reach * niche_clarity * packaging * platform_blessing * (1 - slop_penalty)

ctr = clamp(0.02 + thumb_skill*0.08 + title_skill*0.05 - generic_penalty, 0.01, 0.22)

retention = clamp(0.18 + entertainment*0.25 + game_skill*0.1 - tilt*0.15, 0.08, 0.72)

follow_conv = retention * trust * 0.04 * clip_to_live_quality

ccv_display = ccv_real + ccv_bots

chat_density = chatters / max(ccv_display, 1)

take_home_sub = price * platform_split * (1 - processor_fee) * (1 - tax_withhold)
```

**Funnel UI order:** impressions → CTR → AVD/retention → follow → live click.

Players who scream “shadowban” without reading the funnel fail Act 1 lesson `Q07`.

---

## Platforms (factions)

None is a complete business. They are opposing gods with different weather.

### Twitch (home base)

- Directory sorts by CCV → small creators are buried.
- Affiliate-scale gate (brief): ~25 followers / 4 hours / 4 unique days / avg ~3 CCV.
- Sub split ~50/50; Plus ladder ~60/40 then ~70/30 from **paid** subs only (Prime/gifts don’t count toward ladder fiction).
- Bot penalty: cap display toward historical real.
- Multi-stream allowed with friction: don’t advertise the other stream / merged chat pain.

### YouTube (archive that pays later)

- Search + suggested + Shorts.
- YPP-like gates high (brief): ~8000 watch hours **or** ~20M Shorts views / 90d.
- Silent kill: yellow-dollar demonetization.
- Members / Super Chat ~70/30.

### TikTok / Shorts / Reels (discovery casino)

- FYP lottery, low RPM, trend half-life measured in days.
- Risks: synthetic, reproduced, inactivity flags.

### Kick

- Headline split ~95/5.
- Thinner city.
- Partner multi-stream toggle can cut that session payout ~50%.

### Owned land (bunker)

- Discord, email, Patreon.
- Feeds `owned_audience`.
- Win condition when platform ToS weather turns.

---

## Dark Market catalog

First-class system. Not a joke menu. Implemented in `js/dark-market.js` with live state mutations.

| ID | Name | Cash cost | Primary effects (from `js/dark-market.js`) |
|----|------|-----------|----------------------------------------------|
| `BOT_CCV` | Bottled CCV | $40 | `integrity -8`, detect 18%, `heat +4`, `ccv_bots` += 12–18 |
| `BOT_CHAT` | Chat Farm | $70 | `integrity -10`, detect 22%, chatters += 6–10 |
| `RAID_POD` | Raid Pod | $25 | `trust -3`, `heat +6`, `ccv_real` burst 8–14 |
| `SOFT_AIM_SMURF` | Soft-Aim Smurf | $0 | `clip_quality +18`, `integrity -12`, viewer-detect 12% |
| `RAGE_ALT` | Rage Alt | $0 | `clip_quality +35`, `integrity -28`, AC-detect 35% |
| `DMA_HW` | DMA Hardware | $2500 | `integrity -40`, AC-detect 8% pre-wave / 55% on wave |
| `STOLEN_CLIPS` | Stolen Clips | $0 | growth +10, `integrity -9`, strike risk 14% |

### Adversarial weather (not all SKUs)

- Enemies can **troll-bot your stream** to trigger detection.
- **False anti-cheat bans** exist (banned while reporting).
- Stream sniping, engagement pods, fake raid trains.

Detection should feel like weather — sometimes fair, sometimes not.

---

## Content types

Each has a growth / money / risk / energy profile:

Ranked · Variety · Just Chatting · IRL (safety events) · Speedrun · Gambling (**brand death**) · Reaction (**copyright**) · Horror · Educational · Drama/callouts · ASMR · Collab · Charity/subathon · VTuber (optional content type — **still no mascot in management GUI**)

---

## Chat is a creature

Chat archetypes:

lurker · chatter · clip goblin · whale · parasocial spouse · backseat cop · hater who stays · raid tourist · bot · fellow streamer scout · brand intern

**Training rule:** you train the room with your **last 10 replies**. Culture is a sliding window, not a vibe setting.

---

## GUI screens

Prototype nav covers all ten:

| # | Screen | Job |
|---|--------|-----|
| 1 | Ops Command | Day board / quests / ops vs live split |
| 2 | Live Session HUD | Gameplay capture placeholder + chrome (not a character) |
| 3 | Funnel | Impressions → CTR → AVD → follow → live click |
| 4 | Clip Factory | Storefront inventory & quality |
| 5 | Platform Contracts | Faction gates & splits |
| 6 | Dark Market | Integrity spend SKUs (live mutations) |
| 7 | Chat Creature | Archetypes + reply training |
| 8 | Body / Soul | Body + soul meters, ending score |
| 9 | Calendar / Meta | Days, rites, schedule fiction |
| 10 | Media Kit | The polite lie you send brands |

Webcam control lives in Live HUD chrome; **default OFF**.

---

## Act 1 quests (Q00–Q10)

Full dialogue/choices live in `docs/act1-script.md`. Summary:

| ID | Title | Beat |
|----|-------|------|
| `Q00` | CLOCK IN | Side job shift; rent exists |
| `Q01` | FIRST LIGHT | Stream ~90 minutes |
| `Q02` | NAME THE ROOM | Title / rules / overlay |
| `Q03` | FOUR DAY RITE | 4 unique stream days |
| `Q04` | ONE CLIP THAT CONVERTS | 3 clips, 1 live click |
| `Q05` | THE EMPTY PEAK | Refuse $40 bot offer or accept the lie |
| `Q06` | CHAT CREATURE | 10 unique chatters, first mod |
| `Q07` | FUNNEL LESSON | Read the funnel; don’t yell shadowban |
| `Q08` | PAYOUT FICTION | First $5 is NET-delayed |
| `Q09` | RIVAL PING | Raid same-size or clip-callout |
| `Q10` | REST OR LIE | Burnout ≥ 25; dark day or stream through crash |

Prototype quest flags live under `state.quests` in `js/state.js`.

---

## Event IDs

Keep these stable in saves and scripts:

**Good:** `E_RAID_DOWN`, `E_FYP_SPIKE`, `E_KEY_DROP`, `E_QUIET_WHALE`, `E_COLLAB_OFFER`, `E_BLESSING_WEEK`

**Bad:** `E_UPLINK_DIE`, `E_VOD_MUTE`, `E_FALSE_BAN`, `E_TROLL_BOT`, `E_MOD_NUKE`, `E_BRAND_GHOST`, `E_RATE_CUT`, `E_STOLEN_FACE`, `E_DOOR`

**Ugly:** `E_REACT_FUNERAL`, `E_GAMBLE_SPONSOR`, `E_ONE_TIME_CHEAT`, `E_LEAK_DISCORD`, `E_FAKE_BREAKDOWN`, `E_STREAM_THROUGH_PANIC`

---

## Builds / playstyles

Clip brain · Parasocial sponge · One-trick · Wholesome · Unfiltered · Ops monster · Detective · Dark market

**Detective** should reveal bottled CCV visually. **Dark market** is a viable short-term build that writes moral memory into the save.

---

## Prototype map (this repo)

```text
streamer-life/
  README.md
  index.html
  css/styles.css
  js/state.js
  js/dark-market.js
  js/formulas.js
  js/ui.js
  js/app.js
  screens/README.txt
  docs/design-brief.md
  docs/act1-script.md
  docs/architecture.md
```

GitHub: https://github.com/SensoredRooster/streamer-life

Local copy (Windows): `C:\Users\brand\Documents\streamer-life`

---

## How the HTML prototype works

### Boot

`index.html` loads:

1. `css/styles.css`
2. `js/state.js`
3. `js/formulas.js`
4. `js/dark-market.js`
5. `js/ui.js`
6. `js/app.js`

`app.js` boots UI, paints header meters (including dual CCV + ending score), and routes screens.

### State

`INITIAL_STATE` in `state.js` seeds day 1, small cash, low owned audience, integrity 100, webcam off, quests starting at `Q00`.

Helpers compute:

- `ccv_display`
- `ending_score`
- crash / decision quality flags

### Dark Market mutations

`applyDarkMarket(id, state)` :

- Checks cash when `cost > 0`
- Applies integrity / heat / trust / bots / clip_quality / strikes per SKU
- Rolls detection where applicable
- Pushes a log line the UI can show

This is the acceptance test for “the buttons are real.”

### Screens

`ui.js` owns nav labels and render functions for all ten screens. Live HUD must remain capture+chrome, never a mascot.

---

## Post-stream crash

If `energy_spent > 40` at session end:

```text
decision_quality *= 0.65 for 90 minutes
```

Act 1 `Q10` forces the player to face rest vs lying through the crash. Ops decisions made while crashed should feel worse (misclicks on titles, bad Dark Market impulse, etc.).

---

## What this is not

Existing streamer life sims often stop at: hunger, toilet, buy GPU, donate popup.

**Insufficient.** This project requires:

- Funnel UI
- Two-clock life (live vs clip factory)
- Platforms as opposing gods
- Fraud tech tree that works then detonates
- Anti-cheat weather including wrong-person bans
- Chat as a trained animal
- Payout delay / insolvency while “famous”
- Brand safety vs funny
- Post-stream crash decisions
- Owned-land win condition
- Moral memory in the save file

---

## Engine path (Godot / Unity)

See `docs/architecture.md` for scenes, resources, and save schema.

**Godot-first recommendation:**

- Autoloads for `PlayerState`, `Economy`, `Platforms`, `DarkMarket`, `ChatCreature`, `EventBus`
- Scenes mirroring the ten GUI screens
- Save resource includes moral memory: integrity history, detections, strikes, owned audience, bottled CCV ledger

**Unity appendix:** same data model as ScriptableObjects / plain C# serializable state; UI Toolkit or uGUI panels named identically.

The HTML prototype is the **behavioral sketch**, not the shipping client.

---

## Stability contract

When extending this project, keep stable unless a design doc explicitly revises them:

- Palette hex values
- Wordmark text: `STREAMER LIFE`
- Dual CCV field names: `ccv_real`, `ccv_bots`, `ccv_display`
- Ending score formula
- Dark Market IDs: `BOT_CCV`, `BOT_CHAT`, `RAID_POD`, `SOFT_AIM_SMURF`, `RAGE_ALT`, `DMA_HW`, `STOLEN_CLIPS`
- Quest IDs: `Q00`–`Q10`
- Event IDs listed above
- Art lock (no mascot / no VTuber body / no robot in management GUI)

Do **not** restart the design from scratch in a random new metaphor.

---

## Credits & license notes

- Design brief & creative direction: **Sensored Rooster** — thank you.
- Prototype & docs scaffolding: built to match the locked brief as **Streamer Life** (ATTN//MARKET naming retired).
- Add a formal license file when you decide distribution terms (prototype currently ships without an SPDX license file).

---

### One-line reminder

**Live is the factory. Clips are the storefront. Owned audience is the bunker. Integrity is spendable. Dual CCV never lies to the same eye twice — unless you paid for the lie.**

---

## Appendix A — Prototype starting state (day 1)

Seeded in `js/state.js` (`INITIAL_STATE`), approximate:

| Field | Start | Notes |
|-------|-------|-------|
| `day` | 1 | Act 1 clock |
| `cash` | 180 | Enough for a few Dark Market mistakes |
| `followers` | 12 | Vanity, not ending score |
| `ccv_real` / `ccv_bots` | 0 / 0 | Dual CCV begins honest |
| `owned_audience` | 3 | Tiny bunker |
| `integrity` | 100 | Full moral capital |
| `burnout` | 8 | Already slightly tired |
| `energy` | 78 | |
| `trust` | 55 | |
| `heat` | 5 | |
| `sponsor_safety` | 80 | |
| `webcam_on` | `false` | Art lock default |
| `quests.Q00` | `available` | CLOCK IN |

Exact keys can drift slightly as the prototype evolves; treat `js/state.js` as authoritative for runtime.

---

## Appendix B — Acceptance checklist

Use this before calling a build “done”:

- [ ] Wordmark reads **STREAMER LIFE** (no ATTN//MARKET)
- [ ] Palette matches the eight locked hex values
- [ ] No mascot / VTuber body / robot in any management screen
- [ ] Webcam control exists and defaults **OFF**
- [ ] Header (or equivalent) shows **CCV Real** and **CCV Display** separately
- [ ] Ending score uses owned audience × integrity × burnout term × health
- [ ] Dark Market `BOT_CCV` changes integrity, cash, heat, and `ccv_bots` without merging CCV fields
- [ ] All ten screens reachable from nav
- [ ] `docs/act1-script.md` still lists Q00–Q10
- [ ] `docs/architecture.md` still describes save moral memory
- [ ] README (this file) still matches IDs in `js/dark-market.js`

---

## Appendix C — Local + remote locations

| Location | Path |
|----------|------|
| GitHub repo | https://github.com/SensoredRooster/streamer-life |
| This machine (Documents) | `C:\Users\brand\Documents\streamer-life` |
| Dev box workspace | `/workspace/streamer-life` |

Open `index.html` from Documents or clone from GitHub — same prototype.
