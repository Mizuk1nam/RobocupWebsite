(function () {
  const SETTINGS_KEY = "robocupSiteSettings";
  const LEAGUES_KEY = "robocupCompetitions";
  const SCHEDULE_COMPETITIONS_KEY = "robocupScheduleCompetitions";
  const SCHEDULE_EVENTS_KEY = "robocupScheduleEvents";
  const LEAGUE_DETAILS_KEY = "robocupLeagueDetails";
  const SUPABASE_URL = String(window.ROBOCUP_SUPABASE_URL || window.SUPABASE_URL || "https://vexxlnugvrlkliyijltv.supabase.co").trim();
  const SUPABASE_ANON_KEY = String(window.ROBOCUP_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleHhsbnVndnJsa2xpeWlqbHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODU3NzEsImV4cCI6MjA5ODM2MTc3MX0.G2MgcHCSsIg2cqtnqVDl7CBYNzddA0FSoBlPRtG9-jc").trim();
  const APP_CONFIG_KEYS = [
    "site_settings",
    "competitions",
    "schedule_competitions",
    "schedule_events",
    "league_details"
  ];
  const DEFAULT_SITE_NAME = "RoboCupJunior Canada";
  const MAX_INTERNATIONAL_GALLERY_IMAGES = 25;
  const INTERNATIONAL_GALLERY_IMAGE_CATALOG = [
    "Award Ceremony.jpg",
    "Awards and Trophy_Vancouver.jpg",
    "Code and Build.jpg",
    "Engineering.jpg",
    "FI.jpg",
    "Home and School Bake Sale_parents.jpg",
    "Home and School Bake Sale_students.jpg",
    "OnStage League.jpg",
    "Rescue Line League Challenge 1.jpg",
    "Rescue Line League Challenge 2.jpg",
    "Rescue Line League evac.2.jpg",
    "Rescue Line League.jpg",
    "Rescue Line League_evac..jpg",
    "Rescue Maze League.png",
    "RoboParty League - Rescue Line1.jpg",
    "RoboParty League - Rescue Line2.jpg",
    "RoboParty League - Rescue Maze1.jpg",
    "RoboParty League - Sumo Challenge.jpg",
    "RoboParty League - Sumo Challenge_1.jpg",
    "RoboParty League- Performance Challenge.jpg",
    "Soccer League1.jpg",
    "Soccer League2.jpg"
  ];
  const DEFAULT_INTERNATIONAL_GALLERY_IMAGES = INTERNATIONAL_GALLERY_IMAGE_CATALOG.slice(0, MAX_INTERNATIONAL_GALLERY_IMAGES);
  const DEFAULT_REGISTRATION_EVENT_SETTINGS = {
    heroEventEn: "RoboCup Americas 2026",
    heroEventFr: "RoboCup Americas 2026",
    eventDateEn: "October 22-25, 2026",
    eventDateFr: "22-25 octobre 2026",
    locationNameEn: "Sheridan College - Davis Campus",
    locationNameFr: "Sheridan College - Davis Campus",
    locationAddressEn: "Brampton, ON, Canada",
    locationAddressFr: "Brampton, ON, Canada"
  };
  const DEFAULT_CONTACT_SETTINGS = {
    generalEmail: "info@robocupcanada.ca",
    quebecName: "Sarah Morgan",
    quebecEmail: "director@robocupcanada.ca",
    nationalName: "Shaun Callendar",
    nationalEmail: "director@robocupcanada.ca"
  };
  const DEFAULT_RESOURCES_LINKS = {
    international: "https://junior.robocup.org/",
    forums: "https://junior.forum.robocup.org/",
    slack: "https://robocupjunior.slack.com/",
    soccer: "https://github.com/robocup-junior/awesome-rcj-soccer/",
    rescueDocs: "https://rescue.rcj.cloud/documents",
    rescueSpecs: "https://docs.google.com/document/d/1d97f-1gQnpQa3BZidJXpBIZX4N7Hgf3Q-El1FVgRXS8/edit?tab=t.0",
    juniorDiscord: "https://discord.com/invite/45pxMQY4nJ",
    internationalDiscord: "https://discord.com/invite/dcFgqFTeCy",
    communitySupport: "https://junior.forum.robocup.org/",
    usa: "https://www.robocupjunior.us/",
    australia: "https://www.robocupjunior.org.au/",
    learning: "https://junior.robocup.org/"
  };
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
  const DEFAULT_SCHEDULE_EVENTS = [
    {
      id: "americas-2026",
      featured: true,
      title: "RoboCup Americas 2026",
      dateEn: "October 22-25, 2026",
      dateFr: "22-25 octobre 2026",
      locationEn: "Sheridan College - Davis Campus, Brampton, ON, Canada",
      locationFr: "Sheridan College - Davis Campus, Brampton, ON, Canada",
      websiteLabel: "ASR 2026",
      websiteUrl: "https://robocupcanada.ca/asr/",
      contactEn: "",
      contactFr: "",
      competitions: [
        "Soccer Infrared Lightweight",
        "Soccer Vision Open",
        "Rescue Maze",
        "Rescue Line",
        "Rescue Simulation",
        "OnStage"
      ]
    },
    {
      id: "west-vancouver-2026",
      featured: false,
      title: "West Vancouver RoboCupJunior",
      dateEn: "March 7, 2026",
      dateFr: "7 mars 2026",
      locationEn: "UBC Campus",
      locationFr: "Campus UBC",
      websiteLabel: "Vancouver West 2026",
      websiteUrl: "https://vancouver.robocup.ca",
      contactEn: "",
      contactFr: "",
      competitions: [
        "Rescue Maze",
        "Rescue Line",
        "Soccer Infrared Lightweight",
        "Soccer Vision Open",
        "OnStage"
      ]
    },
    {
      id: "toronto-2026",
      featured: false,
      title: "Toronto Canada RoboCupJunior",
      dateEn: "April 1, 2026",
      dateFr: "1er avril 2026",
      locationEn: "St. Andrews College",
      locationFr: "St. Andrews College",
      websiteLabel: "St. Andrews",
      websiteUrl: "https://www.sac.on.ca/robocup",
      contactEn: "Benjamin Lawrence",
      contactFr: "Benjamin Lawrence",
      competitions: [
        "Soccer Infrared Lightweight",
        "Rescue Maze",
        "Rescue Line"
      ]
    },
    {
      id: "western-canada-2026",
      featured: false,
      title: "Western Canada RoboCupJunior",
      dateEn: "April 10, 2026",
      dateFr: "10 avril 2026",
      locationEn: "Okanagan College, Kelowna Campus",
      locationFr: "Okanagan College, Campus Kelowna",
      websiteLabel: "Okanagan College RoboCup",
      websiteUrl: "https://www.okanagan.bc.ca/robocup",
      contactEn: "",
      contactFr: "",
      competitions: [
        "Rescue Maze",
        "Rescue Line",
        "Soccer Infrared Lightweight",
        "Soccer Vision Open",
        "OnStage"
      ]
    }
  ];
  const KNOWN_LEAGUE_CONTENT = {
    maze: {
      nameEn: "Maze",
      nameFr: "Maze",
      icon: "&#129521;",
      slug: "maze",
      image: "images/leagues/maze.jpg",
      imageAltEn: "Robot navigating the RoboParty maze challenge",
      imageAltFr: "Robot parcourant le défi de labyrinthe RoboParty",
      summaryEn: "A RoboParty challenge where robots navigate a walled corridor from start to finish.",
      summaryFr: "Un défi RoboParty où les robots traversent un corridor avec des murs du départ à l'arrivée.",
      bulletsEn: ["3 attempts per robot.", "120 second maximum per run.", "Wall contact can reduce the score."],
      bulletsFr: ["3 essais par robot.", "Maximum de 120 secondes par essai.", "Les contacts avec les murs peuvent réduire le score."]
    },
    "formula 1": {
      nameEn: "Formula 1",
      nameFr: "Formule 1",
      icon: "&#127950;",
      slug: "formula-1",
      image: "images/leagues/formula-1.jpg",
      imageAltEn: "Robot competing in the Formula 1 line-following challenge",
      imageAltFr: "Robot participant au défi de suivi de ligne Formule 1",
      summaryEn: "A RoboParty challenge where robots follow a black curved line around a race track.",
      summaryFr: "Un défi RoboParty où les robots suivent une ligne noire courbée sur une piste de course.",
      bulletsEn: ["3 attempts per robot.", "Best run is counted.", "Fast and stable line-following is key."],
      bulletsFr: ["3 essais par robot.", "Le meilleur essai est retenu.", "Le suivi de ligne rapide et stable est essentiel."]
    },
    performance: {
      nameEn: "Performance",
      nameFr: "Performance",
      icon: "&#127925;",
      slug: "performance",
      image: "images/leagues/performance.jpg",
      imageAltEn: "Students presenting a robot performance challenge",
      imageAltFr: "Élèves présentant un défi de performance robotique",
      summaryEn: "A RoboParty challenge where teams present a short robot routine with music and creativity.",
      summaryFr: "Un défi RoboParty où les équipes présentent une courte routine de robot avec musique et créativité.",
      bulletsEn: ["Usually a 1 minute routine.", "Creativity and entertainment are judged.", "Programming complexity matters."],
      bulletsFr: ["Routine habituellement d'environ 1 minute.", "La créativité et le divertissement sont évalués.", "La complexité de la programmation compte."]
    },
    sumobots: {
      nameEn: "SumoBots",
      nameFr: "SumoBots",
      icon: "&#129302;",
      slug: "sumobots",
      image: "images/leagues/sumobots.jpg",
      imageAltEn: "Robots competing in the SumoBots challenge",
      imageAltFr: "Robots participant au défi SumoBots",
      summaryEn: "A RoboParty challenge where robots try to push opponents out of an octagonal ring.",
      summaryFr: "Un défi RoboParty où les robots tentent de pousser leurs adversaires hors d'un anneau octogonal.",
      bulletsEn: ["Robots compete inside a ring.", "Points are earned by pushing opponents out.", "Size and weight limits apply."],
      bulletsFr: ["Les robots s'affrontent dans un anneau.", "Des points sont gagnés en poussant les adversaires dehors.", "Des limites de taille et de poids s'appliquent."]
    },
    "rescue line": {
      nameEn: "Rescue Line",
      nameFr: "Rescue Line",
      icon: "&#128657;",
      slug: "rescue-line",
      image: "images/leagues/rescue-line.jpg",
      imageAltEn: "Robot completing a Rescue Line challenge course",
      imageAltFr: "Robot réalisant un parcours Rescue Line",
      summaryEn: "Robots follow a black line through a rescue course with obstacles and evacuation zones.",
      summaryFr: "Les robots suivent une ligne noire dans un parcours de sauvetage avec obstacles et zones d'évacuation.",
      bulletsEn: ["Points are awarded for completing course elements.", "Robots may need to recover from gaps or obstacles.", "Evacuation zones use victim objects and point multipliers."],
      bulletsFr: ["Des points sont accordés pour les éléments complétés.", "Les robots peuvent devoir récupérer après des écarts ou des obstacles.", "La zone d'évacuation utilise des victimes et des multiplicateurs."]
    },
    "rescue maze": {
      nameEn: "Rescue Maze",
      nameFr: "Rescue Maze",
      icon: "&#129517;",
      slug: "rescue-maze",
      image: "images/leagues/rescue-maze.png",
      imageAltEn: "Robot exploring the Rescue Maze competition field",
      imageAltFr: "Robot explorant le terrain de compétition Rescue Maze",
      summaryEn: "Robots explore a simulated disaster maze to locate victims and deliver rescue kits.",
      summaryFr: "Les robots explorent un labyrinthe simulant une catastrophe pour localiser des victimes et livrer des trousses de secours.",
      bulletsEn: ["Designed as preparation for international Rescue divisions.", "Teams may participate in Rescue Maze and Rescue Line at qualifying events."],
      bulletsFr: ["Préparation aux divisions internationales de Rescue.", "Les équipes peuvent participer à Rescue Maze et Rescue Line aux événements de qualification."]
    },
    soccer: {
      nameEn: "Soccer",
      nameFr: "Soccer",
      icon: "&#9917;",
      slug: "soccer",
      image: "images/leagues/soccer.jpg",
      imageAltEn: "Autonomous robots competing in RoboCupJunior Soccer",
      imageAltFr: "Robots autonomes participant au Soccer RoboCupJunior",
      summaryEn: "Two autonomous robots compete against another pair by detecting and kicking a ball.",
      summaryFr: "Deux robots autonomes affrontent une autre paire en détectant et en frappant une balle.",
      bulletsEn: ["Lightweight uses an infrared ball.", "Open uses a vision-tracked orange ball.", "Each goal is worth 1 point."],
      bulletsFr: ["Lightweight utilise une balle infrarouge.", "Open utilise une balle orange suivie par vision.", "Chaque but vaut 1 point."]
    },
    onstage: {
      nameEn: "OnStage",
      nameFr: "OnStage",
      icon: "&#127917;",
      slug: "onstage",
      image: "images/leagues/onstage.jpg",
      imageAltEn: "Students and robots performing in the OnStage league",
      imageAltFr: "Élèves et robots présentant un spectacle OnStage",
      summaryEn: "Teams create a robotic performance combining engineering, music, and storytelling.",
      summaryFr: "Les équipes créent une performance robotique combinant ingénierie, musique et récit.",
      bulletsEn: ["Robots and students perform together on stage.", "Judges evaluate creativity and entertainment.", "Robot autonomy is considered during evaluation."],
      bulletsFr: ["Les robots et les élèves se produisent ensemble sur scène.", "Les juges évaluent la créativité et le divertissement.", "L'autonomie des robots est prise en compte lors de l'évaluation."]
    }
  };
  const REPLACEMENT_PATTERNS = [
    /RoboCupJunior Canada/g,
    /RoboCup Junior Canada/g,
    /RoboCup Canada/g
  ];

  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function isSupabaseConfigReadable() {
    return SUPABASE_URL.startsWith("https://") && Boolean(SUPABASE_ANON_KEY);
  }

  function writeConfigToLocalStorage(key, value) {
    switch (key) {
      case "site_settings":
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(value && typeof value === "object" ? value : {}));
        break;
      case "competitions":
        localStorage.setItem(LEAGUES_KEY, JSON.stringify(Array.isArray(value) ? value : []));
        break;
      case "schedule_competitions":
        localStorage.setItem(SCHEDULE_COMPETITIONS_KEY, JSON.stringify(Array.isArray(value) ? value : []));
        break;
      case "schedule_events":
        localStorage.setItem(SCHEDULE_EVENTS_KEY, JSON.stringify(Array.isArray(value) ? value : []));
        break;
      case "league_details":
        localStorage.setItem(LEAGUE_DETAILS_KEY, JSON.stringify(value && typeof value === "object" ? value : {}));
        break;
      default:
        break;
    }
  }

  async function syncFromSupabaseConfig() {
    if (!isSupabaseConfigReadable()) return false;

    const inFilter = `(${APP_CONFIG_KEYS.map((key) => `"${key}"`).join(",")})`;
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/app_config?select=key,value&key=in.${encodeURIComponent(inFilter)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) {
      return false;
    }

    rows.forEach((row) => {
      if (!row || typeof row.key !== "string") return;
      writeConfigToLocalStorage(row.key, row.value);
    });

    return true;
  }

  function normalizeGalleryImageSelection(value, catalog, maxItems) {
    const source = Array.isArray(value) ? value : [];
    const allowed = new Set(catalog);
    const seen = new Set();
    const normalized = [];

    source.forEach((entry) => {
      const fileName = String(entry || "").trim();
      if (!fileName || !allowed.has(fileName) || seen.has(fileName)) return;
      seen.add(fileName);
      normalized.push(fileName);
    });

    return normalized.slice(0, maxItems);
  }

  function normalizeGalleryCatalog(value) {
    const source = Array.isArray(value) ? value : [];
    const seen = new Set();
    const normalized = [];

    source.forEach((entry) => {
      const fileName = String(entry || "").trim();
      if (!fileName || seen.has(fileName)) return;
      seen.add(fileName);
      normalized.push(fileName);
    });

    return normalized;
  }

  function getInternationalGalleryCatalog() {
    const settings = readSettings();
    const customCatalog = normalizeGalleryCatalog(settings.internationalGalleryCatalog);
    return customCatalog.length ? customCatalog : INTERNATIONAL_GALLERY_IMAGE_CATALOG.slice();
  }

  function getDefaultInternationalGalleryImages(catalog) {
    const source = Array.isArray(catalog) && catalog.length
      ? catalog
      : INTERNATIONAL_GALLERY_IMAGE_CATALOG;
    return source.slice(0, MAX_INTERNATIONAL_GALLERY_IMAGES);
  }

  function getInternationalGalleryImagesFromSettings() {
    const settings = readSettings();
    const catalog = getInternationalGalleryCatalog();
    const normalized = normalizeGalleryImageSelection(
      settings.internationalGalleryImages,
      catalog,
      MAX_INTERNATIONAL_GALLERY_IMAGES
    );

    return normalized.length ? normalized : getDefaultInternationalGalleryImages(catalog);
  }

  function normalizeRegistrationEventSettings(value) {
    const raw = value && typeof value === "object" ? value : {};

    return {
      heroEventEn: String(raw.heroEventEn || DEFAULT_REGISTRATION_EVENT_SETTINGS.heroEventEn).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.heroEventEn,
      heroEventFr: String(raw.heroEventFr || DEFAULT_REGISTRATION_EVENT_SETTINGS.heroEventFr).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.heroEventFr,
      eventDateEn: String(raw.eventDateEn || DEFAULT_REGISTRATION_EVENT_SETTINGS.eventDateEn).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.eventDateEn,
      eventDateFr: String(raw.eventDateFr || DEFAULT_REGISTRATION_EVENT_SETTINGS.eventDateFr).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.eventDateFr,
      locationNameEn: String(raw.locationNameEn || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationNameEn).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationNameEn,
      locationNameFr: String(raw.locationNameFr || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationNameFr).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationNameFr,
      locationAddressEn: String(raw.locationAddressEn || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationAddressEn).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationAddressEn,
      locationAddressFr: String(raw.locationAddressFr || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationAddressFr).trim() || DEFAULT_REGISTRATION_EVENT_SETTINGS.locationAddressFr
    };
  }

  function getRegistrationEventSettings() {
    const settings = readSettings();
    return normalizeRegistrationEventSettings(settings.registrationEvent);
  }

  function normalizeContactSettings(value) {
    const raw = value && typeof value === "object" ? value : {};

    return {
      generalEmail: String(raw.generalEmail || DEFAULT_CONTACT_SETTINGS.generalEmail).trim() || DEFAULT_CONTACT_SETTINGS.generalEmail,
      quebecName: String(raw.quebecName || DEFAULT_CONTACT_SETTINGS.quebecName).trim() || DEFAULT_CONTACT_SETTINGS.quebecName,
      quebecEmail: String(raw.quebecEmail || DEFAULT_CONTACT_SETTINGS.quebecEmail).trim() || DEFAULT_CONTACT_SETTINGS.quebecEmail,
      nationalName: String(raw.nationalName || DEFAULT_CONTACT_SETTINGS.nationalName).trim() || DEFAULT_CONTACT_SETTINGS.nationalName,
      nationalEmail: String(raw.nationalEmail || DEFAULT_CONTACT_SETTINGS.nationalEmail).trim() || DEFAULT_CONTACT_SETTINGS.nationalEmail
    };
  }

  function getContactSettings() {
    const settings = readSettings();
    return normalizeContactSettings(settings.contact);
  }

  function normalizeResourcesLinks(value) {
    const raw = value && typeof value === "object" ? value : {};

    return {
      international: String(raw.international || DEFAULT_RESOURCES_LINKS.international).trim() || DEFAULT_RESOURCES_LINKS.international,
      forums: String(raw.forums || DEFAULT_RESOURCES_LINKS.forums).trim() || DEFAULT_RESOURCES_LINKS.forums,
      slack: String(raw.slack || DEFAULT_RESOURCES_LINKS.slack).trim() || DEFAULT_RESOURCES_LINKS.slack,
      soccer: String(raw.soccer || DEFAULT_RESOURCES_LINKS.soccer).trim() || DEFAULT_RESOURCES_LINKS.soccer,
      rescueDocs: String(raw.rescueDocs || DEFAULT_RESOURCES_LINKS.rescueDocs).trim() || DEFAULT_RESOURCES_LINKS.rescueDocs,
      rescueSpecs: String(raw.rescueSpecs || DEFAULT_RESOURCES_LINKS.rescueSpecs).trim() || DEFAULT_RESOURCES_LINKS.rescueSpecs,
      juniorDiscord: String(raw.juniorDiscord || DEFAULT_RESOURCES_LINKS.juniorDiscord).trim() || DEFAULT_RESOURCES_LINKS.juniorDiscord,
      internationalDiscord: String(raw.internationalDiscord || DEFAULT_RESOURCES_LINKS.internationalDiscord).trim() || DEFAULT_RESOURCES_LINKS.internationalDiscord,
      communitySupport: String(raw.communitySupport || DEFAULT_RESOURCES_LINKS.communitySupport).trim() || DEFAULT_RESOURCES_LINKS.communitySupport,
      usa: String(raw.usa || DEFAULT_RESOURCES_LINKS.usa).trim() || DEFAULT_RESOURCES_LINKS.usa,
      australia: String(raw.australia || DEFAULT_RESOURCES_LINKS.australia).trim() || DEFAULT_RESOURCES_LINKS.australia,
      learning: String(raw.learning || DEFAULT_RESOURCES_LINKS.learning).trim() || DEFAULT_RESOURCES_LINKS.learning
    };
  }

  function getResourcesLinks() {
    const settings = readSettings();
    return normalizeResourcesLinks(settings.resourcesLinks);
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

  function readScheduleCompetitions() {
    try {
      const raw = JSON.parse(localStorage.getItem(SCHEDULE_COMPETITIONS_KEY) || "[]");
      const source = Array.isArray(raw) && raw.length ? raw : readLeagues();
      const seen = new Set();
      const competitions = [];

      source.forEach((entry) => {
        const name = String(entry || "").trim();
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return;
        seen.add(key);
        competitions.push(name);
      });

      return competitions.length ? competitions : readLeagues();
    } catch (error) {
      return readLeagues();
    }
  }

  function normalizeScheduleEvent(event, fallbackEvent) {
    const fallback = fallbackEvent || {};
    const competitionsList = Array.isArray(event?.competitions)
      ? event.competitions
      : Array.isArray(fallback.competitions)
        ? fallback.competitions
        : readScheduleCompetitions();

    return {
      id: String(event?.id || fallback.id || "").trim(),
      featured: Boolean(event?.featured ?? fallback.featured),
      title: String(event?.title || fallback.title || "").trim(),
      dateEn: String(event?.dateEn || fallback.dateEn || "").trim(),
      dateFr: String(event?.dateFr || fallback.dateFr || "").trim(),
      locationEn: String(event?.locationEn || fallback.locationEn || "").trim(),
      locationFr: String(event?.locationFr || fallback.locationFr || "").trim(),
      websiteLabel: String(event?.websiteLabel || fallback.websiteLabel || "").trim(),
      websiteUrl: String(event?.websiteUrl || fallback.websiteUrl || "").trim(),
      contactEn: String(event?.contactEn || fallback.contactEn || "").trim(),
      contactFr: String(event?.contactFr || fallback.contactFr || "").trim(),
      competitions: competitionsList.map((item) => String(item || "").trim()).filter(Boolean)
    };
  }

  function readScheduleEvents() {
    const defaults = DEFAULT_SCHEDULE_EVENTS.map((event) => normalizeScheduleEvent(event, event));
    try {
      const raw = JSON.parse(localStorage.getItem(SCHEDULE_EVENTS_KEY) || "[]");
      if (!Array.isArray(raw) || !raw.length) return defaults;

      return defaults.map((defaultEvent) => {
        const custom = raw.find((item) => String(item?.id || "").trim() === defaultEvent.id) || {};
        const merged = normalizeScheduleEvent(custom, defaultEvent);
        if (!merged.competitions.length) {
          merged.competitions = defaultEvent.competitions.slice();
        }
        return merged;
      });
    } catch (error) {
      return defaults;
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
    const fallbackSummaryFr = `Cette ligue a été ajoutée par l'équipe d'administration. Les règles complètes pour ${trimmed} seront publiées bientôt.`;

    const baseConfig = known ? {
      nameEn: known.nameEn,
      nameFr: known.nameFr,
      icon: known.icon,
      slug: known.slug,
      image: known.image,
      imageAltEn: known.imageAltEn,
      imageAltFr: known.imageAltFr,
      summaryEn: known.summaryEn,
      summaryFr: known.summaryFr,
      bulletsEn: known.bulletsEn,
      bulletsFr: known.bulletsFr
    } : {
      nameEn: trimmed,
      nameFr: trimmed,
      icon: "&#129302;",
      slug: "",
      image: "",
      imageAltEn: "",
      imageAltFr: "",
      summaryEn: fallbackSummaryEn,
      summaryFr: fallbackSummaryFr,
      bulletsEn: ["League details coming soon."],
      bulletsFr: ["Détails de la ligue à venir."]
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
      nameEn: String(custom.nameEn || baseConfig.nameEn || trimmed).trim() || trimmed,
      nameFr: String(custom.nameFr || baseConfig.nameFr || trimmed).trim() || trimmed,
      icon: mergedIcon,
      slug: mergedSlug,
      image: String(custom.image || baseConfig.image || "").trim(),
      imageAltEn: String(custom.imageAltEn || baseConfig.imageAltEn || "").trim(),
      imageAltFr: String(custom.imageAltFr || baseConfig.imageAltFr || "").trim(),
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

    const detailsWord = isFrench ? "Détails" : "Details";
    const displayName = isFrench ? league.nameFr : league.nameEn;
    const summary = isFrench ? league.summaryFr : league.summaryEn;
    const bullets = isFrench ? league.bulletsFr : league.bulletsEn;

    document.documentElement.lang = isFrench ? "fr" : "en";
    document.title = `${displayName} ${detailsWord} | ${DEFAULT_SITE_NAME}`;
    pageTitle.innerHTML = `${escapeHtml(displayName)}<span>${detailsWord}</span>`;
    pageSummary.textContent = summary;
    backLink.href = isFrench ? "leagues_fr.html" : "leagues.html";
    backLink.textContent = isFrench ? "Retour aux ligues →" : "Back to Leagues →";

    const heroImage = document.getElementById("hero-image");
    if (heroImage && league.image) {
      heroImage.src = league.image;
      heroImage.alt = isFrench ? league.imageAltFr : league.imageAltEn;
    }

    content.innerHTML = `
      <section>
        <div class="container">
          <h2 class="section-title">${isFrench ? "Informations de la ligue" : "League Information"}</h2>
          <div class="content-grid">
            <div class="panel">
              <h3>${isFrench ? "Résumé" : "Summary"}</h3>
              <p>${escapeHtml(summary)}</p>
            </div>
            <div class="panel">
              <h3>${isFrench ? "Points clés" : "Highlights"}</h3>
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
    const actionKnown = isFrench ? "Voir les détails" : "View details";
    const actionUnknown = isFrench ? "Détails à venir" : "Details coming soon";

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
      const displayName = isFrench ? league.nameFr : league.nameEn;
      const imageAlt = isFrench ? league.imageAltFr : league.imageAltEn;
      const normalizedSlug = normalizeLeagueSlug(league.slug || slugifyLeague(league.name));
      const href = normalizedSlug ? `competition.html?lang=${lang}&type=${encodeURIComponent(normalizedSlug)}` : "#";
      const actionText = normalizedSlug ? actionKnown : actionUnknown;
      const unknownClass = normalizedSlug ? "" : " league-card-no-details";

      return `
        <a class="league-card${unknownClass}" href="${href}" ${normalizedSlug ? "" : 'data-no-details="true"'}>
          ${league.image ? `<img class="league-card-image" src="${escapeHtml(league.image)}" alt="${escapeHtml(imageAlt)}" loading="lazy">` : ""}
          <div class="league-icon">${league.icon}</div>
          <h3>${escapeHtml(displayName)}</h3>
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

  function sanitizeHttpUrl(url) {
    const trimmed = String(url || "").trim();
    if (!trimmed) return "#";
    try {
      const parsed = new URL(trimmed, window.location.origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
      return "#";
    } catch (error) {
      return "#";
    }
  }

  function renderScheduleEventsFromSettings() {
    const path = window.location.pathname.toLowerCase();
    const isSchedulePage = path.endsWith("/schedule.html") || path.endsWith("/schedule_fr.html") || path.endsWith("schedule.html") || path.endsWith("schedule_fr.html");
    if (!isSchedulePage) return;

    const grid = document.querySelector(".grid-2");
    if (!grid) return;

    const isFrench = document.documentElement.lang === "fr" || path.endsWith("schedule_fr.html");
    const scheduleEvents = readScheduleEvents();
    if (!scheduleEvents.length) return;

    const locationLabel = isFrench ? "Lieu" : "Location";
    const websiteLabelText = isFrench ? "Site Web" : "Website";
    const leaguesLabel = isFrench ? "Ligues" : "Leagues";
    const contactLabel = isFrench ? "Contact" : "Contact";

    grid.innerHTML = scheduleEvents.map((event) => {
      const dateLabel = isFrench ? event.dateFr : event.dateEn;
      const location = isFrench ? event.locationFr : event.locationEn;
      const contact = isFrench ? event.contactFr : event.contactEn;
      const competitionsMarkup = (event.competitions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      const websiteHref = sanitizeHttpUrl(event.websiteUrl);
      const websiteMarkup = event.websiteLabel
        ? `
          <p>
            <strong>${websiteLabelText}:</strong>
            <a href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.websiteLabel)}</a>
          </p>
        `
        : "";

      return `
        <div class="info-card${event.featured ? " featured-card" : ""}">
          <span class="event-date">${escapeHtml(dateLabel)}</span>
          <h3>${escapeHtml(event.title)}</h3>
          <p><strong>${locationLabel}:</strong> ${escapeHtml(location)}</p>
          ${websiteMarkup}
          <p><strong>${leaguesLabel}:</strong></p>
          <ul>${competitionsMarkup}</ul>
          ${contact ? `<p><strong>${contactLabel}:</strong> ${escapeHtml(contact)}</p>` : ""}
        </div>
      `;
    }).join("");
  }

  function applyRegistrationEventSettings() {
    const path = window.location.pathname.toLowerCase();
    const isRegistrationPage = path.endsWith("/registration.html")
      || path.endsWith("registration.html")
      || path.endsWith("/registration_fr.html")
      || path.endsWith("registration_fr.html");
    if (!isRegistrationPage) return;

    const isFrench = document.documentElement.lang === "fr" || path.endsWith("registration_fr.html");
    const settings = getRegistrationEventSettings();
    const hero = isFrench ? settings.heroEventFr : settings.heroEventEn;
    const date = isFrench ? settings.eventDateFr : settings.eventDateEn;
    const locationName = isFrench ? settings.locationNameFr : settings.locationNameEn;
    const locationAddress = isFrench ? settings.locationAddressFr : settings.locationAddressEn;

    const heroTarget = document.getElementById("registration-hero-event");
    const dateTarget = document.getElementById("registration-event-date");
    const locationNameTarget = document.getElementById("registration-event-location-name");
    const locationAddressTarget = document.getElementById("registration-event-location-address");

    if (heroTarget) heroTarget.textContent = hero;
    if (dateTarget) dateTarget.textContent = date;
    if (locationNameTarget) locationNameTarget.textContent = locationName;
    if (locationAddressTarget) locationAddressTarget.textContent = locationAddress;
  }

  function applyContactSettings() {
    const path = window.location.pathname.toLowerCase();
    const isContactPage = path.endsWith("/contact.html")
      || path.endsWith("contact.html")
      || path.endsWith("/contact_fr.html")
      || path.endsWith("contact_fr.html");
    if (!isContactPage) return;

    const settings = getContactSettings();
    const isFrench = document.documentElement.lang === "fr" || path.endsWith("contact_fr.html");
    const quebecLabel = isFrench ? "Représentante Québec" : "Quebec Representative";
    const nationalLabel = isFrench ? "Représentant national" : "National Representative";

    const generalEmailAnchor = document.getElementById("contact-general-email-link");
    const quebecNameTarget = document.getElementById("contact-quebec-name");
    const quebecEmailAnchor = document.getElementById("contact-quebec-email-link");
    const nationalNameTarget = document.getElementById("contact-national-name");
    const nationalEmailAnchor = document.getElementById("contact-national-email-link");
    const quebecHeadingTarget = document.getElementById("contact-quebec-heading");
    const nationalHeadingTarget = document.getElementById("contact-national-heading");

    if (generalEmailAnchor) {
      generalEmailAnchor.href = `mailto:${settings.generalEmail}`;
      generalEmailAnchor.textContent = settings.generalEmail;
    }
    if (quebecHeadingTarget) quebecHeadingTarget.textContent = quebecLabel;
    if (quebecNameTarget) quebecNameTarget.textContent = settings.quebecName;
    if (quebecEmailAnchor) {
      quebecEmailAnchor.href = `mailto:${settings.quebecEmail}`;
      quebecEmailAnchor.textContent = settings.quebecEmail;
    }
    if (nationalHeadingTarget) nationalHeadingTarget.textContent = nationalLabel;
    if (nationalNameTarget) nationalNameTarget.textContent = settings.nationalName;
    if (nationalEmailAnchor) {
      nationalEmailAnchor.href = `mailto:${settings.nationalEmail}`;
      nationalEmailAnchor.textContent = settings.nationalEmail;
    }
  }

  function applyResourcesLinks() {
    const path = window.location.pathname.toLowerCase();
    const isResourcesPage = path.endsWith("/resources.html")
      || path.endsWith("resources.html")
      || path.endsWith("/resources_fr.html")
      || path.endsWith("resources_fr.html");
    if (!isResourcesPage) return;

    const links = getResourcesLinks();
    const mapping = {
      "resources-link-international": links.international,
      "resources-link-forums": links.forums,
      "resources-link-slack": links.slack,
      "resources-link-soccer": links.soccer,
      "resources-link-rescue-docs": links.rescueDocs,
      "resources-link-rescue-specs": links.rescueSpecs,
      "resources-link-junior-discord": links.juniorDiscord,
      "resources-link-international-discord": links.internationalDiscord,
      "resources-link-community-support": links.communitySupport,
      "resources-link-usa": links.usa,
      "resources-link-australia": links.australia,
      "resources-link-learning": links.learning
    };

    Object.entries(mapping).forEach(([id, url]) => {
      const anchor = document.getElementById(id);
      if (!anchor) return;
      anchor.href = sanitizeHttpUrl(url);
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
    renderScheduleEventsFromSettings();
    applyRegistrationEventSettings();
    applyContactSettings();
    applyResourcesLinks();

    applyToTitle(siteName);
    applyToTextNodes(siteName);
  }

  async function bootstrapRoboCupSiteSettings() {
    applyRoboCupSiteSettings();

    try {
      const updatedFromRemote = await syncFromSupabaseConfig();
      if (updatedFromRemote) {
        applyRoboCupSiteSettings();
      }
    } catch (error) {
      // Keep local rendering if Supabase is unavailable.
      console.error("Failed to load site settings from Supabase:", error);
    }
  }

  window.getRoboCupInternationalGalleryCatalog = getInternationalGalleryCatalog;
  window.getRoboCupInternationalGalleryImages = getInternationalGalleryImagesFromSettings;
  window.getRoboCupRegistrationEventSettings = getRegistrationEventSettings;
  window.getRoboCupRegistrationEventDefaults = () => ({ ...DEFAULT_REGISTRATION_EVENT_SETTINGS });
  window.getRoboCupContactSettings = getContactSettings;
  window.getRoboCupContactSettingsDefaults = () => ({ ...DEFAULT_CONTACT_SETTINGS });
  window.getRoboCupResourcesLinks = getResourcesLinks;
  window.getRoboCupResourcesLinksDefaults = () => ({ ...DEFAULT_RESOURCES_LINKS });
  window.ROBOCUP_MAX_INTERNATIONAL_GALLERY_IMAGES = MAX_INTERNATIONAL_GALLERY_IMAGES;
  window.applyRoboCupSiteSettings = applyRoboCupSiteSettings;
  window.syncRoboCupSiteSettingsFromSupabase = syncFromSupabaseConfig;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapRoboCupSiteSettings, { once: true });
  } else {
    bootstrapRoboCupSiteSettings();
  }
})();
