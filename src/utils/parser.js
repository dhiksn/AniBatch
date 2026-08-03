/**
 * Cheerio-based HTML parsers.
 *
 * All selectors are centralised here so that if alqanime.net changes its
 * markup, only this file needs to be updated.
 *
 * URL normalisation: every href / src encountered is resolved against
 * BASE_URL via `resolveUrl()` so the API always returns absolute URLs.
 */

const cheerio = require('cheerio');
const { BASE_URL } = require('./http');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a relative URL to an absolute one.
 * Returns the original string unchanged if it is already absolute or empty.
 */
function resolveUrl(href) {
  if (!href) return '';
  href = href.trim();
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return href;
  }
}

/**
 * Extract a slug from a full URL.
 * e.g. "https://alqanime.net/anime/naruto-shippuuden/" → "naruto-shippuuden"
 */
function urlToSlug(url) {
  try {
    const parts = new URL(url).pathname.replace(/\/$/, '').split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// parseAnimeCard  —  used on homepage, genre pages, and search results
// ---------------------------------------------------------------------------

/**
 * Parse a single anime card element from alqanime.net.
 *
 * alqanime.net uses TWO different card styles:
 *
 * Style A — standard cards (hot/completed/movies sections):
 *   <article class="bs">
 *     <div class="bsx">
 *       <a href="...">
 *         <div class="limit">
 *           <div class="typez TV">TV</div>
 *           <div class="bt"><span class="epx">Ongoing</span></div>
 *           <img src="..." />
 *         </div>
 *         <div class="tt">
 *           <span class="ntitle">Anime Title</span>
 *         </div>
 *       </a>
 *     </div>
 *   </article>
 *
 * Style B — "egg" layout (.latestdark / Rilisan Terbaru section):
 *   <article class="bs styleegg">
 *     <div class="bsx">
 *       <a href="...">
 *         <div class="limit">
 *           <div class="egghead">
 *             <div class="eggtitle">Anime Title</div>
 *             <div class="eggmeta">
 *               <div class="eggtype TV">TV</div>
 *               <div class="eggepisode">Eps 04</div>
 *             </div>
 *           </div>
 *           <img src="..." />
 *         </div>
 *         <div class="tt"><h2>Full Episode Title</h2></div>
 *       </a>
 *     </div>
 *   </article>
 *
 * (verified 2026-07-30)
 *
 * @param {cheerio.CheerioAPI} $
 * @param {cheerio.Element} el   — article.bs
 * @returns {object}
 */
function parseAnimeCard($, el) {
  const $el = $(el);
  const $link = $el.find('a').first();
  const href  = resolveUrl($link.attr('href') || '');
  const slug  = urlToSlug(href);

  // Title — Style B: .eggtitle  |  Style A: .ntitle  |  fallback: a[title] or h2
  const title =
    $el.find('.eggtitle').first().text().trim() ||
    $el.find('.ntitle').first().text().trim() ||
    $link.attr('title') ||
    $el.find('h2').first().text().trim() ||
    '';

  // Thumbnail
  const $img = $el.find('img').first();
  const thumbnail = resolveUrl($img.attr('src') || $img.attr('data-src') || '');

  // Episode label — Style B: .eggepisode  |  Style A: .epx
  const episodeLabel =
    $el.find('.eggepisode').first().text().trim() ||
    $el.find('.epx').first().text().trim() ||
    '';

  // Type — Style B: .eggtype  |  Style A: .typez
  const type =
    $el.find('.eggtype').first().text().trim() ||
    $el.find('.typez').first().text().trim() ||
    '';

  // Score / rating (present on search results)
  const score = $el.find('.numscore, .score, .imdb, .rating').first().text().trim() || '';

  return { title, slug, url: href, thumbnail, type, episodeLabel, score };
}

// ---------------------------------------------------------------------------
// parseAnimeDetail  —  used on /anime/:slug detail page
// ---------------------------------------------------------------------------

/**
 * Parse an anime detail page from alqanime.net.
 *
 * Verified markup (2026-07-30) from /naruto-shippuuden/:
 *
 * <div class="thumbook">
 *   <div class="thumb"><img src="..." /></div>
 * </div>
 * <div class="infox">
 *   <h1 class="entry-title" itemprop="name">...</h1>
 *   <div class="alter">Alt Title 1, Alt Title 2</div>
 *   <div class="spe">
 *     <span><b>Status:</b> Completed</span>
 *     <span><b>Studio:</b> <a>...</a></span>
 *     <span><b>Dirilis:</b> 2007</span>
 *     <span><b>Durasi:</b> 23 min. per ep.</span>
 *     <span><b>Musim:</b> <a>Winter 2007</a></span>
 *     <span><b>Tipe:</b> <a>TV</a></span>
 *   </div>
 *   <div class="genxed">
 *     <a href="/tag/action/">Action</a> ...
 *   </div>
 *   <div class="desc">SEO spam — ignored</div>
 * </div>
 *
 * Sinopsis yang benar ada di [itemprop="description"], bukan .desc.
 * Cast ada di .spe span yang berisi <b>Casts:</b> diikuti <a class="casts">.
 *
 * @param {string} html
 * @returns {object}
 */
function parseAnimeDetail(html) {
  const $ = cheerio.load(html);

  // Title  (h1.entry-title inside .infox)
  const title =
    $('h1.entry-title').first().text().trim() ||
    $('title').text().replace(/[-|–].*$/, '').trim();

  // Alternative title  (.alter)
  const alternativeTitle = $('.alter').first().text().trim();

  // Thumbnail  (.thumbook .thumb img)
  const $thumb = $('.thumbook img, .thumb img').first();
  const thumbnail = resolveUrl($thumb.attr('src') || $thumb.attr('data-src') || '');

  // Sinopsis — [itemprop="description"] contains the real synopsis.
  // .desc is SEO-only filler text and must be ignored.
  const description = $('[itemprop="description"]').first().text().trim();

  // Metadata from .spe spans
  // Each span: <span><b>Label:</b> Value or <a>Value</a></span>
  const meta = {};
  const castLinks = [];

  $('.spe span').each((_, el) => {
    const bold = $(el).find('b').first().text().replace(':', '').trim().toLowerCase();
    if (!bold) return;

    if (bold === 'casts') {
      // Cast entries are <a class="casts"> links within this span
      $(el).find('a.casts').each((_, a) => {
        const name = $(a).text().trim();
        const href = resolveUrl($(a).attr('href') || '');
        const slug = urlToSlug(href);
        if (name) castLinks.push({ name, slug, url: href });
      });
      return;
    }

    const $clone = $(el).clone();
    $clone.find('b').remove();
    const value = $clone.text().replace(/^[:\s]+/, '').trim();
    if (value) meta[bold] = value;
  });

  const status   = meta['status']  || '';
  const type     = meta['tipe']    || '';
  const studio   = meta['studio']  || '';
  const released = meta['dirilis'] || '';
  const season   = meta['musim']   || '';

  // Rating / score
  const rating =
    $('[itemprop="ratingValue"], .numscore, .imdb').first().text().trim() || '';

  // Genres — .genxed links point to /tag/<slug>/
  const genres = [];
  $('.genxed a[rel="tag"]').each((_, el) => {
    const name = $(el).text().trim();
    const href = resolveUrl($(el).attr('href') || '');
    const slug = urlToSlug(href);
    if (name && slug) genres.push({ name, slug, url: href });
  });

  // Downloads — alqanime.net adalah situs download.
  // Struktur (verified 2026-07-30):
  //
  // <div class="soraddl dlone">
  //   <div class="sorattl"><h3>Batch</h3></div>
  //   <div class="content">
  //     <table><tbody>
  //       <tr>
  //         <td class="reso"><div class="res">360p</div></td>
  //         <td><div class="slink">
  //           <a href="https://...">AceFile</a>
  //           <a href="https://...">MediaFire</a>
  //         </div></td>
  //       </tr>
  //     </tbody></table>
  //   </div>
  // </div>
  //
  // Satu .soraddl = satu episode/batch, berisi N baris resolusi,
  // masing-masing resolusi berisi N mirror link.

  const downloads = [];

  $('.soraddl').each((_, dlEl) => {
    const $dl = $(dlEl);
    const episodeTitle = $dl.find('.sorattl h3, .sorattl h4').first().text().trim();

    const qualities = [];

    $dl.find('table tr').each((_, trEl) => {
      const $tr = $(trEl);
      const resolution = $tr.find('.res').first().text().trim();

      const mirrors = [];
      $tr.find('.slink a').each((_, aEl) => {
        const label = $(aEl).text().trim();
        const url   = $(aEl).attr('href') || '';
        if (label && url) mirrors.push({ label, url });
      });

      if (resolution || mirrors.length) {
        qualities.push({ resolution, mirrors });
      }
    });

    if (episodeTitle || qualities.length) {
      downloads.push({ episode: episodeTitle, qualities });
    }
  });

  return {
    title,
    alternativeTitle,
    thumbnail,
    description,
    status,
    type,
    studio,
    released,
    season,
    rating,
    genres,
    cast: castLinks,
    downloads,
  };
}

// ---------------------------------------------------------------------------
// parseGenres  —  list of all genres (typically from sidebar or genre page)
// ---------------------------------------------------------------------------

/**
 * Parse genre links from alqanime.net.
 *
 * Verified markup (2026-07-30): /genre/ page uses:
 *   <div class="soralist">
 *     <div class="blix">
 *       <span><a name="A">A</a></span>
 *       <ul>
 *         <li><a href="https://alqanime.net/tag/action/">Action</a></li>
 *         ...
 *       </ul>
 *     </div>
 *   </div>
 *
 * Genres use the WordPress TAG taxonomy: /tag/<slug>/
 *
 * @param {string} html
 * @returns {Array<{name:string, slug:string, url:string}>}
 */
function parseGenres(html) {
  const $ = cheerio.load(html);
  const genres = [];
  const seen = new Set();

  // Primary selector: genre index page
  $('.soralist .blix ul li a, .soralist ul li a').each((_, el) => {
    const name = $(el).text().trim();
    const href = resolveUrl($(el).attr('href') || '');
    const slug = urlToSlug(href);
    if (name && slug && !seen.has(slug)) {
      seen.add(slug);
      genres.push({ name, slug, url: href });
    }
  });

  // Fallback: any /tag/ links on the page (sidebar, etc.)
  if (genres.length === 0) {
    $('a[href*="/tag/"]').each((_, el) => {
      const name = $(el).text().trim();
      const href = resolveUrl($(el).attr('href') || '');
      const slug = urlToSlug(href);
      if (name && slug && !seen.has(slug) && name.length > 1) {
        seen.add(slug);
        genres.push({ name, slug, url: href });
      }
    });
  }

  return genres;
}

// ---------------------------------------------------------------------------
// parsePagination
// ---------------------------------------------------------------------------

/**
 * Parse pagination from alqanime.net.
 *
 * Verified markup (2026-07-30):
 * <div class="pagination">
 *   <span aria-current="page" class="page-numbers current">1</span>
 *   <a class="page-numbers" href=".../page/2/">2</a>
 *   <a class="page-numbers" href=".../page/3/">3</a>
 *   <span class="page-numbers dots">…</span>
 *   <a class="page-numbers" href=".../page/N/">N</a>
 * </div>
 *
 * prev/next links are NOT present — determine from current page position.
 *
 * @param {string} html
 * @param {number} currentPage
 */
function parsePagination(html, currentPage = 1) {
  const $ = cheerio.load(html);

  let page = currentPage;
  let hasPrev = false;
  let hasNext = false;
  let totalPages = null;

  // Current page from span.current
  const currentEl = $('span.page-numbers.current, span.current').first();
  if (currentEl.length) {
    const n = parseInt(currentEl.text().trim(), 10);
    if (!isNaN(n)) page = n;
  }

  // Explicit prev/next links
  hasPrev = $('a.prev, a[rel="prev"]').length > 0;
  hasNext = $('a.next, a[rel="next"]').length > 0;

  // Largest page number found in pagination links
  let max = page;
  $('a.page-numbers').each((_, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > max) max = n;
  });

  if (max > 1) {
    totalPages = max;
    if (page > 1)   hasPrev = true;
    if (page < max) hasNext = true;
  }

  return { page, hasPrev, hasNext, totalPages };
}

/**
 * Parse the homepage of alqanime.net.
 *
 * Verified section structure (2026-07-30):
 *
 *   .bixbox  with  .releases.hothome    → "Lagi Hangat Saat ini"  (5 cards)
 *   .bixbox.latestdark                  → "Rilisan Terbaru"        (20 cards, egg layout)
 *   .bixbox  [2nd without special class]→ "Selesai Tayang"         (5 cards)
 *   .bixbox  [3rd without special class]→ "Film Layar Lebar"       (5 cards)
 *
 * Sections without a unique class are identified by their heading text inside
 * .releases h2, which is a sibling div inside the same .bixbox wrapper.
 *
 * @param {string} html
 * @returns {object}
 */
function parseHomePage(html) {
  const $ = cheerio.load(html);

  function cardsFrom($container) {
    const cards = [];
    $container.find('article.bs').each((_, el) => {
      cards.push(parseAnimeCard($, el));
    });
    return cards;
  }

  let hot = [], latest = [], completed = [], movies = [];

  $('#content .bixbox').each((_, el) => {
    const $box = $(el);
    const releasesClass = $box.find('.releases').first().attr('class') || '';
    const heading = $box.find('.releases h2, .releases h3').first().text().trim();

    if (releasesClass.includes('hothome')) {
      hot = cardsFrom($box);
    } else if ($box.hasClass('latestdark') || releasesClass.includes('latesthome')) {
      latest = cardsFrom($box).map(({ score, ...card }) => card);
    } else if (heading.toLowerCase().includes('selesai')) {
      completed = cardsFrom($box);
    } else if (heading.toLowerCase().includes('film')) {
      movies = cardsFrom($box);
    }
  });

  // Sidebar "Anime Populer" — 3 tabs: weekly, monthly, alltime
  // Each .serieslist.wpop-<range> contains ranked items
  function parsePopularTab(selector) {
    const items = [];
    $(`${selector} ul li`).each((_, li) => {
      const $li   = $(li);
      const rank  = $li.find('.ctr').first().text().trim();
      const $link = $li.find('div.imgseries a.series').first();
      const href  = resolveUrl($link.attr('href') || '');
      const slug  = urlToSlug(href);
      const title = $li.find('.leftseries h4 a').first().text().trim();
      const thumbnail = resolveUrl($li.find('img').first().attr('src') || '');
      const score = $li.find('.numscore').first().text().trim();
      const genres = [];
      $li.find('span a[rel="tag"]').each((__, a) => {
        const name = $(a).text().trim();
        const gHref = resolveUrl($(a).attr('href') || '');
        const gSlug = urlToSlug(gHref);
        if (name && gSlug) genres.push({ name, slug: gSlug, url: gHref });
      });
      if (slug) items.push({ rank, title, slug, url: href, thumbnail, score, genres });
    });
    return items;
  }

  const popular = {
    weekly:  parsePopularTab('.serieslist.wpop-weekly'),
    monthly: parsePopularTab('.serieslist.wpop-monthly'),
    alltime: parsePopularTab('.serieslist.wpop-alltime'),
  };

  return { hot, latest, completed, movies, popular };
}

// ---------------------------------------------------------------------------
// parsePopularSidebar  —  standalone, callable from any page HTML
// ---------------------------------------------------------------------------

/**
 * Extract the "Anime Populer" sidebar widget from any page HTML.
 * Returns weekly / monthly / alltime top-5 lists.
 *
 * @param {string} html
 * @returns {{ weekly: Array, monthly: Array, alltime: Array }}
 */
function parsePopularSidebar(html) {
  const $ = cheerio.load(html);

  function parseTab(selector) {
    const items = [];
    $(`${selector} ul li`).each((_, li) => {
      const $li   = $(li);
      const rank  = $li.find('.ctr').first().text().trim();
      const $link = $li.find('div.imgseries a.series').first();
      const href  = resolveUrl($link.attr('href') || '');
      const slug  = urlToSlug(href);
      const title = $li.find('.leftseries h4 a').first().text().trim();
      const thumbnail = resolveUrl($li.find('img').first().attr('src') || '');
      const score = $li.find('.numscore').first().text().trim();
      const genres = [];
      $li.find('span a[rel="tag"]').each((__, a) => {
        const name  = $(a).text().trim();
        const gHref = resolveUrl($(a).attr('href') || '');
        const gSlug = urlToSlug(gHref);
        if (name && gSlug) genres.push({ name, slug: gSlug, url: gHref });
      });
      if (slug) items.push({ rank, title, slug, url: href, thumbnail, score, genres });
    });
    return items;
  }

  return {
    weekly:  parseTab('.serieslist.wpop-weekly'),
    monthly: parseTab('.serieslist.wpop-monthly'),
    alltime: parseTab('.serieslist.wpop-alltime'),
  };
}

/**
 * Parse search results from alqanime.net.
 *
 * Search URL: /?s=<query>
 * Results are standard article.bs cards.
 *
 * @param {string} html
 * @returns {Array}
 */
function parseSearchResults(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('article.bs').each((_, el) => {
    results.push(parseAnimeCard($, el));
  });

  return results;
}

// ---------------------------------------------------------------------------
// parseSeasonPage  —  /season/:slug page
// ---------------------------------------------------------------------------

/**
 * Parse a season page from alqanime.net.
 *
 * Verified markup (2026-07-30) — completely different from other pages:
 *
 * <div class="newseason">
 *   <h1>Fall 2013</h1>
 *   <div class="listseries">
 *     <div class="card">
 *       <div class="card-box">
 *         <a href="https://alqanime.net/.../" title="...">
 *           <div class="card-thumb">
 *             <img src="..." />
 *             <div class="card-title">
 *               <h2>Title</h2>
 *               <span class="studio purple">Studio Name</span>
 *             </div>
 *           </div>
 *         </a>
 *         <div class="card-info">
 *           <div class="card-info-top">
 *             <div class="stats">
 *               <div class="left">
 *                 <span>12 episodes · Series</span>
 *                 <span class="status">Completed</span>
 *                 <span class="alternative">Alt titles...</span>
 *               </div>
 *               <div class="right purple"><span>7.39</span></div>
 *             </div>
 *             <div class="desc"><p>Synopsis...</p></div>
 *           </div>
 *           <div class="card-info-bottom purple">
 *             <a href="/tag/action/">Action</a>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * No pagination — all anime in a season are on one page.
 *
 * @param {string} html
 * @returns {{ season: string, animes: Array }}
 */
function parseSeasonPage(html) {
  const $ = cheerio.load(html);

  const season = $('.newseason h1, .newseason h2').first().text().trim();

  const animes = [];

  $('.listseries .card').each((_, el) => {
    const $card = $(el);

    const $link  = $card.find('a').first();
    const href   = resolveUrl($link.attr('href') || '');
    const slug   = urlToSlug(href);
    const title  = $card.find('.card-title h2').first().text().trim()
                || $link.attr('title') || '';
    const thumbnail = resolveUrl($card.find('img').first().attr('src') || '');
    const studio    = $card.find('.studio').first().text().trim();

    // "12 episodes · Series" — first plain <span> inside .left
    const metaSpan  = $card.find('.stats .left span').first().text().trim();
    const metaParts = metaSpan.split('·').map(s => s.trim());
    const episodes  = metaParts[0] || '';
    const type      = metaParts[1] || '';

    const status    = $card.find('.status').first().text().trim();
    const altTitle  = $card.find('.alternative').first().text().trim();
    const score     = $card.find('.right span').first().text().trim();
    const synopsis  = $card.find('.desc').first().text().trim();

    const genres = [];
    $card.find('.card-info-bottom a[rel="tag"]').each((__, a) => {
      const name = $(a).text().trim();
      const gHref = resolveUrl($(a).attr('href') || '');
      const gSlug = urlToSlug(gHref);
      if (name && gSlug) genres.push({ name, slug: gSlug, url: gHref });
    });

    if (slug) {
      animes.push({ title, alternativeTitle: altTitle, slug, url: href,
        thumbnail, studio, type, episodes, status, score, synopsis, genres });
    }
  });

  return { season, animes };
}

/**
 * Parse the Season sidebar list from homepage HTML.
 *
 * Verified markup (2026-07-30):
 *   <div class="mseason">
 *     <ul class="season">
 *       <li><a href="/season/fall-2013/">Fall 2013 <span>28</span></a></li>
 *       ...
 *     </ul>
 *   </div>
 *
 * @param {string} html
 * @returns {Array<{label:string, slug:string, url:string, count:number}>}
 */
function parseSeasonList(html) {
  const $ = cheerio.load(html);
  const seasons = [];

  $('.mseason ul.season li a').each((_, el) => {
    const href  = resolveUrl($(el).attr('href') || '');
    const slug  = urlToSlug(href);
    const count = parseInt($(el).find('span').text().trim(), 10) || 0;

    // Label = full text minus the count span
    const $clone = $(el).clone();
    $clone.find('span').remove();
    const label = $clone.text().trim();

    // Skip typo entries like "Fall 20220" or "Summer 20212"
    if (!slug || !/^[a-z]+-\d{4}$/.test(slug)) return;

    seasons.push({ label, slug, url: href, count });
  });

  // Return as-is — order matches the website's original sidebar order exactly
  return seasons;
}

module.exports = {
  resolveUrl,
  urlToSlug,
  parseAnimeCard,
  parseAnimeDetail,
  parseGenres,
  parsePagination,
  parseHomePage,
  parseSearchResults,
  parseSeasonPage,
  parsePopularSidebar,
  parseSeasonList,
};
