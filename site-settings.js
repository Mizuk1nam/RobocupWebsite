(function () {
  const SETTINGS_KEY = "robocupSiteSettings";
  const LEAGUES_KEY = "robocupCompetitions";
  const LEAGUE_DETAILS_KEY = "robocupLeagueDetails";
  const DEFAULT_SITE_NAME = "RoboCupJunior Canada";
  const DEFAULT_LEAGUES = [
    "Maze",
    "Formula 1",
    "Performance",
    "SumoBots",
    "Rescue Line",
    "Rescue Maze",
    "Soccer",
    "OnStage"
  ];
  const KNOWN_LEAGUE_CONTENT = {
    maze: {
      icon: "&#129521;",
      slug: "maze",
      summaryEn: "A RoboParty challenge where robots navigate a walled corridor from start to finish.",
      summaryFr: "Un defi RoboParty ou les robots traversent un corridor avec des murs du depart a l'arrivee.",
      bulletsEn: ["3 attempts per robot.", "120 second maximum per run.", "Wall contact can reduce the score."],
      bulletsFr: ["3 essais par robot.", "Maximum de 120 secondes par essai.", "Les contacts avec les murs peuvent reduire le score."]
    },
    "formula 1": {
      icon: "&#127950;",
      slug: "formula-1",
      summaryEn: "A RoboParty challenge where robots follow a black curved line around a race track.",
      summaryFr: "Un defi RoboParty ou les robots suivent une ligne noire courbee sur une piste de course.",
      bulletsEn: ["3 attempts per robot.", "Best run is counted.", "Fast and stable line-following is key."],
      bulletsFr: ["3 essais par robot.", "Le meilleur essai est retenu.", "Le suivi de ligne rapide et stable est essentiel."]
    },
    performance: {
      icon: "&#127925;",
      slug: "performance",
      summaryEn: "A RoboParty challenge where teams present a short robot routine with music and creativity.",
      summaryFr: "Un defi RoboParty ou les equipes presentent une courte routine de robot avec musique et creativite.",
      bulletsEn: ["Usually a 1 minute routine.", "Creativity and entertainment are judged.", "Programming complexity matters."],
      bulletsFr: ["Routine habituellement d'environ 1 minute.", "La creativite et le divertissement sont evalues.", "La complexite de la programmation compte."]
    },
    sumobots: {
      icon: "&#129302;",
      slug: "sumobots",
      summaryEn: "A RoboParty challenge where robots try to push opponents out of an octagonal ring.",
      summaryFr: "Un defi RoboParty ou les robots tentent de pousser leurs adversaires hors d'un anneau octogonal.",
      bulletsEn: ["Robots compete inside a ring.", "Points are earned by pushing opponents out.", "Size and weight limits apply."],
      bulletsFr: ["Les robots s'affrontent dans un anneau.", "Des points sont gagnes en poussant les adversaires dehors.", "Des limites de taille et de poids s'appliquent."]
    },
    "rescue line": {
      icon: "&#128657;",
      slug: "rescue-line",
      summaryEn: "Robots follow a black line through a rescue course with obstacles and evacuation zones.",
      summaryFr: "Les robots suivent une ligne noire dans un parcours de sauvetage avec obstacles et zones d'evacuation.",
      bulletsEn: ["Points are awarded for completing course elements.", "Robots may need to recover from gaps or obstacles.", "Evacuation zones use victim objects and point multipliers."],
      bulletsFr: ["Des points sont accordes pour les elements completes.", "Les robots peuvent devoir recuperer apres des ecarts ou obstacles.", "La zone d'evacuation utilise des victimes et des multiplicateurs."]
    },
    "rescue maze": {
      icon: "&#129517;",
      slug: "rescue-maze",
      summaryEn: "Robots explore a simulated disaster maze to locate victims and deliver rescue kits.",
      summaryFr: "Les robots explorent un labyrinthe simulant une catastrophe pour localiser des victimes et livrer des trousses de secours.",
      bulletsEn: ["Designed as preparation for international Rescue divisions.", "Teams may participate in Rescue Maze and Rescue Line at qualifying events."],
      bulletsFr: ["Preparation aux divisions internationales de Rescue.", "Les equipes peuvent participer a Rescue Maze et Rescue Line aux evenements de qualification."]
    },
    soccer: {
      icon: "&#9917;",
      slug: "soccer",
      summaryEn: "Two autonomous robots compete against another pair by detecting and kicking a ball.",
      summaryFr: "Deux robots autonomes affrontent une autre paire en detectant et en frappant une balle.",
      bulletsEn: ["Lightweight uses an infrared ball.", "Open uses a vision-tracked orange ball.", "Each goal is worth 1 point."],
      bulletsFr: ["Lightweight utilise une balle infrarouge.", "Open utilise une balle orange suivie par vision.", "Chaque but vaut 1 point."]
    },
    onstage: {
      icon: "&#127917;",
      slug: "onstage",
      summaryEn: "Teams create a robotic performance combining engineering, music, and storytelling.",
      summaryFr: "Les equipes creent une performance robotique combinant ingenierie, musique et recit.",
      bulletsEn: ["Robots and students perform together on stage.", "Judges evaluate creativity and entertainment.", "Robot autonomy is considered during evaluation."],
      bulletsFr: ["Les robots et les eleves performent ensemble sur scene.", "Les juges evaluent creativite et divertissement.", "L'autonomie des robots est prise en compte lors de l'evaluation."]
    }
  };
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

  function readLeagues() {
    try {
      const raw = JSON.parse(localStorage.getItem(LEAGUES_KEY) || "[]");
      const source = Array.isArray(raw) && raw.length ? raw : DEFAULT_LEAGUES;
      const seen = new Set();
      const leagues = [];
      source.forEach((entry) => {
        const name = String(entry || "").trim();
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return;
        seen.add(key);
        leagues.push(name);
      });

      return leagues.length ? leagues : DEFAULT_LEAGUES.slice();
    } catch (error) {
      return DEFAULT_LEAGUES.slice();
    }
  }

  function normalizeLeagueKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeLeagueSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function readLeagueDetailsMap() {
    try {
      return JSON.parse(localStorage.getItem(LEAGUE_DETAILS_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugifyLeague(name) {
    return normalizeLeagueSlug(name);
  }

  function getLeagueConfig(name) {
    const leagueDetailsMap = readLeagueDetailsMap();
    const trimmed = String(name || "").trim();
    const key = normalizeLeagueKey(trimmed);
    const known = KNOWN_LEAGUE_CONTENT[key];
    const custom = leagueDetailsMap[key] || {};

    const fallbackSummaryEn = `This league has been added by the admin team. Full rules for ${trimmed} will be posted soon.`;
    const fallbackSummaryFr = `Cette ligue a ete ajoutee par l'equipe d'administration. Les regles completes pour ${trimmed} seront publiees bientot.`;

    const baseConfig = known ? {
      icon: known.icon,
      slug: known.slug,
      summaryEn: known.summaryEn,
      summaryFr: known.summaryFr,
      bulletsEn: known.bulletsEn,
      bulletsFr: known.bulletsFr
    } : {
      icon: "&#129302;",
      slug: "",
      summaryEn: fallbackSummaryEn,
      summaryFr: fallbackSummaryFr,
      bulletsEn: ["League details coming soon."],
      bulletsFr: ["Details de la ligue a venir."]
    };

    const mergedSlug = normalizeLeagueSlug(custom.slug || baseConfig.slug || "");
    const mergedIcon = String(custom.icon || baseConfig.icon || "&#129302;").trim() || "&#129302;";
    const mergedSummaryEn = String(custom.summaryEn || baseConfig.summaryEn || fallbackSummaryEn).trim() || fallbackSummaryEn;
    const mergedSummaryFr = String(custom.summaryFr || baseConfig.summaryFr || fallbackSummaryFr).trim() || fallbackSummaryFr;
    const mergedBulletsEn = Array.isArray(custom.bulletsEn) && custom.bulletsEn.length
      ? custom.bulletsEn
      : baseConfig.bulletsEn;
    const mergedBulletsFr = Array.isArray(custom.bulletsFr) && custom.bulletsFr.length
      ? custom.bulletsFr
      : baseConfig.bulletsFr;

    return {
      name: trimmed,
      icon: mergedIcon,
      slug: mergedSlug,
      summaryEn: mergedSummaryEn,
      summaryFr: mergedSummaryFr,
      bulletsEn: mergedBulletsEn,
      bulletsFr: mergedBulletsFr
    };
  }

  function applyCustomCompetitionDetails() {
    const path = window.location.pathname.toLowerCase();
    const isCompetitionPage = path.endsWith("/competition.html") || path.endsWith("competition.html");
    if (!isCompetitionPage) return;

    const params = new URLSearchParams(window.location.search);
    const type = normalizeLeagueSlug(params.get("type") || "");
    if (!type) return;

    const isFrench = document.documentElement.lang === "fr" || params.get("lang") === "fr";
    const leagues = readLeagues().map((name) => getLeagueConfig(name));
    const league = leagues.find((item) => normalizeLeagueSlug(item.slug) === type);
    if (!league) return;

    const pageTitle = document.getElementById("page-title");
    const pageSummary = document.getElementById("page-summary");
    const backLink = document.getElementById("back-link");
    const content = document.getElementById("content");
    if (!pageTitle || !pageSummary || !backLink || !content) return;

    const detailsWord = isFrench ? "Details" : "Details";
    const summary = isFrench ? league.summaryFr : league.summaryEn;
    const bullets = isFrench ? league.bulletsFr : league.bulletsEn;

    document.documentElement.lang = isFrench ? "fr" : "en";
    document.title = `${league.name} ${detailsWord} | ${DEFAULT_SITE_NAME}`;
    pageTitle.innerHTML = `${escapeHtml(league.name)}<span>${detailsWord}</span>`;
    pageSummary.textContent = summary;
    backLink.href = isFrench ? "leagues_fr.html" : "leagues.html";
    backLink.textContent = isFrench ? "Retour aux ligues →" : "Back to Leagues →";

    content.innerHTML = `
      <section>
        <div class="container">
          <h2 class="section-title">${isFrench ? "Informations de la ligue" : "League Information"}</h2>
          <div class="content-grid">
            <div class="panel">
              <h3>${isFrench ? "Resume" : "Summary"}</h3>
              <p>${escapeHtml(summary)}</p>
            </div>
            <div class="panel">
              <h3>${isFrench ? "Points cles" : "Highlights"}</h3>
              <ul>
                ${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
      </section>
    `;
  }
  function renderLeagueCardsFromSettings() {
    const path = window.location.pathname.toLowerCase();
    const isLeaguesPage = path.endsWith("/leagues.html") || path.endsWith("/leagues_fr.html") || path.endsWith("leagues.html") || path.endsWith("leagues_fr.html");
    if (!isLeaguesPage) return;

    const grid = document.querySelector(".grid-3");
    if (!grid) return;

    const isFrench = document.documentElement.lang === "fr";
    const leagues = readLeagues();
    const lang = isFrench ? "fr" : "en";
    const actionKnown = isFrench ? "Voir les details" : "View details";
    const actionUnknown = isFrench ? "Details a venir" : "Details coming soon";

    if (!document.getElementById("dynamic-leagues-style")) {
      const style = document.createElement("style");
      style.id = "dynamic-leagues-style";
      style.textContent = ".league-card-no-details{opacity:.92;cursor:default}.league-card-no-details .card-action{color:#64748b}";
      document.head.appendChild(style);
    }

    grid.innerHTML = leagues.map((leagueName) => {
      const league = getLeagueConfig(leagueName);
      const description = isFrench ? league.summaryFr : league.summaryEn;
      const bullets = isFrench ? league.bulletsFr : league.bulletsEn;
      const normalizedSlug = normalizeLeagueSlug(league.slug || slugifyLeague(league.name));
      const href = normalizedSlug ? `competition.html?lang=${lang}&type=${encodeURIComponent(normalizedSlug)}` : "#";
      const actionText = normalizedSlug ? actionKnown : actionUnknown;
      const unknownClass = normalizedSlug ? "" : " league-card-no-details";

      return `
        <a class="league-card${unknownClass}" href="${href}" ${normalizedSlug ? "" : 'data-no-details="true"'}>
          <div class="league-icon">${league.icon}</div>
          <h3>${escapeHtml(league.name)}</h3>
          <p>${escapeHtml(description)}</p>
          <ul>
            ${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <span class="card-action">${actionText}</span>
        </a>
      `;
    }).join("");

    grid.querySelectorAll('[data-no-details="true"]').forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
      });
    });
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

    applyCustomCompetitionDetails();
    renderLeagueCardsFromSettings();

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
