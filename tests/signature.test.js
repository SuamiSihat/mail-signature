"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseConfigYAML, validateSignatureConfig } = require("../scripts/config-loader.js");
const {
  buildSignatureHTML,
  clearSignatureDraft,
  formatAddressHTML,
  formatMalaysianPhone,
  getCompanyConfig,
  isValidEmail,
  isValidPhone,
  loadSignatureDraft,
  localizePreviewAssets,
  saveSignatureDraft,
  sanitizeEmail,
  sanitizePhone,
} = require("../scripts/signature-generator.js");

const CONFIG = validateSignatureConfig(
  parseConfigYAML(fs.readFileSync(path.join(__dirname, "..", "config", "signature-config.yaml"), "utf8"))
);
const UI = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const DEFAULT_CONFIG = getCompanyConfig(CONFIG, CONFIG.defaultCompanyId);
const external = buildSignatureHTML("Amina Rahman", "Partnerships Lead", "+6012 345 6789", "amina@suamisihat.com.my", DEFAULT_CONFIG, "external");
const reply = buildSignatureHTML("Amina Rahman", "Partnerships Lead", "+6012 345 6789", "amina@suamisihat.com.my", DEFAULT_CONFIG, "reply");

for (const [variant, html] of Object.entries({ external, reply })) {
  assert.match(html, /role="presentation"/, `${variant}: uses presentation tables`);
  assert.match(html, /font-family:'Poppins', Arial, Helvetica, sans-serif/, `${variant}: uses Poppins with email-safe fallbacks`);
  assert.match(html, /#022057/, `${variant}: uses SS Prussian Blue`);
  assert.match(html, /#043388/, `${variant}: uses SS Blue`);
  assert.match(html, /#21A1F7/, `${variant}: uses Azure as an accent`);
  assert.doesNotMatch(html, /<style|class=|display:flex|display:grid|position:/i, `${variant}: avoids email-unsafe layout CSS`);
  assert.match(html, /width="(?:70|48)" height="(?:70|48)"/, `${variant}: preserves the secondary vertical logo aspect ratio`);
  assert.match(html, /assets\/brand\/ssh\/secondary-light\.png/, `${variant}: uses the Outlook-safe export of the approved secondary logo`);
  assert.doesNotMatch(html, /<img[^>]+\.svg/i, `${variant}: avoids SVG images unsupported by Outlook desktop`);
}

assert.match(external, /sigma_banner\.gif/, "external: includes the campaign banner");
assert.match(external, /sigma_banner\.gif" width="600"/, "external: banner spans the full signature width");
assert.match(external, /quickchart\.io\/qr\?text=/, "external: includes a hosted PNG contact QR code");
assert.match(external, /width="120" height="120"[^>]+alt="Scan to save contact"/, "external: positions a scannable contact QR in the header");
assert.match(external, />PHONE NO<\/td>/, "external: uses the approved phone number label");
assert.doesNotMatch(external, />DIRECT<\/td>/, "external: no longer uses the direct label");
assert.match(external, /CONFIDENTIALITY NOTICE:/, "external: includes the disclaimer");
assert.match(external, /google-play\.png/, "external: includes app links");
assert.doesNotMatch(reply, /sigma_banner\.gif|CONFIDENTIALITY NOTICE:|google-play\.png|quickchart\.io\/qr/, "reply: remains compact");
assert.doesNotMatch(localizePreviewAssets(external), /raw\.githubusercontent\.com/, "preview uses local repository assets");
assert.match(localizePreviewAssets(external), /assets\/campaign\/sigma_banner\.gif/, "preview preserves organized asset paths");

const escaped = buildSignatureHTML("<script>alert(1)</script>", "Lead", "", "", DEFAULT_CONFIG, "reply");
assert.doesNotMatch(escaped, /<script>/, "user-entered HTML is escaped");

assert.equal(sanitizePhone("  +60 (12) 345-6789 ext. 2  "), "+60123456789");
assert.equal(sanitizePhone("0060 12 345 6789"), "+60123456789");
assert.equal(sanitizePhone("012 345 6789"), "+60123456789");
assert.equal(sanitizePhone("12 345 6789"), "+60123456789");
assert.equal(formatMalaysianPhone("+60123456789"), "+60 12 345 6789");
assert.equal(formatMalaysianPhone("0123456789"), "+60 12 345 6789");
assert.equal(isValidPhone("+60123456789"), true);
assert.equal(isValidPhone("123"), false);
assert.equal(sanitizeEmail("  AMINA@SUAMISIHAT.COM.MY  "), "amina@suamisihat.com.my");
assert.equal(isValidEmail("amina@suamisihat.com.my"), true);
assert.equal(isValidEmail("amina@@suamisihat"), false);
assert.equal(
  formatAddressHTML("Jalan Pengaturcara, Seksyen U1, 40150 Shah Alam, Selangor"),
  "Jalan Pengaturcara, Seksyen U1,<br>40150 Shah Alam, Selangor"
);
assert.match(external, /Seksyen U1,<br>40150 Shah Alam/);
assert.equal(getCompanyConfig(CONFIG, CONFIG.defaultCompanyId).company.name, "SS Health");
assert.equal(
  getCompanyConfig(CONFIG, "ssh").company.address,
  "U1, UOA Business Park, 8-3A, 51A, Jalan Pengaturcara, Seksyen U1, 40150 Shah Alam, Selangor Darul Ehsan, MALAYSIA"
);
const mmcSignature = buildSignatureHTML("Dr. Amirul", "Medical Director", "+60107893661", "amirul@suamisihat.com.my", DEFAULT_CONFIG, "external", "MMC48291");
assert.match(mmcSignature, /MMC48291/, "includes Staff ID / MMC tag when provided");

for (const requiredControl of [
  "copyExternalBtn",
  "copyReplyBtn",
  "companySummary",
  "inputContactQr",
  "inputMmc",
  "draftStatus",
  "clearDraftBtn",
  "previewClient",
  "previewZoom",
  "previewThemeToggle",
  "advancedPreviewToggle",
  "advancedPreviewControls",
  "copyRequirementStatus",
  "installationGuide",
  "gmailSteps",
  "outlookSteps",
  "mobileCopyBtn",
]) {
  assert.match(UI, new RegExp(`id="${requiredControl}"`), `UI includes ${requiredControl}`);
}
assert.doesNotMatch(UI, /id="(?:qrcode|qrPlaceholder|vcardBtn)"/, "UI removes the separate QR code section");
assert.match(UI, /id="installationGuide" hidden/, "installation instructions stay hidden until a successful copy");
assert.match(UI, /id="copyRequirementStatus"[^>]+aria-live="polite"/, "copy readiness is announced accessibly");

const draftMemory = new Map();
const draftStorage = {
  getItem: key => draftMemory.get(key) ?? null,
  setItem: (key, value) => draftMemory.set(key, value),
  removeItem: key => draftMemory.delete(key),
};
assert.equal(saveSignatureDraft(draftStorage, {
  companyId: "sst",
  name: "Amina Rahman",
  email: "amina@suamisihat.com.my",
}), true);
assert.deepEqual(loadSignatureDraft(draftStorage), {
  schemaVersion: 1,
  companyId: "sst",
  name: "Amina Rahman",
  email: "amina@suamisihat.com.my",
});
assert.equal(clearSignatureDraft(draftStorage), true);
assert.equal(loadSignatureDraft(draftStorage), null);

assert.equal(Object.keys(CONFIG.groupWebsites).length, 5, "group links are defined once in shared config");
for (const company of Object.values(CONFIG.companies)) {
  assert.equal(company.subsidiaryWebsites, undefined, `${company.id}: does not duplicate shared group links`);
}

const withoutQr = {
  ...DEFAULT_CONFIG,
  company: {
    ...DEFAULT_CONFIG.company,
    features: { ...DEFAULT_CONFIG.company.features, showContactQr: false },
  },
};
const withoutCampaign = {
  ...DEFAULT_CONFIG,
  company: {
    ...DEFAULT_CONFIG.company,
    features: {
      ...DEFAULT_CONFIG.company.features,
      showSocialLinks: false,
      showCampaignBanner: false,
      showAppLinks: false,
      showGroupLinks: false,
    },
  },
};
assert.doesNotMatch(
  buildSignatureHTML("Amina", "Lead", "+60123456789", "amina@example.com", withoutQr, "external"),
  /quickchart\.io\/qr|SAVE CONTACT/,
  "contact QR can be disabled"
);
assert.doesNotMatch(
  buildSignatureHTML("Amina", "Lead", "+60123456789", "amina@example.com", withoutCampaign, "external"),
  /sigma_banner|google-play|LinkedIn|>GROUP<\/td>/,
  "campaign, apps, social links, and group links can be disabled"
);

const companyExpectations = {
  ssh: ["SS Health", "assets/brand/ssh/secondary-light.png", "+60356260031"],
  ssw: ["SS Wellness", "assets/brand/ssw/secondary-light.png", "+60107893661"],
  ssc: ["SS Clinic", "assets/brand/ssc/secondary-light.png", "+60107893661"],
  sse: ["SS Ecommerce", "assets/brand/sse/secondary-light.png", "+601159986564"],
  sst: ["SS Technology", "assets/brand/sst/secondary-light.png", "+60356260031"],
};

for (const [companyId, [companyName, logoFile, phone]] of Object.entries(companyExpectations)) {
  const companyConfig = getCompanyConfig(CONFIG, companyId);
  const companySignature = buildSignatureHTML(
    "Amina Rahman",
    "Team Lead",
    "+6012 345 6789",
    "amina@suamisihat.com.my",
    companyConfig,
    "external"
  );

  assert.equal(companyConfig.company.id, companyId);
  assert.equal(companyConfig.company.name, companyName);
  assert.equal(companyConfig.company.hqPhone, phone);
  assert.match(companySignature, new RegExp(logoFile.replace(".", "\\.")));
  assert.match(companySignature, new RegExp(companyName));
  assert.match(companySignature, />GROUP<\/td>/);
  assert.doesNotMatch(companySignature, /SUBSIDIARIES/);
  assert.match(companySignature, /SS Health/);
  assert.match(companySignature, /SS Ecommerce/);
}

const repositoryRoot = path.join(__dirname, "..");
const assetPaths = [
  ...Object.values(CONFIG.companies).flatMap(company => [
    company.logoPreviewUrl,
    company.emailLogoPreviewUrl,
    new URL(company.logoUrl).pathname.split("/main/")[1],
    new URL(company.emailLogoUrl).pathname.split("/main/")[1],
  ]),
  ...Object.values(CONFIG.social).map(item => new URL(item.icon).pathname.split("/main/")[1]),
  new URL(CONFIG.apps.bannerImage).pathname.split("/main/")[1],
  new URL(CONFIG.apps.playStore.icon).pathname.split("/main/")[1],
  new URL(CONFIG.apps.appStore.icon).pathname.split("/main/")[1],
];

for (const assetPath of assetPaths) {
  assert.ok(fs.existsSync(path.join(repositoryRoot, assetPath)), `Referenced asset exists: ${assetPath}`);
}

const pngFiles = fs.readdirSync(path.join(repositoryRoot, "assets"), { recursive: true })
  .filter(file => file.endsWith(".png"))
  .map(file => path.join(repositoryRoot, "assets", file));
const totalPngBytes = pngFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
assert.ok(pngFiles.every(file => fs.statSync(file).size < 500_000), "each PNG remains below 500 KB");
assert.ok(totalPngBytes < 2_000_000, "combined PNG payload remains below 2 MB");

console.log("Signature compatibility checks passed for all five companies and both variants.");
