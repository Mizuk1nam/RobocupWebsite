# RobocupWebsite

RoboCup Canada Website Redesign

## Project Overview

This repository contains the public RoboCup Junior Canada website in English and French.

Primary pages include:

- `index.html` and `index_fr.html`
- `about.html` and `about_fr.html`
- `leagues.html` and `leagues_fr.html`
- `registration.html` and `registration_fr.html`
- `schedule.html` and `schedule_fr.html`
- `gallery.html` and `gallery_fr.html`
- `resources.html` and `resources_fr.html`
- `contact.html` and `contact_fr.html`

## Registration Feature Scope

The registration module now includes:

1. Registration flow design implemented in-page with clear team steps.
2. Multi-team registration support in one submission.
3. League-aware member limits:
	 - OnStage: 2 to 5 members
	 - Other leagues: 2 to 4 members
4. Release form PDF generation from entered team/member data.

## How To Run Locally

From the project folder, run:

```powershell
python -m http.server 5500
```

Then open:

- `http://localhost:5500/`

## Registration Flow (English and French)

1. Open the registration page.
2. Fill Team Information and Mentor Information.
3. Add/Remove members per team.
4. Add additional teams when needed.
5. Generate Release Form PDF.
6. Submit registration.

## Notes About Data Handling

- Current submission flow is client-side only for demo/testing.
- Form data is kept in memory only (no backend persistence yet).
- For production, connect the submit action to a server endpoint.

## Release Form PDF Generator

- Implemented using `jsPDF` via CDN.
- Includes team profile, mentor details, participant list, and signature placeholders.
- Output file names:
	- English: `robocup-release-forms-2026.pdf`
	- French: `formulaires-decharge-robocup-2026.pdf`

## Annual Maintenance Checklist

Update these items every season:

1. Competition year and date text on registration pages.
2. Registration deadline and fee.
3. Venue address.
4. League rules and limits (if changed).
5. PDF header year and output filenames.
6. Any sponsor/branding wording.

## Recommended Next Step

Connect registration submission to a backend API and store submissions in a database with admin export.
