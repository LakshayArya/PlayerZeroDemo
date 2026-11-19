# PlayerZeroDemo

A runnable proof of concept for demonstrating the **production engineering workflow** around PlayerZero: support ticket intake, code/telemetry/deployment context, investigation, and proposed next steps.

> **Important:** This repository starts in **mock/demo mode**. Its sample incidents and explanations are synthetic. It does not call PlayerZero, run Sim-1, analyze a real codebase, or claim actual root-cause conclusions.

## Requirements

- Node.js 20 or newer
- No npm dependencies or secrets required for mock mode

## Run locally

```bash
git clone https://github.com/LakshayArya/PlayerZeroDemo.git
cd PlayerZeroDemo
npm start
```

Open http://localhost:3000

Use a different port with `PORT=4000 npm start` (macOS/Linux) or `$env:PORT=4000; npm start` (PowerShell).

## Test

```bash
npm test
```

## API

- `GET /api/health`: service health and demo mode
- `GET /api/incidents`: list synthetic incident summaries
- `GET /api/incidents/INC-101`: inspect synthetic evidence and suggested response

## Demo storyline

1. A support ticket arrives with a user-visible symptom.
2. Investigators correlate example telemetry and code/deploy evidence.
3. A **hypothesis**, not a verified root cause, is presented.
4. Engineering proposes a fix, QA validates, and the release owner approves.
5. The resolved outcome can later be recorded for future investigation.

The app deliberately shows **hypothesis** and **proposed next steps** rather than claiming that AI executed a real simulation.

## Live PlayerZero integration — future phase

1. Obtain an authorized PlayerZero workspace/account.
2. Confirm the supported SDK/API, authentication method, scopes, and endpoints in official documentation.
3. Add a server-side adapter under `src/integrations/`; never expose credentials in the browser.
4. Connect a demo repository, incident/ticket source, and observability signals according to workspace permissions.
5. Replace synthetic evidence with attributable live results, and show clearly whether a hypothesis has been tested.

Official resources: https://playerzero.ai/ and https://github.com/goplayerzero/docs

## Security and deployment

This scaffold is for local demonstration, **not production hosting**. Do not put customer data, credentials, or proprietary logs into sample fixtures. Add authentication, authorization, rate limiting, audit logging, and production deployment controls before connecting real systems.

## Possible next iterations

- Real integration adapter (after access and API details are verified)
- OpenTelemetry-powered sample service and deliberately injected failures
- A Jira/GitHub issue workflow and human-approved PR demonstration
- Sim-1 validation walkthrough where available through the actual platform
