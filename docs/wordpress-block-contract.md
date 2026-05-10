# WordPress Block Contract

WordPress is the editor. Astro owns routing, layout, typography, and front-end behavior.

Keep the WordPress authoring surface small. Content should describe the post or page, not design it.

## Allowed Blocks

Enable these blocks in WordPress:

| Block | WordPress name | Notes |
| --- | --- | --- |
| Paragraph | `core/paragraph` | Body copy. |
| Heading | `core/heading` | Use `h2` through `h6` in body content. Astro owns the `h1`. |
| List | `core/list` | Ordered and unordered lists. |
| Quote | `core/quote` | Quoted passages. |
| Pullquote | `core/pullquote` | Use sparingly. |
| Verse | `core/verse` | Poems, lyrics, or intentionally formatted text. |
| Image | `core/image` | Requires useful alt text unless decorative. |
| Gallery | `core/gallery` | Simple image grids only. |
| Table | `core/table` | Basic tabular content. |
| Details | `core/details` | Native disclosure content. |
| Separator | `core/separator` | Horizontal rule. |
| Code | `core/code` | Inline-sized code examples. |
| Preformatted | `core/preformatted` | Long code/text blocks. Use approved `pre-*` language classes. |
| Embed | `core/embed` | YouTube and Vimeo only. |

Allowed inline formatting:

- Links
- Bold
- Italic
- Inline code
- Strikethrough
- Subscript and superscript

## Disabled Blocks

Disable blocks that duplicate Astro responsibilities or create unreviewed markup:

- Layout blocks: Group, Row, Stack, Columns, Grid, Media & Text, Cover, Spacer
- Navigation and theme blocks: Navigation, Query Loop, Template Part, Post Title, Post Content, Comments
- Widget blocks: Archives, Calendar, Categories, Latest Posts, RSS, Search, Social Icons, Tag Cloud
- Interactive blocks: Buttons, forms, RSVP/contact plugins
- Commerce blocks
- Custom HTML and Shortcode
- File, Audio, and Video blocks unless Astro gets matching presentation styles

## Disabled Settings

Disable editor controls that change site design from WordPress:

- Custom colors and background colors
- Custom font sizes and typography controls
- Drop caps
- Block spacing and dimensions controls
- Border controls
- Layout controls
- Custom CSS classes unless needed for a migration
- Anchors unless heading deep links are added intentionally

## Editorial Rules

- Use the WordPress title field for page and post titles.
- Do not add an `h1` block unless imported content requires it.
- Start content with paragraphs, images, or `h2` sections.
- Keep heading levels in order.
- Do not use empty paragraphs or spacer blocks for visual spacing.
- Keep captions plain text, with links only when needed.
- Avoid pasted rich text that introduces inline styles.

## Astro Expectations

Astro currently receives rendered HTML from WPGraphQL and injects it into pages. Unsupported blocks may still output HTML, but they are not guaranteed to look correct.

Astro should style the semantic HTML emitted by allowed blocks: headings, paragraphs, links, lists, quotes, figures, captions, images, code, preformatted text, tables, details, horizontal rules, and approved embeds.

Astro should not depend on WordPress theme CSS. Target stable `wp-block-*` classes only when semantic selectors are not enough.

## Enforcement

Preferred WordPress enforcement:

- Add a small site-specific plugin that defines `allowed_block_types_all`.
- Disable design supports through `theme.json` or editor settings.
- Keep the enforcement code with this Astro repo or a companion WordPress repo.

Minimal plugin sketch:

```php
<?php
/**
 * Plugin Name: Joseph Chekanoff Content Contract
 */

add_filter('allowed_block_types_all', function () {
    return [
        'core/paragraph',
        'core/heading',
        'core/list',
        'core/quote',
        'core/pullquote',
        'core/verse',
        'core/code',
        'core/preformatted',
        'core/image',
        'core/gallery',
        'core/table',
        'core/details',
        'core/separator',
        'core/embed',
    ];
});
```

When adding a block, update this file, add Astro styling or rendering support, and enable the block in WordPress.
