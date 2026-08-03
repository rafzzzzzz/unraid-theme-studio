#!/bin/bash
set -u

PLUGIN_DIR="/usr/local/emhttp/plugins/theme.studio"
CONFIG_DIR="/boot/config/plugins/theme.studio"

mkdir -p "$CONFIG_DIR"

# Always regenerate so CSS migrations are applied while preserving the palette.
php -r "require '$PLUGIN_DIR/include/theme.php'; exit(theme_studio_save(theme_studio_load()) ? 0 : 1);"

chmod -R u=rwX,go=rX "$PLUGIN_DIR"
chmod 0755 "$CONFIG_DIR"
chmod 0644 "$CONFIG_DIR"/*.json "$CONFIG_DIR"/*.css 2>/dev/null || true
logger -t theme.studio "Theme Studio installed and active"
