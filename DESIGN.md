# vfmaudio

Owner-selected direction, 8 November 2026: editorial audio, warm paper, dark ink, orange accent, dense catalog. Antislop mode: during (session override).

## Design read

An Indonesian audio buying desk for listeners comparing real tradeoffs. A reference book rather than a storefront. ENERGY 2 / RHYTHM 2 / MOTION 1.

## Identity and purpose

- Name is a text wordmark, not an invented logo. No product photos, avatars, or illustrative assets.
- Warm paper (#f4f1e9), ink (#242720), muted ink (#5c6056), and burnt orange (#a43d18) recall printed listening notes. Orange marks the primary search action and selected controls.
- Dark mode uses warm charcoal (#20231e), pale paper (#f4f1e9), muted paper (#b8bcaf), and orange (#f6aa7f). The catalog can be read comfortably in either theme.
- Instrument Serif gives the main question a recognisable editorial voice. DM Sans gives dense controls and names legible letterforms. Fonts are self-hosted with swap.
- Tabular numbers align Indonesian rupiah amounts and source scores. Monospace is not a visual theme.
- Main composition: compact masthead, asymmetric title and source note, full-width need input, then narrow filter column and wide ranked reading list. This follows the buying decision, with no marketing sections.
- Repeated large rank numerals and fine horizontal rules borrow the rhythm of an indexed listening notebook. They communicate ordering and row boundaries, not imaginary measurements.
- Rows share a predictable data structure because users compare the same fields. First result receives a larger title, not a fictitious endorsement badge.
- Radius is 4px on inputs and buttons, 8px on inset panels. Panels stay flat; only the modal has a shadow to communicate elevation.
- Icons use Phosphor regular weight for real actions (search, comparison, close, theme, information). Text accompanies primary actions. No decorative feature glyphs.
- Motion is limited to hover, active, and focus feedback under 140ms. Reduced motion removes transitions. No entrance choreography or continuous motion.
- Whitespace groups the request, editable constraints, and evidence. Desktop uses a 1280px reading area; tablet shortens the filter column; mobile stacks filters above results. Controls retain 44px targets.

## Product language

Indonesian, direct, complete sentences. Show evidence and uncertainty next to decisions. “Belum tercatat” means unknown, never false or good. No universal audiophile certification, invented microphone claims, discount claims, or best-in-market promises.

## Data decisions

- Credit Kitab Audio by Fernanda Gunsan everywhere a source score is displayed.
- Link each result to its source tab and exact row. Original reviews and affiliate links stay in the original sheet.
- Source value ranks sort within category. Sound scores never rank across product categories; headphone open/closed groups stay separate.
- Three states: all requested facts known, one or more facts unknown, or known failure. Strict mode hides unknowns.
- Accessory reserve is a user-set estimate, never a fabricated product price. It cannot turn unverified compatibility into verified compatibility.
- “Diperiksa” is our check time. It never claims the author updated then. Source title date is shown separately when available.

## Responsive and state contracts

320px minimum layout, one-column mobile results, no page overflow, no sticky overlay over final content. Native forms and dialogs, visible focus, loading text, retryable errors, filter-specific empty state. One h1, logical h2/h3, labelled controls and keyboard operation in both themes.
