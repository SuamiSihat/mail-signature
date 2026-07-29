/**
 * SuamiSihat Email Signature Generator — Core Logic
 * ==================================================
 * Handles: live preview rendering, QR vCard generation, copy-to-clipboard
 */

// ---- Theme Management ----
const THEME_KEY = "ss-sig-theme";

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById("themeToggle");
  const icon = btn?.querySelector(".material-symbols-rounded");
  if (icon) icon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
  if (btn) btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

// ---- Signature HTML Generator ----
const EMAIL_FONT = "'Poppins', Arial, Helvetica, sans-serif";
const RAW_ASSET_ROOT = "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/";
const DRAFT_KEY = "ss-signature-draft-v1";

function loadSignatureDraft(storage) {
  try {
    const draft = JSON.parse(storage?.getItem(DRAFT_KEY) || "null");
    return draft && draft.schemaVersion === 1 ? draft : null;
  } catch {
    return null;
  }
}

function saveSignatureDraft(storage, draft) {
  try {
    storage?.setItem(DRAFT_KEY, JSON.stringify({ ...draft, schemaVersion: 1 }));
    return true;
  } catch {
    return false;
  }
}

function clearSignatureDraft(storage) {
  try {
    storage?.removeItem(DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

function formatAddressHTML(value) {
  const address = escapeHTML(value);
  return address.replace(/,\s*(?=\d{5}\b)/, ",<br>");
}

function localizePreviewAssets(html) {
  return String(html).replaceAll(RAW_ASSET_ROOT, "");
}

function sanitizePhone(value) {
  let phone = String(value || "")
    .trim()
    .replace(/\s*(?:ext\.?|extension|x)\s*\d+\s*$/i, "")
    .replace(/[^\d+]/g, "");
  phone = phone.replace(/(?!^)\+/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  const hasPlus = phone.startsWith("+");
  const digits = phone.replace(/\D/g, "").slice(0, 15);
  if (!digits) return "";
  if (hasPlus) return `+${digits}`;
  return digits.startsWith("0") ? `+60${digits.slice(1)}` : `+60${digits}`;
}

function formatMalaysianPhone(value) {
  const phone = sanitizePhone(value);
  if (!phone) return "";

  const international = phone.startsWith("+60");
  const local = international ? `0${phone.slice(3)}` : phone;
  if (!/^0\d+$/.test(local)) return phone;

  let formatted;
  if (/^01\d/.test(local)) {
    formatted = [local.slice(0, 3), local.slice(3, 6), local.slice(6)].filter(Boolean).join(" ");
  } else {
    const prefixLength = local.startsWith("03") ? 2 : 3;
    formatted = [
      local.slice(0, prefixLength),
      local.slice(prefixLength, prefixLength + 4),
      local.slice(prefixLength + 4),
    ].filter(Boolean).join(" ");
  }

  return international ? `+60 ${formatted.slice(1)}` : formatted;
}

function isValidPhone(value) {
  return /^\+?[1-9]\d{7,14}$/.test(value) || /^0\d{8,10}$/.test(value);
}

function sanitizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u0000-\u001F\u007F]/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function getCompanyConfig(cfg, companyId) {
  const selectedCompany =
    cfg.companies?.[companyId] ||
    cfg.companies?.[cfg.defaultCompanyId] ||
    cfg.company;
  const company = {
    ...selectedCompany,
    features: {
      ...(cfg.featureDefaults || {}),
      ...(selectedCompany?.features || {}),
    },
  };
  return { ...cfg, company };
}

function buildSignatureHTML(name, position, phone, email, cfg, variant = "external") {
  const normalizedPhone = sanitizePhone(phone);
  const normalizedEmail = sanitizeEmail(email);
  const validPhone = isValidPhone(normalizedPhone);
  const validEmail = isValidEmail(normalizedEmail);
  const displayName = escapeHTML(name || "[Your Name]");
  const displayPos = escapeHTML(position || "[Your Position]");
  const displayPhone = escapeHTML(phone ? (validPhone ? normalizedPhone : "[Invalid Phone]") : "[Your Phone]");
  const displayEmail = escapeHTML(email ? (validEmail ? normalizedEmail : "[Invalid Email]") : "[Your Email]");
  const phoneHref = validPhone ? `tel:${escapeHTML(normalizedPhone)}` : "tel:";
  const emailHref = validEmail ? `mailto:${escapeHTML(normalizedEmail)}` : "mailto:";
  const emailLogoUrl = cfg.company.emailLogoUrl || cfg.company.logoUrl;
  const qrVCard = buildVCard(name, position, normalizedPhone, normalizedEmail, cfg);
  const qrImageUrl = escapeHTML(
    `https://quickchart.io/qr?text=${encodeURIComponent(qrVCard)}&size=240&margin=1&ecLevel=M&dark=022057&light=ffffff`
  );
  const font = `font-family:${EMAIL_FONT};`;
  const features = cfg.company.features || cfg.featureDefaults || {};
  const showGroupLinks = features.showGroupLinks !== false;
  const showSocialLinks = features.showSocialLinks !== false;
  const showCampaignBanner = features.showCampaignBanner !== false;
  const showAppLinks = features.showAppLinks !== false;
  const showContactQr = features.showContactQr !== false;
  const groupLinks = Object.entries(showGroupLinks ? (cfg.groupWebsites || {}) : {})
    .map(([label, url]) => `<a href="${escapeHTML(url)}" style="color:#043388;text-decoration:none;">${escapeHTML(label)}</a>`)
    .join('<span style="color:#21A1F7;">&nbsp;|&nbsp;</span>');

  if (variant === "reply") {
    return `<div dir="ltr">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="480" bgcolor="#FFFFFF" style="width:480px;max-width:100%;background-color:#FFFFFF;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td width="60" valign="top" style="width:60px;padding:2px 12px 0 0;vertical-align:top;">
      <img src="${emailLogoUrl}" width="48" height="48" border="0" alt="SuamiSihat" style="display:block;width:48px;height:48px;border:0;outline:none;text-decoration:none;">
    </td>
    <td width="3" style="width:3px;background-color:#21A1F7;font-size:1px;line-height:1px;">&nbsp;</td>
    <td valign="top" style="padding:0 0 0 12px;vertical-align:top;${font}">
      <div style="margin:0;color:#022057;font-size:15px;line-height:19px;font-weight:700;${font}">${displayName}</div>
      <div style="margin:1px 0 5px;color:#043388;font-size:11px;line-height:15px;font-weight:600;${font}">${displayPos} &middot; ${escapeHTML(cfg.company.name)}</div>
      <div style="margin:0;color:#4B5563;font-size:10px;line-height:15px;${font}">
        <a href="${phoneHref}" style="color:#4B5563;text-decoration:none;">${displayPhone}</a>
        <span style="color:#21A1F7;">&nbsp;|&nbsp;</span>
        <a href="${emailHref}" style="color:#043388;text-decoration:none;">${displayEmail}</a>
        <span style="color:#21A1F7;">&nbsp;|&nbsp;</span>
        <a href="${cfg.company.website}" style="color:#043388;text-decoration:none;">${escapeHTML(cfg.company.websiteDisplay)}</a>
      </div>
    </td>
  </tr>
</table>
</div>`;
  }

  const socialIcons = showSocialLinks ? Object.values(cfg.social).map(s => `
    <td width="28" style="width:28px;padding:0 5px 0 0;">
      <a href="${s.url}" rel="nofollow noreferrer" target="_blank" style="text-decoration:none;">
        <img src="${s.icon}" width="22" height="22" border="0" alt="${escapeHTML(s.label)}" style="display:block;width:22px;height:22px;border:0;outline:none;text-decoration:none;">
      </a>
    </td>`).join("") : "";
  const columnSpan = showContactQr ? 4 : 3;

  return `<div dir="ltr">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;max-width:100%;background-color:#FFFFFF;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td width="86" valign="top" style="width:86px;padding:2px 16px 0 0;vertical-align:top;">
      <img src="${emailLogoUrl}" width="70" height="70" border="0" alt="SuamiSihat" style="display:block;width:70px;height:70px;border:0;outline:none;text-decoration:none;">
    </td>
    <td width="3" style="width:3px;background-color:#21A1F7;font-size:1px;line-height:1px;">&nbsp;</td>
    <td valign="top" style="padding:0 0 0 16px;vertical-align:top;${font}">
      <div style="margin:0;color:#022057;font-size:18px;line-height:23px;font-weight:700;${font}">${displayName}</div>
      <div style="margin:1px 0 10px;color:#043388;font-size:12px;line-height:17px;font-weight:600;${font}">${displayPos}<br>${escapeHTML(cfg.company.name)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${font}">
        <tr>
          <td style="padding:0 14px 5px 0;color:#022057;font-size:10px;line-height:15px;font-weight:700;white-space:nowrap;${font}">PHONE NO</td>
          <td style="padding:0 0 5px;color:#4B5563;font-size:11px;line-height:15px;${font}"><a href="${phoneHref}" style="color:#4B5563;text-decoration:none;">${displayPhone}</a></td>
        </tr>
        <tr>
          <td style="padding:0 14px 5px 0;color:#022057;font-size:10px;line-height:15px;font-weight:700;white-space:nowrap;${font}">EMAIL</td>
          <td style="padding:0 0 5px;color:#4B5563;font-size:11px;line-height:15px;${font}"><a href="${emailHref}" style="color:#043388;text-decoration:none;">${displayEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:0 14px 5px 0;color:#022057;font-size:10px;line-height:15px;font-weight:700;white-space:nowrap;${font}">${escapeHTML(cfg.company.hqPhoneLabel || "HQ")}</td>
          <td style="padding:0 0 5px;color:#4B5563;font-size:11px;line-height:15px;${font}"><a href="tel:${cfg.company.hqPhone}" style="color:#4B5563;text-decoration:none;">${escapeHTML(cfg.company.hqPhoneDisplay)}</a></td>
        </tr>
        <tr>
          <td style="padding:0 14px 0 0;color:#022057;font-size:10px;line-height:15px;font-weight:700;white-space:nowrap;${font}">WEB</td>
          <td style="padding:0;color:#4B5563;font-size:11px;line-height:15px;${font}"><a href="${cfg.company.website}" style="color:#043388;text-decoration:none;">${escapeHTML(cfg.company.websiteDisplay)}</a></td>
        </tr>
        ${groupLinks ? `<tr>
          <td style="padding:5px 14px 0 0;color:#022057;font-size:10px;line-height:15px;font-weight:700;white-space:nowrap;${font}">GROUP</td>
          <td style="padding:5px 0 0;color:#4B5563;font-size:11px;line-height:15px;${font}">${groupLinks}</td>
        </tr>` : ""}
      </table>
      <div style="margin:9px 0 0;color:#6B7280;font-size:10px;line-height:15px;${font}">
        <a href="${cfg.company.googleMapsUrl}" style="color:#6B7280;text-decoration:none;">${formatAddressHTML(cfg.company.address)}</a>
      </div>
      ${socialIcons ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-collapse:collapse;"><tr>${socialIcons}</tr></table>` : ""}
    </td>
    ${showContactQr ? `<td width="132" valign="top" align="right" style="width:132px;padding:0 0 0 12px;vertical-align:top;text-align:right;${font}">
      <img src="${qrImageUrl}" width="120" height="120" border="0" alt="Scan to save contact" style="display:block;width:120px;height:120px;margin-left:auto;border:0;outline:none;text-decoration:none;">
      <div style="margin:4px 0 0;color:#043388;font-size:8px;line-height:11px;font-weight:600;text-align:center;letter-spacing:.3px;${font}">SAVE CONTACT</div>
    </td>` : ""}
  </tr>
  ${showCampaignBanner ? `<tr><td colspan="${columnSpan}" height="14" style="height:14px;font-size:1px;line-height:14px;">&nbsp;</td></tr>
  <tr>
    <td colspan="${columnSpan}">
      <a href="${cfg.apps.bannerLink}" rel="nofollow noreferrer" target="_blank" style="text-decoration:none;">
        <img src="${cfg.apps.bannerImage}" width="600" border="0" alt="${escapeHTML(cfg.apps.bannerAlt)}" style="display:block;width:600px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">
      </a>
    </td>
  </tr>` : ""}
  ${showAppLinks ? `<tr><td colspan="${columnSpan}" height="12" style="height:12px;font-size:1px;line-height:12px;">&nbsp;</td></tr>
  <tr>
    <td colspan="${columnSpan}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td valign="middle" style="padding:0 10px 0 0;color:#022057;font-size:11px;line-height:15px;font-weight:600;${font}">${escapeHTML(cfg.apps.downloadLabel)}</td>
          <td valign="middle" style="padding:0 5px 0 0;"><a href="${cfg.apps.playStore.url}" target="_blank"><img src="${cfg.apps.playStore.icon}" width="112" height="33" border="0" alt="${escapeHTML(cfg.apps.playStore.alt)}" style="display:block;width:112px;height:33px;border:0;"></a></td>
          <td valign="middle"><a href="${cfg.apps.appStore.url}" target="_blank"><img src="${cfg.apps.appStore.icon}" width="99" height="33" border="0" alt="${escapeHTML(cfg.apps.appStore.alt)}" style="display:block;width:99px;height:33px;border:0;"></a></td>
        </tr>
      </table>
    </td>
  </tr>` : ""}
  <tr><td colspan="${columnSpan}" height="12" style="height:12px;font-size:1px;line-height:12px;">&nbsp;</td></tr>
  <tr>
    <td colspan="${columnSpan}" style="padding-top:9px;border-top:1px solid #D8E3F2;color:#6B7280;font-size:9px;line-height:13px;${font}">${escapeHTML(cfg.footer.disclaimer)}</td>
  </tr>
</table>
</div>`;
}

// ---- vCard Builder ----
function buildVCard(name, position, phone, email, cfg) {
  const nameParts = (name || "").trim().split(/\s+/);
  const lastName  = nameParts.length > 1 ? nameParts.pop() : "";
  const firstName = nameParts.join(" ");
  const normalizedPhone = sanitizePhone(phone);
  const normalizedEmail = sanitizeEmail(email);

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name || ""}`,
    `N:${lastName};${firstName};;;`,
    `ORG:${cfg.company.name}`,
    `TITLE:${position || ""}`,
    isValidPhone(normalizedPhone) ? `TEL;TYPE=CELL:${normalizedPhone}` : "",
    `TEL;TYPE=WORK:${cfg.company.hqPhone.replace(/\s/g, "")}`,
    isValidEmail(normalizedEmail) ? `EMAIL;TYPE=WORK:${normalizedEmail}` : "",
    `URL:${cfg.company.website}`,
    `ADR;TYPE=WORK:;;${cfg.company.address};;;;`,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

// ---- Copy Signature to Clipboard ----
async function copySignature(html) {
  try {
    // Modern Clipboard API with HTML support
    const blob = new Blob([html], { type: "text/html" });
    const item = new ClipboardItem({ "text/html": blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    // Fallback: use a hidden contenteditable div
    try {
      const el = document.createElement("div");
      el.setAttribute("contenteditable", "true");
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      el.innerHTML = html;
      document.body.appendChild(el);
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("copy");
      sel.removeAllRanges();
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

// ---- Show Copy Feedback ----
function showCopyFeedback(success, variant = "") {
  const el = document.getElementById("copyFeedback");
  if (!el) return;
  el.textContent = success
    ? `${variant === "reply" ? "Compact" : "Full"} signature copied. Paste it into Gmail or Outlook.`
    : "Copy failed. Complete the required fields and try again.";
  el.classList.add("visible");
  setTimeout(() => el.classList.remove("visible"), 3500);
}

if (typeof module !== "undefined") {
  module.exports = {
    buildSignatureHTML,
    buildVCard,
    escapeHTML,
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
    clearSignatureDraft,
  };
}

if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", async () => {
  applyTheme(getStoredTheme());

  const byId = id => document.getElementById(id);
  const previewEl = byId("signaturePreview");
  const configStatus = byId("configStatus");
  if (!previewEl) return;

  let CONFIG;
  try {
    CONFIG = await loadSignatureConfig("config/signature-config.yaml");
    if (configStatus) {
      configStatus.classList.add("ready");
      const versionLabel = CONFIG.configVersion ? ` · v${escapeHTML(CONFIG.configVersion)}` : "";
      configStatus.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">verified</span>Brand profiles ready${versionLabel}`;
    }
  } catch (error) {
    previewEl.textContent = `Configuration error: ${error.message}`;
    if (configStatus) {
      configStatus.classList.add("error");
      configStatus.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">error</span>Configuration unavailable';
    }
    return;
  }

  const nameInput = byId("inputName");
  const positionInput = byId("inputPosition");
  const companyInput = byId("inputCompany");
  const phoneInput = byId("inputPhone");
  const emailInput = byId("inputEmail");
  const contactQrInput = byId("inputContactQr");
  const draftStatus = byId("draftStatus");
  const clearDraftBtn = byId("clearDraftBtn");
  const nameError = byId("nameError");
  const positionError = byId("positionError");
  const phoneError = byId("phoneError");
  const emailError = byId("emailError");
  const companySummary = byId("companySummary");
  const copyExternalBtn = byId("copyExternalBtn");
  const copyReplyBtn = byId("copyReplyBtn");
  const mobileCopyBtn = byId("mobileCopyBtn");
  const previewWrapper = byId("previewWrapper");
  const previewStage = byId("previewStage");
  const previewClient = byId("previewClient");
  const previewZoom = byId("previewZoom");
  const previewThemeToggle = byId("previewThemeToggle");
  const emailChrome = byId("emailChrome");
  const variantButtons = document.querySelectorAll("[data-variant]");
  const instructionTabs = document.querySelectorAll("[data-instruction]");

  byId("themeToggle")?.addEventListener("click", toggleTheme);

  Object.entries(CONFIG.companies || { default: CONFIG.company }).forEach(([id, company]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${id.toUpperCase()} — ${company.name}`;
    companyInput?.appendChild(option);
  });
  if (companyInput) companyInput.value = CONFIG.defaultCompanyId || companyInput.options[0]?.value || "";

  const savedDraft = loadSignatureDraft(window.localStorage);
  if (savedDraft?.companyId && CONFIG.companies[savedDraft.companyId] && companyInput) {
    companyInput.value = savedDraft.companyId;
  }
  if (nameInput && typeof savedDraft?.name === "string") nameInput.value = savedDraft.name;
  if (positionInput && typeof savedDraft?.position === "string") positionInput.value = savedDraft.position;
  if (phoneInput && typeof savedDraft?.phone === "string") phoneInput.value = formatMalaysianPhone(savedDraft.phone);
  if (emailInput && typeof savedDraft?.email === "string") emailInput.value = sanitizeEmail(savedDraft.email);
  if (previewClient && [...previewClient.options].some(option => option.value === savedDraft?.previewClient)) {
    previewClient.value = savedDraft.previewClient;
  }
  if (previewZoom && [...previewZoom.options].some(option => option.value === savedDraft?.previewZoom)) {
    previewZoom.value = savedDraft.previewZoom;
  }
  if (previewWrapper) {
    previewWrapper.dataset.previewTheme = savedDraft?.previewTheme === "dark" ? "dark" : "light";
  }

  let selectedVariant = savedDraft?.variant === "reply" ? "reply" : "external";
  let selectedConfig = getCompanyConfig(CONFIG, companyInput?.value || CONFIG.defaultCompanyId);
  if (contactQrInput) {
    contactQrInput.checked = typeof savedDraft?.contactQr === "boolean"
      ? savedDraft.contactQr
      : selectedConfig.company.features.showContactQr !== false;
  }
  const touched = new Set();
  let draftSaveTimer;
  let suspendDraftSave = false;

  function setDraftStatus(message, saved = false) {
    if (!draftStatus) return;
    draftStatus.textContent = message;
    draftStatus.classList.toggle("saved", saved);
  }

  function collectDraft() {
    return {
      companyId: companyInput?.value || CONFIG.defaultCompanyId,
      name: nameInput?.value || "",
      position: positionInput?.value || "",
      phone: phoneInput?.value || "",
      email: emailInput?.value || "",
      contactQr: contactQrInput?.checked ?? true,
      variant: selectedVariant,
      previewClient: previewClient?.value || "canvas",
      previewZoom: previewZoom?.value || "fit",
      previewTheme: previewWrapper?.dataset.previewTheme || "light",
    };
  }

  function scheduleDraftSave() {
    if (suspendDraftSave) return;
    clearTimeout(draftSaveTimer);
    setDraftStatus("Saving locally…");
    draftSaveTimer = setTimeout(() => {
      const saved = saveSignatureDraft(window.localStorage, collectDraft());
      setDraftStatus(saved ? "Saved locally" : "Local save unavailable", saved);
    }, 150);
  }

  function applyPreviewTheme(dark) {
    if (previewWrapper) previewWrapper.dataset.previewTheme = dark ? "dark" : "light";
    if (!previewThemeToggle) return;
    previewThemeToggle.setAttribute("aria-pressed", String(dark));
    previewThemeToggle.setAttribute("aria-label", `Switch preview to ${dark ? "light" : "dark"} mode`);
    const icon = previewThemeToggle.querySelector(".material-symbols-rounded");
    const label = previewThemeToggle.querySelector(".preview-theme-label");
    if (icon) icon.textContent = dark ? "light_mode" : "dark_mode";
    if (label) label.textContent = dark ? "Light" : "Dark";
  }

  applyPreviewTheme(previewWrapper?.dataset.previewTheme === "dark");
  variantButtons.forEach(button => {
    const active = button.dataset.variant === selectedVariant;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (mobileCopyBtn) {
    mobileCopyBtn.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">content_copy</span>Copy ${selectedVariant === "reply" ? "compact" : "full"} signature`;
  }
  if (savedDraft) setDraftStatus("Draft restored", true);

  function markValidity(input, errorEl, valid, message) {
    if (!input) return;
    const showError = (touched.has(input.id) || input.value.trim().length > 0) && !valid;
    input.setAttribute("aria-invalid", String(showError));
    if (errorEl) errorEl.textContent = showError ? message : "";
  }

  function renderCompanySummary() {
    if (!companySummary) return;
    const company = selectedConfig.company;
    companySummary.innerHTML = `
      <img src="${escapeHTML(company.emailLogoPreviewUrl || company.logoPreviewUrl)}" alt="">
      <div class="company-summary-content">
        <strong><span>${escapeHTML(company.id.toUpperCase())}</span>${escapeHTML(company.name)}</strong>
        <div class="company-summary-links">
          <a href="tel:${escapeHTML(company.hqPhone)}">${escapeHTML(company.hqPhoneDisplay)}</a>
          <a href="${escapeHTML(company.website)}" target="_blank" rel="noopener noreferrer">${escapeHTML(company.websiteDisplay)}</a>
        </div>
        <p>${formatAddressHTML(company.address)}</p>
      </div>`;
  }

  function getValues() {
    const name = nameInput?.value.trim() || "";
    const position = positionInput?.value.trim() || "";
    const phoneRaw = phoneInput?.value || "";
    const emailRaw = emailInput?.value || "";
    const phone = sanitizePhone(phoneRaw);
    const email = sanitizeEmail(emailRaw);
    return {
      name,
      position,
      phone,
      email,
      nameValid: name.length >= 2,
      positionValid: position.length >= 2,
      phoneValid: !phoneRaw.trim() || isValidPhone(phone),
      emailValid: isValidEmail(email),
    };
  }

  function buildCurrentHTML(variant) {
    const values = getValues();
    const effectiveConfig = {
      ...selectedConfig,
      company: {
        ...selectedConfig.company,
        features: {
          ...selectedConfig.company.features,
          showContactQr: contactQrInput?.checked ?? selectedConfig.company.features.showContactQr,
        },
      },
    };
    return buildSignatureHTML(
      values.name,
      values.position,
      values.phoneValid ? values.phone : "",
      values.emailValid ? values.email : "",
      effectiveConfig,
      variant
    );
  }

  function updateEmailChrome() {
    if (!emailChrome || !previewWrapper) return;
    const client = previewClient?.value || "canvas";
    previewWrapper.dataset.client = client;
    emailChrome.textContent = client === "gmail"
      ? "Gmail · New message"
      : client === "outlook"
        ? "Outlook · New message"
        : "";
  }

  function updatePreviewScale() {
    if (!previewEl || !previewWrapper || !previewStage) return;
    const naturalWidth = selectedVariant === "reply" ? 480 : 600;
    const zoomValue = previewZoom?.value || "fit";
    const availableWidth = Math.max(280, previewWrapper.clientWidth - 48);
    const scale = zoomValue === "fit" ? Math.min(1, availableWidth / naturalWidth) : Number(zoomValue);
    previewEl.style.setProperty("--preview-scale", String(scale));
    previewStage.style.width = `${naturalWidth * scale}px`;
    previewStage.style.height = `${previewEl.scrollHeight * scale}px`;
  }

  function update() {
    selectedConfig = getCompanyConfig(CONFIG, companyInput?.value || CONFIG.defaultCompanyId);
    const values = getValues();
    const formValid = values.nameValid && values.positionValid && values.phoneValid && values.emailValid;

    markValidity(nameInput, nameError, values.nameValid, "Enter your full name.");
    markValidity(positionInput, positionError, values.positionValid, "Enter your job title or position.");
    markValidity(phoneInput, phoneError, values.phoneValid, "Use a valid Malaysian or international phone number.");
    markValidity(emailInput, emailError, values.emailValid, "Enter a valid work email address.");

    [copyExternalBtn, copyReplyBtn, mobileCopyBtn].forEach(button => {
      if (button) button.disabled = !formValid;
    });
    const currentHTML = buildCurrentHTML(selectedVariant);
    previewEl.innerHTML = localizePreviewAssets(currentHTML);
    renderCompanySummary();
    requestAnimationFrame(updatePreviewScale);
    scheduleDraftSave();
  }

  [nameInput, positionInput, emailInput].forEach(input => {
    if (!input) return;
    input.addEventListener("input", update);
    input.addEventListener("blur", () => {
      touched.add(input.id);
      if (input === emailInput) input.value = sanitizeEmail(input.value);
      update();
    });
  });

  phoneInput?.addEventListener("input", () => {
    phoneInput.value = formatMalaysianPhone(phoneInput.value);
    update();
  });
  phoneInput?.addEventListener("blur", () => {
    touched.add(phoneInput.id);
    phoneInput.value = formatMalaysianPhone(phoneInput.value);
    update();
  });
  companyInput?.addEventListener("change", () => {
    selectedConfig = getCompanyConfig(CONFIG, companyInput.value || CONFIG.defaultCompanyId);
    update();
  });
  contactQrInput?.addEventListener("change", update);

  variantButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedVariant = button.dataset.variant;
      variantButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      if (mobileCopyBtn) {
        mobileCopyBtn.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">content_copy</span>Copy ${selectedVariant === "reply" ? "compact" : "full"} signature`;
      }
      update();
    });
  });

  async function handleCopy(variant) {
    const values = getValues();
    const formValid = values.nameValid && values.positionValid && values.phoneValid && values.emailValid;
    if (!formValid) {
      [nameInput, positionInput, phoneInput, emailInput].forEach(input => input && touched.add(input.id));
      update();
      showCopyFeedback(false, variant);
      return;
    }
    showCopyFeedback(await copySignature(buildCurrentHTML(variant)), variant);
  }

  copyExternalBtn?.addEventListener("click", () => handleCopy("external"));
  copyReplyBtn?.addEventListener("click", () => handleCopy("reply"));
  mobileCopyBtn?.addEventListener("click", () => handleCopy(selectedVariant));
  previewClient?.addEventListener("change", () => {
    updateEmailChrome();
    scheduleDraftSave();
  });
  previewZoom?.addEventListener("change", () => {
    updatePreviewScale();
    scheduleDraftSave();
  });
  previewThemeToggle?.addEventListener("click", () => {
    const dark = previewWrapper?.dataset.previewTheme !== "dark";
    applyPreviewTheme(dark);
    scheduleDraftSave();
  });
  window.addEventListener("resize", updatePreviewScale);
  updateEmailChrome();

  instructionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      instructionTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
        const panel = byId(item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !active;
      });
    });
  });

  clearDraftBtn?.addEventListener("click", () => {
    suspendDraftSave = true;
    clearTimeout(draftSaveTimer);
    if (companyInput) companyInput.value = CONFIG.defaultCompanyId;
    if (nameInput) nameInput.value = "";
    if (positionInput) positionInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (emailInput) emailInput.value = "";
    selectedVariant = "external";
    selectedConfig = getCompanyConfig(CONFIG, CONFIG.defaultCompanyId);
    if (contactQrInput) contactQrInput.checked = selectedConfig.company.features.showContactQr !== false;
    if (previewClient) previewClient.value = "canvas";
    if (previewZoom) previewZoom.value = "fit";
    applyPreviewTheme(false);
    variantButtons.forEach(button => {
      const active = button.dataset.variant === "external";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (mobileCopyBtn) {
      mobileCopyBtn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">content_copy</span>Copy full signature';
    }
    touched.clear();
    updateEmailChrome();
    update();
    clearSignatureDraft(window.localStorage);
    suspendDraftSave = false;
    setDraftStatus("Draft cleared");
  });

  update();
});
