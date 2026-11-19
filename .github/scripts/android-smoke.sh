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
# Print the words on screen (text and accessibility labels) to the job log.
screen() {
  echo "--- on screen ($1), $(adb shell wm size | tr -d '\r'):"
  ui | tr '>' '\n' | grep -e 'text="[^"]' -e 'content-desc="[^"]' \
    | sed -E 's/.*(text="[^"]*").*(content-desc="[^"]*").*(bounds="[^"]*").*/    \1 \2 \3/' | head -80
}
# Close the on-screen keyboard (a swipe over it would type) and answer Android's notification prompt.
calm() {
  adb shell dumpsys input_method | grep -q 'mInputShown=true' && adb shell input keyevent KEYCODE_BACK && sleep 1
  tap "Don’t allow" && sleep 1
  return 0
}
# Scroll the page down by about half a screen.
scroll_down() {
  calm
  local w h
  read -r w h <<<"$(adb shell wm size | grep -o '[0-9]\+x[0-9]\+' | tail -1 | tr 'x' ' ')"
  adb shell input swipe $((w / 2)) $((h * 7 / 10)) $((w / 2)) $((h * 3 / 10)) 400
}
open_link() { adb shell am start -W -a android.intent.action.VIEW -d "$1" "$PKG" >/dev/null; }
fail() {
  echo "::error::$1"; shot failed; screen "when it failed"
  adb logcat -d > "$OUT/logcat.txt"
  echo "--- app log (errors and React Native):"; grep -E "ReactNativeJS|FATAL EXCEPTION|AndroidRuntime: (Process|java)" "$OUT/logcat.txt" | tail -30
  exit 1
}

adb install -r "$APK" || fail "the APK did not install"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity" || fail "the app did not open"

# Up to 60 s: skip the welcome slides and the setup steps.
for i in $(seq 1 30); do
  sleep 2
  alive || fail "the app closed on start"
  [ "$i" = 3 ] && { shot first-screen; screen "first screen"; }
  tap "Skip" && continue
  break
done
sleep 3
shot after-intro
screen "after the intro"
alive || fail "the app closed after the intro"

# Sign in with the shared demo account.
open_link "dokyu://sign-in"
sleep 4
screen "after opening dokyu://sign-in"
found=0
for i in $(seq 1 30); do
  sleep 2
  alive || fail "the app closed on the sign-in screen"
  tap "Skip" && continue                       # Doki's tour of the sign-in screen
  if ui | grep -q 'Try the demo account'; then found=1; break; fi
  scroll_down   # the demo button is below the form
done
[ "$found" = 1 ] || fail "the sign-in screen with the demo account button never appeared"
shot sign-in
tap "Try the demo account"

# Up to 90 s (the demo server may be waking up): the sign-in screen goes away without an error.
ok=0
for i in $(seq 1 45); do
  sleep 2
  alive || fail "the app closed after signing in"
  calm
  dump=$(ui)
  echo "$dump" | grep -q 'Try the demo account' || { ok=1; break; }
done
[ "$ok" = 1 ] || fail "still on the sign-in screen 90 s after tapping the demo account"
sleep 3
shot signed-in
screen "after signing in"
tap "Skip"; sleep 2

# The account screen shows the shared-demo notice only when signed in to the demo account.
open_link "dokyu://account"
ok=0
for i in $(seq 1 20); do
  sleep 2
  alive || fail "the app closed on the account screen"
  calm
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
