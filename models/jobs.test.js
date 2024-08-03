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
      newJob.id = 4
      expect(job).toEqual(newJob);
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE id = $1`, [job.id]);
      expect(result.rows).toEqual([
        {
          id: 4,
          title: "new",
          salary: 125,
          equity: "0.5",
          company_handle: "c1",
        },
      ]);
    });
  });

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
        {
          id: 1,
          title: "j1",
          salary: 100,
          equity: "0.5",
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
        {
          id: 3,
          title: "j3",
          salary: 300,
          equity: "0.7",
          company_handle: "c1",
        },
      ]);
    });
  
    test("works: with filter", async function () {
      let jobs = await Job.findAll({ minSalary: 200 });
      expect(jobs).toEqual([
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
        {
          id: 3,
          title: "j3",
          salary: 300,
          equity: "0.7",
          company_handle: "c1",
        },
      ]);
    });
  
    test("work: with multiple filters", async function () {
      let jobs = await Job.findAll({ minSalary: 200, hasEquity: true });
      expect(jobs).toEqual([
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
        {
          id: 3,
          title: "j3",
          salary: 300,
          equity: "0.7",
          company_handle: "c1",
        },
      ]);
    });
  
    test("works: with all filters", async function () {
      let jobs = await Job.findAll({ minSalary: 200, hasEquity: true, title: "j2" });
      expect(jobs).toEqual([
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
      ]);
    });
  
    test("works: when filtering only by title", async function () {
      let jobs = await Job.findAll({ title: "j2" });
      expect(jobs).toEqual([
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
      ]);
    });

    test("works: when filtering for equity false", async function () {
      let jobs = await Job.findAll({ hasEquity: false });
      expect(jobs).toEqual([
        {
          id: 1,
          title: "j1",
          salary: 100,
          equity: "0.5",
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
        {
          id: 3,
          title: "j3",
          salary: 300,
          equity: "0.7",
          company_handle: "c1",
        },
      ]);
    })
  });

