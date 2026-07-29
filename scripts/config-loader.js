/**
 * Minimal YAML loader for the signature configuration schema.
 * Supports nested mappings and quoted/unquoted scalar values.
 */

function parseYAMLScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "") return {};
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null" || trimmed === "~") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return JSON.parse(trimmed);
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

function parseConfigYAML(source) {
  const root = {};
  const stack = [{ indent: -1, value: root }];

  String(source).split(/\r?\n/).forEach((line, lineIndex) => {
    if (!line.trim() || line.trimStart().startsWith("#")) return;

    const match = line.match(/^(\s*)([^:]+):(.*)$/);
    if (!match) throw new Error(`Invalid YAML mapping on line ${lineIndex + 1}.`);

    const indent = match[1].length;
    const key = match[2].trim();
    const rawValue = match[3].trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    const value = parseYAMLScalar(rawValue);
    parent[key] = value;

    if (rawValue === "") stack.push({ indent, value });
  });

  return root;
}

function validateSignatureConfig(config) {
  if (!config || !config.companies || !Object.keys(config.companies).length) {
    throw new Error("signature-config.yaml must define at least one company.");
  }
  if (!config.defaultCompanyId || !config.companies[config.defaultCompanyId]) {
    throw new Error("signature-config.yaml defaultCompanyId must match a configured company.");
  }
  if (!config.groupWebsites || !Object.keys(config.groupWebsites).length) {
    throw new Error("signature-config.yaml must define shared groupWebsites.");
  }

  const supportedFeatures = [
    "showGroupLinks",
    "showSocialLinks",
    "showCampaignBanner",
    "showAppLinks",
    "showContactQr",
  ];
  supportedFeatures.forEach(feature => {
    if (typeof config.featureDefaults?.[feature] !== "boolean") {
      throw new Error(`featureDefaults.${feature} must be true or false.`);
    }
  });

  const requiredCompanyFields = [
    "id",
    "name",
    "hqPhone",
    "hqPhoneDisplay",
    "website",
    "websiteDisplay",
    "address",
    "googleMapsUrl",
    "emailLogoUrl",
    "emailLogoPreviewUrl",
  ];

  Object.entries(config.companies).forEach(([companyId, company]) => {
    requiredCompanyFields.forEach(field => {
      if (!company[field]) throw new Error(`Company "${companyId}" is missing "${field}".`);
    });
    if (company.id !== companyId) {
      throw new Error(`Company "${companyId}" must use the matching id "${companyId}".`);
    }
    if (!/^https:\/\//.test(company.website) || !/^https:\/\//.test(company.googleMapsUrl)) {
      throw new Error(`Company "${companyId}" must use secure website and map URLs.`);
    }
    if (!/\.png(?:\?.*)?$/i.test(company.emailLogoUrl)) {
      throw new Error(`Company "${companyId}" emailLogoUrl must use an Outlook-safe PNG.`);
    }
    Object.entries(company.features || {}).forEach(([feature, value]) => {
      if (!supportedFeatures.includes(feature) || typeof value !== "boolean") {
        throw new Error(`Company "${companyId}" has an invalid feature override "${feature}".`);
      }
    });
  });

  return config;
}

async function loadSignatureConfig(url = "config/signature-config.yaml") {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${url} (${response.status}).`);
  return validateSignatureConfig(parseConfigYAML(await response.text()));
}

if (typeof window !== "undefined") {
  window.loadSignatureConfig = loadSignatureConfig;
}

if (typeof module !== "undefined") {
  module.exports = { loadSignatureConfig, parseConfigYAML, validateSignatureConfig };
}
