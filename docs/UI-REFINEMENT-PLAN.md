# Bayan Blue refinement implementation

Approved direction: `ui-concepts/01-bayan-blue-refined-doki-nav.png` (5 November 2026). Implement the home experience and shared navigation in the existing Expo app. Other screens retain the established shared design system; their routes and features must remain reachable.

## Completion criteria

- [x] Record the approved design and inspect existing components, data and navigation.
- [x] Refine the home header, personalized greeting, location control and illustrated banner with the existing Doki artwork.
- [x] Move the real next-step card ahead of category browsing; use the blue card, gold action and actual checklist progress. Handle continuing, goal recommendation and no-goal states.
- [x] Keep search connected to Guides and make four category tiles clear and responsive.
- [x] Replace popular-guide carousel with readable linked rows using real guide data.
- [x] Group office finder, holidays, checklists and My Docs into visit tools; keep real document alerts.
- [x] Use desktop columns when enough space is available; retain a readable mobile/tablet stack without horizontal overflow.
- [x] Emphasize the central mobile Doki tab with raised blue surface, white rim, larger face, shadow and persistent label. Preserve all five tabs, selection state, safe area and tour targets.
- [x] Preserve bilingual content, large text, reduced motion, visible focus, screen-reader labels, comfortable touch targets and independent-project disclaimer.
- [x] Review React structure and hooks; add no bitmap UI or unnecessary dependencies.
- [x] Run formatting, lint, typecheck and relevant tests; build web and Android bundles where tooling permits.
- [x] Visually review mobile and desktop in English/Tagalog and large-text modes; check affected navigation, search, checklist continuation and guided tour.
- [x] Save screenshots and verification results; distinguish verified behavior from environment limitations.

## Implementation order

1. Establish baseline and install locked dependencies.
2. Implement home presentation components, localized copy and responsive composition.
3. Refine shared navigation and content clearance.
4. Run static checks and fix findings.
5. Build and review the affected user flows, then update this checklist and handoff.

## Boundaries

Use real data and existing behavior rather than mockup sample values. No changes to authentication, government content, backend contracts or persistence are required. Preserve existing code-native mascot and animations. Local implementation and validation are authorized; publication is separate from this visual refinement.

## Status

### Reference reproduction pass (5 November 2026, latest)

The user rejected the earlier approximate typography and mascot. This pass supersedes the earlier visual claims: Home uses its own desktop/mobile typography scale, navy `#090B35` text, 36px desktop hero/card titles, 24px section headings, 18px desktop body/category text, a 210px sidebar and an 880px maximum Home column. Desktop columns and the horizontal document card now work at the supplied 1104px reference width. Phone search, banner, card padding and CTA height were measured separately rather than scaled from desktop.

Home and the central navbar now display the **actual supplied mascot illustration**, clipped at render time from `assets/bayan-approved-reference.png`; the older SVG character remains available for conversational animation elsewhere. The raster asset contains illustration pixels only in the rendered crops; UI text, data, controls and navigation remain native components. The exact illustration's background is retained in its crop, rather than claiming this is a transparent cutout.

Current comparison captures: `ui-concepts/implemented/desktop-reference-dimensions.png` at 1104 × 910 and `phone-reference-dimensions.png` at 390 × 900. These temporarily display one real checklist tick for checking the continuation layout; the test tick is undone afterward. Names, areas and actual requirement counts are not replaced with the mockup's sample data. The files and checks from prior passes below are historical. This pass uses direct visual comparison and does not claim an automated pixel-perfect match.

Implemented locally. The approved design is now the Home presentation and shared navigation. Real user data determines the next action; no mockup sample state is hard-coded.

### Visual-reference correction (5 November 2026)

The user correctly identified that the initial implementation still looked too much like the original app. Passing functional checks did not establish a close visual match. The implementation was revised against the approved image, including:

- Folder logo and entirely blue wordmark, replacing the previous gold letter.
- A white paper face, red folder tab and wider folder silhouette for the existing animated, code-native Doki, also used by the raised navigation button.
- Larger home headings, pale blue gradient banner, blue gradient action card, white document icon and divider, gold gradient action, stronger card outlines, and tighter spacing.
- Simpler desktop sidebar, three popular guide rows with category labels, and two main visit actions with secondary checklist/My Docs links.
- Shorter, honest introductory card for users without checklist progress. Names, areas and requirement counts remain real rather than copying the mockup's example values.

Current screenshots: [desktop](ui-concepts/implemented/desktop-en.png), [phone](ui-concepts/implemented/phone-en.png). A real checklist tick was temporarily used to capture the continuation state ([phone](ui-concepts/implemented/reference-match-phone.png), [desktop](ui-concepts/implemented/reference-match-desktop.png)); it was then undone and verified as 0 of 3. Language and large-text test changes were also restored to their original English/normal state.

Current verification: lint, workspace typechecks, all 29 shared tests, and web/Android exports pass. Direct browser checks verified guide opening, checklist continuation and restoration, Doki navigation, search focus/filtering, and the revised language/text-size layouts. Nine measured layout modes show no document-level horizontal overflow; see [reference-match-layouts.json](ui-concepts/implemented/reference-match-layouts.json). The Tagalog large-text mode was also visually checked at 320px. The previous automated interaction and accessibility JSON files below document earlier review stages and do not constitute a fresh full accessibility audit of these visual corrections. Physical-device and live-account limits remain.

## Verification

- Formatting and repository lint pass.
- Full workspace typecheck passes for shared, app and server packages. The Prisma client was generated after dependency installation; no database migration or application data change was needed.
- All 29 shared tests pass.
- Web export and Android Hermes export pass with the final source.
- Browser interaction checks pass for the raised portion of the Doki button, all five tabs and selected states, search focus/filtering, four document categories, checklist persistence and refreshed Home progress, popular guide links, all visit tools, goal/no-goal states, the full first-visit guided tour, keyboard focus and reduced-motion preference.
- Responsive screenshots and measured layouts: [implemented/](ui-concepts/implemented/). Machine-readable checks: [layout-results.json](ui-concepts/implemented/layout-results.json) and [interaction-results.json](ui-concepts/implemented/interaction-results.json).
- React review: stable hook ordering, existing providers and data access retained, reusable home sections extracted, no new runtime dependencies, existing reduced-motion helpers retained, all product text uses AppText and localized strings (Doki is a proper name).

## Limits and delivery

Browser checks use an isolated guest session and bundled fallback guide data in a local preview, with sample checklist entries only in that disposable browser storage. They do not verify live account synchronization or backend database integration. Android was bundle-verified, not exercised on a physical device. Screen-reader semantics were reviewed in source; no full assistive-technology audit was performed. No production deployment, commit or push was performed.

The raised button uses a complete 72px-wide Pressable around the raised surface and label, rather than positioning the face outside its touch bounds. Content has additional bottom clearance, labels can wrap in large-text mode, and the independent-project disclaimer has stronger text contrast.

## Follow-up audit (5 November 2026)

The second review found and corrected two gaps:

1. **Native hit boundaries:** the raised Pressable previously extended above its navbar parent. The navbar now reserves space for the entire control; only its white background is inset. Measured checks confirm that the Doki control is contained within every non-empty ancestor rectangle on phone, small phone with large text, and desktop. Its size is now sourced from the shared `size.dokiButton` token.
2. **Desktop accessibility semantics:** the sidebar previously assigned `tablist` to the entire sidebar, including the logo heading. That role now wraps only the navigation tabs. The development-only design-system shortcut is a separate button.

After correction: lint, workspace typechecks, formatting, 29 shared tests, the ten responsive layout checks, all ten browser interaction groups, and final web/Android exports pass. Automated accessibility checks report no violations in the three audited Home modes; results and ancestor measurements are saved in [recheck-accessibility.json](ui-concepts/implemented/recheck-accessibility.json).

The automated contrast checker requested manual review of the single gold letter in the wordmark and the Doki label adjacent to its illustration. The gold letter is retained as branding; the functional Doki label uses the primary blue on white and has been checked separately for contrast. These automated scans do not replace a full screen-reader or physical-device audit. The local/live-service limitations above still apply; no zero-defect guarantee is implied.
