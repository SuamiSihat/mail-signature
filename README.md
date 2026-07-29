# SuamiSihat Email Signature Generator

Welcome to the **SuamiSihat Email Signature** repository — a browser-based signature generator with live preview, full external and compact reply variants, one-click copy for Gmail and Outlook, and an integrated contact QR.

---

## 🚀 Quick Links

| Link | Description |
|------|-------------|
| 👉 [**Open Signature Generator**](https://suamisihat.github.io/mail-signature/) | Interactive app — fill in your details and copy to Gmail |
| 👁️ [**Preview Raw Signature**](https://htmlpreview.github.io/?https://github.com/SuamiSihat/mail-signature/blob/main/signature-full.html) | Static preview for manual copy |
| 📝 [**Release Notes**](RELEASE_NOTES.md) | Version 2.1.0 highlights, upgrade notes, and prerequisites |

---

## ✨ Features

- **Live Preview** — Signature updates in real-time as you type
- **Two Email-Safe Variants** — Full external and compact reply/internal formats
- **Dynamic Company Selection** — Company details, branding, contact information, and group URLs are populated from `config/signature-config.yaml`
- **One-Click Copy** — Copies rich HTML signature directly to the clipboard (Gmail and Outlook-ready)
- **Brand Aligned** — SS Prussian Blue `#022057`, SS Blue `#043388`, Azure `#21A1F7` accents, and Poppins with safe fallbacks
- **Dark / Light Mode** — Toggle with memory (saved to browser)
- **Integrated Contact QR** — Adds a scannable vCard QR to the top-right of the full signature
- **Centralized YAML Config** — Admins update `config/signature-config.yaml` without editing JavaScript
- **Five SS Companies** — SSH, SSW, SSC, SSE, and SST use independent approved logos and company details
- **Material Symbols UI** — Consistent Material icons throughout the generator interface
- **Guided Copy Workflow** — Dedicated full and compact copy actions with Gmail and Outlook instructions
- **Adaptive Preview** — Email canvas, Gmail, and Outlook preview modes with fit and zoom controls
- **Accessible Validation** — Required-field guidance, Malaysian phone formatting, keyboard focus states, and responsive mobile controls
- **Automated Validation** — Pull requests check JavaScript syntax, YAML configuration, asset paths, and email compatibility
- **Local Draft Saving** — Company, personal details, QR choice, signature format, and preview settings survive refreshes on the same browser

---

## 📋 How to Use (for Staff)

### 1. Open the Generator
Go to 👉 [**https://suamisihat.github.io/mail-signature/**](https://suamisihat.github.io/mail-signature/)

### 2. Fill In Your Details
| Field | What to Enter |
|-------|---------------|
| **Company** | Select your company from the configured dropdown |
| **Full Name** | Your full name (e.g. Ahmad Rizal bin Abdullah) |
| **Job Title / Position** | Your role (e.g. Senior Sales Executive) |
| **Direct Phone / Mobile** | Your direct line or mobile (e.g. +6012 345 6789) |
| **Work Email** | Your company email (e.g. ahmad@suamisihat.com.my) |

### 3. Copy Signature
Click **📋 Copy Signature** — the signature HTML is now in your clipboard.

### 4. Paste into Gmail or Outlook
1. Open [Gmail](https://mail.google.com) → **⚙️ Settings** → **See all settings**
2. Under the **General** tab, scroll to **Signature** → click **Create new**
3. Paste (`Ctrl+V` / `Cmd+V`) into the editor
4. Scroll to the bottom → click **Save Changes**

### 5. Contact QR Code
The full signature includes a QR code that recipients can scan to save your contact details. The compact reply signature omits it to stay lightweight.

### Local Drafts
Changes are saved automatically in the browser's local storage. They are not uploaded to a server. Use **Clear** in the Your Details card to remove the saved draft and reset the form.

---

## 🛠️ Admin: Updating Company Details

Company profiles, shared social links, app store links, banner image, and footer disclaimer are stored in a single configuration file:

👉 [`config/signature-config.yaml`](config/signature-config.yaml)

**To update anything company-wide:**
1. Open `config/signature-config.yaml`
2. Edit the relevant company under `companies` (or add another keyed company profile to create a new dropdown option)
3. Save the file and submit the change through the normal review workflow

```yaml
companies:
  ssh:
    id: ssh
    name: "SS Health"
    hqPhone: "+60356260031"
    website: "https://suamisihat.com.my"
    features:
      showContactQr: true
    # ...address and approved logo fields
```

Shared group links are defined once under `groupWebsites`. Display defaults are controlled under `featureDefaults`, while individual companies can override `showGroupLinks`, `showSocialLinks`, `showCampaignBanner`, `showAppLinks`, or `showContactQr`.

---

## 📁 Project Structure

```
mail-signature/
├── index.html                    ← Interactive signature generator
├── signature-full.html           ← Full external signature preview
├── signature-compact.html        ← Compact reply signature preview
├── config/
│   └── signature-config.yaml     ← Company profiles and shared data
├── scripts/
│   ├── config-loader.js          ← YAML loading and validation
│   └── signature-generator.js    ← Preview, QR, validation and copy logic
├── styles/
│   └── app.css                   ← Generator interface styles
├── assets/
│   ├── brand/                    ← Approved logos grouped by company
│   ├── social/                   ← Social-media icons
│   ├── apps/                     ← App-store badges
│   └── campaign/                 ← Campaign banner
├── tests/
│   └── signature.test.js         ← Compatibility and configuration tests
└── .github/
    └── workflows/
        └── deploy.yml  ← GitHub Pages auto-deploy
```

---

## 🤝 Support

For issues or questions, contact the SuamiSihat IT/Marketing team.

Before production rollout, complete the [email-client QA checklist](docs/email-client-qa-checklist.md) and review the [deployment prerequisites](docs/deployment-prerequisites.md).
