const platformProfiles = {
  LinkedIn: {
    hook: "Open with the business lesson before the story.",
    fit: "Best for authority, founder POV, consulting insight, and comment-led discussion.",
    caption: "Frame the clip as a practical lesson for operators, founders, or advisory buyers.",
    titleStyle: "B2B lesson"
  },
  "YouTube Shorts": {
    hook: "Start with the most specific claim or mistake in the first two seconds.",
    fit: "Best for searchable clips, punchy takeaways, and channel discovery.",
    caption: "Use a direct title, one context line, and a clear reason to watch the full episode.",
    titleStyle: "Searchable teaser"
  },
  TikTok: {
    hook: "Lead with a pattern interrupt or contrarian line.",
    fit: "Best for fast education, story moments, and opinionated advice.",
    caption: "Keep the caption conversational and make the lesson feel immediately usable.",
    titleStyle: "Contrarian hook"
  },
  "Instagram Reels": {
    hook: "Lead with the emotional or visual before-and-after.",
    fit: "Best for polished takeaways, founder moments, and brand familiarity.",
    caption: "Write a short caption that pairs the insight with a simple save-worthy takeaway.",
    titleStyle: "Save-worthy insight"
  }
};

const goalAngles = {
  authority: [
    "a clear point of view",
    "a lesson that makes the speaker sound experienced",
    "a moment that challenges a common assumption"
  ],
  leads: [
    "a problem your ideal buyer recognizes",
    "a concrete next-step prompt",
    "a moment that makes a consultation feel useful"
  ],
  education: [
    "a step-by-step explanation",
    "a mistake-and-fix teaching moment",
    "a framework the audience can reuse"
  ],
  "product awareness": [
    "a workflow problem your product or service helps solve",
    "a before-and-after operational moment",
    "a use case that can stand alone without a sales pitch"
  ]
};

const contentTypeContext = {
  podcast: "episode conversation",
  webinar: "teaching section",
  "founder interview": "founder story",
  "YouTube episode": "long-form segment",
  "LinkedIn live": "live discussion"
};

const timestampHints = ["00:02:15 - 00:03:05", "00:08:40 - 00:09:35", "00:14:10 - 00:15:05", "00:22:30 - 00:23:20", "00:31:45 - 00:32:35"];

const analyzerForm = document.querySelector("#clip-analyzer-form");
const analyzerError = document.querySelector("#analyzer-error");
const auditState = document.querySelector("#audit-state");
const clipResults = document.querySelector("#clip-results");
const inquiryForm = document.querySelector("#clip-inquiry-form");
const inquiryError = document.querySelector("#inquiry-error");
const inquirySummary = document.querySelector("#inquiry-summary");
const mailtoLink = document.querySelector("#mailto-link");
const copySummary = document.querySelector("#copy-summary");
const githubInquiry = document.querySelector("#github-inquiry");
const fiverrServiceLink = document.querySelector("#fiverr-service-link");
const copyFiverrSummary = document.querySelector("#copy-fiverr-summary");
const packageSelectButtons = document.querySelectorAll("[data-package-select]");
const hostedSubmit = document.querySelector('[data-submit-mode="hosted"]');
const hostedSubmitNote = document.querySelector(".hosted-submit-note");
const summaryState = document.querySelector("#summary-state");
const trafficSourceInput = document.querySelector("#traffic-source");
const githubIssueBase = "https://github.com/kimw1994/clipfactory-site/issues/new";
const linkedinReplyFallbackUrl = "https://www.linkedin.com/feed/update/urn:li:share:7465434280165261312";
const fiverrServiceUrl = "https://www.fiverr.com/vitalease/design-an-ai-workflow-automation-for-your-small-business";

const prefillAliases = {
  package: {
    audit: "$149 Clip Audit",
    clipaudit: "$149 Clip Audit",
    starter: "$499 Starter monthly",
    growth: "$999 Growth monthly",
    dfy: "$1,999 Done-for-you monthly",
    doneforyou: "$1,999 Done-for-you monthly",
    done: "$1,999 Done-for-you monthly",
    "149": "$149 Clip Audit",
    "499": "$499 Starter monthly",
    "999": "$999 Growth monthly",
    "1999": "$1,999 Done-for-you monthly"
  },
  platform: {
    linkedin: "LinkedIn",
    shorts: "YouTube Shorts",
    youtubeshorts: "YouTube Shorts",
    youtube: "YouTube Shorts",
    tiktok: "TikTok",
    reels: "Instagram Reels",
    instagram: "Instagram Reels",
    instagramreels: "Instagram Reels"
  },
  goal: {
    authority: "authority",
    leads: "leads",
    education: "education",
    awareness: "product awareness",
    product: "product awareness",
    productawareness: "product awareness"
  },
  frequency: {
    test: "One episode test",
    oneepisode: "One episode test",
    oneepisodetest: "One episode test",
    weekly: "Weekly",
    twice: "Twice per week",
    twiceperweek: "Twice per week",
    monthly: "Monthly batch",
    monthlybatch: "Monthly batch"
  }
};

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

function getTrafficSource() {
  const params = new URLSearchParams(window.location.search);
  const taggedSource = params.get("src") || params.get("utm_campaign") || params.get("utm_source");

  if (taggedSource) {
    return taggedSource.slice(0, 120);
  }

  if (document.referrer) {
    try {
      return new URL(document.referrer).hostname.slice(0, 120);
    } catch {
      return "referrer";
    }
  }

  return "direct";
}

function showError(element, message) {
  element.textContent = message;
}

function clearError(element) {
  element.textContent = "";
}

function prefillKey(value) {
  return cleanValue(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function firstParam(params, names) {
  for (const name of names) {
    const value = cleanValue(params.get(name));
    if (value) {
      return value;
    }
  }
  return "";
}

function resolveSelectValue(select, rawValue, aliases) {
  const direct = Array.from(select.options).find((option) => option.value.toLowerCase() === rawValue.toLowerCase());
  if (direct) {
    return direct.value;
  }

  return aliases[prefillKey(rawValue)] || "";
}

function setSelectFromUrl(params, selectors, names, aliases) {
  const rawValue = firstParam(params, names);
  if (!rawValue) {
    return false;
  }

  let applied = false;
  selectors.forEach((selector) => {
    const select = document.querySelector(selector);
    if (!select) {
      return;
    }

    const resolved = resolveSelectValue(select, rawValue, aliases);
    if (resolved) {
      select.value = resolved;
      applied = true;
    }
  });

  return applied;
}

function applyUrlPrefill() {
  const params = new URLSearchParams(window.location.search);
  let applied = false;

  applied = setSelectFromUrl(params, ["#requested-package"], ["package", "pkg", "plan", "requested_package"], prefillAliases.package) || applied;
  applied = setSelectFromUrl(params, ["#target-platform", "#inquiry-platform"], ["platform", "target_platform"], prefillAliases.platform) || applied;
  applied = setSelectFromUrl(params, ["#clip-goal", "#inquiry-goal"], ["goal", "clip_goal"], prefillAliases.goal) || applied;
  applied = setSelectFromUrl(params, ["#publishing-frequency"], ["frequency", "publishing_frequency", "cadence"], prefillAliases.frequency) || applied;

  const videoUrl = firstParam(params, ["video_url", "video", "url"]);
  if (videoUrl && isValidUrl(videoUrl)) {
    document.querySelector("#video-url").value = videoUrl;
    document.querySelector("#inquiry-video-url").value = videoUrl;
    applied = true;
  }

  if (applied && summaryState) {
    summaryState.textContent = "Link preferences loaded";
  }
}

function createOpportunity(index, data) {
  const platform = platformProfiles[data.targetPlatform];
  const angle = goalAngles[data.clipGoal][index % goalAngles[data.clipGoal].length];
  const context = contentTypeContext[data.contentType] || "long-form segment";
  const hookBase = [
    `Most ${data.contentType} clips start too late. This one should begin where the speaker names ${angle}.`,
    `Use the first sentence that explains the real cost of the problem, then cut everything before it.`,
    `Start where the guest gives the example, not where the host asks the setup question.`,
    `Pull the moment where the speaker turns a vague idea into a specific operating rule.`,
    `Cut around the line that would make the viewer think, "that is exactly my problem."`
  ];
  const titleBase = [
    `The ${platform.titleStyle} hidden in this ${context}`,
    `A short clip about ${angle}`,
    `Why this ${context} can become a stronger short-form asset`,
    `The 45-second idea your audience can use today`,
    `A cleaner way to package this long-form moment`
  ];

  return {
    timestamp_hint: timestampHints[index],
    hook: `${platform.hook} ${hookBase[index]}`,
    title: titleBase[index],
    caption: `${platform.caption} Suggested caption: "One useful takeaway from this ${data.contentType}: ${angle}. The full episode gives the context, but this clip can stand alone."`,
    platform_fit: `${data.targetPlatform}: ${platform.fit}`,
    why_it_works: `This clip is aimed at ${data.clipGoal} because it turns the ${context} into ${angle}. Final selection still needs human review of the actual episode.`
  };
}

function renderOpportunities(opportunities) {
  clipResults.className = "clip-opportunities";
  clipResults.innerHTML = opportunities
    .map((opportunity, index) => {
      return `
        <article class="clip-opportunity">
          <div class="panel-header">
            <span>Opportunity ${index + 1}</span>
            <span>${opportunity.timestamp_hint}</span>
          </div>
          <h3>${opportunity.title}</h3>
          <dl>
            <div>
              <dt>Hook</dt>
              <dd>${opportunity.hook}</dd>
            </div>
            <div>
              <dt>Caption</dt>
              <dd>${opportunity.caption}</dd>
            </div>
            <div>
              <dt>Platform fit</dt>
              <dd>${opportunity.platform_fit}</dd>
            </div>
            <div>
              <dt>Why it works</dt>
              <dd>${opportunity.why_it_works}</dd>
            </div>
          </dl>
        </article>
      `;
    })
    .join("") +
    `
      <div class="output-cta">
        <button class="button primary" type="button" data-output-action="copy-public-inquiry">Copy public inquiry</button>
        <button class="button secondary dark-button" type="button" data-output-action="linkedin-public-reply">Copy + reply on LinkedIn</button>
        <button class="button secondary dark-button" type="button" data-output-action="github-public-inquiry">Open public GitHub inquiry</button>
        <button class="button secondary dark-button" type="button" data-output-action="fiverr-public-inquiry">Copy + open Fiverr service</button>
        <a class="button secondary dark-button" href="#inquiry">Edit inquiry details</a>
      </div>
    `;
}

function syncInquiryFields(data) {
  document.querySelector("#inquiry-video-url").value = data.videoUrl;
  document.querySelector("#inquiry-platform").value = data.targetPlatform;
  document.querySelector("#inquiry-goal").value = data.clipGoal;
  if (data.email) {
    document.querySelector("#buyer-email").value = data.email;
  }
  document.querySelector("#inquiry-rights").checked = true;
}

function getAnalyzerData() {
  return {
    videoUrl: cleanValue(document.querySelector("#video-url").value),
    contentType: cleanValue(document.querySelector("#content-type").value),
    targetPlatform: cleanValue(document.querySelector("#target-platform").value),
    clipGoal: cleanValue(document.querySelector("#clip-goal").value),
    email: cleanValue(document.querySelector("#analyzer-email").value),
    rightsConfirmed: document.querySelector("#rights-confirmation").checked
  };
}

function validateAnalyzer(data) {
  if (!data.videoUrl) {
    return "Paste a public video URL before generating a sample audit.";
  }
  if (!isValidUrl(data.videoUrl)) {
    return "Use a full public URL that starts with http:// or https://.";
  }
  if (!data.rightsConfirmed) {
    return "Confirm that you own the content or have permission to process and republish it.";
  }
  return "";
}

function getInquiryData() {
  return {
    name: cleanValue(document.querySelector("#buyer-name").value),
    email: cleanValue(document.querySelector("#buyer-email").value),
    videoUrl: cleanValue(document.querySelector("#inquiry-video-url").value),
    targetPlatform: cleanValue(document.querySelector("#inquiry-platform").value),
    frequency: cleanValue(document.querySelector("#publishing-frequency").value),
    requestedPackage: cleanValue(document.querySelector("#requested-package").value),
    clipGoal: cleanValue(document.querySelector("#inquiry-goal").value),
    avoidList: cleanValue(document.querySelector("#inquiry-avoid-list")?.value),
    trafficSource: cleanValue(trafficSourceInput?.value) || "direct",
    rightsConfirmed: document.querySelector("#inquiry-rights").checked
  };
}

function validateInquiry(data) {
  if (!data.videoUrl || !isValidUrl(data.videoUrl)) {
    return "Add a full public video URL that starts with http:// or https://.";
  }
  if (!data.rightsConfirmed) {
    return "Confirm that you own the content or have permission to process and republish it.";
  }
  return "";
}

function inquiryDisplayName(data) {
  return data.name || "Public visitor";
}

function buildInquirySummary(data) {
  return [
    "ClipFactory inquiry",
    "",
    `Name: ${inquiryDisplayName(data)}`,
    `Email: ${data.email || "Not provided; replying through public channel"}`,
    `Video URL: ${data.videoUrl}`,
    `Target platform: ${data.targetPlatform}`,
    `Publishing frequency: ${data.frequency}`,
    `Requested package: ${data.requestedPackage || "$149 Clip Audit"}`,
    `Main goal: ${data.clipGoal}`,
    `Avoid-list: ${data.avoidList || "Not provided yet; please ask before payment"}`,
    `Source: ${data.trafficSource}`,
    "Rights confirmation: Yes, I own this content or have permission to process, edit, and republish it.",
    "",
    "Requested next step:",
    `Please review this episode and send a written scope for the selected next step: ${data.requestedPackage || "$149 Clip Audit"}.`,
    "",
    "I understand this page does not collect payment and does not guarantee views, revenue, follower growth, or platform approval."
  ].join("\n");
}

function buildPublicInquirySummary(data) {
  return [
    "ClipFactory public inquiry",
    "",
    `Name: ${inquiryDisplayName(data)}`,
    `Video URL: ${data.videoUrl}`,
    `Target platform: ${data.targetPlatform}`,
    `Publishing frequency: ${data.frequency}`,
    `Requested package: ${data.requestedPackage || "$149 Clip Audit"}`,
    `Main goal: ${data.clipGoal}`,
    `Avoid-list: ${data.avoidList || "Not provided yet; please ask before payment"}`,
    `Source: ${data.trafficSource}`,
    "Rights confirmation: Yes, I own this content or have permission to process, edit, and republish it.",
    "",
    "Requested next step:",
    `Please review this public episode and tell me whether ${data.requestedPackage || "$149 Clip Audit"} is the right next step.`,
    "",
    "Privacy note: this GitHub issue is public. Do not include private links, passwords, customer data, or confidential details."
  ].join("\n");
}

function buildGithubIssueUrl(data) {
  const params = new URLSearchParams({
    title: `ClipFactory inquiry - ${inquiryDisplayName(data)}`,
    body: buildPublicInquirySummary(data)
  });

  return `${githubIssueBase}?${params.toString()}`;
}

function getLinkedinReplyUrl() {
  return document.querySelector("#linkedin-reply-link")?.href || linkedinReplyFallbackUrl;
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    inquirySummary.value = text;
    inquirySummary.select();
    document.execCommand("copy");
    return true;
  }
}

function preparePublicInquiryFromSyncedFields() {
  const data = getInquiryData();
  const validationMessage = validateInquiry(data);

  if (validationMessage) {
    showError(inquiryError, validationMessage);
    summaryState.textContent = "Needs input";
    return null;
  }

  clearError(inquiryError);
  const summary = buildPublicInquirySummary(data);
  inquirySummary.value = summary;
  return { data, summary };
}

analyzerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = getAnalyzerData();
  const validationMessage = validateAnalyzer(data);

  if (validationMessage) {
    showError(analyzerError, validationMessage);
    auditState.textContent = "Needs input";
    return;
  }

  clearError(analyzerError);
  const opportunities = Array.from({ length: 5 }, (_, index) => createOpportunity(index, data));
  renderOpportunities(opportunities);
  syncInquiryFields(data);
  auditState.textContent = "Generated";
});

clipResults?.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-output-action]");
  if (!actionButton) {
    return;
  }

  const prepared = preparePublicInquiryFromSyncedFields();
  if (!prepared) {
    return;
  }

  if (actionButton.dataset.outputAction === "copy-public-inquiry") {
    await copyTextToClipboard(prepared.summary);
    summaryState.textContent = "Copied public summary";
    auditState.textContent = "Inquiry copied";
    return;
  }

  if (actionButton.dataset.outputAction === "linkedin-public-reply") {
    const copyPromise = copyTextToClipboard(prepared.summary);
    const opened = window.open(getLinkedinReplyUrl(), "_blank", "noopener,noreferrer");
    await copyPromise;
    summaryState.textContent = "Copied for LinkedIn";
    auditState.textContent = opened ? "Opening LinkedIn" : "Popup blocked";

    if (!opened) {
      showError(inquiryError, "The browser blocked the LinkedIn window. The public summary was copied; open the LinkedIn post link manually.");
    }
    return;
  }

  if (actionButton.dataset.outputAction === "github-public-inquiry") {
    summaryState.textContent = "Opening GitHub";
    auditState.textContent = "Opening inquiry";
    const opened = window.open(buildGithubIssueUrl(prepared.data), "_blank", "noopener,noreferrer");
    if (!opened) {
      summaryState.textContent = "Copy public summary";
      auditState.textContent = "Popup blocked";
      showError(inquiryError, "The browser blocked the GitHub inquiry window. Copy the public summary and open the GitHub repo link manually.");
    }
    return;
  }

  if (actionButton.dataset.outputAction === "fiverr-public-inquiry") {
    const copyPromise = copyTextToClipboard(prepared.summary);
    const opened = window.open(fiverrServiceUrl, "_blank", "noopener,noreferrer");
    await copyPromise;
    summaryState.textContent = "Copied for Fiverr";
    auditState.textContent = opened ? "Opening Fiverr" : "Popup blocked";

    if (!opened) {
      showError(inquiryError, "The browser blocked the Fiverr window. The public summary was copied; open the Fiverr service link manually.");
    }
  }
});

inquiryForm?.addEventListener("submit", (event) => {
  const data = getInquiryData();
  const validationMessage = validateInquiry(data);
  const submitMode = event.submitter?.dataset.submitMode || "copy";

  if (validationMessage) {
    event.preventDefault();
    showError(inquiryError, validationMessage);
    summaryState.textContent = "Needs input";
    return;
  }

  clearError(inquiryError);

  if (submitMode === "hosted") {
    if (window.location.hostname.endsWith("github.io")) {
      event.preventDefault();
      inquirySummary.value = buildInquirySummary(data);
      summaryState.textContent = "Hosted form unavailable here";
      showError(inquiryError, "This public GitHub Pages version cannot capture hosted form submissions. Copy the summary or open a public GitHub inquiry instead.");
      return;
    }
    summaryState.textContent = "Submitting";
    return;
  }

  event.preventDefault();
  const summary = buildInquirySummary(data);
  inquirySummary.value = summary;
  summaryState.textContent = "Prepared to copy";
  mailtoLink.classList.add("disabled-link");
  mailtoLink.setAttribute("aria-disabled", "true");
  mailtoLink.href = "#";
});

githubInquiry?.addEventListener("click", () => {
  const data = getInquiryData();
  const validationMessage = validateInquiry(data);

  if (validationMessage) {
    showError(inquiryError, validationMessage);
    summaryState.textContent = "Needs input";
    return;
  }

  clearError(inquiryError);
  inquirySummary.value = buildPublicInquirySummary(data);
  summaryState.textContent = "Opening GitHub";
  const opened = window.open(buildGithubIssueUrl(data), "_blank", "noopener,noreferrer");

  if (!opened) {
    summaryState.textContent = "Copy public summary";
    showError(inquiryError, "The browser blocked the GitHub inquiry window. Copy the public summary and open the GitHub repo link manually.");
  }
});

async function copyAndOpenFiverr() {
  const prepared = preparePublicInquiryFromSyncedFields();
  if (!prepared) {
    return;
  }

  const copyPromise = copyTextToClipboard(prepared.summary);
  const opened = window.open(fiverrServiceUrl, "_blank", "noopener,noreferrer");
  await copyPromise;
  summaryState.textContent = "Copied for Fiverr";

  if (!opened) {
    showError(inquiryError, "The browser blocked the Fiverr window. The public summary was copied; open the Fiverr service link manually.");
  }
}

fiverrServiceLink?.addEventListener("click", copyAndOpenFiverr);
copyFiverrSummary?.addEventListener("click", copyAndOpenFiverr);

packageSelectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const packageValue = button.dataset.packageSelect;
    const requestedPackage = document.querySelector("#requested-package");
    const inquirySection = document.querySelector("#inquiry");
    const videoField = document.querySelector("#inquiry-video-url");

    if (requestedPackage && packageValue) {
      requestedPackage.value = packageValue;
      summaryState.textContent = "Package selected";
    }

    inquirySection?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (videoField) {
      window.setTimeout(() => videoField.focus({ preventScroll: true }), 450);
    }
  });
});

copySummary?.addEventListener("click", async () => {
  const summary = inquirySummary.value;
  if (!summary) {
    summaryState.textContent = "Prepare first";
    return;
  }

  await copyTextToClipboard(summary);
  summaryState.textContent = "Copied";
});

if (trafficSourceInput) {
  trafficSourceInput.value = getTrafficSource();
}

applyUrlPrefill();

if (hostedSubmit && window.location.hostname.endsWith("github.io")) {
  hostedSubmit.hidden = true;
}

if (hostedSubmitNote && window.location.hostname.endsWith("github.io")) {
  hostedSubmitNote.textContent = "This public GitHub Pages version cannot collect hosted form submissions. Use Copy summary, or open a public GitHub inquiry without private details.";
}
