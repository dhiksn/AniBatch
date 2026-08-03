require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const path    = require('path');

const { sendSuccess, sendError, AUTHOR } = require('./src/utils/response');

const homeRouter              = require('./src/routes/home.routes');
const animeRouter             = require('./src/routes/anime.routes');
const searchRouter            = require('./src/routes/search.routes');
const genreRouter             = require('./src/routes/genre.routes');
const popularRouter           = require('./src/routes/popular.routes');
const popularSidebarRouter    = require('./src/routes/popular-sidebar.routes');
const scheduleRouter          = require('./src/routes/schedule.routes');
const listRouter              = require('./src/routes/list.routes');
const advancedSearchRouter    = require('./src/routes/advanced-search.routes');
const seasonRouter            = require('./src/routes/season.routes');
const seasonsRouter           = require('./src/routes/seasons.routes');
const castRouter              = require('./src/routes/cast.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------

app.use(helmet({
  contentSecurityPolicy: false, // allow inline scripts for frontend pages
}));

// CORS — configurable via CORS_ORIGIN env variable
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------------------------------
// Static files (frontend pages)
// ---------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------

app.use(express.json());

// ---------------------------------------------------------------------------
// Root endpoint
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    author: AUTHOR,
    service: 'Alqanime REST-API',
    version: '1.0.0',
    endpoints: {
      home:           'GET /api/home',
      popular:        'GET /api/popular?page=<n>',
      popularSidebar: 'GET /api/popular-sidebar',
      schedule:       'GET /api/schedule',
      list:           'GET /api/list',
      listLetter:     'GET /api/list?letter=<A-Z>',
      season:         'GET /api/season/:slug',
      seasons:        'GET /api/seasons',
      cast:           'GET /api/cast/:slug?page=<n>',
      animeDetail:    'GET /api/anime/:slug',
      search:         'GET /api/search?q=<query>&page=<n>',
      advancedSearch: 'GET /api/advanced-search?title=&genre[]=&season[]=&studio[]=&status=&type[]=&order=&page=',
      genreList:      'GET /api/genre',
      genreAnime:     'GET /api/genre/:slug?page=<n>',
      health:         'GET /api/health',
    },
  });
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    author: AUTHOR,
    service: 'Alqanime REST-API',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.use('/api/home',             homeRouter);
app.use('/api/anime',            animeRouter);
app.use('/api/search',           searchRouter);
app.use('/api/genre',            genreRouter);
app.use('/api/popular',          popularRouter);
app.use('/api/popular-sidebar',  popularSidebarRouter);
app.use('/api/schedule',         scheduleRouter);
app.use('/api/list',             listRouter);
app.use('/api/advanced-search',  advancedSearchRouter);
app.use('/api/season',           seasonRouter);
app.use('/api/seasons',          seasonsRouter);
app.use('/api/cast',             castRouter);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

app.use((req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Endpoint ${req.method} ${req.path} tidak ditemukan`);
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message || 'Internal Server Error';
  return sendError(res, statusCode, code, message);
});

// ---------------------------------------------------------------------------
// Start server (only in non-serverless env)
// ---------------------------------------------------------------------------

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[Alqanime API] Server berjalan di http://localhost:${PORT}`);
    console.log(`[Alqanime API] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Alqanime API] Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
