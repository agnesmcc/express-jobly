const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
    test("works: partial update", function () {
        const data = { firstName: "Aliya", age: 32 };
        const jsToSql = { firstName: "first_name", age: "age" };
        const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
        expect(setCols).toEqual('"first_name"=$1, "age"=$2');
        expect(values).toEqual(["Aliya", 32]);
    });

    test("returns BadRequestError if dataToUpdate is empty", function () {
        const data = {};
        const jsToSql = { firstName: "first_name", age: "age" };
        expect(() => sqlForPartialUpdate(data, jsToSql)).toThrow(BadRequestError);
    });

    test("works with no jsToSql", function () {
        const data = { firstName: "Aliya", age: 32 };
        const jsToSql = {};
        const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
        expect(setCols).toEqual('"firstName"=$1, "age"=$2');
        expect(values).toEqual(["Aliya", 32]);
    });
})
