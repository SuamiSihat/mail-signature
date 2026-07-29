/**
 * SuamiSihat Email Signature Generator — Core Logic
 * ==================================================
 * Handles: live preview rendering, QR vCard generation, copy-to-clipboard
 */

/* ---- QR Code Library (loaded via CDN in index.html) ---- */

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
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

// ---- Signature HTML Generator ----
function buildSignatureHTML(name, position, phone, email, cfg) {
  const displayName = name   || "[Your Name]";
  const displayPos  = position || "[Your Position]";
  const displayPhone = phone  || "[Your Phone]";
  const displayEmail = email  || "[Your Mail]";

  const phoneHref  = phone  ? `tel:${phone.replace(/\s/g, "")}` : "tel:[Your Phone]";
  const emailHref  = email  ? `mailto:${email}` : "mailto:[Your Mail]";

  const socialIcons = Object.entries(cfg.social)
    .map(([, s]) => `
      <td align="left" style="padding-right:6px;text-align:center">
        <a href="${s.url}" rel="nofollow noreferrer" target="_blank">
          <img width="24" height="24" src="${s.icon}" style="border:none;display:block" alt="${s.label}">
        </a>
      </td>`)
    .join("\n");

  return `<div dir="ltr">
<table style="direction:ltr;border-collapse:collapse;width:100%;max-width:600px;" width="100%">
  <tbody>
    <tr><td style="line-height:1%;padding-top:16px;font-size:1px"></td></tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;line-height:1.15;width:100%;">
          <tbody>
            <tr>
              <td style="vertical-align:top;padding:.01px 14px 0.01px 1px;width:65px;text-align:center">
                <p style="margin:1px">
                  <img border="0" src="${cfg.company.logoUrl}" height="55" width="65" alt="SuamiSihat Logo"
                    style="max-width:100%;height:auto;border-radius:0;border:0;display:block">
                </p>
              </td>
              <td valign="top" style="padding:.01px 0.01px 0.01px 14px;vertical-align:top;border-left:solid 1px #bdbdbd">
                <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
                  <tbody>
                    <tr>
                      <td style="padding:.01px">
                        <p style="margin:.1px;line-height:120%;font-size:16px">
                          <span style="font-family:Arial;font-size:16px;font-weight:bold;color:#1c1c1c;letter-spacing:0">${displayName}</span><br>
                          <span style="font-family:Arial;font-size:13px;font-weight:bold;color:#646464">${displayPos}, ${cfg.company.name}</span>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
                          <tbody>
                            <tr>
                              <td style="padding-top:14px;white-space:nowrap;font-family:Arial;font-size:11px;">
                                <p style="margin:1px">
                                  <a href="tel:${cfg.company.hqPhone.replace(/\s/g,"")}" style="text-decoration:unset;color:#212121">${cfg.company.hqPhoneDisplay} (${cfg.company.hqPhoneLabel})</a>
                                  &nbsp;&nbsp;|&nbsp;&nbsp;
                                  <a href="${phoneHref}" style="text-decoration:unset;color:#212121">${displayPhone}</a>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:8px;white-space:nowrap;font-family:Arial;font-size:11px;">
                                <p style="margin:1px">
                                  <a href="${cfg.company.website}" style="text-decoration:unset;color:#212121">${cfg.company.websiteDisplay}</a>
                                  &nbsp;&nbsp;|&nbsp;&nbsp;
                                  <a href="${emailHref}" style="text-decoration:unset;color:#212121">${displayEmail}</a>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:8px;white-space:normal;font-family:Arial;font-size:11px;">
                                <p style="margin:1px">
                                  <a href="${cfg.company.googleMapsUrl}" style="text-decoration:unset;color:#212121">${cfg.company.address}</a>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 0.01px 0.01px 0.01px">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                              ${socialIcons}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr><td style="line-height:1%;padding-top:16px;font-size:1px"></td></tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tbody>
            <tr>
              <td style="text-align:left">
                <a href="${cfg.apps.bannerLink}" rel="nofollow noreferrer" target="_blank">
                  <img src="${cfg.apps.bannerImage}" style="width:100%;height:auto;max-width:448px;" alt="${cfg.apps.bannerAlt}">
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr><td style="line-height:1%;padding-top:16px;font-size:1px"></td></tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tbody>
            <tr>
              <td align="left">
                <table cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td style="padding-bottom:4px;text-align:left">
                        <p style="margin:1px"><span style="font-size:12px;color:#222222">${cfg.apps.downloadLabel}</span></p>
                      </td>
                    </tr>
                    <tr>
                      <td align="left">
                        <table cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                              <td style="padding-right:5px">
                                <a href="${cfg.apps.playStore.url}" style="text-decoration:none" rel="nofollow noreferrer" target="_blank">
                                  <img src="${cfg.apps.playStore.icon}" style="height:33px" alt="${cfg.apps.playStore.alt}">
                                </a>
                              </td>
                              <td>
                                <a href="${cfg.apps.appStore.url}" style="text-decoration:none" rel="nofollow noreferrer" target="_blank">
                                  <img src="${cfg.apps.appStore.icon}" style="height:33px" alt="${cfg.apps.appStore.alt}">
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr><td style="line-height:1%;padding-top:16px;font-size:1px"></td></tr>
    <tr>
      <td style="font-family:Arial;color:#808080;text-align:left;font-size:10px;line-height:120%">
        ${cfg.footer.disclaimer}
      </td>
    </tr>
  </tbody>
</table>
</div>`;
}

// ---- vCard Builder ----
function buildVCard(name, position, phone, email, cfg) {
  const nameParts = (name || "").trim().split(/\s+/);
  const lastName  = nameParts.length > 1 ? nameParts.pop() : "";
  const firstName = nameParts.join(" ");

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name || ""}`,
    `N:${lastName};${firstName};;;`,
    `ORG:${cfg.company.name}`,
    `TITLE:${position || ""}`,
    phone  ? `TEL;TYPE=CELL:${phone}` : "",
    `TEL;TYPE=WORK:${cfg.company.hqPhone.replace(/\s/g, "")}`,
    email  ? `EMAIL;TYPE=WORK:${email}` : "",
    `URL:${cfg.company.website}`,
    `ADR;TYPE=WORK:;;${cfg.company.address};;;;`,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

// ---- QR Code Generator ----
let qrInstance = null;

function renderQR(text) {
  const container = document.getElementById("qrcode");
  const placeholder = document.getElementById("qrPlaceholder");
  if (!container) return;

  if (!text || text.trim() === "") {
    container.innerHTML = "";
    container.style.display = "none";
    if (placeholder) placeholder.style.display = "flex";
    return;
  }

  if (placeholder) placeholder.style.display = "none";
  container.innerHTML = "";
  container.style.display = "block";

  // Use QRCode library (loaded from CDN)
  const qr = new QRCode(container, {
    text: text,
    width: 120,
    height: 120,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });
}

// ---- vCard Download ----
function downloadVCard(vcfContent, name) {
  const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${(name || "contact").replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
function showCopyFeedback(success) {
  const el = document.getElementById("copyFeedback");
  if (!el) return;
  el.textContent = success ? "✅ Signature copied! Paste in Gmail." : "❌ Copy failed. Select manually.";
  el.classList.add("visible");
  setTimeout(() => el.classList.remove("visible"), 3500);
}

// ---- Main Init ----
document.addEventListener("DOMContentLoaded", () => {
  // Apply stored theme immediately
  applyTheme(getStoredTheme());

  const nameInput     = document.getElementById("inputName");
  const positionInput = document.getElementById("inputPosition");
  const phoneInput    = document.getElementById("inputPhone");
  const emailInput    = document.getElementById("inputEmail");
  const previewEl     = document.getElementById("signaturePreview");
  const copyBtn       = document.getElementById("copyBtn");
  const vcardBtn      = document.getElementById("vcardBtn");
  const themeBtn      = document.getElementById("themeToggle");

  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  let currentVCard = "";
  let currentHTML  = "";

  function update() {
    const name     = nameInput?.value.trim()     || "";
    const position = positionInput?.value.trim() || "";
    const phone    = phoneInput?.value.trim()    || "";
    const email    = emailInput?.value.trim()    || "";

    // Render preview
    currentHTML = buildSignatureHTML(name, position, phone, email, CONFIG);
    if (previewEl) previewEl.innerHTML = currentHTML;

    // Update QR
    if (name || phone || email) {
      currentVCard = buildVCard(name, position, phone, email, CONFIG);
      renderQR(currentVCard);
    } else {
      currentVCard = "";
      renderQR("");
    }
  }

  // Live update on input
  [nameInput, positionInput, phoneInput, emailInput].forEach(el => {
    if (el) el.addEventListener("input", update);
  });

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!currentHTML) { showCopyFeedback(false); return; }
      const ok = await copySignature(currentHTML);
      showCopyFeedback(ok);
    });
  }

  // Download vCard
  if (vcardBtn) {
    vcardBtn.addEventListener("click", () => {
      if (!currentVCard) return;
      downloadVCard(currentVCard, nameInput?.value.trim() || "contact");
    });
  }

  // Initial render
  update();
});
