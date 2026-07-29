# Release Notes — v2.1.0

Release date: 29 July 2026

## Highlights

- Redesigned the email signature generator around the SS Health brand system.
- Added dynamic profiles for SSH, SSW, SSC, SSE, and SST.
- Added full external and compact reply signature variants.
- Added approved vertical company logos, SS brand colors, and Poppins with email-safe fallbacks.
- Preserved table-based, inline-CSS output for Gmail and Outlook.

## Generator experience

- Added company summaries with dynamic phone, address, website, map, and group links.
- Added live validation and automatic Malaysian `+60` phone normalization.
- Added dedicated copy actions for full and compact signatures.
- Added Gmail, Outlook, and neutral email preview modes.
- Added preview zoom and independent light/dark preview controls.
- Added an optional vCard QR in the top-right of the full signature.
- Added browser-local draft saving with a clear-draft control.
- Added responsive mobile controls, accessible focus states, and reduced-motion support.

## Signature content

- Renamed the phone label to `PHONE NO`.
- Renamed the company-link section to `GROUP`.
- Formatted addresses across two lines with the postcode beginning the second line.
- Expanded the campaign banner to the full 600 px signature width.
- Updated the confidentiality notice.
- Kept social-media PNG icons for reliable Gmail and Outlook rendering.

## Configuration and repository

- Replaced the JavaScript configuration with `config/signature-config.yaml`.
- Consolidated shared group links and added validated per-company feature overrides.
- Organized assets into brand, social, app, and campaign folders.
- Renamed scripts, styles, and static previews with descriptive filenames.
- Removed obsolete and duplicated assets.
- Added full and compact static preview pages.

## Quality and deployment

- Added automated tests for all companies, both signature variants, sanitization, configuration, feature flags, drafts, and asset paths.
- Added pull-request validation through GitHub Actions.
- Added a real-client QA checklist and deployment prerequisites.
- Verified the generator and static previews through rendered browser testing.

## Production prerequisites

- Complete `docs/email-client-qa-checklist.md`.
- Obtain Legal or Compliance approval for the confidentiality notice.
- Consider replacing QuickChart and raw GitHub asset URLs with SuamiSihat-controlled services.

## Upgrade notes

The previous root-level `config.js`, `generator.js`, `style.css`, and `signature.html` files have been replaced by the organized paths documented in `README.md`. Bookmarks to the old static preview should be updated to `signature-full.html`.
