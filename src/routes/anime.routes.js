const { Router } = require('express');
const { detail } = require('../controllers/anime.controller');

const router = Router();

router.get('/:slug', detail);

module.exports = router;
