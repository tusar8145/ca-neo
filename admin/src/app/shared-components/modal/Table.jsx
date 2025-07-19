import React from 'react';
import '../../../styles/base-table.css';


const Table = ({ data }) => {
  // Extract the headers (keys) from the JSON data
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <table>
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {headers.map(header => (
              <td key={header}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;