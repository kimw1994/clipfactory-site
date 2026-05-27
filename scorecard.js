const scorecardForm = document.querySelector("#buyer-intent-scorecard");
const scorecardState = document.querySelector("#scorecard-state");
const scorecardTotal = document.querySelector("#scorecard-total");
const scorecardVerdict = document.querySelector("#scorecard-verdict");
const scorecardGuidance = document.querySelector("#scorecard-guidance");
const scorecardSummary = document.querySelector("#scorecard-summary");
const copyScorecardSummary = document.querySelector("#copy-scorecard-summary");
const scorecardAnalyzerLink = document.querySelector("#scorecard-analyzer-link");
const scorecardError = document.querySelector("#scorecard-error");
const scorecardRights = document.querySelector("#scorecard-rights");
const scorecardResultPanel = document.querySelector(".score-result-panel");

const scoreFields = ["tension", "clarity", "buyer", "tactical", "platformFit"];
const githubIssueBase = "https://github.com/kimw1994/clipfactory-site/issues/new";
const linkedinReplyFallbackUrl = "https://www.linkedin.com/feed/update/urn:li:share:7465347581661970432";

function selectedScore(name) {
  return Number(document.querySelector(`input[name="${name}"]:checked`)?.value || 0);
}

function cleanScorecardValue(selector) {
  return String(document.querySelector(selector)?.value || "").trim();
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function showScorecardError(message) {
  scorecardError.textContent = message;
}

function clearScorecardError() {
  scorecardError.textContent = "";
}

function scoreDecision(score) {
  if (score >= 8) {
    return {
      verdict: "Strong clip candidate.",
      guidance: "This moment is worth sending through the free analyzer or a manual Clip Audit if the source episode has several similar buyer-intent moments.",
      state: "Strong"
    };
  }

  if (score >= 6) {
    return {
      verdict: "Maybe useful, but strengthen the hook.",
      guidance: "Tighten the opening sentence, add caption context, or choose a more decision-focused timestamp before editing.",
      state: "Needs packaging"
    };
  }

  return {
    verdict: "Do not make this the first edit.",
    guidance: "Use this moment in the full episode, newsletter, blog, or carousel while looking for a clearer short-form clip candidate.",
    state: "Not first edit"
  };
}

function buildScoreSummary(score, decision) {
  const episodeUrl = cleanScorecardValue("#scorecard-url") || "Not provided";
  const timestampHint = cleanScorecardValue("#scorecard-timestamp") || "Not provided";
  const targetPlatform = cleanScorecardValue("#scorecard-platform");

  return [
    "ClipFactory buyer-intent score",
    "",
    `Episode URL: ${episodeUrl}`,
    `Timestamp hint: ${timestampHint}`,
    `Target platform: ${targetPlatform}`,
    `Score: ${score}/10`,
    `Decision: ${decision.verdict}`,
    `Next step: ${decision.guidance}`,
    "",
    "Scored criteria:",
    `- First sentence tension: ${selectedScore("tension")}/2`,
    `- Standalone clarity: ${selectedScore("clarity")}/2`,
    `- Buyer relevance: ${selectedScore("buyer")}/2`,
    `- Tactical value: ${selectedScore("tactical")}/2`,
    `- Platform fit: ${selectedScore("platformFit")}/2`,
    "",
    "Compliance note: only process content you own or have permission to edit and republish. No views, leads, revenue, follower growth, virality, or platform approval are guaranteed."
  ].join("\n");
}

function buildAuditInquirySummary(score, decision) {
  const episodeUrl = cleanScorecardValue("#scorecard-url");
  const timestampHint = cleanScorecardValue("#scorecard-timestamp") || "Not provided";
  const targetPlatform = cleanScorecardValue("#scorecard-platform");

  return [
    "ClipFactory scorecard audit inquiry",
    "",
    "Name: Public visitor from scorecard",
    `Episode URL: ${episodeUrl}`,
    `Timestamp hint: ${timestampHint}`,
    `Target platform: ${targetPlatform}`,
    `Score: ${score}/10`,
    `Decision: ${decision.verdict}`,
    `Scorecard note: ${decision.guidance}`,
    "Rights confirmation: Yes, I own this content or have permission to process, edit, and republish it.",
    "",
    "Requested next step:",
    "Please review this public episode moment and tell me whether a $149 Clip Audit is the right next step.",
    "",
    "Privacy note: this public inquiry path is not for private files, passwords, customer data, or confidential details.",
    "I understand this page does not collect payment and does not guarantee views, leads, revenue, follower growth, virality, or platform approval."
  ].join("\n");
}

function buildGithubIssueUrl(summary, score) {
  const platform = cleanScorecardValue("#scorecard-platform");
  const params = new URLSearchParams({
    title: `ClipFactory scorecard inquiry - ${score}/10 ${platform}`,
    body: summary
  });

  return `${githubIssueBase}?${params.toString()}`;
}

function getLinkedinReplyUrl() {
  return linkedinReplyFallbackUrl;
}

function updateAnalyzerLink(score) {
  const params = new URLSearchParams({
    src: "scorecard-result",
    score: String(score),
    platform: cleanScorecardValue("#scorecard-platform")
  });
  scorecardAnalyzerLink.href = `index.html?${params.toString()}#analyzer`;
}

function updateScorecard() {
  const score = scoreFields.reduce((sum, field) => sum + selectedScore(field), 0);
  const decision = scoreDecision(score);

  scorecardTotal.textContent = String(score);
  scorecardVerdict.textContent = decision.verdict;
  scorecardGuidance.textContent = decision.guidance;
  scorecardState.textContent = decision.state;
  scorecardSummary.value = buildScoreSummary(score, decision);
  updateAnalyzerLink(score);
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    scorecardSummary.value = text;
    scorecardSummary.select();
    document.execCommand("copy");
  }
}

async function copySummary() {
  if (!scorecardSummary.value) {
    updateScorecard();
  }

  await copyTextToClipboard(scorecardSummary.value);
  scorecardState.textContent = "Copied";
}

function prepareAuditInquiry() {
  const episodeUrl = cleanScorecardValue("#scorecard-url");

  if (!episodeUrl || !isValidUrl(episodeUrl)) {
    showScorecardError("Add a full public episode URL that starts with http:// or https:// before requesting an audit.");
    scorecardState.textContent = "Needs URL";
    return null;
  }

  if (!scorecardRights.checked) {
    showScorecardError("Confirm that you own the content or have permission to process and republish it.");
    scorecardState.textContent = "Needs rights";
    return null;
  }

  clearScorecardError();
  const score = scoreFields.reduce((sum, field) => sum + selectedScore(field), 0);
  const decision = scoreDecision(score);
  const summary = buildAuditInquirySummary(score, decision);
  scorecardSummary.value = summary;
  return { score, summary };
}

async function handleAuditAction(action) {
  const prepared = prepareAuditInquiry();
  if (!prepared) {
    return;
  }

  if (action === "copy-audit-inquiry") {
    await copyTextToClipboard(prepared.summary);
    scorecardState.textContent = "Audit inquiry copied";
    return;
  }

  if (action === "linkedin-audit-inquiry") {
    const copyPromise = copyTextToClipboard(prepared.summary);
    const opened = window.open(getLinkedinReplyUrl(), "_blank", "noopener,noreferrer");
    await copyPromise;
    scorecardState.textContent = opened ? "Opening LinkedIn" : "Popup blocked";

    if (!opened) {
      showScorecardError("The browser blocked the LinkedIn window. The audit inquiry was copied; open the LinkedIn post manually.");
    }
    return;
  }

  if (action === "github-audit-inquiry") {
    const opened = window.open(buildGithubIssueUrl(prepared.summary, prepared.score), "_blank", "noopener,noreferrer");
    scorecardState.textContent = opened ? "Opening GitHub" : "Popup blocked";

    if (!opened) {
      showScorecardError("The browser blocked the GitHub window. Copy the audit inquiry and open the GitHub repo link manually.");
    }
  }
}

scorecardForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  updateScorecard();
});

scorecardForm?.addEventListener("change", updateScorecard);
copyScorecardSummary?.addEventListener("click", copySummary);
scorecardResultPanel?.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-scorecard-action]");
  if (!actionButton) {
    return;
  }

  handleAuditAction(actionButton.dataset.scorecardAction);
});

updateScorecard();
