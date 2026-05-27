const sampleAuditUrl = document.querySelector("#sample-audit-url");
const sampleAuditPlatform = document.querySelector("#sample-audit-platform");
const sampleAuditCadence = document.querySelector("#sample-audit-cadence");
const sampleAuditRights = document.querySelector("#sample-audit-rights");
const sampleAuditError = document.querySelector("#sample-audit-error");
const sampleAuditSummary = document.querySelector("#sample-audit-summary");
const sampleAuditState = document.querySelector("#sample-audit-state");
const sampleRequestPanel = document.querySelector(".sample-request-panel");

const githubIssueBase = "https://github.com/kimw1994/clipfactory-site/issues/new";
const linkedinReplyUrl = "https://www.linkedin.com/feed/update/urn:li:share:7465347581661970432";

function cleanValue(value) {
  return String(value || "").trim();
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function showError(message) {
  sampleAuditError.textContent = message;
}

function clearError() {
  sampleAuditError.textContent = "";
}

function buildSampleAuditInquiry() {
  const videoUrl = cleanValue(sampleAuditUrl.value);
  const platform = cleanValue(sampleAuditPlatform.value);
  const cadence = cleanValue(sampleAuditCadence.value);

  return [
    "ClipFactory sample audit inquiry",
    "",
    "Name: Public visitor from sample audit page",
    `Video URL: ${videoUrl}`,
    `Target platform: ${platform}`,
    `Publishing cadence: ${cadence}`,
    "Requested package: $149 Clip Audit",
    "Rights confirmation: Yes, I own this content or have permission to process, edit, and republish it.",
    "",
    "Requested next step:",
    "Please review this public episode and confirm whether the sample audit format is a fit for a paid $149 Clip Audit.",
    "",
    "What I expect:",
    "- 10-20 timestamped clip opportunities",
    "- Hook and title ideas",
    "- Caption starters",
    "- Platform fit notes",
    "- Editor handoff notes",
    "",
    "Privacy note: this public inquiry path is not for private files, passwords, customer data, or confidential details.",
    "I understand this page does not collect payment and does not guarantee views, leads, revenue, follower growth, virality, or platform approval."
  ].join("\n");
}

function buildGithubIssueUrl(summary) {
  const params = new URLSearchParams({
    title: `ClipFactory sample audit inquiry - ${cleanValue(sampleAuditPlatform.value)}`,
    body: summary
  });

  return `${githubIssueBase}?${params.toString()}`;
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    sampleAuditSummary.value = text;
    sampleAuditSummary.select();
    document.execCommand("copy");
  }
}

function prepareInquiry() {
  const videoUrl = cleanValue(sampleAuditUrl.value);

  if (!videoUrl || !isValidUrl(videoUrl)) {
    showError("Add a full public episode URL that starts with http:// or https:// before requesting an audit.");
    sampleAuditState.textContent = "Needs URL";
    return null;
  }

  if (!sampleAuditRights.checked) {
    showError("Confirm that you own the content or have permission to process and republish it.");
    sampleAuditState.textContent = "Needs rights";
    return null;
  }

  clearError();
  const summary = buildSampleAuditInquiry();
  sampleAuditSummary.value = summary;
  return summary;
}

async function handleSampleAction(action) {
  const summary = prepareInquiry();
  if (!summary) {
    return;
  }

  if (action === "copy-inquiry") {
    await copyTextToClipboard(summary);
    sampleAuditState.textContent = "Inquiry copied";
    return;
  }

  if (action === "linkedin-inquiry") {
    const copyPromise = copyTextToClipboard(summary);
    const opened = window.open(linkedinReplyUrl, "_blank", "noopener,noreferrer");
    await copyPromise;
    sampleAuditState.textContent = opened ? "Opening LinkedIn" : "Popup blocked";

    if (!opened) {
      showError("The browser blocked the LinkedIn window. The inquiry was copied; open the LinkedIn post manually.");
    }
    return;
  }

  if (action === "github-inquiry") {
    const opened = window.open(buildGithubIssueUrl(summary), "_blank", "noopener,noreferrer");
    sampleAuditState.textContent = opened ? "Opening GitHub" : "Popup blocked";

    if (!opened) {
      showError("The browser blocked the GitHub window. Copy the audit inquiry and open the GitHub repo link manually.");
    }
  }
}

sampleRequestPanel?.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-sample-action]");
  if (!actionButton) {
    return;
  }

  handleSampleAction(actionButton.dataset.sampleAction);
});
