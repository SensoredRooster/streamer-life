# Streamer Life — Locked Design Brief

You are helping me build a streamer-life simulation game called Streamer Life (working title). This is my version of "Life of a Streamer" / Streamer Life Simulator, but more honest about 2026 creator reality.

Do not invent a cartoon, humanoid, VTuber, or robot-mascot theme. Art lock is final:
- No cartoon humanoid
- No VTuber body
- No robot character in the GUI
- Live stage = gameplay capture + overlay chrome + typography
- Brand = wordmark STREAMER LIFE, teal on black, meters — not a character
- Optional tiny webcam tile can exist and must be togglable OFF
- Palette: bg #07090C, panel #10161C, teal #1EE6C5, teal_dim #0E6F62, danger #FF3B5C, warn #F5C542, muted #7A8894, text #E8F0F4

DESIGN THESIS
Fame is a hostile market. Live is the factory. Shorts are the storefront. Owned audience is the bunker. Integrity is spendable. Burnout can beat a green graph.
Work split shown in UI: 30% on camera, 70% ops (clips, titles, thumbs, replies, mods, taxes).
If the player only presses Go Live they stall at eternal ~4 viewers.

HIDDEN ENDING SCORE (vanity followers and bottled CCV excluded)
ending_score = owned_audience * (integrity/100) * (1 - burnout/120) * health

CORE LOOP
LIVE (factory) -> CLIP (storefront) -> POST (discovery) -> COMMUNITY (retention) -> MONEY/REP/HEAT -> REST/LIFE

STATS
Body: energy, sleep debt, voice, RSI, hunger/caffeine
Craft: game skill per title, commentary, entertainment timing, packaging (title/thumb/hook), tech/OBS, community craft
Market: reach, trust, heat, niche clarity, platform standing, sponsor safety
Soul: burnout, authenticity-vs-performance gap, isolation, metrics obsession, integrity, parasocial debt
Post-stream crash: if energy_spent > 40, decision_quality *= 0.65 for 90 minutes

CURRENCIES
cash, pending_payouts (NET-15 to NET-120 delay is a mechanic), followers, ccv_real, ccv_display, watch_hours, clips_ready, strikes, plus_points, sponsor_safety, owned_audience (Discord+email+Patreon)

ALWAYS show two CCV numbers: real vs display. Bottled CCV is a different color if Detective perk.

PLATFORMS (factions, none is a complete business)
- Twitch: home base, directory sorts by CCV so small = buried. Affiliate ~25 followers / 4 hours / 4 unique days / avg 3 CCV. Sub split 50/50, Plus ladder 60/40 then 70/30 from PAID subs only (Prime/gifts don't count). Bot penalty = cap display CCV to historical real. Multi-stream allowed with "don't advertise the other stream / merged chat" friction.
- YouTube: archive that pays later. Search + suggested + Shorts. YPP gates high (8000 watch hours OR 20M Shorts views / 90d). Silent kill = yellow-dollar demonetization. Members/Super Chat ~70/30.
- TikTok/Shorts/Reels: discovery casino. FYP lottery. Low RPM. Trend half-life in days. Risks: synthetic, reproduced, inactivity flags.
- Kick: 95/5 headline. Thinner city. Partner multi-stream toggle can cut that session payout ~50%.
- Owned land: Discord, email, Patreon. The bunker when ToS changes.

FORMULAS
impressions = reach * niche_clarity * packaging * platform_blessing * (1 - slop_penalty)
ctr = clamp(0.02 + thumb_skill*0.08 + title_skill*0.05 - generic_penalty, 0.01, 0.22)
retention = clamp(0.18 + entertainment*0.25 + game_skill*0.1 - tilt*0.15, 0.08, 0.72)
follow_conv = retention * trust * 0.04 * clip_to_live_quality
ccv_display = ccv_real + ccv_bots
chat_density = chatters / max(ccv_display, 1)
take_home_sub = price * platform_split * (1-processor_fee) * (1-tax_withhold)

INTEGRITY / DARK MARKET (first-class system, not a joke)
BOT_CCV: $40, integrity -8, detect 18%, heat +4
BOT_CHAT: $70, integrity -10, detect 22%
RAID_POD: $25, trust -3, heat +6
SOFT_AIM_SMURF: clip_quality +18, integrity -12, viewer-detect 12%
RAGE_ALT: clip_quality +35, integrity -28, AC-detect 35%
DMA_HW: $2500, integrity -40, AC-detect 8% until wave then 55%
STOLEN_CLIPS: growth +10, integrity -9, strike risk 14%
Also: enemies can troll-bot YOUR stream to trigger detection. False anti-cheat bans exist (you can get banned while reporting). Stream sniping. Engagement pods. Fake raid trains.

CONTENT TYPES (each has growth / money / risk / energy)
Ranked, variety, Just Chatting, IRL (safety events), speedrun, gambling (brand death), reaction (copyright), horror, educational, drama/callouts, ASMR, collab, charity/subathon, VTuber (optional content type — still no mascot in the MANAGEMENT GUI).

CHAT IS A CREATURE
Types: lurker, chatter, clip goblin, whale, parasocial spouse, backseat cop, hater who stays, raid tourist, bot, fellow streamer scout, brand intern.
You train the room with your last 10 replies.

GUI SCREENS
1 Ops Command (day board)
2 Live Session HUD (gameplay capture, not a character)
3 Funnel (impressions -> CTR -> AVD -> follow -> live click)
4 Clip Factory
5 Platform Contracts
6 Dark Market
7 Chat Creature
8 Body/Soul
9 Calendar/Meta
10 Media Kit (the polite lie you send brands)

ACT 1 QUESTS (first 14 days)
Q00 CLOCK IN — side job shift
Q01 FIRST LIGHT — stream 90 min
Q02 NAME THE ROOM — title/rules/overlay
Q03 FOUR DAY RITE — 4 unique stream days
Q04 ONE CLIP THAT CONVERTS — 3 clips, 1 live click
Q05 THE EMPTY PEAK — refuse $40 bot offer or accept the lie
Q06 CHAT CREATURE — 10 unique chatters, first mod
Q07 FUNNEL LESSON — read the funnel, don't yell shadowban
Q08 PAYOUT FICTION — first $5 is NET-delayed
Q09 RIVAL PING — raid same-size or clip-callout
Q10 REST OR LIE — burnout >= 25, dark day or stream through crash

EVENT IDS
GOOD: E_RAID_DOWN, E_FYP_SPIKE, E_KEY_DROP, E_QUIET_WHALE, E_COLLAB_OFFER, E_BLESSING_WEEK
BAD: E_UPLINK_DIE, E_VOD_MUTE, E_FALSE_BAN, E_TROLL_BOT, E_MOD_NUKE, E_BRAND_GHOST, E_RATE_CUT, E_STOLEN_FACE, E_DOOR
UGLY: E_REACT_FUNERAL, E_GAMBLE_SPONSOR, E_ONE_TIME_CHEAT, E_LEAK_DISCORD, E_FAKE_BREAKDOWN, E_STREAM_THROUGH_PANIC

BUILDS
Clip brain / Parasocial sponge / One-trick / Wholesome / Unfiltered / Ops monster / Detective / Dark market

WHAT EXISTING STEAM STREAMER SIMS DO THAT WE MUST NOT STOP AT
Hunger, toilet, buy GPU, donate popup. Insufficient.
We need funnel UI, two-clock life (live vs clip factory), platforms as opposing gods, fraud tech tree that works then detonates, anti-cheat weather including wrong-person bans, chat as trained animal, payout delay/insolvency while "famous", brand safety vs funny, post-stream crash decisions, owned-land win condition, moral memory in the save file.

TONE
Funny until it isn't. Numbers-first. No motivational fluff. Never let "buy a better GPU" be the whole game.

YOUR JOB IN THIS CHAT
1) Confirm you understand the art lock and systems.
2) Ask which deliverable I want next if I didn't specify: (A) wire a clickable HTML prototype to these stats so Dark Market buttons actually change Integrity/CCV, (B) Act 1 script/dialogue, (C) Godot/Unity architecture, (D) more UI screens in the same no-avatar style.
3) Then build that deliverable. Keep names, IDs, and colors stable.

Do not restart the design from scratch. Do not add a mascot. Do not collapse ccv_real and ccv_display into one number.
