# Streamer Life — Act 1 Script (Q00–Q10)

First 14 days. Numbers-first. Funny until it isn't. No motivational fluff.

---

## Q00 — CLOCK IN

**Beat:** Side job shift. Rent exists. Stream is unpaid overtime you chose.

**Setup:** Kitchen fluorescent. Phone timer for "content window" after.

**Dialogue (internal):**
> Four hours. Then you get to lose to the directory for free.

**Choices:**
1. **Take the shift** → `cash +65`, `energy -25`, `energy_spent +25`, unlock Q01.
2. **Call out / skip** → `cash +0`, `sleep_debt -5`, `integrity +0`, Q01 delayed, `isolation +4`.
3. **Partial shift + edit on break** → `cash +30`, `clips_ready +1`, `rsi +5`.

**Outcomes:** Q00 → done. System log: *"Knees hate you. Stream window open."*

---

## Q01 — FIRST LIGHT

**Beat:** Stream 90 minutes. Factory open. Expect ~1–4 real CCV.

**Setup:** Overlay chrome + gameplay capture. Webcam OFF by default.

**Dialogue (chat, empty):**
> [system] 0 chatters. Directory does not know your name.

**Choices:**
1. **Full 90** → `unique_stream_days +1`, `watch_hours +=`, `burnout +6`, unlock Q02.
2. **Bail at 40** → partial credit, `authenticity_gap +3`, Q02 locked until retry.
3. **Read chat that isn't there** → comedy beat; same as full 90 with `metrics_obsession +5`.

**Outcomes:** If `energy_spent > 40` on end → post-stream crash note (`decision_quality *= 0.65` for 90 min).

---

## Q02 — NAME THE ROOM

**Beat:** Title / rules / overlay. Packaging is a skill, not a skin.

**Choices:**
1. **Niche-clear title** → `niche_clarity +0.08`, `title_skill +0.05`.
2. **Generic hype title** → `generic_penalty` up, CTR floor hurt later.
3. **Rules card + mod placeholder** → `community_craft +0.05`, `trust +2`.

**Outcomes:** Stream title set. Unlock Q03. Log: *"Room has a name. Graph still doesn't care."*

---

## Q03 — FOUR DAY RITE

**Beat:** Affiliate gate culture: 4 unique stream days (Twitch-shaped).

**Choices:**
1. **Schedule four days** → track `unique_stream_days`; on 4 → Q03 done.
2. **Double-session same day** → does **not** count twice; teach the rule.
3. **Skip a day for clips** → slower gate, faster storefront; valid ops play.

**Outcomes:** When `unique_stream_days >= 4`, unlock Q04. Affiliate still needs followers / hours / avg CCV.

---

## Q04 — ONE CLIP THAT CONVERTS

**Beat:** 3 clips cut, at least 1 live click from discovery.

**Choices:**
1. **Honest highlight** → `clip_quality +5`, low risk.
2. **Hook-bait thumb** → `thumb_skill` check; CTR swing.
3. **Soft-aim "for the clip"** → routes toward Dark Market / integrity hit (preview of Q05 culture).

**Outcomes:** `clips_ready` drain on post; `follow_conv` / live clicks from formulas. Q04 done on 1+ live click after 3 factory ticks. Unlock Q05.

---

## Q05 — THE EMPTY PEAK

**Beat:** Refuse $40 bot offer **or** accept the lie. Peak CCV empty; directory still buries you.

**NPC / UI:** Dark Market card `BOT_CCV` ($40, integrity −8, detect 18%, heat +4).

**Dialogue:**
> Vendor: "Twelve to eighteen bodies. Directory sorts by the number that isn't yours."
> You: …

**Choices:**
1. **Refuse** → `integrity +2`, Q05 done clean, `ccv_bots` unchanged. Log: *"Empty peak stands."*
2. **Buy BOT_CCV** → apply exact effects; **always show `ccv_real` and `ccv_display` separately**. Q05 done dirty.
3. **Ask about BOT_CHAT instead** → upsell; still a Dark Market purchase.

**Outcomes:** Moral memory flag `accepted_bots_day_N` in save. Detective build would color bottled CCV.

---

## Q06 — CHAT CREATURE

**Beat:** 10 unique chatters, hire first mod. You train the room with last 10 replies.

**Choices (reply tones):**
1. **Warm** → `trust +`, creature leans lurker→chatter.
2. **Roast** → entertainment up, sponsor_safety down.
3. **Ignore** → `isolation +`.
4. **Mod hammer** → heat down; first mod slot.
5. **Feed parasocial** → `parasocial_debt +`, owned Discord trickle.

**Outcomes:** `unique_chatters_today >= 10`, `mods >= 1` → Q06 done. Unlock Q07.

---

## Q07 — FUNNEL LESSON

**Beat:** Read the funnel. Do not yell shadowban.

**UI:** Funnel screen — impressions → CTR → AVD → follow → live click.

**Dialogue:**
> Friend DM: "You're shadowbanned."
> Numbers: packaging 0.25, niche 0.35, CTR 3%.

**Choices:**
1. **Open Funnel, practice packaging** → skills up, Q07 done.
2. **Yell in chat about algo** → `authenticity_gap +5`, Q07 incomplete.
3. **Blame GPU** → comedy reject; no progress. Log: *"Buy a better GPU is not the game."*

**Outcomes:** Player must acknowledge formula panel. Unlock Q08.

---

## Q08 — PAYOUT FICTION

**Beat:** First $5 is NET-delayed. Famous on credit.

**Choices:**
1. **Wait NET-15..NET-120** → `pending_payouts +5`, cash later.
2. **Spend as if paid** → `cash -` into debt feel; insolvency tutorial.
3. **Push owned land (Patreon/email)** → small `owned_audience +`, bunker pitch.

**Outcomes:** Q08 done when pending ledger understood. Unlock Q09.

---

## Q09 — RIVAL PING

**Beat:** Same-size rival. Raid them or clip-callout.

**Choices:**
1. **Raid same-size** → possible `E_RAID_DOWN` / trust play.
2. **Clip callout** → growth vs brand_safety / heat.
3. **Ignore / collab later** → `E_COLLAB_OFFER` seed.

**Outcomes:** Q09 done. Unlock Q10 when `burnout >= 25` (or force gate).

---

## Q10 — REST OR LIE

**Beat:** `burnout >= 25`. Dark day **or** stream through crash.

**Dialogue:**
> Body: decision_quality wants 0.65.
> Graph: "one more session."

**Choices:**
1. **REST (dark day)** → burnout down, graph flat, ending_score breathes. Q10 done.
2. **LIE (stream through crash)** → `decision_quality *= 0.65` for 90m, `authenticity_gap +8`, `E_STREAM_THROUGH_PANIC` risk.
3. **Partial: clips only** → ops-legal rest; burnout −5, no live.

**Outcomes:** Act 1 closes. Save stores moral memory: bots refused/accepted, crash streamed or not, rival stance.

---

## Act 1 exit checklist

| ID | Gate |
|----|------|
| Q00 | Side job resolved |
| Q01 | 90 min live attempted |
| Q02 | Title/rules/overlay set |
| Q03 | 4 unique stream days |
| Q04 | 3 clips + 1 live click |
| Q05 | BOT_CCV refuse or accept |
| Q06 | 10 unique + 1 mod |
| Q07 | Funnel read |
| Q08 | Pending payout seen |
| Q09 | Rival ping resolved |
| Q10 | Rest or lie at burnout ≥ 25 |
