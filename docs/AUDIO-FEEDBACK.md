# Doki and interface sound feedback

Implemented 6 November 2026.

## Behavior

- Quiet tap feedback on shared buttons, cards, navigation, checkboxes and choices. Browser links/switches and the native display switches are covered too. Disabled controls, hovering and scrolling do not request a cue. Nested click/press events are deduplicated.
- Doki's introduction and account/Home guides use a short movement cue, greeting, explanation chime and completion sound. Resizing/repositioning a step does not replay its cue. Skipping/closing a guide stops its sounds.
- **Account → Display & sound → Sound effects** defaults on, is saved locally, and can silence all feedback immediately. **Preview Doki sound** works with touch/mouse and Enter. Sound preference is independent of language, text size and profile sync.
- The browser starts audio after user interaction; blocked automatic cues are discarded, not replayed later. Background tabs/apps stop current cues. Native playback mixes with other audio, respects silent mode, and requests no recording/background-audio capability.
- All five earcons are original and use one score in `lib/soundCues.ts`. The browser creates short PCM buffers locally; Android uses five bundled WAVs (53,588 bytes total). No network sound service is needed. Regenerate native clips with `node --import tsx apps/mobile-web/scripts/generate-sounds.mjs` from the repository root.

## Implementation

`AppSounds` owns lifecycle and preference changes. `components/ui/Pressable.tsx` preserves React Native props/refs and adds activation feedback; existing Pressable imports now use it. `sounds.web.ts` owns Web Audio, and `sounds.ts` uses Expo Audio 58 on native. Recording and background playback are explicitly disabled in the Expo config. SDK reference: [Expo Audio 58](https://docs.expo.dev/versions/v58.0.0/sdk/audio/).

## Validation

- Five audio tests cover mute/foreground gating, tap deduplication, finite/quiet/bounded PCM, silence at clip boundaries and matching native WAV headers/sample data.
- Shared tests: 29 pass. Isolated database-backed backend tests: 53 pass. Total across the three suites: 87 pass.
- Formatting, lint, all workspace TypeScript, matching translation keys, production web export and Android Hermes export pass.
- Browser: actual AudioContext playback requests observed for all five cues; one tap request per activation; mute suppresses navigation and tour cues; muted preference survives reload; re-enabling works; preview activates with Enter. New controls fit at 320px with Tagalog and large text. Temporary display preferences were restored to English/normal; sounds remain on.
- Evidence: `docs/ui-concepts/implemented/audio-feedback-checks.json` and `sound-settings.png`.
- The local backend suite needs `npm_config_manage_package_manager_versions=false` on this Windows machine because its pnpm auto-version installation is missing; the tests pass with that process-only override.

Physical Android speaker/headphone behavior still needs a device check; bundle and browser checks do not establish hardware playback.
