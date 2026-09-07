/**
 * Scraper service — ESM version for Next.js API routes.
 * NodeCache removed (serverless is stateless).
 * Caching is handled by Next.js / Vercel CDN via Cache-Control headers.
 */

import { fetchPage } from './http.js';
import {
  parseHomePage,
  parseAnimeDetail,
  parseSearchResults,
  parseGenres,
  parseAnimeCard,
  parsePagination,
  parseSeasonPage,
  parsePopularSidebar,
  parseSeasonList,
  resolveUrl,
  urlToSlug,
} from './parser.js';
import * as cheerio from 'cheerio';

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export async function getHome(page = 1) {
  const path = page > 1 ? `/page/${page}/` : '/';
  const html = await fetchPage(path);
  let data;
  if (page === 1) {
    data = parseHomePage(html);
  } else {
    const $ = cheerio.load(html);
    const latest = [];
    let grabbed = false;
    $('#content .bixbox').each((_, el) => {
      const $box = $(el);
      const releasesClass = $box.find('.releases').first().attr('class') || '';
      if ($box.hasClass('latestdark') || releasesClass.includes('latesthome')) {
        $box.find('article.bs').each((__, card) => latest.push(parseAnimeCard($, card)));
        grabbed = true;
      }
    });
    if (!grabbed) $('article.bs').each((_, el) => latest.push(parseAnimeCard($, el)));
    const pagination = parsePagination(html, page);
    data = { hot: [], latest: latest.map(({ score, ...card }) => card), completed: [], movies: [], popular: null, pagination };
  }
  if (page === 1) {
    const $ = cheerio.load(html);
    data.pagination = parsePagination(html, 1);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Anime detail
// ---------------------------------------------------------------------------

export async function getAnimeDetail(slug) {
  if (!slug || typeof slug !== 'string') {
    const e = new Error('Slug tidak valid'); e.statusCode = 400; e.code = 'BAD_REQUEST'; throw e;
  }
  const html = await fetchPage(`/${slug}/`);
  const data = parseAnimeDetail(html);
  if (!data.title) {
    const e = new Error('Anime tidak ditemukan'); e.statusCode = 404; e.code = 'NOT_FOUND'; throw e;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchAnime(query, page = 1) {
  if (!query || query.trim().length < 2) {
    const e = new Error('Query pencarian minimal 2 karakter'); e.statusCode = 400; e.code = 'BAD_REQUEST'; throw e;
  }
  const q = query.trim();
  const encoded = encodeURIComponent(q);
  const path = page > 1 ? `/page/${page}/?s=${encoded}` : `/?s=${encoded}`;
  const html = await fetchPage(path);
  return { results: parseSearchResults(html), pagination: parsePagination(html, page) };
}

// ---------------------------------------------------------------------------
// Genres
// ---------------------------------------------------------------------------

export async function getGenres() {
  return parseGenres(await fetchPage('/genre/'));
}

// ---------------------------------------------------------------------------
// Anime by genre
// ---------------------------------------------------------------------------

export async function getAnimeByGenre(slug, page = 1) {
  if (!slug || typeof slug !== 'string') {
    const e = new Error('Slug genre tidak valid'); e.statusCode = 400; e.code = 'BAD_REQUEST'; throw e;
  }
  const path = page > 1 ? `/tag/${slug}/page/${page}/` : `/tag/${slug}/`;
  const html = await fetchPage(path);
  const $ = cheerio.load(html);
  const genreName =
    $('h1.page-title, h1.entry-title, .wrapheader h2, .taxname').first().text().trim() ||
    $('title').text().replace(/[-|–].*$/, '').trim() || slug;
  const animes = [];
  $('article.bs').each((_, el) => animes.push(parseAnimeCard($, el)));
  return { genre: { name: genreName, slug }, animes, pagination: parsePagination(html, page) };
}

// ---------------------------------------------------------------------------
// Popular
// ---------------------------------------------------------------------------

export async function getPopular(page = 1) {
  const path = page > 1 ? `/popular/page/${page}/` : `/popular/`;
  const html = await fetchPage(path);
  const $ = cheerio.load(html);
  const animes = [];
  $('article.bs').each((_, el) => animes.push(parseAnimeCard($, el)));
  return { animes, pagination: parsePagination(html, page) };
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export async function getSchedule() {
  const html = await fetchPage('/jadwal-rilis/');
  const $ = cheerio.load(html);
  const days = [];
  $('#content .bixbox').each((_, el) => {
    const $box = $(el);
    const dayName = $box.find('.releases h3').first().text().trim();
    if (!dayName) return;
    const animes = [];
    $box.find('article.bs').each((__, card) => animes.push(parseAnimeCard($, card)));
    days.push({ day: dayName, animes });
  });
  return days;
}

// ---------------------------------------------------------------------------
// Anime list
// ---------------------------------------------------------------------------

export async function getAnimeList(letter = null) {
  const html = await fetchPage('/daftar-anime/');
  const $ = cheerio.load(html);
  const groups = [];
  $('.soralist .blix').each((_, blixEl) => {
    const $blix = $(blixEl);
    const letterLabel = $blix.find('span a[name]').first().attr('name') || '';
    const items = [];
    $blix.find('ul li a.series').each((__, aEl) => {
      const title = $(aEl).text().trim();
      const href = resolveUrl($(aEl).attr('href') || '');
      const slug = urlToSlug(href);
      if (title && slug) items.push({ title, slug, url: href });
    });
    if (items.length === 0) return;
    const groupLetter = letterLabel.toUpperCase();
    if (letter && groupLetter !== letter.toUpperCase()) return;
    groups.push({ letter: groupLetter || '#', animes: items });
  });
  return groups;
}

// ---------------------------------------------------------------------------
// Advanced search
// ---------------------------------------------------------------------------

export async function advancedSearch({ title, genres, seasons, studios, types, status, order, page }) {
  const params = new URLSearchParams();
  if (title) params.set('title', title);
  if (status) params.set('status', status);
  if (order) params.set('order', order);
  for (const g of genres) params.append('genre[]', g);
  for (const s of seasons) params.append('season[]', s);
  for (const st of studios) params.append('studio[]', st);
  for (const t of types) params.append('type[]', t);
  const pageSegment = page > 1 ? `page/${page}/` : '';
  const html = await fetchPage(`/advanced-search/${pageSegment}?${params.toString()}`);
  const $ = cheerio.load(html);
  const results = [];
  $('article.bs').each((_, el) => results.push(parseAnimeCard($, el)));
  return { results, pagination: parsePagination(html, page) };
}

// ---------------------------------------------------------------------------
// Anime by season
// ---------------------------------------------------------------------------

export async function getAnimesBySeason(slug) {
  const html = await fetchPage(`/season/${slug}/`);
  const data = parseSeasonPage(html);
  if (!data.season) {
    const e = new Error('Season tidak ditemukan'); e.statusCode = 404; e.code = 'NOT_FOUND'; throw e;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Anime by cast
// ---------------------------------------------------------------------------

export async function getAnimeByCast(slug, page = 1) {
  if (!slug || typeof slug !== 'string') {
    const e = new Error('Slug cast tidak valid'); e.statusCode = 400; e.code = 'BAD_REQUEST'; throw e;
  }
  const path = page > 1 ? `/cast/${slug}/page/${page}/` : `/cast/${slug}/`;
  const html = await fetchPage(path);
  const $ = cheerio.load(html);
  const name =
    $('.releases h1 span, .releases h1').first().text().trim() ||
    $('title').text().replace(/Archives.*$/i, '').trim();
  const animes = [];
  $('article.bs').each((_, el) => animes.push(parseAnimeCard($, el)));
  return { name, animes, pagination: parsePagination(html, page) };
}

// ---------------------------------------------------------------------------
// Popular sidebar
// ---------------------------------------------------------------------------

export async function getPopularSidebar() {
  return parsePopularSidebar(await fetchPage('/'));
}

// ---------------------------------------------------------------------------
// Season list
// ---------------------------------------------------------------------------

export async function getSeasonList() {
  return parseSeasonList(await fetchPage('/'));
}
