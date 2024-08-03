"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
      title: "new",
      salary: 125,
      equity: "0.5",
      company_handle: "c1",
    };
  
    test("works", async function () {
      let job = await Job.create(newJob);
      newJob.id = 1
      expect(job).toEqual(newJob);
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE id = $1`, [job.id]);
      expect(result.rows).toEqual([
        {
          id: 1,
          title: "new",
          salary: 125,
          equity: "0.5",
          company_handle: "c1",
        },
      ]);
    });
  });