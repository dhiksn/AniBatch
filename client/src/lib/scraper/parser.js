import * as cheerio from 'cheerio';
import { BASE_URL } from './http.js';

export function resolveUrl(href) {
  if (!href) return '';
  href = href.trim();
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  try { return new URL(href, BASE_URL).href; } catch { return href; }
}

export function urlToSlug(url) {
  try {
    const parts = new URL(url).pathname.replace(/\/$/, '').split('/');
    return parts[parts.length - 1] || '';
  } catch { return ''; }
}

export function parseAnimeCard($, el) {
  const $el = $(el);
  const $link = $el.find('a').first();
  const href = resolveUrl($link.attr('href') || '');
  const slug = urlToSlug(href);
  const title =
    $el.find('.eggtitle').first().text().trim() ||
    $el.find('.ntitle').first().text().trim() ||
    $link.attr('title') ||
    $el.find('h2').first().text().trim() || '';
  const $img = $el.find('img').first();
  const thumbnail = resolveUrl($img.attr('src') || $img.attr('data-src') || '');
  const episodeLabel =
    $el.find('.eggepisode').first().text().trim() ||
    $el.find('.epx').first().text().trim() || '';
  const type =
    $el.find('.eggtype').first().text().trim() ||
    $el.find('.typez').first().text().trim() || '';
  const score = $el.find('.numscore, .score, .imdb, .rating').first().text().trim() || '';
  return { title, slug, url: href, thumbnail, type, episodeLabel, score };
}

export function parseAnimeDetail(html) {
  const $ = cheerio.load(html);
  const title =
    $('h1.entry-title').first().text().trim() ||
    $('title').text().replace(/[-|–].*$/, '').trim();
  const alternativeTitle = $('.alter').first().text().trim();
  const $thumb = $('.thumbook img, .thumb img').first();
  const thumbnail = resolveUrl($thumb.attr('src') || $thumb.attr('data-src') || '');
  const description = $('[itemprop="description"]').first().text().trim();
  const meta = {};
  const castLinks = [];
  $('.spe span').each((_, el) => {
    const bold = $(el).find('b').first().text().replace(':', '').trim().toLowerCase();
    if (!bold) return;
    if (bold === 'casts') {
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
  const genres = [];
  $('.genxed a[rel="tag"]').each((_, el) => {
    const name = $(el).text().trim();
    const href = resolveUrl($(el).attr('href') || '');
    const slug = urlToSlug(href);
    if (name && slug) genres.push({ name, slug, url: href });
  });
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
        const url = $(aEl).attr('href') || '';
        if (label && url) mirrors.push({ label, url });
      });
      if (resolution || mirrors.length) qualities.push({ resolution, mirrors });
    });
    if (episodeTitle || qualities.length) downloads.push({ episode: episodeTitle, qualities });
  });
  return {
    title, alternativeTitle, thumbnail, description,
    status: meta['status'] || '', type: meta['tipe'] || '',
    studio: meta['studio'] || '', released: meta['dirilis'] || '',
    season: meta['musim'] || '',
    rating: $('[itemprop="ratingValue"], .numscore, .imdb').first().text().trim() || '',
    genres, cast: castLinks, downloads,
  };
}

export function parseGenres(html) {
  const $ = cheerio.load(html);
  const genres = [];
  const seen = new Set();
  $('.soralist .blix ul li a, .soralist ul li a').each((_, el) => {
    const name = $(el).text().trim();
    const href = resolveUrl($(el).attr('href') || '');
    const slug = urlToSlug(href);
    if (name && slug && !seen.has(slug)) { seen.add(slug); genres.push({ name, slug, url: href }); }
  });
  if (genres.length === 0) {
    $('a[href*="/tag/"]').each((_, el) => {
      const name = $(el).text().trim();
      const href = resolveUrl($(el).attr('href') || '');
      const slug = urlToSlug(href);
      if (name && slug && !seen.has(slug) && name.length > 1) { seen.add(slug); genres.push({ name, slug, url: href }); }
    });
  }
  return genres;
}

export function parsePagination(html, currentPage = 1) {
  const $ = cheerio.load(html);
  let page = currentPage;
  let hasPrev = false;
  let hasNext = false;
  let totalPages = null;
  const currentEl = $('span.page-numbers.current, span.current').first();
  if (currentEl.length) { const n = parseInt(currentEl.text().trim(), 10); if (!isNaN(n)) page = n; }
  hasPrev = $('a.prev, a[rel="prev"]').length > 0;
  hasNext = $('a.next, a[rel="next"]').length > 0;
  let max = page;
  $('a.page-numbers').each((_, el) => { const n = parseInt($(el).text().trim(), 10); if (!isNaN(n) && n > max) max = n; });
  if (max > 1) { totalPages = max; if (page > 1) hasPrev = true; if (page < max) hasNext = true; }
  return { page, hasPrev, hasNext, totalPages };
}

export function parseHomePage(html) {
  const $ = cheerio.load(html);
  function cardsFrom($container) {
    const cards = [];
    $container.find('article.bs').each((_, el) => cards.push(parseAnimeCard($, el)));
    return cards;
  }
  let hot = [], latest = [], completed = [], movies = [];
  $('#content .bixbox').each((_, el) => {
    const $box = $(el);
    const releasesClass = $box.find('.releases').first().attr('class') || '';
    const heading = $box.find('.releases h2, .releases h3').first().text().trim();
    if (releasesClass.includes('hothome')) hot = cardsFrom($box);
    else if ($box.hasClass('latestdark') || releasesClass.includes('latesthome')) latest = cardsFrom($box).map(({ score, ...card }) => card);
    else if (heading.toLowerCase().includes('selesai')) completed = cardsFrom($box);
    else if (heading.toLowerCase().includes('film')) movies = cardsFrom($box);
  });
  function parsePopularTab(selector) {
    const items = [];
    $(`${selector} ul li`).each((_, li) => {
      const $li = $(li);
      const rank = $li.find('.ctr').first().text().trim();
      const $link = $li.find('div.imgseries a.series').first();
      const href = resolveUrl($link.attr('href') || '');
      const slug = urlToSlug(href);
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
  return { hot, latest, completed, movies, popular: { weekly: parsePopularTab('.serieslist.wpop-weekly'), monthly: parsePopularTab('.serieslist.wpop-monthly'), alltime: parsePopularTab('.serieslist.wpop-alltime') } };
}

export function parsePopularSidebar(html) {
  const $ = cheerio.load(html);
  function parseTab(selector) {
    const items = [];
    $(`${selector} ul li`).each((_, li) => {
      const $li = $(li);
      const rank = $li.find('.ctr').first().text().trim();
      const $link = $li.find('div.imgseries a.series').first();
      const href = resolveUrl($link.attr('href') || '');
      const slug = urlToSlug(href);
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
  return { weekly: parseTab('.serieslist.wpop-weekly'), monthly: parseTab('.serieslist.wpop-monthly'), alltime: parseTab('.serieslist.wpop-alltime') };
}

export function parseSearchResults(html) {
  const $ = cheerio.load(html);
  const results = [];
  $('article.bs').each((_, el) => results.push(parseAnimeCard($, el)));
  return results;
}

export function parseSeasonPage(html) {
  const $ = cheerio.load(html);
  const season = $('.newseason h1, .newseason h2').first().text().trim();
  const animes = [];
  $('.listseries .card').each((_, el) => {
    const $card = $(el);
    const $link = $card.find('a').first();
    const href = resolveUrl($link.attr('href') || '');
    const slug = urlToSlug(href);
    const title = $card.find('.card-title h2').first().text().trim() || $link.attr('title') || '';
    const thumbnail = resolveUrl($card.find('img').first().attr('src') || '');
    const studio = $card.find('.studio').first().text().trim();
    const metaSpan = $card.find('.stats .left span').first().text().trim();
    const metaParts = metaSpan.split('·').map(s => s.trim());
    const genres = [];
    $card.find('.card-info-bottom a[rel="tag"]').each((__, a) => {
      const name = $(a).text().trim();
      const gHref = resolveUrl($(a).attr('href') || '');
      const gSlug = urlToSlug(gHref);
      if (name && gSlug) genres.push({ name, slug: gSlug, url: gHref });
    });
    if (slug) animes.push({
      title, alternativeTitle: $card.find('.alternative').first().text().trim(),
      slug, url: href, thumbnail, studio, type: metaParts[1] || '',
      episodes: metaParts[0] || '', status: $card.find('.status').first().text().trim(),
      score: $card.find('.right span').first().text().trim(),
      synopsis: $card.find('.desc').first().text().trim(), genres,
    });
  });
  return { season, animes };
}

export function parseSeasonList(html) {
  const $ = cheerio.load(html);
  const seasons = [];
  $('.mseason ul.season li a').each((_, el) => {
    const href = resolveUrl($(el).attr('href') || '');
    const slug = urlToSlug(href);
    const count = parseInt($(el).find('span').text().trim(), 10) || 0;
    const $clone = $(el).clone();
    $clone.find('span').remove();
    const label = $clone.text().trim();
    if (!slug || !/^[a-z]+-\d{4}$/.test(slug)) return;
    seasons.push({ label, slug, url: href, count });
  });
  return seasons;
}
