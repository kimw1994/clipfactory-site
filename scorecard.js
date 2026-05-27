const scorecardForm = document.querySelector("#buyer-intent-scorecard");
const scorecardState = document.querySelector("#scorecard-state");
const scorecardTotal = document.querySelector("#scorecard-total");
const scorecardVerdict = document.querySelector("#scorecard-verdict");
const scorecardGuidance = document.querySelector("#scorecard-guidance");
const scorecardSummary = document.querySelector("#scorecard-summary");
const copyScorecardSummary = document.querySelector("#copy-scorecard-summary");
const scorecardAnalyzerLink = document.querySelector("#scorecard-analyzer-link");

const scoreFields = ["tension", "clarity", "buyer", "tactical", "platformFit"];

function selectedScore(name) {
  return Number(document.querySelector(`input[name="${name}"]:checked`)?.value || 0);
}

function cleanScorecardValue(selector) {
  return String(document.querySelector(selector)?.value || "").trim();
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

async function copySummary() {
  if (!scorecardSummary.value) {
    updateScorecard();
  }

  try {
    await navigator.clipboard.writeText(scorecardSummary.value);
    scorecardState.textContent = "Copied";
  } catch {
    scorecardSummary.select();
    document.execCommand("copy");
    scorecardState.textContent = "Copied";
  }
}

scorecardForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  updateScorecard();
});

scorecardForm?.addEventListener("change", updateScorecard);
copyScorecardSummary?.addEventListener("click", copySummary);

updateScorecard();
