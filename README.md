# SuamiSihat Email Signature Generator

Welcome to the **SuamiSihat Email Signature** repository — a fully interactive, browser-based signature generator with live preview, dark/light mode, one-click copy for Gmail, and QR vCard support.

---

## 🚀 Quick Links

| Link | Description |
|------|-------------|
| 👉 [**Open Signature Generator**](https://suamisihat.github.io/mail-signature/) | Interactive app — fill in your details and copy to Gmail |
| 👁️ [**Preview Raw Signature**](https://htmlpreview.github.io/?https://github.com/SuamiSihat/mail-signature/blob/main/signature.html) | Static preview for manual copy |

---

## ✨ Features

- **Live Preview** — Signature updates in real-time as you type
- **One-Click Copy** — Copies rich HTML signature directly to clipboard (Gmail-ready)
- **Dark / Light Mode** — Toggle with memory (saved to browser)
- **QR vCard** — Auto-generates a scannable contact QR code; download as `.vcf`
- **Centralized Config** — Admins update `config.js` once to update all company-wide details

---

## 📋 How to Use (for Staff)

### 1. Open the Generator
Go to 👉 [**https://suamisihat.github.io/mail-signature/**](https://suamisihat.github.io/mail-signature/)

### 2. Fill In Your Details
| Field | What to Enter |
|-------|---------------|
| **Full Name** | Your full name (e.g. Ahmad Rizal bin Abdullah) |
| **Job Title / Position** | Your role (e.g. Senior Sales Executive) |
| **Direct Phone / Mobile** | Your direct line or mobile (e.g. +6012 345 6789) |
| **Work Email** | Your company email (e.g. ahmad@suamisihat.com.my) |

### 3. Copy Signature
Click **📋 Copy Signature** — the signature HTML is now in your clipboard.

### 4. Paste into Gmail
1. Open [Gmail](https://mail.google.com) → **⚙️ Settings** → **See all settings**
2. Under the **General** tab, scroll to **Signature** → click **Create new**
3. Paste (`Ctrl+V` / `Cmd+V`) into the editor
4. Scroll to the bottom → click **Save Changes**

### 5. vCard QR Code (Optional)
Once your name or contact info is filled in, a QR code appears automatically.
- Scan it with any smartphone to instantly save your contact
- Click **⬇️ Download .vcf** to get the vCard file

---

## 🛠️ Admin: Updating Company Details

All company-wide values (phone number, address, website, social links, app store links, banner image, and footer disclaimer) are stored in a single configuration file:

👉 [`config.js`](config.js)

**To update anything company-wide:**
1. Open `config.js`
2. Edit the relevant value (e.g. change `hqPhone`, update a social URL, swap `bannerImage`)
3. Save the file and commit to `main` — all staff using the generator will see the update immediately

```js
// Example: Update the HQ phone number
hqPhone: "+60312345678",
hqPhoneDisplay: "+603 1234 5678",
```

---

## 📁 Project Structure

```
mail-signature/
├── index.html        ← Interactive signature generator app
├── signature.html    ← Clean, email-safe standalone signature (for manual copy)
├── config.js         ← ⭐ Company config — edit this to update company-wide details
├── style.css         ← Generator UI styles (dark/light mode)
├── generator.js      ← Generator logic (preview, QR, copy)
├── assets/           ← Image assets (logo, social icons, banners)
└── .github/
    └── workflows/
        └── deploy.yml  ← GitHub Pages auto-deploy
```

---

## 🤝 Support

For issues or questions, contact the SuamiSihat IT/Marketing team.
