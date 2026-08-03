const { Router } = require('express');
const { seasons } = require('../controllers/seasons.controller');

const router = Router();

router.get('/', seasons);

module.exports = router;
