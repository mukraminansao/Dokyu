#!/usr/bin/env bash
# Android smoke test (run by .github/workflows/android.yml inside the emulator job).
# Installs the APK, opens Dokyu, skips the intro and setup, signs in with the shared demo account
# and checks that the account screen shows the demo notice, with no crashes. Screenshots go to smoke/.
set -u
APK="$1"
PKG=ph.dokyu.app
OUT=smoke
mkdir -p "$OUT"
step=0

shot() { step=$((step + 1)); adb exec-out screencap -p > "$OUT/$(printf '%02d' $step)-$1.png"; }
ui() { adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; adb shell cat /sdcard/ui.xml 2>/dev/null; }
# Tap the centre of the first element whose text or content-desc starts with $1. Returns 1 if not on screen.
tap() {
  local b
  b=$(ui | tr '>' '\n' | grep -F -e "text=\"$1" -e "content-desc=\"$1" | head -1 | grep -o 'bounds="[^"]*"')
  [ -n "$b" ] || return 1
  read -r x1 y1 x2 y2 <<<"$(echo "$b" | grep -o '[0-9]\+' | tr '\n' ' ')"
  adb shell input tap $(((x1 + x2) / 2)) $(((y1 + y2) / 2))
}
alive() { adb shell pidof "$PKG" >/dev/null; }
open_link() { adb shell am start -W -a android.intent.action.VIEW -d "$1" "$PKG" >/dev/null; }
fail() { echo "::error::$1"; shot failed; adb logcat -d > "$OUT/logcat.txt"; exit 1; }

adb install -r "$APK" || fail "the APK did not install"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity" || fail "the app did not open"

# Up to 60 s: skip the welcome slides and the setup steps.
for i in $(seq 1 30); do
  sleep 2
  alive || fail "the app closed on start"
  [ "$i" = 3 ] && shot first-screen
  tap "Skip" && continue
  break
done
sleep 3
shot after-intro
alive || fail "the app closed after the intro"

# Sign in with the shared demo account.
open_link "dokyu://sign-in"
found=0
for i in $(seq 1 30); do
  sleep 2
  alive || fail "the app closed on the sign-in screen"
  if ui | grep -q 'Try the demo account'; then found=1; break; fi
done
[ "$found" = 1 ] || fail "the sign-in screen with the demo account button never appeared"
shot sign-in
tap "Try the demo account"

# Up to 90 s (the demo server may be waking up): the sign-in screen goes away without an error.
ok=0
for i in $(seq 1 45); do
  sleep 2
  alive || fail "the app closed after signing in"
  dump=$(ui)
  echo "$dump" | grep -q 'Try the demo account' || { ok=1; break; }
done
[ "$ok" = 1 ] || fail "still on the sign-in screen 90 s after tapping the demo account"
sleep 3
shot signed-in
tap "Skip"; sleep 2

# The account screen shows the shared-demo notice only when signed in to the demo account.
open_link "dokyu://account"
ok=0
for i in $(seq 1 20); do
  sleep 2
  alive || fail "the app closed on the account screen"
  if ui | grep -q "in the shared demo account"; then ok=1; break; fi
done
shot account
[ "$ok" = 1 ] || fail "the account screen does not show the demo account"

adb logcat -d > "$OUT/logcat.txt"
if grep -q "FATAL EXCEPTION" "$OUT/logcat.txt"; then fail "a crash was logged"; fi
if grep -E "ReactNativeJS.*(Error|Exception)" "$OUT/logcat.txt" | grep -v -i "network request failed" | head -5 | grep -q .; then
  grep -E "ReactNativeJS.*(Error|Exception)" "$OUT/logcat.txt" | head -5
  fail "JavaScript errors were logged"
fi
echo "Android smoke test passed: opened, intro skipped, demo account signed in, account screen shown, no crashes."
