# Reference details and articulated Doki

Follow-up to the user's comparison with `01 / Bayan Blue, refined` on 5 November 2026.

## Corrections

- [x] Home fills the available desktop workspace. Its old 880px reading-column limit no longer leaves large side margins. Other reading screens retain their width limits.
- [x] White page canvas and fully white mobile navigation background. Content colors cannot show through the raised navbar area; the broad upper navbar shadow is removed.
- [x] Stronger reference blue, solid selected Home icon, navy inactive labels, larger navigation icons and labels. The selected Doki halo is pale blue; keyboard focus remains visible.
- [x] Tighter mobile brand/header spacing, larger navy greeting/location text, filled location pin, filled profile avatar, and desktop avatar/name/chevron grouping.
- [x] Reference-sized document icon, desktop-only divider, light blue progress rail, compact phone action-card spacing, checked shield icon, heavier guide titles, larger visit-tool icons, navy reminder text and descriptive desktop search.
- [x] Doki is now an articulated SVG character with the reference's blue folder, red tab, folded white face, navy outline, pink cheeks and gold ID. Active placements no longer render the single PNG. Arms, feet, eyes, gaze, mouth and lanyard move independently; walking, waving, pointing up/down, talking, celebrating and worried expressions differ. The same rig supplies the navbar/chat face.
- [x] Banner Doki starts the Home walkthrough when tapped. Welcome, account screens, chat, tours and the development pose gallery use the same character.
- [x] Character animation updates pause for reduced motion and hidden apps/tabs. Tour walking animations stop on cleanup.
- [x] Tour bubbles measure their actual height, stay within the viewport and keep controls visible. Text can scroll in very short windows. Narrow/large-text footers put the step count on its own line. Navbar text stays within 320px.

## Evidence

Saved under `docs/ui-concepts/implemented/detail-pass/`:

- `home-phone.png`, `home-desktop.png`, `doki-poses.png` and six tour screenshots.
- `layout-checks.json`: 390px page has no horizontal overflow, navigation background is white, selected Home fill is `#0635CB`; at 1366px Home spans the available workspace with normal page padding.
- `tour-large-checks.json`: all six Tagalog tour steps keep their controls on screen at 320×740 with large text enabled.
- `chat-speech-check.json`: two different mouth paths observed while a chat answer typed. Joint transforms also change between rendered frames.

The screenshots with NBI progress use two temporary ticks to show the real progress state. Those ticks were restored to the original zero; language and large-text settings were restored to English/normal. The real guide has three required items, so the UI does not copy the mockup's fictional five-item count.

Lint, formatting, workspace TypeScript and 29 shared tests pass. Production web export and Android Hermes export pass. Existing backend tests were already verified in the preceding finishing pass; backend behavior is unchanged by this follow-up.

This is an implementation of the reference, with responsive behavior and actual user data. It does not reproduce the mockup's fake device chrome or invent a person's name, location or progress. Physical Android rendering and a full screen-reader audit remain outside the browser checks.

## Release

Both exports pass. Source publication and live verification are in progress.
