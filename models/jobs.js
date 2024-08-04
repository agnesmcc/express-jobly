"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
        [
          title,
          salary,
          equity,
          company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filters = {}) {
    let query = `SELECT id, title,
                salary,
                equity,
                company_handle
           FROM jobs`;
    let values = [];
    if (filters.minSalary) {
      query += ` WHERE salary >= $1`;
      values.push(filters.minSalary);
    }
    if (filters.title) {
      (values.length >= 1) ? query += " AND" : query += " WHERE";
      query += ` title ILIKE $${values.length + 1}`;
      values.push(`%${filters.title}%`);
    }
    if (filters.hasEquity) {
      (values.length >= 1) ? query += " AND" : query += " WHERE";
      query += ` equity >= 0`;
    }
    query += ` ORDER BY title`;
    console.log(query, values);
    const companiesRes = await db.query(query, values);
    return companiesRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(jobId) {
    const jobRes = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`,
        [jobId]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(jobId, data) {
    if (data.company_handle) delete data.company_handle;
    console.log(data);
    const { setCols, values } = sqlForPartialUpdate(data, {});
    console.log(setCols, values);
    const jobIdVarIndex = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${jobIdVarIndex} 
                      RETURNING id, title,
                                salary,
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, jobId]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(jobId) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [jobId]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);
  }
}


module.exports = Job;
