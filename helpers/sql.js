const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Generates SQL for a partial update based on the provided data and mapping.
 *
 * @param {Object} dataToUpdate - The data to be updated.
 * @param {Object} jsToSql - The mapping of JavaScript keys to SQL column names.
 * @throws {BadRequestError} If the data to update is empty.
 * @return {Object} An object containing the generated SQL and the values to be updated.
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
