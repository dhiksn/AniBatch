const { Router } = require('express');
const { listGenres, animeByGenre } = require('../controllers/genre.controller');

const router = Router();

router.get('/', listGenres);
router.get('/:slug', animeByGenre);

module.exports = router;
