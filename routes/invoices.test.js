process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async function () {
    await db.query(`
     DROP TABLE IF EXISTS invoices;
     DROP TABLE IF EXISTS companies;

    CREATE TABLE companies(
        code text PRIMARY KEY,
        name text NOT NULL UNIQUE,
        description text
    );

    CREATE TABLE invoices(
        id serial PRIMARY KEY,
        comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
        amt float NOT NULL,
        paid boolean DEFAULT false NOT NULL,
        add_date date DEFAULT CURRENT_DATE NOT NULL,
        paid_date date,
        CONSTRAINT invoices_amt_check CHECK((amt > (0):: double precision))
);

INSERT INTO companies
VALUES('walmart', 'great Value', 'ecommerce'),
    ('target', 'target prod.', 'Big value.');

INSERT INTO invoices(comp_code, amt, paid, paid_date)
VALUES('walmart', 100, false, null),
    ('walmart', 300, true, '2018-01-01'),
    ('target', 400, false, null);

   `)

})

afterEach(async function () {
    await db.query('DELETE FROM invoices');
    await db.query(`DELETE FROM companies`);
})

afterAll(async function () {
    await db.end();
})

describe('GET /invoices', () => {

    test('Should return all invoices', async () => {

        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoices: [
                {
                    id: expect.any(Number),
                    comp_code: 'walmart',
                    amt: 100,
                    paid: false,
                    add_date: expect.any(String),
                    paid_date: null
                },
                {
                    id: expect.any(Number),
                    comp_code: 'walmart',
                    amt: 300,
                    paid: true,
                    add_date: expect.any(String),
                    paid_date: expect.any(String)
                },
                {
                    id: expect.any(Number),
                    comp_code: 'target',
                    amt: 400,
                    paid: false,
                    add_date: expect.any(String),
                    paid_date: null
                }
            ]
        })

    })
})

describe('GET /invoice/:id', function () {

    test('Should return one invoice', async () => {

        const res = await request(app).get(`/invoices/1`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: "walmart",
                description: "ecommerce",
                name: "great Value"
            },
            invoice: {
                id: 1,
                comp_code: 'walmart',
                amt: 100,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        })
    })
})

describe('POST /invoices', function () {

    test('Should add new invoice', async () => {

        const res = await request(app).post('/invoices').send({
            comp_code: 'walmart',
            amt: 100,
            paid: false,
            paid_date: null
        });

        expect(res.statusCode).toEqual(201);
    })
})

describe('PATCH /invoices/:id', () => {

    test('Should update the existing invoice', async () => {

        const res = await request(app).patch(`/invoices/1`).send({
            amt: 500
        })
        expect(res.statusCode).toEqual(200);
    })

    test('Respond with 404', async () => {

        const res = await request(app).patch(`/invoices/0`);
        expect(res.statusCode).toEqual(404);
    })
})

describe('DELETE /invoices/:id', () => {

    test('Should delete single invoice', async () => {
        const res = await request(app).delete(`/invoices/1`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: "DELETED" })
    })

    test('Respond with 404', async () => {

        const res = await request(app).delete(`/invoices/0`);
        expect(res.statusCode).toEqual(404);
    })
})