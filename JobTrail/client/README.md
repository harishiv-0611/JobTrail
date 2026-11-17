# React + Vite

## Run JobTrail locally

Start the client and application data API together in one terminal:

1. From `client`, run `npm run dev`. This starts Vite and the application data API (port 5001).
2. In a separate terminal, from `server`, run `npm run dev` to start the authentication API (port 5000).

The seeded development account is `jane@gmail.com` with password `Password@123`.
Application data is stored in `client/db.json`; authentication accounts are held
in server memory and are reset when the authentication server restarts.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs)

## React Compiler

The React Compiler is not enabled on this template because of its impact on build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out [the TypeScript template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript with type-aware lint rules.
