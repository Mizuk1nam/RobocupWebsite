(function () {
  const message = document.getElementById("auth-message") || document.getElementById("dashboard-message");

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.classList.remove("error", "success");
    if (type) message.classList.add(type);
  }

  function requireSupabase() {
    if (window.isSupabaseConfigured && window.supabaseClient) {
      return true;
    }

    const warning = document.getElementById("setup-warning");
    if (warning) warning.hidden = false;
    setMessage("Supabase is not configured yet. Add your project URL and anon public key.", "error");
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
    if (!requireSupabase()) return null;

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !sessionData.session) {
      window.location.href = "index.html";
      return null;
    }

    const user = sessionData.session.user;
    const profile = await getProfile(user.id);
    if (!profile || profile.role !== "admin") {
      await supabaseClient.auth.signOut();
      window.location.href = "index.html";
      return null;
    }

    return user;
  }

  async function login(email, password) {
    if (!requireSupabase()) return;

    setMessage("Checking login...");
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message, "error");
      return;
    }

    try {
      const profile = await getProfile(data.user.id);
      if (!profile || profile.role !== "admin") {
        await supabaseClient.auth.signOut();
        setMessage("This account is not approved as an admin.", "error");
        return;
      }
      window.location.href = "dashboard.html";
    } catch (profileError) {
      await supabaseClient.auth.signOut();
      setMessage("Admin profile was not found. Check the profiles table.", "error");
    }
  }

  async function loadTeams() {
    const teamSelect = document.getElementById("score-team");
    const teamsTable = document.getElementById("teams-table");
    if (!teamSelect && !teamsTable) return [];

    const { data, error } = await supabaseClient
      .from("teams")
      .select("id, team_name, competition, school")
      .order("team_name", { ascending: true });

    if (error) throw error;

    if (teamSelect) {
      teamSelect.innerHTML = '<option value="">Select team</option>';
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
        teamsTable.innerHTML = '<tr><td colspan="4">No teams saved yet.</td></tr>';
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
                Delete
              </button>
            </td>
          </tr>
        `).join("");
      }
    }

    return data;
  }

  async function deleteTeam(teamId, teamName) {
    const confirmed = window.confirm(`Delete ${teamName}? This will also remove related scores.`);
    if (!confirmed) return;

    const { error } = await supabaseClient
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (error) throw error;

    await loadTeams();
    await loadScores();
    setMessage("Team deleted.", "success");
  }

  async function loadScores() {
    const tableBody = document.getElementById("scores-table");
    if (!tableBody) return;

    const { data, error } = await supabaseClient
      .from("scores")
      .select("round_number, score, notes, competition, teams(team_name)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="5">No scores saved yet.</td></tr>';
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
    setupDashboard();

    teamForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const { error } = await supabaseClient.from("teams").insert({
          team_name: document.getElementById("team-name").value.trim(),
          competition: document.getElementById("team-competition").value,
          school: document.getElementById("team-school").value.trim()
        });
        if (error) throw error;
        teamForm.reset();
        await loadTeams();
        await loadScores();
        setMessage("Team saved.", "success");
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
        const userResult = await supabaseClient.auth.getUser();
        const selectedTeam = document.getElementById("score-team").selectedOptions[0];
        const { error } = await supabaseClient.from("scores").insert({
          team_id: Number(document.getElementById("score-team").value),
          competition: selectedTeam.dataset.competition,
          round_number: Number(document.getElementById("score-round").value),
          score: Number(document.getElementById("score-value").value),
          notes: document.getElementById("score-notes").value.trim(),
          created_by: userResult.data.user.id
        });
        if (error) throw error;
        scoreForm.reset();
        document.getElementById("score-round").value = "1";
        await loadScores();
        setMessage("Score saved.", "success");
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

  const refreshButton = document.getElementById("refresh-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      try {
        await loadTeams();
        await loadScores();
        setMessage("Dashboard refreshed.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      if (requireSupabase()) {
        await supabaseClient.auth.signOut();
      }
      window.location.href = "index.html";
    });
  }
})();
