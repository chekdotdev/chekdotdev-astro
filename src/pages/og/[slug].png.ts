import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPosts, stripHtml } from '../../lib/wpgraphql';

async function fetchFont(family: string): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}&display=swap`
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
  if (!url) throw new Error(`Could not extract font URL for ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

let fontsCache: { vollkorn: ArrayBuffer; firaCode: ArrayBuffer } | undefined;

async function loadFonts() {
  if (fontsCache) return fontsCache;
  const [vollkorn, firaCode] = await Promise.all([
    fetchFont('Vollkorn'),
    fetchFont('Fira+Code'),
  ]);
  fontsCache = { vollkorn, firaCode };
  return fontsCache;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      title: stripHtml(post.title),
      date: new Date(post.date).toLocaleDateString('en', { dateStyle: 'long' }),
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, date } = props as { title: string; date: string };
  const { vollkorn, firaCode } = await loadFonts();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '80px',
          background: '#131313',
          color: '#ffffff',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: '"Fira Code"',
                      fontSize: 20,
                      color: 'rgba(255,255,255,0.70)',
                    },
                    children: date,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Vollkorn',
                      fontSize: 72,
                      fontWeight: 400,
                      lineHeight: 1.05,
                      letterSpacing: '-1.5px',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: '"Fira Code"',
                fontSize: 22,
                color: 'rgba(255,255,255,0.70)',
              },
              children: [
                { type: 'div', props: { children: 'chek.dev' } },
                { type: 'div', props: { children: 'Joseph Chekanoff' } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Vollkorn', data: vollkorn, weight: 400, style: 'normal' },
        { name: 'Fira Code', data: firaCode, weight: 400, style: 'normal' },
      ],
    }
  );

  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
