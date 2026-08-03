const { Router } = require('express');
const { popular } = require('../controllers/popular.controller');

const router = Router();

router.get('/', popular);

module.exports = router;
