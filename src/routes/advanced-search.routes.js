const { Router } = require('express');
const { advancedSearchHandler } = require('../controllers/advanced-search.controller');

const router = Router();

router.get('/', advancedSearchHandler);

module.exports = router;
