# Streamer Life — Architecture

**Engine priority: Godot 4 first.** Unity mapping is a short appendix for portability, not the lead.

Art lock applies in-engine: live stage = gameplay viewport + Control overlay chrome + typography. No humanoid/VTuber/robot mascot in management GUI. Webcam texture optional, default hidden.

---

## 1. Scene map (Godot)

| Scene | Purpose |
|-------|---------|
| `res://scenes/boot/Boot.tscn` | Load save, apply moral memory flags |
| `res://scenes/ops/OpsCommand.tscn` | Day board, quest list, 70% ops actions |
| `res://scenes/live/LiveSession.tscn` | SubViewport gameplay capture + HUD overlay |
| `res://scenes/funnel/Funnel.tscn` | Impressions→CTR→AVD→follow→live click |
| `res://scenes/clips/ClipFactory.tscn` | Queue, quality, ship to Shorts factions |
| `res://scenes/market/DarkMarket.tscn` | Fraud SKUs; mutates integrity / dual CCV |
| `res://scenes/platforms/Contracts.tscn` | Twitch/YT/Kick/Owned as factions |
| `res://scenes/chat/ChatCreature.tscn` | Types + last-10 reply training |
| `res://scenes/body/BodySoul.tscn` | Meters + ending_score readout |
| `res://scenes/meta/Calendar.tscn` | Event IDs, builds, AC weather |
| `res://scenes/brand/MediaKit.tscn` | Polite lie vs honest numbers |

Autoloads: `GameState`, `Formulas`, `DarkMarket`, `EventBus`, `SaveService`.

---

## 2. Data models

```text
PlayerState
  currencies: cash, pending_payouts[], followers,
              ccv_real, ccv_bots,  # display = real + bots (never stored as only field)
              watch_hours, clips_ready, strikes, plus_points,
              sponsor_safety, owned_audience
  body: energy, sleep_debt, voice, rsi, hunger, caffeine, health
  craft: game_skill, commentary, entertainment, packaging,
         thumb_skill, title_skill, tech_obs, community_craft,
         clip_quality, clip_to_live_quality
  market: reach, trust, heat, niche_clarity, platform_standing,
          platform_blessing, slop_penalty, growth_mod
  soul: burnout, authenticity_gap, isolation, metrics_obsession,
        integrity, parasocial_debt
  session: live, live_minutes, energy_spent, crash_until, decision_quality
  platforms: { twitch, youtube, shorts, kick, owned }
  quests: { Q00…Q10: status }
  moral_memory: { accepted_bots, streamed_through_crash, rival_stance, dma_owned, … }
  reply_history: String[10]
  flags: webcam_on (default false), detective, dma_active, dma_wave, …
```

**Invariant:** UI and save always expose `ccv_real` and `ccv_display` (computed) as two numbers. Bottled amount tinted if `detective`.

**Hidden score:**
`ending_score = owned_audience * (integrity/100) * (1 - burnout/120) * health`

---

## 3. Save with moral memory

- Slot format: JSON (Godot `ConfigFile` or JSON resource).
- Persist full `PlayerState` + `moral_memory` + event history hashes.
- Soft reset can wipe currencies but **keep** moral_memory for NG+ tone (optional flag).
- Hard reset clears memory (Calendar screen warns).
- Version field `save_version` for migrations.

Moral memory drives dialogue variants (Q05 vendor lines, brand emails, rival DMs) without changing core formulas.

---

## 4. Platforms as factions

Each platform is a `FactionResource`: standing, gates, split curves, multi-stream friction, kill conditions (yellow-dollar, bot cap, partner toggle −50%).

- **Twitch:** directory by CCV; Affiliate gates; bot penalty caps display to historical real.
- **YouTube:** delayed pay; YPP gates; silent demonetization event `E_VOD_MUTE` / yellow dollar.
- **Shorts/TikTok/Reels:** discovery casino; trend half-life timer.
- **Kick:** 95/5 headline; thinner pool; multi-stream cut.
- **Owned land:** Discord/email/Patreon — only faction that feeds `owned_audience` for ending_score.

None completes a business alone; Contracts scene shows the gap.

---

## 5. Fraud tree (Dark Market)

Resource-driven SKUs matching brief IDs:

| ID | Cost | Key effects |
|----|------|-------------|
| BOT_CCV | $40 | integrity −8, detect 18%, heat +4, +bots |
| BOT_CHAT | $70 | integrity −10, detect 22% |
| RAID_POD | $25 | trust −3, heat +6 |
| SOFT_AIM_SMURF | — | clip_quality +18, integrity −12, viewer-detect 12% |
| RAGE_ALT | — | clip_quality +35, integrity −28, AC-detect 35% |
| DMA_HW | $2500 | integrity −40, AC 8% until wave then 55% |
| STOLEN_CLIPS | — | growth +10, integrity −9, strike 14% |

Works, then detonates via detect rolls + AC weather (`dma_wave`). Enemies can apply `E_TROLL_BOT` to the player (bots on *your* channel).

---

## 6. Chat creature

- Population weights over types: lurker, chatter, clip goblin, whale, parasocial spouse, backseat cop, hater who stays, raid tourist, bot, fellow streamer scout, brand intern.
- `reply_history` ring buffer (10) shifts type weights each stream tick.
- Mods reduce heat events (`E_MOD_NUKE` inverted when staffed).

---

## 7. Post-stream crash

On `end_stream`:
```
if energy_spent > 40:
  crash_until = now + 90 minutes
  decision_quality = 0.65
```
Affects packaging rolls, Dark Market accept prompts, rival choices. UI callout on Live + Body/Soul.

---

## 8. Owned land win pressure

Campaign victory hooks check `ending_score` thresholds, **not** peak `ccv_display`. Vanity followers and bottled CCV excluded by formula construction.

---

## 9. Event bus IDs

Reuse brief IDs exactly:

- GOOD: `E_RAID_DOWN`, `E_FYP_SPIKE`, `E_KEY_DROP`, `E_QUIET_WHALE`, `E_COLLAB_OFFER`, `E_BLESSING_WEEK`
- BAD: `E_UPLINK_DIE`, `E_VOD_MUTE`, `E_FALSE_BAN`, `E_TROLL_BOT`, `E_MOD_NUKE`, `E_BRAND_GHOST`, `E_RATE_CUT`, `E_STOLEN_FACE`, `E_DOOR`
- UGLY: `E_REACT_FUNERAL`, `E_GAMBLE_SPONSOR`, `E_ONE_TIME_CHEAT`, `E_LEAK_DISCORD`, `E_FAKE_BREAKDOWN`, `E_STREAM_THROUGH_PANIC`

---

## 10. HTML prototype ↔ Godot

This repo's vanilla JS mirrors autoload responsibilities:

| JS | Godot |
|----|-------|
| `state.js` (`window.SLState`) | `GameState` autoload |
| `formulas.js` (`window.SLFormulas`) | `Formulas` |
| `dark-market.js` (`window.SLDark`) | `DarkMarket` |
| `ui.js` (`window.SLUI`) | scene Controllers |
| `app.js` | Boot |

Port by replacing DOM renders with Godot signals + Control trees; keep formulas identical.

---

## Appendix — Unity (short)

- Same data model as ScriptableObjects / plain C# serializable state.
- Scenes mirror table above; Addressables optional for platform faction assets.
- Live: RenderTexture from game camera into UI RawImage + TextMeshPro overlay (wordmark/meters). **No avatar controller in mgmt UI.**
- Save: `JsonUtility` or Newtonsoft; moral_memory as nested DTO.
- Prefer Godot for primary production unless Unity multiplayer/tooling mandate appears later.
