This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Copy `.env.example` to `.env` locally and set these variables in production:

- `DATABASE_URL`
- `LIBSQL_AUTH_TOKEN` when using a remote libSQL/Turso database
- `GEMINI_API_KEY`
- `GEMINI_MODEL` optional, defaults to `gemini-flash-latest`
- `NEXT_PUBLIC_APP_API_SECRET`

For production, use a persistent database such as Turso/libSQL instead of the local `file:./dev.db` SQLite file.

## QR Demo Mode

The public poster/QR demo does not use real authentication. Each browser creates a local `demoUserId` in `localStorage` and sends it with API requests as `x-demo-user-id`.

This is only lightweight demo isolation: visitors see only the Task, Note, and Event records tied to their demo id, and each demo user starts with 5 AI requests. The header can be spoofed, so this should not be treated as login, authorization, or data security for production users.

## Deploy Checklist

```bash
npm install
npm run prisma:generate
npm run build
npm run start
```

Run `npm run db:push` against the production database before the first deploy if its schema has not been created yet.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
