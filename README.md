# Human Filter

Write with AI. Sound like yourself.

Human Filter is an open-source tone-of-voice agent for people who use AI to write but do not want to sound like AI. It helps turn rough thoughts, messy notes, drafts and AI-generated writing into posts that feel more natural, specific, believable and close to the user's own voice.

This is not another LinkedIn post generator. It is a human tone filter.

## Why it exists

AI makes writing faster, but it often makes people sound the same. Human Filter removes obvious AI and LinkedIn tells, keeps the useful thought, and remembers what the user corrects so they do not have to remove the same habit twice.

## Features

- Paste rough thoughts, drafts, transcripts or AI-generated posts
- Choose up to three tone modes
- Add banned words and phrases
- Save a local voice profile
- Generate a main version and a rougher alternative
- See a Human Filter Check with warnings and removed tells
- Save feedback and preferences in local storage
- Generate a supporting image prompt
- Optionally generate an image when API access is configured
- Browse open-source product and ethics docs

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- Local storage for the MVP learning loop
- Vercel-ready API routes

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` and add values as needed.

```bash
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_URL=https://github.com/your-org/human-filter
```

Without `OPENAI_API_KEY`, the app does not crash. It shows a clear notice and uses a local preview filter so the UI can still be tried.

## API routes

- `POST /api/rewrite`
- `POST /api/image-prompt`
- `POST /api/generate-image`

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add `OPENAI_API_KEY` if you want live text and image generation.
4. Add `NEXT_PUBLIC_APP_URL` with your production URL.
5. Deploy.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The most useful contributions improve the core filter: clearer prompts, better AI-tell checks, stronger local memory and simpler UX.

## What this project will never do

- It will not impersonate people.
- It will not clone someone's voice without permission.
- It will not scrape private messages without consent.
- It will not fabricate personal stories.
- It will not become a spam tool.
- It will not pretend to be an AI detector.
- It will not become a bloated LinkedIn scheduling platform.

## License

AGPL-3.0 is the recommended license for this project. The included `LICENSE` file is a placeholder so the project owner can confirm or change the license before publishing.
