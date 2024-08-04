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

    test("works: when filtering for equity true", async function () {
      let jobs = await Job.findAll({ hasEquity: true });
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

    test("works: when filtering on minSalary and title", async function () {
      let jobs = await Job.findAll({ minSalary: 200, title: "j2" });
      expect(jobs).toEqual([
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
      ]);
    })

    test("works: when filtering on minSalary and equity", async function () {
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
    })

    test("works: when filtering on title and equity", async function () {
      let jobs = await Job.findAll({ title: "j2", hasEquity: true });
      expect(jobs).toEqual([
        {
          id: 2,
          title: "j2",
          salary: 200,
          equity: "0.6",
          company_handle: "c1",
        },
      ]);
    })
  });

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 100,
      equity: "0.5",
      company_handle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 10,
    equity: "0.5",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      company_handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, salary, equity
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      title: "New",
      salary: 10,
      equity: "0.5",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      company_handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT title, salary, equity
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      title: "New",
      salary: null,
      equity: null,
    }]);
  });

  test("unable to change company_handle", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
      company_handle: "c2",
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      company_handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT company_handle
       FROM jobs
       WHERE id = 1`);
    expect(result.rows).toEqual([{
      company_handle: "c1",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(999, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});