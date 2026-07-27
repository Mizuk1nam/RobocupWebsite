(function () {
  const COMPETITIONS = [
    "Maze",
    "Formula 1",
    "Performance",
    "SumoBots",
    "Rescue Line",
    "Rescue Maze",
    "Soccer",
    "OnStage"
  ];
  const BRACKET_COMPETITIONS = COMPETITIONS.slice();
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
    siteSettingsReset: isFrench ? "Paramètres du site réinitialisés." : "Site settings reset."
  };

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.classList.remove("error", "success");
    if (type) message.classList.add(type);
  }

  function setupTabs() {
    const tabButtons = Array.from(document.querySelectorAll(".dashboard-tab"));
    const tabPanels = Array.from(document.querySelectorAll(".dashboard-tab-panel"));
    if (!tabButtons.length || !tabPanels.length) return;

    function activateTab(targetId) {
      tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tabTarget === targetId);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === targetId);
      });
    }

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
    });
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
    container.innerHTML = BRACKET_COMPETITIONS.map((competition) => {
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
      populateSiteSettingsForm();
      setMessage(labels.siteSettingsReset, "success");
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
