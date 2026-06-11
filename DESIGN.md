# FounderBox AI Design System

FounderBox AI uses a dark, precise SaaS operating-system aesthetic. The design direction is informed by the VoltAgent `awesome-design-md` approach: document the visual rules in plain text so future coding agents can keep the UI consistent.

## Visual Theme

- Premium near-black product workspace, not a playful AI-tools directory.
- Dense, scannable dashboard surfaces inspired by mature product tools.
- Hairline borders, restrained cards, compact controls, and visible source/status chips.
- Motion is subtle: page fades, active navigation movement, progress steps, and small hover lift.

## Palette

- Background: `#08080A`
- Surface: `#111116`
- Surface 2: `#181820`
- Border: `#2A2A35`
- Accent Maroon: `#8B1A3A`
- Accent Gold: `#C9A961`
- Text: `#F8F8F8`
- Muted Text: `#A1A1AA`

## Components

- Cards use 8px radius, 1px hairline border, dark surface fill, and only subtle hover lift.
- Buttons are compact rounded rectangles; primary uses gold, destructive uses red, secondary uses dark surface with border.
- Badges are pill-shaped and reserved for status, source, agent, type, and demo-mode labels.
- Inputs use dark surface fill, visible border, and gold focus rings.
- Tables are data-dense with uppercase small headers and horizontal scrolling on mobile.
- Dialogs use centered dark panels with backdrop blur and clear close affordances.

## Layout

- App routes use a left sidebar, sticky topbar, project switcher, search, and user menu.
- Content width is constrained but broad enough for dashboards.
- Mobile collapses the sidebar into an overlay menu.
- Page sections are full-width surfaces or normal layouts; cards are for actual records/tools.

## Demo Honesty

- All backend-dependent surfaces must show demo/local/not-connected language.
- No page should imply real OAuth, real AI calls, real databases, or real browser automation.
- Every agent output can be saved to Founder Black Box, reports, and files through localStorage.
