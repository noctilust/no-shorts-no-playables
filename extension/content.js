(() => {
  "use strict";

  const CHIP_SELECTOR = "yt-chip-cloud-chip-renderer";
  const SHORTS_ID_RE = /^\/shorts\/([A-Za-z0-9_-]+)\/?$/;
  const BARE_SHORTS_RE = /^\/shorts\/?$/;
  const PLAYABLES_RE = /^\/playables(?:\/|$)/;
  const CHANNEL_SHORTS_RE =
    /^\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)\/shorts\/?$/;

  let redirecting = false;
  let chipScanTimer = 0;

  function rewritePath(pathname) {
    const short = pathname.match(SHORTS_ID_RE);
    if (short) return `/watch?v=${short[1]}`;

    if (BARE_SHORTS_RE.test(pathname)) return "/";
    if (PLAYABLES_RE.test(pathname)) return "/";

    const channel = pathname.match(CHANNEL_SHORTS_RE);
    if (channel) return `/${channel[1]}/videos`;

    return null;
  }

  function checkLocation() {
    if (redirecting) return;

    const target = rewritePath(location.pathname);
    if (!target) return;

    redirecting = true;
    location.replace(target);
  }

  function onClick(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const anchor = path.find(
      (node) => node && node.tagName === "A" && typeof node.href === "string",
    );
    if (!anchor || (anchor.target && anchor.target !== "_self")) return;

    let url;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    if (url.origin !== location.origin) return;

    const target = rewritePath(url.pathname);
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(target);
  }

  function chipText(chip) {
    return (chip.textContent || "").replace(/\s+/g, " ").trim();
  }

  function hideChip(chip) {
    const text = chipText(chip);
    if (text !== "Shorts" && text !== "Playables") return;

    chip.setAttribute("data-nsnp-hidden", "");

    if (text !== "Shorts") return;

    const chips = Array.from(document.querySelectorAll(CHIP_SELECTOR));
    const selected = chips.find(
      (candidate) =>
        (candidate.hasAttribute("selected") || candidate.classList.contains("iron-selected")) &&
        chipText(candidate) === "Shorts",
    );
    if (!selected) return;

    const all = chips.find((candidate) => chipText(candidate) === "All");
    all?.querySelector("button")?.click();
  }

  function hideChips() {
    for (const chip of document.querySelectorAll(CHIP_SELECTOR)) hideChip(chip);
  }

  function scheduleChipScan() {
    if (chipScanTimer) return;
    chipScanTimer = window.setTimeout(() => {
      chipScanTimer = 0;
      hideChips();
    }, 150);
  }

  function start() {
    hideChips();
    scheduleChipScan();

    if (!document.documentElement) return;
    new MutationObserver(scheduleChipScan).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  checkLocation();

  for (const target of [document, window]) {
    target.addEventListener("yt-navigate-finish", checkLocation, true);
  }
  window.addEventListener("popstate", checkLocation, true);

  document.addEventListener("click", onClick, true);

  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });

  window.setInterval(checkLocation, 1000);
})();
