"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM applications");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");
  await db.query("ALTER SEQUENCE jobs_id_seq RESTART WITH 1;");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });
  
  await db.query(`
    INSERT INTO jobs(title, salary, equity, company_handle)
    VALUES ('j1', 100, 0.5, 'c1'),
            ('j2', 200, 0.6, 'c1'),
            ('j3', 300, 0.7, 'c1')`); 

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "u4",
    firstName: "U4F",
    lastName: "U4L",
    email: "user4@user.com",
    password: "password4",
    isAdmin: true,
  });

  await db.query(`
    INSERT INTO applications(username, job_id)
    VALUES ('u1', 1),
           ('u1', 2)`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u4Token = createToken({ username: "u4", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token,
};
