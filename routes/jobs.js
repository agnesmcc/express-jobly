"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobGetSchema = require("../schemas/jobGet.json");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, hasEquity, company_handle }
 *
 * Returns { id, title, salary, hasEquity, company_handle }
 *
 * Authorization required: login
 */

router.post("/", ensureIsAdmin, async function (req, res, next) {
  try {
    if (req.body.salary) req.body.salary = +req.body.salary;
    if (req.body.equity) req.body.equity = +req.body.equity;
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ {id, title, salary, equity }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    if (req.query.minSalary) req.query.minSalary = +req.query.minSalary;
    if (req.query.hasEquity) req.query.hasEquity = req.query.hasEquity === "true";
    // Validate the query parameters against the schema
    const validator = jsonschema.validate(req.query, jobGetSchema);
    if (!validator.valid) {
      // If the validation fails, throw a BadRequestError with the validation errors
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // The `filters` object will contain the query parameters passed in the request
    // It can contain the following keys:
    // - minEmployees: The minimum number of employees to filter by
    // - maxEmployees: The maximum number of employees to filter by
    // - name: A partial or complete name of the job to search for
    const filters = req.query;
    const jobs = await Job.findAll(filters);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { job }
 *
 *  job is { id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login
 */

router.patch("/:id", ensureIsAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */

router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
