(function () {
  const DEFAULT_COMPETITIONS = [
    "Maze",
    "Formula 1",
    "Performance",
    "SumoBots",
    "Rescue Line",
    "Rescue Maze",
    "Soccer",
    "OnStage"
  ];
  const COMPETITIONS_STORAGE_KEY = "robocupCompetitions";
  const LEAGUE_DETAILS_STORAGE_KEY = "robocupLeagueDetails";
  const DEFAULT_LEAGUE_DETAILS = {
    maze: {
      slug: "maze",
      icon: "🤖",
      summaryEn: "A RoboParty challenge where robots navigate a walled corridor from start to finish.",
      summaryFr: "Un defi RoboParty ou les robots traversent un corridor avec des murs du depart a l'arrivee.",
      bulletsEn: ["3 attempts per robot.", "120 second maximum per run.", "Wall contact can reduce the score."],
      bulletsFr: ["3 essais par robot.", "Maximum de 120 secondes par essai.", "Les contacts avec les murs peuvent reduire le score."]
    },
    "formula 1": {
      slug: "formula-1",
      icon: "🏎️",
      summaryEn: "A RoboParty challenge where robots follow a black curved line around a race track.",
      summaryFr: "Un defi RoboParty ou les robots suivent une ligne noire courbee sur une piste de course.",
      bulletsEn: ["3 attempts per robot.", "Best run is counted.", "Fast and stable line-following is key."],
      bulletsFr: ["3 essais par robot.", "Le meilleur essai est retenu.", "Le suivi de ligne rapide et stable est essentiel."]
    },
    performance: {
      slug: "performance",
      icon: "🎵",
      summaryEn: "A RoboParty challenge where teams present a short robot routine with music and creativity.",
      summaryFr: "Un defi RoboParty ou les equipes presentent une courte routine de robot avec musique et creativite.",
      bulletsEn: ["Usually a 1 minute routine.", "Creativity and entertainment are judged.", "Programming complexity matters."],
      bulletsFr: ["Routine habituellement d'environ 1 minute.", "La creativite et le divertissement sont evalues.", "La complexite de la programmation compte."]
    },
    sumobots: {
      slug: "sumobots",
      icon: "🤖",
      summaryEn: "A RoboParty challenge where robots try to push opponents out of an octagonal ring.",
      summaryFr: "Un defi RoboParty ou les robots tentent de pousser leurs adversaires hors d'un anneau octogonal.",
      bulletsEn: ["Robots compete inside a ring.", "Points are earned by pushing opponents out.", "Size and weight limits apply."],
      bulletsFr: ["Les robots s'affrontent dans un anneau.", "Des points sont gagnes en poussant les adversaires dehors.", "Des limites de taille et de poids s'appliquent."]
    },
    "rescue line": {
      slug: "rescue-line",
      icon: "🚑",
      summaryEn: "Robots follow a black line through a rescue course with obstacles and evacuation zones.",
      summaryFr: "Les robots suivent une ligne noire dans un parcours de sauvetage avec obstacles et zones d'evacuation.",
      bulletsEn: ["Points are awarded for completing course elements.", "Robots may need to recover from gaps or obstacles.", "Evacuation zones use victim objects and point multipliers."],
      bulletsFr: ["Des points sont accordes pour les elements completes.", "Les robots peuvent devoir recuperer apres des ecarts ou obstacles.", "La zone d'evacuation utilise des victimes et des multiplicateurs."]
    },
    "rescue maze": {
      slug: "rescue-maze",
      icon: "🧭",
      summaryEn: "Robots explore a simulated disaster maze to locate victims and deliver rescue kits.",
      summaryFr: "Les robots explorent un labyrinthe simulant une catastrophe pour localiser des victimes et livrer des trousses de secours.",
      bulletsEn: ["Designed as preparation for international Rescue divisions.", "Teams may participate in Rescue Maze and Rescue Line at qualifying events."],
      bulletsFr: ["Preparation aux divisions internationales de Rescue.", "Les equipes peuvent participer a Rescue Maze et Rescue Line aux evenements de qualification."]
    },
    soccer: {
      slug: "soccer",
      icon: "⚽",
      summaryEn: "Two autonomous robots compete against another pair by detecting and kicking a ball.",
      summaryFr: "Deux robots autonomes affrontent une autre paire en detectant et en frappant une balle.",
      bulletsEn: ["Lightweight uses an infrared ball.", "Open uses a vision-tracked orange ball.", "Each goal is worth 1 point."],
      bulletsFr: ["Lightweight utilise une balle infrarouge.", "Open utilise une balle orange suivie par vision.", "Chaque but vaut 1 point."]
    },
    onstage: {
      slug: "onstage",
      icon: "🎭",
      summaryEn: "Teams create a robotic performance combining engineering, music, and storytelling.",
      summaryFr: "Les equipes creent une performance robotique combinant ingenierie, musique et recit.",
      bulletsEn: ["Robots and students perform together on stage.", "Judges evaluate creativity and entertainment.", "Robot autonomy is considered during evaluation."],
      bulletsFr: ["Les robots et les eleves performent ensemble sur scene.", "Les juges evaluent creativite et divertissement.", "L'autonomie des robots est prise en compte lors de l'evaluation."]
    }
  };
  const DEMO_ADMIN_EMAIL = "admin@robocup.test";
  const DEMO_ADMIN_PASSWORD = "robocup123";
  const DEMO_ADMIN_SESSION_KEY = "robocupDemoAdminSession";
  const BRACKET_STORAGE_KEY = "robocupBracketState";
  const SITE_SETTINGS_STORAGE_KEY = "robocupSiteSettings";
  const DEFAULT_SITE_NAME = "RoboCupJunior Canada";
  const message = document.getElementById("auth-message") || document.getElementById("dashboard-message");
  const isFrench = document.documentElement.lang === "fr";
  const loginPage = isFrench ? "index_fr.html" : "index.html";
  const dashboardPage = isFrench ? "dashboard_fr.html" : "dashboard.html";
  let competitions = [];
  let cachedTeams = [];
  const labels = {
    supabaseMissing: isFrench
      ? "Supabase n'est pas encore configuré. Ajoutez l'URL du projet et la clé publique anon."
      : "Supabase is not configured yet. Add your project URL and anon public key.",
    checkingLogin: isFrench ? "Vérification de la connexion..." : "Checking login...",
    notAdmin: isFrench
      ? "Ce compte n'est pas approuvé comme administrateur."
      : "This account is not approved as an admin.",
    missingProfile: isFrench
      ? "Profil administrateur introuvable. Vérifiez la table profiles."
      : "Admin profile was not found. Check the profiles table.",
    selectTeam: isFrench ? "Sélectionner une équipe" : "Select team",
    noTeams: isFrench ? "Aucune équipe enregistrée." : "No teams saved yet.",
    delete: isFrench ? "Supprimer" : "Delete",
    deleteConfirm: (teamName) => isFrench
      ? `Supprimer ${teamName}? Les scores liés seront aussi supprimés.`
      : `Delete ${teamName}? This will also remove related scores.`,
    teamDeleted: isFrench ? "Équipe supprimée." : "Team deleted.",
    noScores: isFrench ? "Aucun score enregistré." : "No scores saved yet.",
    teamSaved: isFrench ? "Équipe enregistrée." : "Team saved.",
    scoreSaved: isFrench ? "Score enregistré." : "Score saved.",
    refreshed: isFrench ? "Tableau de bord actualisé." : "Dashboard refreshed.",
    selectCompetition: isFrench ? "Sélectionner une compétition" : "Select competition",
    bracketTeams: isFrench ? "équipes" : "teams",
    bracketNeedsTeams: isFrench
      ? "Ajoutez au moins deux équipes pour générer un tableau."
      : "Add at least two teams to generate a bracket.",
    bracketMissing: isFrench
      ? "Aucun tableau n'a encore été généré pour cette compétition."
      : "No bracket has been generated for this competition yet.",
    bracketStale: isFrench
      ? "La liste des équipes a changé. Régénérez le tableau pour synchroniser les matchs."
      : "The team list changed. Regenerate the bracket to sync the matches.",
    generateBracket: isFrench ? "Générer le tableau" : "Generate bracket",
    regenerateBracket: isFrench ? "Régénérer le tableau" : "Regenerate bracket",
    resetBracket: isFrench ? "Réinitialiser le tableau" : "Reset bracket",
    bracketGenerated: isFrench ? "Tableau généré." : "Bracket generated.",
    bracketReset: isFrench ? "Tableau réinitialisé." : "Bracket reset.",
    bracketSaved: isFrench ? "Résultat du match enregistré." : "Match result saved.",
    bracketNeedScores: isFrench
      ? "Entrez deux scores différents pour choisir un gagnant."
      : "Enter two different scores to choose a winner.",
    bracketWaiting: isFrench ? "En attente d'équipes" : "Waiting for teams",
    bracketBye: isFrench ? "Passe automatique" : "Bye advances automatically",
    bracketWinner: isFrench ? "Gagnant" : "Winner",
    bracketChampion: isFrench ? "Champion" : "Champion",
    noTeamName: isFrench ? "Équipe inconnue" : "Unknown team",
    siteNameRequired: isFrench ? "Entrez un nom de site pour les deux langues." : "Enter a site name for both languages.",
    siteSettingsSaved: isFrench ? "Paramètres du site enregistrés." : "Site settings saved.",
    siteSettingsReset: isFrench ? "Paramètres du site réinitialisés." : "Site settings reset.",
    heroByTab: {
      "tools-panel": {
        title: isFrench ? "Outils de compétition" : "Competition Tools",
        description: isFrench
          ? "Gérez les équipes, entrez les scores et préparez les résultats de compétition à partir d'un tableau de bord protégé."
          : "Manage teams, enter scores, and prepare competition results from one protected dashboard."
      },
      "brackets-panel": {
        title: isFrench ? "Tableaux de compétition" : "Competition Brackets",
        description: isFrench
          ? "Créez les tableaux, saisissez les scores de match et suivez automatiquement les gagnants de chaque ronde."
          : "Generate brackets, save match scores, and automatically track winners through each round."
      },
      "site-settings-panel": {
        title: isFrench ? "Paramètres du site" : "Site Settings",
        description: isFrench
          ? "Modifiez le nom du site et gérez les ligues affichées sur le site public depuis un seul endroit."
          : "Update the site name and manage leagues shown on the public website from one place."
      }
    },
    competitionNameRequired: isFrench ? "Entrez un nom de ligue." : "Enter a league name.",
    competitionExists: isFrench ? "Cette ligue existe déjà." : "This league already exists.",
    competitionAdded: isFrench ? "Ligue ajoutée." : "League added.",
    competitionRemoved: isFrench ? "Ligue supprimée." : "League removed.",
    competitionNeedOne: isFrench
      ? "Vous devez conserver au moins une ligue."
      : "You must keep at least one league.",
    competitionRemove: isFrench ? "Supprimer" : "Remove league",
    competitionEmpty: isFrench ? "Aucune ligue configurée." : "No leagues configured.",
    competitionRemoveConfirm: (competitionName, teamCount) => {
      if (teamCount > 0) {
        return isFrench
          ? `Supprimer ${competitionName}? ${teamCount} équipe(s) utilisent cette ligue. Elles ne seront pas supprimées.`
          : `Remove ${competitionName}? ${teamCount} team(s) are using this league. Teams will not be deleted.`;
      }

      return isFrench
        ? `Supprimer ${competitionName} de la liste des ligues?`
        : `Remove ${competitionName} from the leagues list?`;
    },
    leagueDetailsSaved: isFrench ? "Details de la ligue enregistres." : "League details saved.",
    leagueDetailsReset: isFrench ? "Details de la ligue reinitialises." : "League details reset.",
    leagueSelectRequired: isFrench ? "Selectionnez une ligue." : "Select a league.",
    slugExists: isFrench ? "Cet identifiant est deja utilise par une autre ligue." : "That slug is already used by another league."
  };
  competitions = getStoredCompetitions();

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.classList.remove("error", "success");
    if (type) message.classList.add(type);
  }

  function setupTabs() {
    const tabButtons = Array.from(document.querySelectorAll(".dashboard-tab"));
    const tabPanels = Array.from(document.querySelectorAll(".dashboard-tab-panel"));
    const heroTitle = document.getElementById("dashboard-hero-title");
    const heroDescription = document.getElementById("dashboard-hero-description");
    if (!tabButtons.length || !tabPanels.length) return;

    function updateHero(targetId) {
      if (!heroTitle || !heroDescription) return;
      const heroContent = labels.heroByTab[targetId] || labels.heroByTab["tools-panel"];
      heroTitle.textContent = heroContent.title;
      heroDescription.textContent = heroContent.description;
    }

    function activateTab(targetId) {
      tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tabTarget === targetId);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === targetId);
      });

      updateHero(targetId);
    }

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
    });

    const activeButton = tabButtons.find((button) => button.classList.contains("active"));
    activateTab(activeButton?.dataset.tabTarget || tabButtons[0].dataset.tabTarget);
  }

  function setupSiteSettingsTabs() {
    const tabButtons = Array.from(document.querySelectorAll(".site-settings-tab"));
    const tabPanels = Array.from(document.querySelectorAll(".site-settings-tab-panel"));
    if (!tabButtons.length || !tabPanels.length) return;

    function activateTab(targetId) {
      tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.settingsTabTarget === targetId);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === targetId);
      });
    }

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.settingsTabTarget));
    });

    const activeButton = tabButtons.find((button) => button.classList.contains("active"));
    activateTab(activeButton?.dataset.settingsTabTarget || tabButtons[0].dataset.settingsTabTarget);
  }

  function isDemoAdminLogin(email, password) {
    return email.toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD;
  }

  function isDemoAdminAuthenticated() {
    return localStorage.getItem(DEMO_ADMIN_SESSION_KEY) === "true";
  }

  function setDemoAdminAuthenticated() {
    localStorage.setItem(DEMO_ADMIN_SESSION_KEY, "true");
  }

  function clearDemoAdminAuthenticated() {
    localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
  }

  function requireSupabase() {
    if (isDemoAdminAuthenticated()) {
      return true;
    }

    if (window.isSupabaseConfigured && window.supabaseClient) {
      return true;
    }

    const warning = document.getElementById("setup-warning");
    if (warning) warning.hidden = false;
    setMessage(labels.supabaseMissing, "error");
    return false;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getDemoTeams() {
    try {
      return JSON.parse(localStorage.getItem("robocupDemoTeams") || "[]") || [];
    } catch (error) {
      return [];
    }
  }

  function saveDemoTeams(teams) {
    localStorage.setItem("robocupDemoTeams", JSON.stringify(teams));
  }

  function getDemoScores() {
    try {
      return JSON.parse(localStorage.getItem("robocupDemoScores") || "[]") || [];
    } catch (error) {
      return [];
    }
  }

  function saveDemoScores(scores) {
    localStorage.setItem("robocupDemoScores", JSON.stringify(scores));
  }

  function useDemoStorage() {
    return isDemoAdminAuthenticated() || !window.isSupabaseConfigured || !window.supabaseClient;
  }

  function normalizeCompetitionName(value) {
    return String(value || "").trim();
  }

  function normalizeLeagueKey(value) {
    return normalizeCompetitionName(value).toLowerCase();
  }

  function normalizeLeagueSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function parseMultiline(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function formatMultiline(items) {
    return (items || []).join("\n");
  }

  function getStoredLeagueDetails() {
    try {
      return JSON.parse(localStorage.getItem(LEAGUE_DETAILS_STORAGE_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function saveStoredLeagueDetails(detailsMap) {
    localStorage.setItem(LEAGUE_DETAILS_STORAGE_KEY, JSON.stringify(detailsMap));
    if (typeof window.applyRoboCupSiteSettings === "function") {
      window.applyRoboCupSiteSettings();
    }
  }

  function getDefaultLeagueDetails(leagueName) {
    const fallbackSummaryEn = `This league has been added by the admin team. Full rules for ${leagueName} will be posted soon.`;
    const fallbackSummaryFr = `Cette ligue a ete ajoutee par l'equipe d'administration. Les regles completes pour ${leagueName} seront publiees bientot.`;
    const defaults = DEFAULT_LEAGUE_DETAILS[normalizeLeagueKey(leagueName)];
    if (defaults) {
      return {
        slug: defaults.slug || "",
        icon: defaults.icon || "🤖",
        summaryEn: defaults.summaryEn || fallbackSummaryEn,
        summaryFr: defaults.summaryFr || fallbackSummaryFr,
        bulletsEn: Array.isArray(defaults.bulletsEn) ? defaults.bulletsEn.slice() : ["League details coming soon."],
        bulletsFr: Array.isArray(defaults.bulletsFr) ? defaults.bulletsFr.slice() : ["Details de la ligue a venir."]
      };
    }

    return {
      slug: "",
      icon: "🤖",
      summaryEn: fallbackSummaryEn,
      summaryFr: fallbackSummaryFr,
      bulletsEn: ["League details coming soon."],
      bulletsFr: ["Details de la ligue a venir."]
    };
  }

  function getLeagueDetails(leagueName) {
    const defaults = getDefaultLeagueDetails(leagueName);
    const allDetails = getStoredLeagueDetails();
    const custom = allDetails[normalizeLeagueKey(leagueName)] || {};
    return {
      slug: normalizeLeagueSlug(custom.slug || defaults.slug || ""),
      icon: normalizeCompetitionName(custom.icon || defaults.icon || "🤖") || "🤖",
      summaryEn: normalizeCompetitionName(custom.summaryEn || defaults.summaryEn || ""),
      summaryFr: normalizeCompetitionName(custom.summaryFr || defaults.summaryFr || ""),
      bulletsEn: Array.isArray(custom.bulletsEn) && custom.bulletsEn.length ? custom.bulletsEn : defaults.bulletsEn,
      bulletsFr: Array.isArray(custom.bulletsFr) && custom.bulletsFr.length ? custom.bulletsFr : defaults.bulletsFr
    };
  }

  function upsertLeagueDetails(leagueName, details) {
    const allDetails = getStoredLeagueDetails();
    allDetails[normalizeLeagueKey(leagueName)] = {
      slug: normalizeLeagueSlug(details.slug),
      icon: normalizeCompetitionName(details.icon) || "🤖",
      summaryEn: normalizeCompetitionName(details.summaryEn),
      summaryFr: normalizeCompetitionName(details.summaryFr),
      bulletsEn: parseMultiline(formatMultiline(details.bulletsEn)),
      bulletsFr: parseMultiline(formatMultiline(details.bulletsFr))
    };
    saveStoredLeagueDetails(allDetails);
  }

  function removeLeagueDetails(leagueName) {
    const allDetails = getStoredLeagueDetails();
    delete allDetails[normalizeLeagueKey(leagueName)];
    saveStoredLeagueDetails(allDetails);
  }

  function populateLeagueDetailsTargetOptions() {
    const select = document.getElementById("league-details-target");
    if (!select) return;

    const previousValue = select.value;
    select.innerHTML = competitions.map((competition) => (
      `<option value="${escapeHtml(competition)}">${escapeHtml(competition)}</option>`
    )).join("");

    if (!competitions.length) return;

    const nextValue = competitions.includes(previousValue) ? previousValue : competitions[0];
    select.value = nextValue;
    populateLeagueDetailsForm(nextValue);
  }

  function populateLeagueDetailsForm(leagueName) {
    const normalizedName = normalizeCompetitionName(leagueName);
    if (!normalizedName) return;

    const details = getLeagueDetails(normalizedName);
    const slugInput = document.getElementById("league-details-slug");
    const iconInput = document.getElementById("league-details-icon");
    const summaryEnInput = document.getElementById("league-details-summary-en");
    const summaryFrInput = document.getElementById("league-details-summary-fr");
    const bulletsEnInput = document.getElementById("league-details-bullets-en");
    const bulletsFrInput = document.getElementById("league-details-bullets-fr");

    if (slugInput) slugInput.value = details.slug;
    if (iconInput) iconInput.value = details.icon;
    if (summaryEnInput) summaryEnInput.value = details.summaryEn;
    if (summaryFrInput) summaryFrInput.value = details.summaryFr;
    if (bulletsEnInput) bulletsEnInput.value = formatMultiline(details.bulletsEn);
    if (bulletsFrInput) bulletsFrInput.value = formatMultiline(details.bulletsFr);
  }

  function resetLeagueDetailsFormToDefaults(leagueName) {
    removeLeagueDetails(leagueName);
    populateLeagueDetailsForm(leagueName);
  }

  function getStoredCompetitions() {
    try {
      const raw = JSON.parse(localStorage.getItem(COMPETITIONS_STORAGE_KEY) || "[]");
      const source = Array.isArray(raw) && raw.length ? raw : DEFAULT_COMPETITIONS;
      const cleaned = [];
      const seen = new Set();
      source.forEach((name) => {
        const normalized = normalizeCompetitionName(name);
        const key = normalized.toLowerCase();
        if (!normalized || seen.has(key)) return;
        seen.add(key);
        cleaned.push(normalized);
      });

      return cleaned.length ? cleaned : DEFAULT_COMPETITIONS.slice();
    } catch (error) {
      return DEFAULT_COMPETITIONS.slice();
    }
  }

  function saveCompetitions(nextCompetitions) {
    competitions = nextCompetitions.slice();
    localStorage.setItem(COMPETITIONS_STORAGE_KEY, JSON.stringify(competitions));
  }

  function populateTeamCompetitionOptions() {
    const teamCompetitionSelect = document.getElementById("team-competition");
    if (!teamCompetitionSelect) return;

    const previousValue = teamCompetitionSelect.value;
    teamCompetitionSelect.innerHTML = `<option value="">${labels.selectCompetition}</option>`;
    competitions.forEach((competition) => {
      const option = document.createElement("option");
      option.value = competition;
      option.textContent = competition;
      teamCompetitionSelect.appendChild(option);
    });

    if (previousValue && competitions.includes(previousValue)) {
      teamCompetitionSelect.value = previousValue;
    }
  }

  function renderCompetitionSettingsList() {
    const list = document.getElementById("competition-settings-list");
    if (!list) return;

    if (!competitions.length) {
      list.innerHTML = `<li class="competition-empty">${labels.competitionEmpty}</li>`;
      return;
    }

    list.innerHTML = competitions.map((competition) => `
      <li class="competition-settings-item">
        <span class="competition-name">${escapeHtml(competition)}</span>
        <button
          class="danger-action small-action remove-competition-button"
          type="button"
          data-competition="${escapeHtml(competition)}"
        >
          ${labels.competitionRemove}
        </button>
      </li>
    `).join("");
  }

  function refreshCompetitionViews() {
    populateTeamCompetitionOptions();
    renderCompetitionSettingsList();
    populateLeagueDetailsTargetOptions();
    renderBrackets(cachedTeams);
  }

  function normalizeSiteName(value) {
    return String(value || "").trim();
  }

  function getSiteSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SITE_SETTINGS_STORAGE_KEY) || "{}") || {};
      const siteNameEn = normalizeSiteName(raw.siteNameEn) || DEFAULT_SITE_NAME;
      const siteNameFr = normalizeSiteName(raw.siteNameFr) || siteNameEn;
      return { siteNameEn, siteNameFr };
    } catch (error) {
      return { siteNameEn: DEFAULT_SITE_NAME, siteNameFr: DEFAULT_SITE_NAME };
    }
  }

  function saveSiteSettings(settings) {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (typeof window.applyRoboCupSiteSettings === "function") {
      window.applyRoboCupSiteSettings();
    }
  }

  function populateSiteSettingsForm() {
    const form = document.getElementById("site-settings-form");
    if (!form) return;

    const settings = getSiteSettings();
    const nameEnInput = document.getElementById("site-name-en");
    const nameFrInput = document.getElementById("site-name-fr");
    if (nameEnInput) nameEnInput.value = settings.siteNameEn;
    if (nameFrInput) nameFrInput.value = settings.siteNameFr;
  }

  function getBracketState() {
    try {
      return JSON.parse(localStorage.getItem(BRACKET_STORAGE_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function saveBracketState(state) {
    localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(state));
  }

  function setCompetitionBracket(competition, bracket) {
    const state = getBracketState();
    state[competition] = bracket;
    saveBracketState(state);
  }

  function clearCompetitionBracket(competition) {
    const state = getBracketState();
    delete state[competition];
    saveBracketState(state);
  }

  function normalizeId(value) {
    return value == null ? null : String(value);
  }

  function getTeamMap(teams) {
    return Object.fromEntries(teams.map((team) => [normalizeId(team.id), team]));
  }

  function getTeamsForCompetition(teams, competition) {
    return teams.filter((team) => team.competition === competition);
  }

  function arraysEqual(left, right) {
    if (left.length !== right.length) return false;
    return left.every((value, index) => value === right[index]);
  }

  function isBracketStale(bracket, teams) {
    if (!bracket) return false;
    const currentIds = teams.map((team) => normalizeId(team.id)).sort();
    const bracketIds = (bracket.teamIds || []).map((teamId) => normalizeId(teamId)).sort();
    return !arraysEqual(currentIds, bracketIds);
  }

  function nextPowerOfTwo(value) {
    let size = 1;
    while (size < value) size *= 2;
    return size;
  }

  function getRoundLabel(roundNumber, totalRounds) {
    if (roundNumber === totalRounds) {
      return isFrench ? "Finale" : "Final";
    }

    if (roundNumber === totalRounds - 1) {
      return isFrench ? "Demi-finales" : "Semifinals";
    }

    if (roundNumber === totalRounds - 2) {
      return isFrench ? "Quarts de finale" : "Quarterfinals";
    }

    return isFrench ? `Ronde ${roundNumber}` : `Round ${roundNumber}`;
  }

  function parseScore(value) {
    if (value === "" || value == null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getMatchWinner(match) {
    if (match.teamAId && !match.teamBId) return match.teamAId;
    if (!match.teamAId && match.teamBId) return match.teamBId;
    if (!match.teamAId && !match.teamBId) return null;

    const scoreA = parseScore(match.teamAScore);
    const scoreB = parseScore(match.teamBScore);
    if (scoreA == null || scoreB == null || scoreA === scoreB) return null;
    return scoreA > scoreB ? match.teamAId : match.teamBId;
  }

  function recalculateBracket(bracket) {
    bracket.rounds.forEach((round, roundIndex) => {
      round.forEach((match) => {
        match.winnerId = getMatchWinner(match);
      });

      const nextRound = bracket.rounds[roundIndex + 1];
      if (!nextRound) return;

      const desiredAssignments = nextRound.map(() => ({ teamAId: null, teamBId: null }));
      round.forEach((match, matchIndex) => {
        const nextIndex = Math.floor(matchIndex / 2);
        const slotKey = matchIndex % 2 === 0 ? "teamAId" : "teamBId";
        desiredAssignments[nextIndex][slotKey] = match.winnerId;
      });

      nextRound.forEach((match, matchIndex) => {
        const desired = desiredAssignments[matchIndex];
        const teamAId = desired.teamAId;
        const teamBId = desired.teamBId;
        if (match.teamAId !== teamAId || match.teamBId !== teamBId) {
          match.teamAId = teamAId;
          match.teamBId = teamBId;
          match.teamAScore = "";
          match.teamBScore = "";
          match.winnerId = null;
        }
      });
    });

    const finalRound = bracket.rounds[bracket.rounds.length - 1] || [];
    bracket.championId = finalRound[0]?.winnerId || null;
    return bracket;
  }

  function createBracket(competition, teams) {
    const seededTeams = teams
      .slice()
      .sort((left, right) => left.team_name.localeCompare(right.team_name));
    const size = nextPowerOfTwo(seededTeams.length);
    const totalRounds = Math.log2(size);
    const rounds = [];
    let teamIndex = 0;

    for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber += 1) {
      const matchCount = size / (2 ** roundNumber);
      const matches = [];
      for (let matchNumber = 1; matchNumber <= matchCount; matchNumber += 1) {
        const match = {
          id: `${competition}-${roundNumber}-${matchNumber}`,
          roundNumber,
          matchNumber,
          teamAId: null,
          teamBId: null,
          teamAScore: "",
          teamBScore: "",
          winnerId: null
        };

        if (roundNumber === 1) {
          match.teamAId = normalizeId(seededTeams[teamIndex]?.id);
          teamIndex += 1;
          match.teamBId = normalizeId(seededTeams[teamIndex]?.id);
          teamIndex += 1;
        }

        matches.push(match);
      }
      rounds.push(matches);
    }

    return recalculateBracket({
      competition,
      generatedAt: new Date().toISOString(),
      teamIds: seededTeams.map((team) => normalizeId(team.id)),
      rounds,
      championId: null
    });
  }

  function getMatchStatus(match, teamLookup) {
    if (!match.teamAId && !match.teamBId) {
      return { text: labels.bracketWaiting, pending: true };
    }

    if ((match.teamAId && !match.teamBId) || (!match.teamAId && match.teamBId)) {
      return { text: labels.bracketBye, pending: false };
    }

    if (!match.winnerId) {
      return { text: labels.bracketWaiting, pending: true };
    }

    const winner = teamLookup[normalizeId(match.winnerId)];
    return {
      text: `${labels.bracketWinner}: ${escapeHtml(winner?.team_name || labels.noTeamName)}`,
      pending: false
    };
  }

  function renderBracketMatch(match, competition, teamLookup) {
    const teamA = teamLookup[normalizeId(match.teamAId)];
    const teamB = teamLookup[normalizeId(match.teamBId)];
    const status = getMatchStatus(match, teamLookup);
    const canSave = Boolean(match.teamAId && match.teamBId);
    const teamAName = teamA?.team_name || labels.bracketWaiting;
    const teamBName = teamB?.team_name || labels.bracketWaiting;

    return `
      <article class="match-card">
        <div class="match-card-header">
          <span>${isFrench ? "Match" : "Match"} ${match.matchNumber}</span>
          <span class="match-status${status.pending ? " pending" : ""}">${status.text}</span>
        </div>
        <div class="match-teams">
          <div class="match-team${normalizeId(match.winnerId) === normalizeId(match.teamAId) ? " winner" : ""}">
            <span class="match-team-name${teamA ? "" : " placeholder"}">${escapeHtml(teamAName)}</span>
            <input
              class="score-input"
              type="number"
              step="0.01"
              data-score-slot="teamA"
              value="${escapeHtml(match.teamAScore)}"
              ${canSave ? "" : "disabled"}
            />
          </div>
          <div class="match-team${normalizeId(match.winnerId) === normalizeId(match.teamBId) ? " winner" : ""}">
            <span class="match-team-name${teamB ? "" : " placeholder"}">${escapeHtml(teamBName)}</span>
            <input
              class="score-input"
              type="number"
              step="0.01"
              data-score-slot="teamB"
              value="${escapeHtml(match.teamBScore)}"
              ${canSave ? "" : "disabled"}
            />
          </div>
        </div>
        <div class="match-card-footer">
          <span class="match-note">${canSave ? "" : labels.bracketBye}</span>
          <button
            class="secondary-action small-action save-match-button"
            type="button"
            data-competition="${escapeHtml(competition)}"
            data-round-number="${match.roundNumber}"
            data-match-number="${match.matchNumber}"
            ${canSave ? "" : "disabled"}
          >
            ${isFrench ? "Enregistrer le match" : "Save match"}
          </button>
        </div>
      </article>
    `;
  }

  function renderCompetitionBracket(competition, teams, bracket, teamLookup) {
    const stale = isBracketStale(bracket, teams);
    const hasBracket = Boolean(bracket && bracket.rounds?.length);
    const headingBadges = [
      `<span class="bracket-badge">${teams.length} ${labels.bracketTeams}</span>`
    ];
    if (stale) {
      headingBadges.push(`<span class="bracket-badge warning">${labels.bracketStale}</span>`);
    }

    let content = `<div class="bracket-empty">${labels.bracketMissing}</div>`;
    if (teams.length < 2) {
      content = `<div class="bracket-empty">${labels.bracketNeedsTeams}</div>`;
    } else if (hasBracket) {
      content = `
        <div class="bracket-rounds">
          ${bracket.rounds.map((round) => `
            <section class="bracket-round">
              <h4>${getRoundLabel(round[0].roundNumber, bracket.rounds.length)}</h4>
              <div class="round-match-list">
                ${round.map((match) => renderBracketMatch(match, competition, teamLookup)).join("")}
              </div>
            </section>
          `).join("")}
        </div>
        ${bracket.championId ? `
          <div class="champion-banner">
            ${labels.bracketChampion}: ${escapeHtml(teamLookup[normalizeId(bracket.championId)]?.team_name || labels.noTeamName)}
          </div>
        ` : ""}
      `;
    }

    return `
      <article class="competition-bracket">
        <div class="competition-bracket-header">
          <div>
            <h3>${escapeHtml(competition)}</h3>
            <div class="competition-bracket-meta">${headingBadges.join("")}</div>
          </div>
          <div class="bracket-actions">
            <button
              class="primary-action small-action generate-bracket-button"
              type="button"
              data-competition="${escapeHtml(competition)}"
              ${teams.length < 2 ? "disabled" : ""}
            >
              ${hasBracket ? labels.regenerateBracket : labels.generateBracket}
            </button>
            <button
              class="danger-action small-action reset-bracket-button"
              type="button"
              data-competition="${escapeHtml(competition)}"
              ${hasBracket ? "" : "disabled"}
            >
              ${labels.resetBracket}
            </button>
          </div>
        </div>
        ${content}
      </article>
    `;
  }

  function renderBrackets(teams) {
    const container = document.getElementById("brackets-container");
    if (!container) return;

    const bracketState = getBracketState();
    const teamLookup = getTeamMap(teams);
    container.innerHTML = competitions.map((competition) => {
      const competitionTeams = getTeamsForCompetition(teams, competition);
      return renderCompetitionBracket(competition, competitionTeams, bracketState[competition], teamLookup);
    }).join("");
  }

  function generateCompetitionBracket(competition) {
    const teams = getTeamsForCompetition(cachedTeams, competition);
    if (teams.length < 2) {
      setMessage(labels.bracketNeedsTeams, "error");
      return;
    }

    const bracket = createBracket(competition, teams);
    setCompetitionBracket(competition, bracket);
    renderBrackets(cachedTeams);
    setMessage(labels.bracketGenerated, "success");
  }

  function resetCompetitionBracket(competition) {
    clearCompetitionBracket(competition);
    renderBrackets(cachedTeams);
    setMessage(labels.bracketReset, "success");
  }

  function saveBracketMatchResult(competition, roundNumber, matchNumber, teamAScore, teamBScore) {
    const bracketState = getBracketState();
    const bracket = bracketState[competition];
    if (!bracket) {
      setMessage(labels.bracketMissing, "error");
      return;
    }

    const match = bracket.rounds[roundNumber - 1]?.find((item) => item.matchNumber === matchNumber);
    if (!match || !match.teamAId || !match.teamBId) {
      setMessage(labels.bracketWaiting, "error");
      return;
    }

    const parsedA = parseScore(teamAScore);
    const parsedB = parseScore(teamBScore);
    if (parsedA == null || parsedB == null || parsedA === parsedB) {
      setMessage(labels.bracketNeedScores, "error");
      return;
    }

    match.teamAScore = String(parsedA);
    match.teamBScore = String(parsedB);
    recalculateBracket(bracket);
    setCompetitionBracket(competition, bracket);
    renderBrackets(cachedTeams);
    setMessage(labels.bracketSaved, "success");
  }

  async function getProfile(userId) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async function requireAdmin() {
    if (isDemoAdminAuthenticated()) {
      return { id: "demo-admin", email: DEMO_ADMIN_EMAIL };
    }

    if (!requireSupabase()) return null;

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !sessionData.session) {
      window.location.href = loginPage;
      return null;
    }

    const user = sessionData.session.user;
    const profile = await getProfile(user.id);
    if (!profile || profile.role !== "admin") {
      await supabaseClient.auth.signOut();
      window.location.href = loginPage;
      return null;
    }

    return user;
  }

  async function login(email, password) {
    if (isDemoAdminLogin(email, password)) {
      setDemoAdminAuthenticated();
      setMessage("Demo admin login successful.", "success");
      window.location.href = "dashboard.html";
      return;
    }

    if (!requireSupabase()) return;

    setMessage(labels.checkingLogin);
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message, "error");
      return;
    }

    try {
      const profile = await getProfile(data.user.id);
      if (!profile || profile.role !== "admin") {
        await supabaseClient.auth.signOut();
        setMessage(labels.notAdmin, "error");
        return;
      }
      window.location.href = dashboardPage;
    } catch (profileError) {
      await supabaseClient.auth.signOut();
      setMessage(labels.missingProfile, "error");
    }
  }

  async function loadTeams() {
    const teamSelect = document.getElementById("score-team");
    const teamsTable = document.getElementById("teams-table");
    if (!teamSelect && !teamsTable) return [];

    if (useDemoStorage()) {
      const demoTeams = getDemoTeams().slice().sort((a, b) => a.team_name.localeCompare(b.team_name));
      if (teamSelect) {
        teamSelect.innerHTML = '<option value="">Select team</option>';
        demoTeams.forEach((team) => {
          const option = document.createElement("option");
          option.value = team.id;
          option.dataset.competition = team.competition;
          option.textContent = `${team.team_name} (${team.competition})`;
          teamSelect.appendChild(option);
        });
      }

      if (teamsTable) {
        if (!demoTeams.length) {
          teamsTable.innerHTML = '<tr><td colspan="4">No teams saved yet.</td></tr>';
        } else {
          teamsTable.innerHTML = demoTeams.map((team) => `
            <tr>
              <td>${escapeHtml(team.team_name)}</td>
              <td>${escapeHtml(team.competition)}</td>
              <td>${escapeHtml(team.school || "-")}</td>
              <td>
                <button
                  class="danger-action small-action delete-team-button"
                  type="button"
                  data-team-id="${team.id}"
                  data-team-name="${escapeHtml(team.team_name)}"
                >
                  Delete
                </button>
              </td>
            </tr>
          `).join("");
        }
      }
      cachedTeams = demoTeams;
      renderBrackets(cachedTeams);
      return demoTeams;
    }

    const { data, error } = await supabaseClient
      .from("teams")
      .select("id, team_name, competition, school")
      .order("team_name", { ascending: true });

    if (error) throw error;

    if (teamSelect) {
      teamSelect.innerHTML = `<option value="">${labels.selectTeam}</option>`;
    }

    data.forEach((team) => {
      if (!teamSelect) return;
      const option = document.createElement("option");
      option.value = team.id;
      option.dataset.competition = team.competition;
      option.textContent = `${team.team_name} (${team.competition})`;
      teamSelect.appendChild(option);
    });

    if (teamsTable) {
      if (!data.length) {
        teamsTable.innerHTML = `<tr><td colspan="4">${labels.noTeams}</td></tr>`;
      } else {
        teamsTable.innerHTML = data.map((team) => `
          <tr>
            <td>${escapeHtml(team.team_name)}</td>
            <td>${escapeHtml(team.competition)}</td>
            <td>${escapeHtml(team.school || "-")}</td>
            <td>
              <button
                class="danger-action small-action delete-team-button"
                type="button"
                data-team-id="${team.id}"
                data-team-name="${escapeHtml(team.team_name)}"
              >
                ${labels.delete}
              </button>
            </td>
          </tr>
        `).join("");
      }
    }

    cachedTeams = data;
    renderBrackets(cachedTeams);
    return data;
  }

  async function deleteTeam(teamId, teamName) {
    const confirmed = window.confirm(labels.deleteConfirm(teamName));
    if (!confirmed) return;

    if (useDemoStorage()) {
      const remainingTeams = getDemoTeams().filter((team) => String(team.id) !== String(teamId));
      saveDemoTeams(remainingTeams);
      const remainingScores = getDemoScores().filter((score) => String(score.team_id) !== String(teamId));
      saveDemoScores(remainingScores);
      await loadTeams();
      await loadScores();
      setMessage("Team deleted.", "success");
      return;
    }

    const { error } = await supabaseClient
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (error) throw error;

    await loadTeams();
    await loadScores();
    setMessage(labels.teamDeleted, "success");
  }

  async function loadScores() {
    const tableBody = document.getElementById("scores-table");
    if (!tableBody) return;

    if (useDemoStorage()) {
      const demoTeams = getDemoTeams();
      const demoScores = getDemoScores()
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);

      if (!demoScores.length) {
        tableBody.innerHTML = '<tr><td colspan="5">No scores saved yet.</td></tr>';
        return;
      }

      const teamLookup = Object.fromEntries(demoTeams.map((team) => [String(team.id), team.team_name]));
      tableBody.innerHTML = demoScores.map((row) => `
        <tr>
          <td>${escapeHtml(teamLookup[String(row.team_id)] || "-")}</td>
          <td>${escapeHtml(row.competition || "-")}</td>
          <td>${row.round_number}</td>
          <td>${row.score}</td>
          <td>${escapeHtml(row.notes || "")}</td>
        </tr>
      `).join("");
      return;
    }

    const { data, error } = await supabaseClient
      .from("scores")
      .select("round_number, score, notes, competition, teams(team_name)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!data.length) {
      tableBody.innerHTML = `<tr><td colspan="5">${labels.noScores}</td></tr>`;
      return;
    }

    tableBody.innerHTML = data.map((row) => `
      <tr>
        <td>${escapeHtml(row.teams?.team_name || "-")}</td>
        <td>${escapeHtml(row.competition || "-")}</td>
        <td>${row.round_number}</td>
        <td>${row.score}</td>
        <td>${escapeHtml(row.notes || "")}</td>
      </tr>
    `).join("");
  }

  async function setupDashboard() {
    const user = await requireAdmin();
    if (!user) return;

    const emailLabel = document.getElementById("admin-email");
    if (emailLabel) emailLabel.textContent = user.email;

    try {
      refreshCompetitionViews();
      await loadTeams();
      await loadScores();
      populateSiteSettingsForm();
    } catch (error) {
      setMessage(error.message, "error");
    }
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      login(
        document.getElementById("email").value.trim(),
        document.getElementById("password").value
      );
    });
  }

  const teamForm = document.getElementById("team-form");
  if (teamForm) {
    setupTabs();
    setupSiteSettingsTabs();
    setupDashboard();

    teamForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const teamName = document.getElementById("team-name").value.trim();
        const competition = document.getElementById("team-competition").value;
        const school = document.getElementById("team-school").value.trim();

        if (useDemoStorage()) {
          const teams = getDemoTeams();
          teams.push({
            id: Date.now(),
            team_name: teamName,
            competition,
            school,
            created_at: new Date().toISOString()
          });
          saveDemoTeams(teams);
          teamForm.reset();
          await loadTeams();
          await loadScores();
          setMessage("Team saved locally.", "success");
          return;
        }

        const { error } = await supabaseClient.from("teams").insert({
          team_name: teamName,
          competition,
          school
        });
        if (error) throw error;
        teamForm.reset();
        await loadTeams();
        await loadScores();
        setMessage(labels.teamSaved, "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  }

  const scoreForm = document.getElementById("score-form");
  if (scoreForm) {
    scoreForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const selectedTeam = document.getElementById("score-team").selectedOptions[0];
        const teamId = Number(document.getElementById("score-team").value);
        const competition = selectedTeam.dataset.competition;
        const roundNumber = Number(document.getElementById("score-round").value);
        const scoreValue = Number(document.getElementById("score-value").value);
        const notes = document.getElementById("score-notes").value.trim();

        if (useDemoStorage()) {
          const scores = getDemoScores();
          scores.push({
            team_id: teamId,
            competition,
            round_number: roundNumber,
            score: scoreValue,
            notes,
            created_at: new Date().toISOString(),
            created_by: "demo-admin"
          });
          saveDemoScores(scores);
          scoreForm.reset();
          document.getElementById("score-round").value = "1";
          await loadScores();
          setMessage("Score saved locally.", "success");
          return;
        }

        const userResult = await supabaseClient.auth.getUser();
        const { error } = await supabaseClient.from("scores").insert({
          team_id: teamId,
          competition,
          round_number: roundNumber,
          score: scoreValue,
          notes,
          created_by: userResult.data.user.id
        });
        if (error) throw error;
        scoreForm.reset();
        document.getElementById("score-round").value = "1";
        await loadScores();
        setMessage(labels.scoreSaved, "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  }

  const teamsTable = document.getElementById("teams-table");
  if (teamsTable) {
    teamsTable.addEventListener("click", async (event) => {
      const button = event.target.closest(".delete-team-button");
      if (!button) return;

      try {
        await deleteTeam(Number(button.dataset.teamId), button.dataset.teamName);
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  }

  const bracketsContainer = document.getElementById("brackets-container");
  if (bracketsContainer) {
    bracketsContainer.addEventListener("click", (event) => {
      const generateButton = event.target.closest(".generate-bracket-button");
      if (generateButton) {
        generateCompetitionBracket(generateButton.dataset.competition);
        return;
      }

      const resetButton = event.target.closest(".reset-bracket-button");
      if (resetButton) {
        resetCompetitionBracket(resetButton.dataset.competition);
        return;
      }

      const saveMatchButton = event.target.closest(".save-match-button");
      if (!saveMatchButton) return;

      const matchCard = saveMatchButton.closest(".match-card");
      const teamAScore = matchCard.querySelector('[data-score-slot="teamA"]').value;
      const teamBScore = matchCard.querySelector('[data-score-slot="teamB"]').value;
      saveBracketMatchResult(
        saveMatchButton.dataset.competition,
        Number(saveMatchButton.dataset.roundNumber),
        Number(saveMatchButton.dataset.matchNumber),
        teamAScore,
        teamBScore
      );
    });
  }

  const refreshButton = document.getElementById("refresh-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      try {
        await loadTeams();
        await loadScores();
        renderBrackets(cachedTeams);
        setMessage(labels.refreshed, "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  }

  const siteSettingsForm = document.getElementById("site-settings-form");
  if (siteSettingsForm) {
    siteSettingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const siteNameEn = normalizeSiteName(document.getElementById("site-name-en").value);
      const siteNameFr = normalizeSiteName(document.getElementById("site-name-fr").value);
      if (!siteNameEn || !siteNameFr) {
        setMessage(labels.siteNameRequired, "error");
        return;
      }

      saveSiteSettings({ siteNameEn, siteNameFr });
      setMessage(labels.siteSettingsSaved, "success");
    });
  }

  const siteSettingsResetButton = document.getElementById("site-settings-reset");
  if (siteSettingsResetButton) {
    siteSettingsResetButton.addEventListener("click", () => {
      const defaults = { siteNameEn: DEFAULT_SITE_NAME, siteNameFr: DEFAULT_SITE_NAME };
      saveSiteSettings(defaults);
      saveCompetitions(DEFAULT_COMPETITIONS.slice());
      localStorage.removeItem(LEAGUE_DETAILS_STORAGE_KEY);
      populateSiteSettingsForm();
      refreshCompetitionViews();
      setMessage(labels.siteSettingsReset, "success");
    });
  }

  const competitionSettingsForm = document.getElementById("competition-settings-form");
  if (competitionSettingsForm) {
    competitionSettingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = document.getElementById("competition-name-input");
      const competitionName = normalizeCompetitionName(input?.value);
      if (!competitionName) {
        setMessage(labels.competitionNameRequired, "error");
        return;
      }

      const exists = competitions.some((item) => item.toLowerCase() === competitionName.toLowerCase());
      if (exists) {
        setMessage(labels.competitionExists, "error");
        return;
      }

      const nextCompetitions = competitions.concat(competitionName);
      saveCompetitions(nextCompetitions);
      const defaults = getDefaultLeagueDetails(competitionName);
      upsertLeagueDetails(competitionName, defaults);
      refreshCompetitionViews();
      if (input) input.value = "";
      setMessage(labels.competitionAdded, "success");
    });
  }

  const competitionSettingsList = document.getElementById("competition-settings-list");
  if (competitionSettingsList) {
    competitionSettingsList.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".remove-competition-button");
      if (!removeButton) return;

      if (competitions.length <= 1) {
        setMessage(labels.competitionNeedOne, "error");
        return;
      }

      const competitionToRemove = removeButton.dataset.competition;
      const teamsUsingCompetition = cachedTeams.filter((team) => team.competition === competitionToRemove).length;
      const confirmed = window.confirm(labels.competitionRemoveConfirm(competitionToRemove, teamsUsingCompetition));
      if (!confirmed) return;

      const nextCompetitions = competitions.filter((item) => item !== competitionToRemove);
      saveCompetitions(nextCompetitions);
      removeLeagueDetails(competitionToRemove);
      clearCompetitionBracket(competitionToRemove);
      refreshCompetitionViews();
      setMessage(labels.competitionRemoved, "success");
    });
  }

  const leagueDetailsTarget = document.getElementById("league-details-target");
  if (leagueDetailsTarget) {
    leagueDetailsTarget.addEventListener("change", () => {
      populateLeagueDetailsForm(leagueDetailsTarget.value);
    });
  }

  const leagueDetailsForm = document.getElementById("league-details-form");
  if (leagueDetailsForm) {
    leagueDetailsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const leagueName = normalizeCompetitionName(document.getElementById("league-details-target")?.value);
      if (!leagueName) {
        setMessage(labels.leagueSelectRequired, "error");
        return;
      }

      const slug = normalizeLeagueSlug(document.getElementById("league-details-slug")?.value);
      if (slug) {
        const slugInUse = competitions
          .filter((item) => item !== leagueName)
          .some((item) => getLeagueDetails(item).slug === slug);
        if (slugInUse) {
          setMessage(labels.slugExists, "error");
          return;
        }
      }

      upsertLeagueDetails(leagueName, {
        slug,
        icon: document.getElementById("league-details-icon")?.value,
        summaryEn: document.getElementById("league-details-summary-en")?.value,
        summaryFr: document.getElementById("league-details-summary-fr")?.value,
        bulletsEn: parseMultiline(document.getElementById("league-details-bullets-en")?.value),
        bulletsFr: parseMultiline(document.getElementById("league-details-bullets-fr")?.value)
      });

      populateLeagueDetailsForm(leagueName);
      setMessage(labels.leagueDetailsSaved, "success");
    });
  }

  const leagueDetailsResetButton = document.getElementById("league-details-reset");
  if (leagueDetailsResetButton) {
    leagueDetailsResetButton.addEventListener("click", () => {
      const leagueName = normalizeCompetitionName(document.getElementById("league-details-target")?.value);
      if (!leagueName) {
        setMessage(labels.leagueSelectRequired, "error");
        return;
      }

      resetLeagueDetailsFormToDefaults(leagueName);
      setMessage(labels.leagueDetailsReset, "success");
    });
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      clearDemoAdminAuthenticated();
      if (window.isSupabaseConfigured && window.supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      window.location.href = loginPage;
    });
  }
})();
