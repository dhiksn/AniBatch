const { Router } = require('express');
const { popularSidebar } = require('../controllers/popular-sidebar.controller');

const router = Router();

router.get('/', popularSidebar);

module.exports = router;
