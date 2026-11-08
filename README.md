# Streamer Life

**Streamer Life** is a numbers-first streamer-life simulation about 2026 creator reality. Live is the factory, shorts are the storefront, owned audience is the bunker, integrity is spendable, and burnout can beat a green graph.

## Quick start

1. Open `index.html` in a modern browser, or:
```bash
cd streamer-life
python3 -m http.server 8080
# visit http://localhost:8080
```

No build step. Vanilla HTML/CSS/JS.

**Immersive shell:** the game opens on a splash screen (Enter fullscreen / windowed). Tabs unlock via Coach. Space/Enter = CONTINUE, F = fullscreen. PWA install is available when served over http(s).

## Docs

| Doc | Path |
|-----|------|
| Locked brief | `docs/design-brief.md` |
| Act 1 script | `docs/act1-script.md` |
| Architecture | `docs/architecture.md` |

## Prototype map

`index.html`, `css/styles.css`, `js/{state,formulas,dark-market,coach,shell,ui,app}.js`, `manifest.webmanifest`, `sw.js`, `src-tauri/` (Tauri 2 desktop)

GitHub: https://github.com/SensoredRooster/streamer-life

> Full design documentation (palette, dual CCV, Dark Market IDs, Act 1, formulas) remains in `docs/` and in the workspace README at `/workspace/streamer-life/README.md`.

---

## Desktop app (Tauri)

Native desktop wrapper around the same static HTML/CSS/JS prototype (no React rewrite). Window title **Streamer Life**, dark background `#07090C`, min size **1100×720**. Identifier: `com.sensoredrooster.streamerlife`.

The browser PWA / “Install app” path still works when you serve over http(s). The Windows **.exe / NSIS / MSI** from Tauri replaces PWA for desktop installs — use the installer when you want a real Start Menu app; splash Install PWA remains fine inside the webview.

### Prerequisites (local)

- [Node.js 20+](https://nodejs.org/)
- [Rust stable](https://rustup.rs/) (`rustc` / `cargo`)
- On Windows: WebView2 (usually already present on Win10/11)
- On Linux: webkit2gtk / related Tauri system deps (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

### Commands

```bash
cd streamer-life
npm install
npm run tauri:dev      # desktop window + hot reload of static files
npm run tauri:build    # release bundles under src-tauri/target/release/bundle/
```

Game files stay at repo root (`index.html`, `css/`, `js/`, `assets/`, …). Tauri `frontendDist` points at `../` from `src-tauri/` (with `.taurignore` excluding `src-tauri`, `node_modules`, docs scratch, etc.).

### Download the Windows .exe from CI

1. Open the repo on GitHub → **Actions** → workflow **Tauri Windows**.
2. Pick a successful run (push to `main` / `feat/**`, pull request, or **Run workflow**).
3. Download the artifact **`streamer-life-windows`**.
4. Inside you will find NSIS/MSI under `bundle/nsis/` / `bundle/msi/` (and often a raw `.exe` under `release/`).

Product constraints unchanged in desktop mode: **meters/wordmark only** (teal on black, no mascot), **dual CCV stays**, **webcam default OFF**.
