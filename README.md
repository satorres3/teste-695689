# HowToMeCM Website

Static website generator for staging.howtomecm.com (and production howtomecm.com).

This Next.js application dynamically generates static websites from content stored in Supabase CMS.

## Features

- **Dynamic Content**: Pulls pages and posts from Supabase based on `website_domain`
- **Static Generation**: Pre-renders pages at build time for optimal performance
- **Multi-Domain Support**: Configurable for different domains (staging/production)
- **SEO Optimized**: Generates metadata from CMS content
- **Responsive Design**: Built with Tailwind CSS
- **Content Types**: Supports various section types (hero, text, images, FAQ, etc.)

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
WEBSITE_DOMAIN=staging.howtomecm.com
```

## Deployment

This repository is configured to deploy to:
- **Staging**: `staging.howtomecm.com`
- **Production**: `howtomecm.com` (when replicated)

### Vercel Deployment

1. Connect this repository to Vercel project
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Content Workflow

1. User creates content in CMS admin (`cms.howtomecm.com`)
2. Content is saved to Supabase with `website_domain` field
3. This website queries Supabase for domain-specific content
4. Static pages are generated and deployed

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the site.

## Architecture

```
CMS Admin → Supabase → This Website → Static Site
```

This solves the "staging creates nothing" issue by ensuring content actually gets deployed to the target domain.