const e = require('express');
const express = require('express');

const db = require('../db');
const ExpressError = require('../expressError');
const router = express.Router();

router.get('/', async (req, res) => {

    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
})

router.get('/:id', async (req, res, next) => {

    try {
        const id = req.params.id;
        const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        const compRes = await db.query(`SELECT * from invoices 
        JOIN companies on invoices.comp_code = companies.code WHERE id =${id}`);
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice id ${id} not found`);
        }
        return res.json({
            invoice: result.rows[0],
            company: { code: compRes.rows[0].code, name: compRes.rows[0].name, description: compRes.rows[0].description }
        });
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {

    try {
        const { comp_code, amt, paid, paid_date } = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES($1, $2, $3, $4) RETURNING *` , [comp_code, amt, paid, paid_date]);

        return res.status(201).json({ invoice: result.rows[0] })
    } catch (error) {
        next(error);
    }
})












module.exports = router;