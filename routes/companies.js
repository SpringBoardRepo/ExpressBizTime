
const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');


router.get('/', async function (req, res, next) {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });

})

router.get('/:code', async (req, res, next) => {

    try {
        const { code } = req.params;
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
        const invoicesRes = await db.query(`SELECT * from invoices WHERE comp_code =$1`, [code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Company code ${code} Not Found`);
        }
        const company = result.rows[0];
        const invoices = invoicesRes.rows;
        company.invoicesRes = invoices.map(inv => inv.id)
        return res.json({ company: company });
    } catch (error) {
        next(error)
    }

})

router.post('/', async (req, res, next) => {

    try {
        const { code, name, description } = req.body;
        const result = await db.query(`INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) 
            RETURNING * `, [code, name, description]);

        return res.status(201).json({ companies: result.rows[0] });

    } catch (error) {
        next(error)
    }
})

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        const result = await db.query(`UPDATE companies SET name=$1,description=$2 WHERE code =$3 RETURNING  * `, [name, description, code])

        if (result.rows.length === 0) {
            throw new ExpressError(`Company code ${code} Not Found`);
        }
        return res.json({ company: result.rows[0] })
    } catch (error) {
        next(error)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {

        const { code } = req.params;
        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No Such Company ${code} Found`);
        }
        return res.json({ company: "DELETED" })
    } catch (error) {
        next(error)
    }
})

module.exports = router;
