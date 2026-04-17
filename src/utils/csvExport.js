/**
 * Exports data to a CSV file and triggers a browser download.
 * 
 * @param {Array<Object>} data - The array of objects to export.
 * @param {string} fileName - The name of the file (e.g., 'inquiries.csv').
 * @param {Array<{key: string, label: string}>} columns - The columns to include in the export.
 */
export const exportToCSV = (data, fileName, columns) => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  // Create headers
  const headers = columns.map(col => col.label).join(",");

  // Create rows
  const rows = data.map(item => {
    return columns.map(col => {
      // Handle nested keys (e.g., 'jobId.title')
      const keys = col.key.split('.');
      let value = item;
      for (const key of keys) {
        value = value ? value[key] : "";
      }

      // Format value: handle nulls, escape quotes, wrap in quotes if contains comma
      const formattedValue = value === null || value === undefined ? "" : String(value).replace(/"/g, '""');
      return `"${formattedValue}"`;
    }).join(",");
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].join("\n");

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
