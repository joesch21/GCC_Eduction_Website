# Architecture

Placeholder for system architecture describing interaction between content registry, learner registry, rewarder, subgraph and frontend.

## Helper Server (Dev Only)

We include a stateless Express server (`packages/server`) for local development:
- `/health` for quick checks
- `/config` to expose read-only chain settings to the UI

No database, no secrets, no custody. The production app remains decentralized; this server is optional and can be disabled or replaced with static hosting.
