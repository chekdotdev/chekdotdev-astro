# chekdotdev-astro

Static Astro site for chek.dev. Content is authored in WordPress and fetched at build time through WPGraphQL.

## Commands

```sh
npm run dev
npm run build
npm run preview
```

## Content Model

- WordPress is the editorial CMS.
- Astro owns routing, layout, typography, and front-end behavior.
- WPGraphQL is the boundary between the two systems.
- Supported WordPress blocks are intentionally limited. See `docs/wordpress-block-contract.md`.

## Routes

- `/` lists recent posts.
- `/posts/` lists all posts.
- `/{YYYY-MM-DD}/{slug}/` renders posts.
- WordPress pages render from their URI, including `/about/` and `/projects/`.

## Environment

```sh
WORDPRESS_GRAPHQL_ENDPOINT=https://wp.chek.dev/graphql
```
