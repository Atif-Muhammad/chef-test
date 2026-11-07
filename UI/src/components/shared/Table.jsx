import React from 'react';

/**
 * Shared Table Component
 * Clean, luxury culinary styling matching the private chef admin layout.
 */
export default function Table({
  columns = [], // [{ header: 'Name', accessor: 'name', render: (row) => ..., align: 'left', width: 'auto' }]
  data = [],
  emptyMessage = 'No records found.',
  className = '',
  style = {},
}) {
  const containerStyle = {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--color-border, #ece7de)',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg, #fbf9f5)',
    boxShadow: 'none',
    ...style,
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  };

  const thStyle = (col) => ({
    padding: '6px 10px',
    backgroundColor: '#f6f3eb',
    color: '#4a453e',
    fontWeight: 600,
    fontSize: '0.69rem',
    borderBottom: '1px solid #ede8df',
    whiteSpace: 'nowrap',
    textAlign: col.align || 'left',
    width: col.width || 'auto',
  });

  const tdStyle = (col, isLast) => ({
    padding: '7px 10px',
    borderBottom: isLast ? 'none' : '1px solid var(--color-border, #ece7de)',
    color: 'var(--color-text, #1e1b16)',
    fontSize: '0.74rem',
    verticalAlign: 'middle',
    textAlign: col.align || 'left',
  });

  return (
    <div style={containerStyle} className={className}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={thStyle(col)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '24px 10px',
                  textAlign: 'center',
                  color: 'var(--color-text-muted, #716c62)',
                  fontSize: '0.74rem',
                  borderBottom: 'none',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const isLast = rowIndex === data.length - 1;
              return (
                <tr
                  key={row._id || row.id || rowIndex}
                  style={{
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f4ec')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg, #fbf9f5)')}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={tdStyle(col, isLast)}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
