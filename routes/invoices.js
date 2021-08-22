
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
            throw new ExpressError(`Invoice id ${id} not found`, 404);
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
router.patch('/:id', async (req, res, next) => {

    try {
        const id = req.params.id;
        const { amt, paid } = req.body;
        let paidDate = null;

        const currResult = await db.query(`SELECT paid FROM invoices WHERE id=$1`, [id]);

        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

        const currPaidDate = currResult.rows[0].paid_date;
        if (!currPaidDate && paid) {
            paidDate = new Date();
        }
        else if (!paid) {
            paidDate = null;
        }
        else {
            paidDate = currPaidResult;
        }
        const result = await db.query(`UPDATE invoices SET amt=$1 paid=$2 paid_date=$3 WHERE id=$4 
        RETURNING *`, [amt, paid, paidDate, id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice id ${id} Not Found`, 404);
        }
        return res.json({ invoice: result.rows[0] })
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {

    try {
        const { id } = req.params;
        const result = await db.query(`DELETE from invoices WHERE id=$1 RETURNING id`, [id]);

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find id ${id}`, 404);
        }
        return res.json({ invoice: "DELETED" })

    } catch (error) {
        next(error);
    }
})

module.exports = router;