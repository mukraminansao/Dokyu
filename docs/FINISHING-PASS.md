# Approved finishing pass

Scope: the sixteen improvements approved on 5 November 2026, plus restoring Doki's account and Home walkthroughs. Preserve the approved Bayan Blue composition and existing application behavior.

## Implementation and verification

- [x] Shared screen surfaces and desktop typography apply across Guides, My Docs, Offices, Goals, Account, onboarding and authentication.
- [x] All active Doki presentations use the approved character, including onboarding, chat and tours. The inconsistent legacy vector implementation has been removed.
- [x] Transparent mascot asset prepared with the built-in image tool and visually checked against the approved character. Runtime asset is 808 KB, compared with the previous 1.7 MB full UI reference; surrounding layout is real UI.
- [x] Shared navy text, type scale, consistent icons, card borders, fields, buttons and focus styling retained.
- [x] Central raised Doki navigation, safe touch bounds and selected states retained.
- [x] Real document progress, existing empty/error/loading states and synchronization messaging retained.
- [x] Web offline notice added; bundled guides and local checklists remain available offline.
- [x] New copy has English and Tagalog translations; large text continues to use shared settings.
- [x] Reduced-motion behavior retained. The tour has dialog semantics, focus handling, Tab containment and Escape/Skip dismissal.
- [x] Root-level tour provider supports authentication and app screens. Sign-in, sign-up and recovery guides have independent completion records. Home tour version 2 runs once after the redesign, and Home/account guidance can be replayed.
- [x] Isolated local development/test databases provisioned. The local preview now connects to a real local API; account forms are enabled locally.
- [x] Full backend regression suite: 53 passing tests, including database-backed authentication, privacy, demo and document synchronization.
- [x] Direct browser checks: independent sign-in/sign-up guides, six Home steps, completion persistence and replay, real local demo sign-in and document rendering. Twelve phone/desktop route layouts fit without horizontal page overflow; Tagalog with large text also fits at 320px. Screenshots and layout measurements saved under `docs/ui-concepts/implemented/`.
- [x] Final lint, formatting, workspace types, 29 shared tests, production web export and Android Hermes export pass.
- [ ] Commit and publish the approved release; verify the deployed asset and available user flows.

## Testing boundaries

The local databases are separate from production. Local settings and credentials are in ignored environment files and must never be committed. Physical Android notification delivery and a full assistive-technology audit cannot be represented by bundle/browser checks. Record those limits explicitly in the final report.

## Mascot asset provenance

Built-in image generation was used in background-extraction mode with the supplied Bayan Blue reference. Prompt: extract only the full waving folder mascot from the desktop banner, preserve the character identity, pose and face, remove the entire UI/background, and output a transparent cutout. The produced image was inspected and saved as `apps/mobile-web/assets/doki-transparent.png`. It is an extraction-derived raster rendition, not a claim of pixel-identical source extraction. Navbar face and other placements reuse the same asset.
