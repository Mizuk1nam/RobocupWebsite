(function () {
  const SETTINGS_KEY = "robocupSiteSettings";
  const DEFAULT_SITE_NAME = "RoboCupJunior Canada";
  const REPLACEMENT_PATTERNS = [
    /RoboCupJunior Canada/g,
    /RoboCup Junior Canada/g,
    /RoboCup Canada/g,
    /RoboCupJunior/g
  ];

  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function getActiveSiteName() {
    const settings = readSettings();
    const isFrench = document.documentElement.lang === "fr";
    const siteNameEn = String(settings.siteNameEn || "").trim();
    const siteNameFr = String(settings.siteNameFr || "").trim();

    if (isFrench) {
      return siteNameFr || siteNameEn || DEFAULT_SITE_NAME;
    }

    return siteNameEn || siteNameFr || DEFAULT_SITE_NAME;
  }

  function replaceKnownNames(text, siteName) {
    if (!text || !siteName) return text;
    return REPLACEMENT_PATTERNS.reduce((current, pattern) => current.replace(pattern, siteName), text);
  }

  function applyToTitle(siteName) {
    if (!document.title) return;
    document.title = replaceKnownNames(document.title, siteName);
  }

  function applyToTextNodes(siteName) {
    if (!document.body) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          const parent = node.parentElement;
          if (!parent) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.closest("script, style, noscript, textarea, code, pre")) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const pendingNodes = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      pendingNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    pendingNodes.forEach((node) => {
      const updated = replaceKnownNames(node.nodeValue, siteName);
      if (updated !== node.nodeValue) {
        node.nodeValue = updated;
      }
    });
  }

  function applyRoboCupSiteSettings() {
    const siteName = getActiveSiteName();
    if (!siteName) return;

    applyToTitle(siteName);
    applyToTextNodes(siteName);
  }

  window.applyRoboCupSiteSettings = applyRoboCupSiteSettings;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyRoboCupSiteSettings, { once: true });
  } else {
    applyRoboCupSiteSettings();
  }
})();
