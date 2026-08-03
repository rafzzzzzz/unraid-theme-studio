#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${VERSION:-$(date -u +%Y.%m.%d)}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-rafzzzzzz/unraid-theme-studio}"
PACKAGE="theme.studio-${VERSION}-x86_64-1.txz"
DIST="$ROOT/dist"
ARCHIVE="$ROOT/archive"

mkdir -p "$DIST" "$ARCHIVE"
rm -f "$DIST/$PACKAGE"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT
cp -a "$ROOT/source/theme.studio/." "$TEMP_DIR/"
chmod 0755 "$TEMP_DIR/install/doinst.sh"

if command -v makepkg >/dev/null 2>&1; then
  (cd "$TEMP_DIR" && makepkg -l y -c n "$DIST/$PACKAGE")
else
  tar --owner=0 --group=0 -C "$TEMP_DIR" -cJf "$DIST/$PACKAGE" .
fi

MD5="$(md5sum "$DIST/$PACKAGE" | awk '{print $1}')"
sed -e "s|@VERSION@|$VERSION|g" -e "s|@MD5@|$MD5|g" -e "s|@GITHUB_REPOSITORY@|$GITHUB_REPOSITORY|g" \
  "$ROOT/plugin/theme.studio.plg.in" > "$DIST/theme.studio.plg"

cp -f "$DIST/$PACKAGE" "$ARCHIVE/$PACKAGE"
cp -f "$DIST/theme.studio.plg" "$ROOT/theme.studio.plg"

echo "Built $DIST/$PACKAGE"
echo "MD5: $MD5"
echo "Manifest: $ROOT/theme.studio.plg"
