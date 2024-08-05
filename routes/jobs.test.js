"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newjob = {
    title: "new",
    salary: 125,
    equity: "0.5",
    company_handle: "c1",
  };

  test("fails for non-admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newjob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("ok for admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newjob)
        .set("authorization", `Bearer ${u4Token}`);
    console.log(resp.body);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {id: expect.any(Number), ...newjob}
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          id: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newjob,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
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
          ],
    });
  });

  test("fails: test next() idr", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-idr works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("works with filter", async function () {
    const resp = await request(app).get('/jobs?minSalary=200');
    expect(resp.body).toEqual({
      jobs:
          [
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
          ],
    });
  })

  test("works with filter on equity", async function () {
    const resp = await request(app).get('/jobs?hasEquity=true');
    expect(resp.body).toEqual({
      jobs:
          [
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
          ],
    });
  })

  test("fails if minEmployees is not a number", async function () {
    const resp = await request(app).get("/jobs?minEmployees=not-a-number");
    expect(resp.statusCode).toEqual(400);
  })

  test("fails if maxEmployees is not a number", async function () {
    const resp = await request(app).get("/jobs?maxEmployees=not-a-number");
    expect(resp.statusCode).toEqual(400);
  })

  test("fails if minEmployees > maxEmployees", async function () {
    const resp = await request(app).get("/jobs?minEmployees=3&maxEmployees=2");
    expect(resp.statusCode).toEqual(400);
  })

  test("fails if minEmployees is < 0", async function () {
    const resp = await request(app).get("/jobs?minEmployees=-1");
    expect(resp.statusCode).toEqual(400);
  })

  test("fails if maxEmployees is < 0", async function () {
    const resp = await request(app).get("/jobs?maxEmployees=-1");
    expect(resp.statusCode).toEqual(400);
  })
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 100,
        equity: "0.5",
        company_handle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("fails for non-admin users", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });

  test("works for admin users", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1-new",
        salary: 100,
        equity: "0.5",
        company_handle: "c1",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/999`)
        .send({
          title: "j1-new-nope",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 999,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("fails for non-admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });

  test("works for admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/999`)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
