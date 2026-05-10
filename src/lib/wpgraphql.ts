import { decodeHtmlEntities } from './html';

const endpoint = import.meta.env.WORDPRESS_GRAPHQL_ENDPOINT;

const featuredImageFields = `
  featuredImage {
    node {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
`;

const taxonomyFields = `
  nodes {
    id
    name
    slug
  }
`;

const postSummaryFields = `
  id
  slug
  title
  excerpt
  date
  ${featuredImageFields}
  categories {
    ${taxonomyFields}
  }
  tags {
    ${taxonomyFields}
  }
`;

export type WpTaxonomyTerm = {
  id: string;
  name: string;
  slug: string;
};

export type WpFeaturedImage = {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      width?: number;
      height?: number;
    } | null;
  };
} | null;

export type WpPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage: WpFeaturedImage;
  categories: { nodes: WpTaxonomyTerm[] };
  tags: { nodes: WpTaxonomyTerm[] };
};

export type WpPost = WpPostSummary & {
  content: string;
};

export function getPostPermalink(post: Pick<WpPostSummary, 'date' | 'slug'>) {
  return `/${post.date.slice(0, 10)}/${post.slug}/`;
}

export function getCategoryPermalink(category: Pick<WpTaxonomyTerm, 'slug'>) {
  return `/category/${category.slug}/`;
}

export function getVisibleCategories(categories: WpTaxonomyTerm[]) {
  return categories.filter((category) => category.slug !== 'uncategorized');
}

export function getTagPermalink(tag: Pick<WpTaxonomyTerm, 'slug'>) {
  return `/tag/${tag.slug}/`;
}

export function stripHtml(html: string) {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}

export function getMetaDescription(value: string, fallback = 'Personal blog of Joseph Chekanoff.') {
  const text = stripHtml(value);

  if (!text) {
    return fallback;
  }

  return text.length > 160 ? `${text.slice(0, 157).trim()}...` : text;
}

export function getOpenGraphImage(image: WpFeaturedImage) {
  if (!image?.node.sourceUrl) {
    return null;
  }

  return {
    url: image.node.sourceUrl,
    alt: image.node.altText,
    width: image.node.mediaDetails?.width,
    height: image.node.mediaDetails?.height,
  };
}

export type WpPageSummary = {
  id: string;
  uri: string;
  title: string;
};

export type WpPage = WpPageSummary & {
  content: string;
  featuredImage: WpFeaturedImage;
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function wpGraphql<T>(query: string, variables?: Record<string, unknown>) {
  if (!endpoint) {
    throw new Error('WORDPRESS_GRAPHQL_ENDPOINT is required.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WPGraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as GraphQlResponse<T>;

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join('\n'));
  }

  if (!result.data) {
    throw new Error('WPGraphQL response did not include data.');
  }

  return result.data;
}

export async function getPosts() {
  const data = await wpGraphql<{
    posts: { nodes: WpPostSummary[] };
  }>(`
    query GetPosts {
      posts(first: 100, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
        nodes {
          ${postSummaryFields}
        }
      }
    }
  `);

  return data.posts.nodes;
}

export async function getPostBySlug(slug: string) {
  const data = await wpGraphql<{
    post: WpPost | null;
  }>(
    `
      query GetPostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          ${postSummaryFields}
          content
        }
      }
    `,
    { slug },
  );

  return data.post;
}

export async function getCategories() {
  const data = await wpGraphql<{
    categories: { nodes: WpTaxonomyTerm[] };
  }>(`
    query GetCategories {
      categories(first: 100, where: { hideEmpty: true }) {
        ${taxonomyFields}
      }
    }
  `);

  return data.categories.nodes;
}

export async function getTags() {
  const data = await wpGraphql<{
    tags: { nodes: WpTaxonomyTerm[] };
  }>(`
    query GetTags {
      tags(first: 100, where: { hideEmpty: true }) {
        ${taxonomyFields}
      }
    }
  `);

  return data.tags.nodes;
}

export async function getPostsByCategory(slug: string) {
  const data = await wpGraphql<{
    posts: { nodes: WpPostSummary[] };
  }>(
    `
      query GetPostsByCategory($slug: String!) {
        posts(first: 100, where: { status: PUBLISH, categoryName: $slug, orderby: { field: DATE, order: DESC } }) {
          nodes {
            ${postSummaryFields}
          }
        }
      }
    `,
    { slug },
  );

  return data.posts.nodes;
}

export async function getPostsByTag(slug: string) {
  const data = await wpGraphql<{
    posts: { nodes: WpPostSummary[] };
  }>(
    `
      query GetPostsByTag($slug: String!) {
        posts(first: 100, where: { status: PUBLISH, tag: $slug, orderby: { field: DATE, order: DESC } }) {
          nodes {
            ${postSummaryFields}
          }
        }
      }
    `,
    { slug },
  );

  return data.posts.nodes;
}

export async function getPages() {
  const data = await wpGraphql<{
    pages: { nodes: WpPageSummary[] };
  }>(`
    query GetPages {
      pages(first: 100, where: { status: PUBLISH }) {
        nodes {
          id
          uri
          title
        }
      }
    }
  `);

  return data.pages.nodes;
}

export async function getPageByUri(uri: string) {
  const data = await wpGraphql<{
    page: WpPage | null;
  }>(
    `
      query GetPageByUri($uri: ID!) {
        page(id: $uri, idType: URI) {
          id
          uri
          title
          content
          ${featuredImageFields}
        }
      }
    `,
    { uri },
  );

  return data.page;
}
