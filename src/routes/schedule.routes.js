const { Router } = require('express');
const { schedule } = require('../controllers/schedule.controller');

const router = Router();

router.get('/', schedule);

module.exports = router;
