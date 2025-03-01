"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filters = {}) {
    let query = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies`;
    let values = [];
    if (filters.minEmployees && filters.maxEmployees && filters.minEmployees > filters.maxEmployees) {
      throw new BadRequestError("minEmployees cannot be greater than maxEmployees");
    }
    if (filters.minEmployees) {
      query += ` WHERE num_employees >= $1`;
      values.push(filters.minEmployees);
    }
    if (filters.maxEmployees) {
      (values.length >= 1) ? query += " AND" : query += " WHERE";
      query += ` num_employees <= $${values.length + 1}`;
      values.push(filters.maxEmployees);
    }
    if (filters.name) {
      (values.length >= 1) ? query += " AND" : query += " WHERE";
      query += ` name ILIKE $${values.length + 1}`;
      values.push(`%${filters.name}%`);
    }
    query += ` ORDER BY name`;
    const companiesRes = await db.query(query, values);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT companies.handle,
                  companies.name,
                  companies.description,
                  companies.num_employees AS "numEmployees",
                  companies.logo_url AS "logoUrl",
                  jobs.id,
                  jobs.title,
                  jobs.salary,
                  jobs.equity
           FROM companies
           LEFT JOIN jobs ON companies.handle = jobs.company_handle
           WHERE companies.handle = $1`,
        [handle]);

    if (!companyRes.rows[0]) throw new NotFoundError(`No company: ${handle}`);
    
    const company = {
      handle: companyRes.rows[0].handle,
      name: companyRes.rows[0].name,
      description: companyRes.rows[0].description,
      numEmployees: companyRes.rows[0].numEmployees,
      logoUrl: companyRes.rows[0].logoUrl,
    };
    const jobs = companyRes.rows.reduce((result, row) => {
      if (row.id !== null) {
        result.push({ id: row.id, title: row.title, salary: row.salary, equity: row.equity });
      }
      return result;
    }, []);
    company.jobs = jobs;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
