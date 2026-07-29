# Deployment Prerequisites

The following items require organization-level infrastructure or approval and cannot be completed solely inside this static repository.

## First-party QR service

The current email-safe QR image uses QuickChart because Gmail and Outlook do not reliably preserve canvas, blob, or data-URI images. Before organization-wide rollout, consider replacing it with a PNG endpoint hosted under a SuamiSihat-controlled domain.

The endpoint must:

- Accept URL-encoded vCard text.
- Return a high-contrast PNG over HTTPS.
- Avoid retaining personal contact data in request logs.
- Provide caching, availability monitoring, and abuse protection.

## Dedicated asset domain

Replace `raw.githubusercontent.com` asset URLs with a stable SuamiSihat-controlled HTTPS asset domain when available. Preserve the organized paths under `assets/` to simplify migration.

## Legal approval

Legal or Compliance must approve the confidentiality notice in `config/signature-config.yaml` before production rollout.

## Final acceptance

Complete the checks in `docs/email-client-qa-checklist.md` and retain test evidence before merging to `main`.
