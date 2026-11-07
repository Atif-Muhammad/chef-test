import React from 'react';

/**
 * CategoryBadge - Renders soft pastel pill badge for categories
 */
export function CategoryBadge({ category }) {
  const catName = typeof category === 'string' ? category : category?.name || 'Main Course';
  const nameLower = catName.toLowerCase();

  let bg = '#fef3e2';
  let color = '#9a5b13';

  if (nameLower.includes('salad')) {
    bg = '#ecfdf5';
    color = '#065f46';
  } else if (nameLower.includes('dessert') || nameLower.includes('sweet')) {
    bg = '#f3e8ff';
    color = '#7c3aed';
  } else if (nameLower.includes('soup')) {
    bg = '#eff6ff';
    color = '#1e40af';
  } else if (nameLower.includes('starter') || nameLower.includes('appetizer')) {
    bg = '#fef9c3';
    color = '#854d0e';
  } else if (nameLower.includes('side')) {
    bg = '#f1f5f9';
    color = '#475569';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1.5px 6px',
        borderRadius: '3px',
        fontSize: '0.64rem',
        fontWeight: 500,
        backgroundColor: bg,
        color: color,
        whiteSpace: 'nowrap',
      }}
    >
      {catName}
    </span>
  );
}

/**
 * DietaryBadge - Renders light pastel badge for dietary tags
 */
export function DietaryBadge({ tag }) {
  const tagLower = (tag || '').toLowerCase();
  let bg = '#ecfdf5';
  let color = '#059669';

  if (tagLower.includes('protein')) {
    bg = '#f3e8ff';
    color = '#7c3aed';
  } else if (tagLower.includes('carb')) {
    bg = '#e0f2fe';
    color = '#0369a1';
  } else if (tagLower.includes('vegan')) {
    bg = '#d1fae5';
    color = '#047857';
  } else if (tagLower.includes('vegetarian')) {
    bg = '#dcfce7';
    color = '#15803d';
  } else if (tagLower.includes('gluten')) {
    bg = '#ecfdf5';
    color = '#059669';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1.5px 5px',
        borderRadius: '3px',
        fontSize: '0.63rem',
        fontWeight: 500,
        backgroundColor: bg,
        color: color,
        whiteSpace: 'nowrap',
      }}
    >
      {tag}
    </span>
  );
}

/**
 * AllergenBadge - Renders soft pastel badge for allergens
 */
export function AllergenBadge({ allergen }) {
  const isNone = !allergen || allergen.toLowerCase() === 'none' || allergen.toLowerCase() === 'no allergens';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1.5px 5px',
        borderRadius: '3px',
        fontSize: '0.63rem',
        fontWeight: 500,
        backgroundColor: isNone ? '#f1f5f9' : '#fee2e2',
        color: isNone ? '#64748b' : '#dc2626',
        whiteSpace: 'nowrap',
      }}
    >
      {allergen || 'None'}
    </span>
  );
}

/**
 * StatusBadge - Renders soft pastel badge for live/draft status
 */
export function StatusBadge({ active, activeText = 'Active', inactiveText = 'Inactive' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1.5px 6px',
        borderRadius: '3px',
        fontSize: '0.64rem',
        fontWeight: 600,
        backgroundColor: active ? '#dcfce7' : '#fee2e2',
        color: active ? '#15803d' : '#dc2626',
        whiteSpace: 'nowrap',
      }}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

/**
 * DataTable Component
 * Clean, modern table matching the private chef admin layout.
 * Dynamic rows, selectable checkboxes, and clean column headers without asc/desc buttons.
 */
export default function DataTable({
  columns = [],
  data = [],
  selectable = true,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  emptyMessage = 'No records found.',
  className = '',
  style = {},
}) {
  const allSelected =
    data.length > 0 && data.every((row) => selectedIds.includes(row._id || row.id));

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: 'var(--color-bg, #fbf9f5)',
        borderRadius: '4px',
        border: '1px solid var(--color-border, #ece7de)',
        boxShadow: 'none',
        ...style,
      }}
      className={className}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f6f3eb', borderBottom: '1px solid #ede8df' }}>
            {selectable && (
              <th style={{ width: '28px', padding: '6px 8px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  style={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '2px',
                    accentColor: '#2e3b12',
                    cursor: 'pointer',
                  }}
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '6px 8px',
                  fontSize: '0.69rem',
                  fontWeight: 600,
                  color: '#4a453e',
                  whiteSpace: 'nowrap',
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: '20px 8px',
                  textAlign: 'center',
                  color: '#716c62',
                  fontSize: '0.74rem',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const rowId = row._id || row.id || rowIdx;
              const isSelected = selectedIds.includes(rowId);
              const isLast = rowIdx === data.length - 1;
              return (
                <tr
                  key={rowId}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--color-border, #ece7de)',
                    backgroundColor: isSelected ? '#f4f0e7' : 'var(--color-bg, #fbf9f5)',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f7f4ec';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg, #fbf9f5)';
                  }}
                >
                  {selectable && (
                    <td style={{ padding: '5px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow && onSelectRow(rowId)}
                        style={{
                          width: '13px',
                          height: '13px',
                          borderRadius: '2px',
                          accentColor: '#2e3b12',
                          cursor: 'pointer',
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      style={{
                        padding: '5px 8px',
                        verticalAlign: 'middle',
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(row) : row[col.accessor || col.key]}
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
