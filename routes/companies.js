
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

        if (result.rows.length === 0) {
            throw new ExpressError(`Company code ${code} Not Found`);
        }
        return res.json({ company: result.rows[0] });
    } catch (error) {
        next(error)
    }

    router.post('/', async (req, res, next) => {

        try {
            console.log("Inside try Block")
            const { code, name, description } = req.body;
            console.log(req.body);
            const result = await db.query(`INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) 
            RETURNING * `, [code, name, description]);
            console.log(result);
            return res.status(201).json({ companies: result.rows[0] });

        } catch (error) {
            console.log("Inside Catch Block")
            next(error)
        }
    })
})

module.exports = router;
