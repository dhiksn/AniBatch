const { Router } = require('express');
const { home } = require('../controllers/home.controller');

const router = Router();

router.get('/', home);

module.exports = router;
