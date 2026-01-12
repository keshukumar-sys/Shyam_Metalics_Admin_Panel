import React from "react";
import "./css/AdminTable.css";

const AdminTable = ({ title = "Admin Panel", children }) => {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th colSpan={1}>{title}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{children}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
