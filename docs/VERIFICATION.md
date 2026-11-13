# Release verification

Verified 13 November 2026, Asia/Jakarta. Production: https://vfmaudio.rezaprama.workers.dev. Worker version: `bcaa4685-4119-458d-a4ad-67614c67b1ab`.

## Executed checks

- `npm test`: 33 tests passed. Includes Indonesian budget parsing, explicit negation, unknown facts, wired mic uncertainty, charging-only USB-C, alternate connector variants, accessory budget, source column drift, complete-component averages, category separation, extended value grades, malformed CSV, and untrusted shared URLs.
- `npm run build`: TypeScript and Vite passed. `wrangler types` generated the binding types from the deployment configuration. No hand-written binding interface.
- `wrangler deploy --dry-run`: passed. Production deploy completed with D1 and static asset bindings.
- `python scripts/verify-import.py`: imported JSON exactly matched the 744-product snapshot. Each SQL statement stayed below 100KB. Live D1 import also succeeded.
- Production `GET /api/catalog`: HTTP 200, 744 products, mode `live`. `POST /api/admin/sync` without credentials: HTTP 401. Conditional GET using the weak ETag returned by Cloudflare: HTTP 304.
- [GitHub Checks](https://github.com/rezaprama/vfmaudio/actions/workflows/checks.yml) validates the pushed source. [Initial sync run](https://github.com/rezaprama/vfmaudio/actions/runs/43417006144) succeeded with `changed:false,count:744`.
- [Update-path sync run](https://github.com/rezaprama/vfmaudio/actions/runs/43418546213) succeeded with `changed:true,count:744`. Bootstrap checksum invalidation exercised the actual snapshot replacement path without altering product facts. D1 retained both current and previous payloads; the temporary checksum marker was repaired after checking that product facts and title matched. This was a release test, not a claim that the author edited the sheet at that time.
- Windows Application Control blocked the local `workerd.exe` runtime. The policy was preserved. Worker verification used real Cloudflare deployment and D1, while frontend outage tests used an ignored local QA proxy.
- Production browser console: no errors observed after search, dialogs, comparison, navigation, and theme changes. Intentional HTTP 503 failures in the local outage test are separate from production console results.
- Core Web Vitals and Lighthouse were not measured. No score or conformance certification is claimed.

## Recorded browser interactions

These checks exercise each control family, with shared product rows tested on representative IEM and wireless headphone records. They do not claim 744 separate manual product audits.

| Control | Observed result |
| --- | --- |
| Empty request submit | Shows a request to enter needs or choose an example. |
| User's Rp1 million example | Selects IEM/wireless headphone, USB-C, 3.5 mm, mic and music. Displays 0 fully verified matches, with explicitly incomplete candidates. |
| Typed TWS request with battery requirement | Applies supported filters and explicitly flags battery/device constraints as not applied. |
| TWS and neutral IEM examples | Update budget, categories, and requirements. Enter activates the example button. |
| Budget and accessory reserve | Changing Rp800,000 budget and Rp100,000 reserve changes the result count and total budget calculation. |
| ANC, multipoint, and minimum sound | Checked controls and changed minimum immediately update results. |
| Extra category select | Adds the Dongle DAC group; remove button removes it. |
| Strict mode | Shows the specific empty state when all remaining matches contain unknown facts. “Tampilkan yang perlu dicek” restores those candidates. |
| Product name and “Alasan & rincian” | Open a native dialog with evidence, exact source row, recorded features and source scores. Tested desktop and mobile. |
| Close button and Escape | Close details and comparison dialogs. |
| Compare selection | Adds/removes products; opens comparison at 2+ selections; a fourth choice shows the maximum-three message. Clear removes all selections. |
| Cross-category comparison | Displays the warning to compare requirements and price rather than cross-category sound scores. |
| Expand and collapse group | Expanded IEM group to 80 rows and collapsed it again. |
| Sort by price | First IEM became Ak6 Pro at Rp58,900 in the verified-price cohort. |
| Sort by sound | First IEM became Moondrop Lan 2, 7.63/10 in the verified-price cohort. |
| Name search without matches | Shows the filter-specific empty state; reset restores default results. |
| Share and reload | Copies a filter URL; reload restores the Rp500,000 TWS filter. Reset clears shared parameters. |
| Navigation | Katalog, Cara menilai and status links navigate to real anchors. Wordmark resets and returns to the top. Source review link opened the original sheet at IEM row 58. Footer source-code link opened the public GitHub repository. |
| Theme | Both light and dark rendered; dark theme survived reload. Final user-facing tab returned to light. |
| Keyboard | Tab from wordmark focused Katalog with a visible solid outline. Enter activated a preset. Escape closed dialogs. Controls use native semantics. |
| Mobile filters | “Ubah” expands, inputs remain editable, “Tutup” collapses. |
| Loading | QA proxy delay showed “Membaca harga dan penilaian dari katalog…”. |
| API outage with available snapshot | Local preview displayed the deployment snapshot and its visible fallback warning. |
| API and snapshot outage | Intentional 503 proxy showed the error and “Muat ulang katalog”; retry returned to loading. |

Viewport checks at 320, 375, 768, 1024, and 1440px showed document/body widths no greater than the viewport. Mobile dialog was usable at 375px. Temporary viewport overrides were reset. Desktop and mobile screenshots were saved with the handoff artifacts.

Contrast calculations: muted light text on paper 5.70:1; white on primary orange 6.44:1; muted dark text 8.22:1; dark text on dark-theme orange 7.92:1. Control boundaries measured 3.49:1 in light and 3.98:1 in dark. Disabled controls use inactive-control styling and are not a conformance claim.

## Anti-slop Delivery Gate

Direction: owner-selected editorial audio. ENERGY 2 / RHYTHM 2 / MOTION 1, declared before UI generation and recorded in DESIGN.md. Mode: during, session override.

### Block 1: Hard Gate, PASS

- R-02 PASS: authored product copy has no em dash; imported source fields retain their original content.
- R-03 PASS: five viewport checks, mobile filters/dialogs, and 44px control hit areas; no page overflow observed.
- R-17 PASS: displayed counts come from catalog arrays; prices/scores retain source provenance or an explicit missing state.
- R-18 PASS: no testimonials or invented people.
- R-23 PASS: text wordmark, owner-selected direction, real catalog data; no assumed logo, avatar, or product illustration.
- R-24 PASS: navigation anchors and external destinations were opened and verified.
- R-25 PASS: text/color pairings calculated above; both token sets checked, with control boundaries above 3:1.
- R-26 PASS: recorded control-family click-through above; no nonfunctional marketing controls.
- R-27 PASS: loading, filtering-empty, fallback, total outage, and retry were exercised.
- R-28 PASS: no template FAQ.
- R-32 PASS: native controls, visible focus, Tab/Enter operation and Escape dialogs checked.
- R-33 PASS: features live in source files; no script patches UI/CSS by string replacement.
- R-34 PASS: both complete themes rendered and theme persistence checked.
- R-35 PASS: app built, ran locally, deployed, and was exercised in production; actual limits are stated above.
- R-36 PASS: no fabricated reviews, compatibility, certification, performance score, or checkout price claims.
- R-37 PASS: owner chose direction before implementation; DESIGN.md records identity and rationale.
- R-38 PASS: source-backed catalog and explicit unknowns; no realistic-looking fabricated content.
- R-39 PASS: native semantic controls, names and visible field labels, pointer/hover/active/disabled states, reduced-motion CSS, lang/title/landmarks and zoomable viewport.
- R-40 PASS: no unsized media or third-party blocking script; self-hosted swap fonts; no invented performance metric.

### Block 2: Purpose-Gate, PASS

- R-01 PASS: warm paper/ink and burnt orange follow the owner's direction and documented hierarchy; no default gradients or glows.
- R-04 PASS: Phosphor icons communicate search, comparison, theme, close, and evidence states.
- R-06 PASS: Instrument Serif supports the reference-book identity; DM Sans supports dense controls; no terminal-style large monospace.
- R-07 PASS: no decorative grid, blueprint, or dot background.
- R-08 PASS: external-link arrows signal leaving the catalog; primary search and filter actions have no decorative arrows.
- R-09 PASS: match labels report actual evidence states; no generic promotional capsules.
- R-10 PASS: no glassmorphism.
- R-12 PASS: shadow only on modal elevation; rows and panels stay flat.
- R-13 PASS: no glow effects.
- R-14 PASS: consistent product rows support comparison; first result uses typographic hierarchy, not interchangeable feature cards.
- R-19 PASS: hover/focus/active feedback only, reduced-motion override; no continuous animation.
- R-22 PASS: no generic illustrations.

### Block 3: Liveliness, PASS

- PASS: explicit ENERGY 2 / RHYTHM 2 / MOTION 1 match the implemented interface.
- PASS: request input is the main action, with a clear title and result hierarchy.
- PASS: whitespace separates need entry, editable constraints, evidence rows and source notes.
- PASS: orange concentrates on primary action and selected controls.
- PASS: indexed rank numerals, editorial type and fine rules repeat the listening-notebook motif.
- PASS: Design Read was stated before generation and is preserved in DESIGN.md.

### Block 4: Craftsmanship and Quality Locks, PASS

- C-1 / R-31 PASS: color, type, spacing, composition, rows, icons and elevation have written reasons in DESIGN.md and this report.
- C-2 PASS: recorded working controls and destinations above.
- C-3 / R-05 PASS: structure follows search, constraints, comparison, methodology and data freshness; no marketing template sections.
- C-4 PASS: error/loading/empty states, keyboard, mobile reflow and both themes were tested within the limits stated above.
- C-5 PASS: facts retain source identity; unknown compatibility remains unknown.
- R-11 PASS: 4px controls, 8px inset panels/modals; no uniform pill treatment.
- R-15 PASS: CTAs name real actions such as “Cari yang cocok”, “Bandingkan” and “Buka Kitab Audio”.
- R-16 PASS: product copy uses concrete behavior, without generic AI marketing claims.
- R-20 PASS: the indexed audio reference identity and constraints/evidence composition are specific to this product.
- R-21 PASS: functioning light/dark choice, not an arbitrary fixed dark default.
- R-29 PASS: warm neutral foundation and one orange accent, consistent in both themes.
- R-30 PASS: no clone of a named commercial interface.

## Operational limits retained

The language parser is rule-based, not an unrestricted assistant. Accessory reserves are estimates and do not form verified hardware bundles. Prices are source references, not live shop checkout prices. Automated scheduled runs can be delayed; GitHub's 60-day inactivity rule and recovery steps are documented in README.md. The UI warns when successful source checks are older than 24 hours. Changes to source columns can require a deliberate mapping update; validation preserves the last good snapshot rather than guessing.
