const { Router } = require('express');
const { season } = require('../controllers/season.controller');

const router = Router();

router.get('/:slug', season);

module.exports = router;
