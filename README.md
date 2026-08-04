# UNRAID Theme Studio

A native UNRAID 7.2+ plugin for visually creating webGUI themes. Pick colors,
see a dashboard preview immediately, check text contrast, then apply the theme
without editing CSS by hand.

## What is included

- Live dashboard preview with desktop and mobile sizes
- Color controls for the page, panels, text, secondary text, borders, header,
  links/accent, success, warning, and danger states
- Corner-radius and density controls
- Master enable/disable switch that preserves the saved palette while removing
  all generated Theme Studio overrides
- Advanced effects for panel transparency, accent gradients and glow, plus an
  optional reduced-motion-aware animated background
- Twelve built-in presets—including Dracula, Catppuccin Mocha, Oblivion, Nord,
  Tokyo Night, Gruvbox, Solarized, Everforest, Rosé Pine, and Plex Inspired—plus
  undo/redo, JSON import/export, and CSS export
- Server-side validation and CSRF-protected saves
- Persistent configuration at `/boot/config/plugins/theme.studio/`
- A generated override stylesheet loaded after UNRAID's stock theme
- Consistent Dynamix tables and components across Docker, Plugins, and third-party pages
- Native Settings page and header shortcut; no Docker socket or extra port

## Try the editor locally

Serve the repository root with any static server and open `/preview/`:

```bash
python -m http.server 8080
```

The preview uses a mock save adapter and does not touch an UNRAID server.

## Build a plugin package

On Linux, WSL, or an UNRAID terminal:

```bash
chmod +x scripts/build.sh
GITHUB_REPOSITORY=rafzzzzzz/unraid-theme-studio ./scripts/build.sh
```

Artifacts are written to `dist/`. Commit the generated `theme.studio.plg` and
publish the `.txz` file in a GitHub release using the version as its tag.

For a manual test install, copy the `.txz` to an UNRAID server and run:

```bash
installpkg theme.studio-*.txz
```

Then open **Settings → User Preferences → Theme Studio**.

## Community Applications publication

Community Applications requires a small plugin template repository. Copy
`community-applications/theme-studio.xml` into a dedicated template repository,
replace the placeholder URLs and author, then submit that repository to the
Community Applications maintainers. The `PluginURL` must exactly match the
`pluginURL` in `theme.studio.plg`.

## Development layout

- `source/theme.studio/` — files packaged onto the UNRAID root filesystem
- `preview/` — standalone browser test harness
- `scripts/build.sh` — creates the Slackware `.txz`, checksum, and `.plg`
- `plugin/theme.studio.plg.in` — install manifest template
- `community-applications/` — CA listing template to move to a dedicated repo

## Compatibility note

The plugin targets UNRAID 7.2 and later. It uses the public CSS custom properties
present in the 7.2 webGUI and an ordinary `Buttons` page stylesheet, so no stock
UNRAID files are patched. A future webGUI release may rename individual CSS
variables; the editor's saved palette remains portable and can be regenerated.
