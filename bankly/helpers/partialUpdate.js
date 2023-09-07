/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - items: the list of columns you want to update
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) {
    throw new BadRequestError("No data");
  }

  const cols = keys.map((colName, idx) => {
    if (!jsToSql[colName]) throw new Error(`Invalid column: ${colName}`);
    return `${jsToSql[colName]}=$${idx + 1}`;
  });

  const values = Object.values(dataToUpdate);

  return {
    setCols: cols.join(", "),
    values: values,
  };
}

module.exports = sqlForPartialUpdate;

