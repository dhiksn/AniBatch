const { Router } = require('express');
const { cast } = require('../controllers/cast.controller');

const router = Router();

router.get('/:slug', cast);

module.exports = router;
