
const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');


router.get('/', async (req, res) => {

    const results = await db.query('SELECT * FROM industries');
    return res.json({ industries: results.rows });
})

router.post('/', async (req, res) => {

    const { name } = req.body;
    const ins_code = slugify(name, { lower: true })
    const results = await db.query(`INSERT INTO industries (industry_code,name) VALUES ($1,$2) RETURNING *`, [ins_code, name]);

    return res.status(201).json({ industy: results.rows[0] });
})

module.exports = router;