const { Router } = require('express');
const { list } = require('../controllers/list.controller');

const router = Router();

router.get('/', list);

module.exports = router;
