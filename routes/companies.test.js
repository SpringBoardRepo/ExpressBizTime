process.env.NODE_ENV = 'test';

const app = require('../app');
const db = require('../db');
const request = require('supertest');

let testComp;
beforeEach(async () => {
    let result = await db.query(`INSERT INTO companies (code,name,description) 
    VALUES ('apple', 'Apple Computer', 'Maker of OSX') RETURNING *`);

    testComp = result.rows[0];

})

afterEach(async () => {
    await db.query('DELETE FROM companies')

})

afterAll(async () => {
    await db.end();
})
describe('GET /companies', function () {

    test('List all the companies', async function () {

        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testComp] })
    })
})

describe('GET /companies/:code', function () {
    test('Should return single company', async () => {

        const res = await request(app).get(`/companies/${testComp.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                "code": "apple",
                "description": "Maker of OSX",
                "invoicesRes": [],
                "name": "Apple Computer",
            }
        })
    })

    test('Respond with 404', async () => {

        const res = await request(app).get('/companies/nokia');
        expect(res.statusCode).toEqual(404);
    })
})

describe('POST /compaines', () => {

    test('Should add new company', async () => {
        const res = await request(app).post('/companies').send(
            {
                "code": "intel",
                "name": "core i7",
                "description": "processor"
            }
        );
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            companies: {
                "code": "intel",
                "name": "core i7",
                "description": "processor"
            }
        })

    })
})

describe('PATCH /companies/:code', () => {

    test('Should update the company details', async () => {

        const res = await request(app).patch(`/companies/${testComp.code}`).send({
            "name": "A Computer",
            "description": "Maker of OSX",
            "code": "apple"
        })
        expect(res.statusCode).toEqual(200);
    })

    test('Respond with 404', async () => {

        const res = await request(app).patch(`/companies/something`);
        expect(res.statusCode).toEqual(404);
    })
})

describe("DELETE /companies", () => {

    test('Should delete a company', async () => {
        const res = await request(app).delete(`/companies/${testComp.code}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ company: "DELETED" })
    })

    test('Respond with 404', async () => {

        const res = await request(app).delete(`/companies/something`);
        expect(res.statusCode).toEqual(404);
    })
})