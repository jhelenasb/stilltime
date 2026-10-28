# stilltime

A calm planner that syncs with Google Calendar & Tasks.

Vanilla JS (Vite), modular architecture, OAuth token persistence, recurrence expansion, drag-and-drop scheduling.

## Features

- Day, Week, Month, Semester, Quarter, and Year views
- Task and event creation
- Task filtering and search
- A warm, minimal interface with a light/dark theme
- Google Calendar and Google Tasks integration — in progress

## Built With

- JavaScript
- Vite
- HTML and CSS
- Google Identity Services and Google APIs (integration in progress)

## Run Locally

1. Install [Node.js](https://nodejs.org/).
2. Clone or download this repository.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root:

   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL shown in your terminal.

## Production Build

```bash
npm run build
```

The production files are generated in the `dist` folder.

## Deployment

Stilltime can be deployed as a static site on Render or Vercel.

For Render:
- Build command: `npm install && npm run build`
- Publish directory: `dist`

Configure the Google OAuth authorized JavaScript origins for your deployed domain before enabling Google integration.

## Environment Variables

Do not commit `.env` files or private credentials to GitHub. The Google OAuth client ID used by a browser application is public-facing; never place client secrets or private API keys in `VITE_` variables.

## Project Status

Stilltime is under active development. Google sign-in, calendar synchronization, task synchronization, and production readiness need to be verified before relying on it for personal data.

## License

To be decided.
