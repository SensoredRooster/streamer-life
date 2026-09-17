# Streamer Life — Architecture

Engine priority: Godot 4 first. The management GUI uses gameplay capture, overlay chrome, and typography; no humanoid, VTuber, or robot mascot.

## Scenes

Boot, OpsCommand, LiveSession, Funnel, ClipFactory, DarkMarket, Contracts, ChatCreature, BodySoul, Calendar, and MediaKit mirror the ten HTML screens.

## Data model

Persist currencies, body, craft, market, soul, session, platforms, quests, moral memory, and a ten-entry reply history. `ccv_display` is always computed as `ccv_real + ccv_bots`; never collapse those fields. The ending score is `owned_audience * (integrity/100) * (1 - burnout/120) * health`.

## Fraud and weather

Dark Market IDs are BOT_CCV, BOT_CHAT, RAID_POD, SOFT_AIM_SMURF, RAGE_ALT, DMA_HW, and STOLEN_CLIPS. Detection rolls, anti-cheat waves, false bans, and troll-bot events make fraud work before it detonates.

## Engine mapping

The vanilla JS files map to Godot autoloads GameState, Formulas, DarkMarket, EventBus, and SaveService. Unity can use the same DTOs and scene names as an appendix.
