const form = document.getElementById("hs-inquiry-form");
const summaryBox = document.getElementById("hs-summary");
const statusBox = document.getElementById("hs-status");
const copyButton = document.getElementById("hs-copy-summary");
const githubLink = document.getElementById("hs-github-link");
const githubIssueBase = "https://github.com/kimw1994/clipfactory-site/issues/new";

function fieldValue(id) {
  const field = document.getElementById(id);
  return field ? field.value.trim() : "";
}

function approvalText() {
  const checked = document.getElementById("hs-approval").checked;
  if (!checked) {
    return "Not confirmed yet";
  }
  return "I can approve the business facts used in a preview and understand this is a website service, not a ranking, traffic, lead, sales, revenue, ad performance, or platform approval guarantee.";
}

function buildSummary() {
  return [
    "Local Service Website Preview Inquiry",
    "",
    `Business name: ${fieldValue("hs-business-name")}`,
    `Website URL: ${fieldValue("hs-website-url")}`,
    `Trade: ${fieldValue("hs-trade")}`,
    `City/state: ${fieldValue("hs-location")}`,
    `Preferred package: ${fieldValue("hs-package")}`,
    `Target timeline: ${fieldValue("hs-timeline")}`,
    `Main issue: ${fieldValue("hs-issue")}`,
    `Best contact: ${fieldValue("hs-contact")}`,
    `Acknowledgment: ${approvalText()}`,
  ].join("\n");
}

function updateSummary() {
  const summary = buildSummary();
  summaryBox.value = summary;
  const params = new URLSearchParams({
    title: `Home service website preview inquiry: ${fieldValue("hs-business-name") || "new business"}`,
    body: summary,
    labels: "home-service-inquiry",
  });
  githubLink.href = `${githubIssueBase}?${params.toString()}`;
}

async function copySummary() {
  updateSummary();
  try {
    await navigator.clipboard.writeText(summaryBox.value);
    statusBox.textContent = "Summary copied. Send it with the approved contact method or import it into the local pipeline.";
  } catch (error) {
    summaryBox.select();
    statusBox.textContent = "Clipboard was blocked. Select the summary and copy it manually.";
  }
}

if (form) {
  form.addEventListener("input", updateSummary);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSummary();
    statusBox.textContent = form.checkValidity()
      ? "Summary ready. No payment, contract, or service commitment has been created."
      : "Please complete the required fields before sending this inquiry.";
  });
}

if (copyButton) {
  copyButton.addEventListener("click", copySummary);
}

updateSummary();
