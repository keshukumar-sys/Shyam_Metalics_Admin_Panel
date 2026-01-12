import React from "react";
import "./css/DataTable.css";

const DataTable = ({ columns = [], data = [], actions }) => {
  return (
    <div className="dt-wrap">
      <table className="dt-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="dt-empty">No records found</td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={row._id || idx}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
              {actions && <td className="dt-actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
