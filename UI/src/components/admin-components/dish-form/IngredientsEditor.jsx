import React from 'react';
import Button from '../../shared/Button';
import { LockIcon, TrashIcon } from '../../shared/Icons';

/**
 * IngredientsEditor
 * Manages master recipe ingredients based on standard 2 servings (qtyPer2).
 * Autocompletes ingredient names from master ingredients list.
 */
export default function IngredientsEditor({
  ingredients = [],
  masterIngredients = [],
  onChange,
  onAddRow,
  onRemoveRow,
  disabled = false,
  error = '',
  className = '',
  style = {},
}) {
  const handleFieldChange = (index, field, val) => {
    const updated = [...ingredients];
    if (field === 'qtyPer2') {
      updated[index][field] = parseFloat(val) || 0;
    } else {
      updated[index][field] = val;
    }

    // Auto-fill standard unit if ingredient matches master ingredient
    if (field === 'name' && val) {
      const match = masterIngredients.find(
        (m) => m.name.toLowerCase() === val.toLowerCase().trim()
      );
      if (match && match.defaultUnit && !updated[index].unit) {
        updated[index].unit = match.defaultUnit;
      }
    }

    if (onChange) onChange(updated);
  };

  return (
    <div
      className={`ingredients-editor ${className}`}
      style={{
        padding: '12px 14px',
        backgroundColor: error ? '#fef2f2' : 'var(--color-bg, #fbf9f5)',
        borderRadius: '4px',
        border: `1px solid ${error ? 'var(--color-danger, #c53030)' : 'var(--color-border, #ece7de)'}`,
        boxShadow: 'none',
        marginBottom: 'var(--spacing-md, 14px)',
        ...style,
      }}
    >
      <div
        className="ingredients-editor-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
          gap: '8px',
        }}
      >
        <div>
          <label className="ingredients-editor-title" style={{ fontWeight: 700, fontSize: '0.8rem', color: error ? 'var(--color-danger)' : 'var(--color-text, #1e1b16)' }}>
            Recipe Ingredients <span style={{ color: 'var(--color-danger)' }}>*</span> (Standard 2 Servings Base)
          </label>
          <span
            className="ingredients-editor-help"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              color: 'var(--color-text-muted, #716c62)',
              marginTop: '1px',
            }}
          >
            <LockIcon size={12} color="#9a3412" /> All ingredient quantities (qtyPer2) are confidential to the chef and scaled automatically for visit shopping lists.
          </span>
          {error && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              {error}
            </span>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ingredients-add-btn"
          disabled={disabled}
          onClick={onAddRow}
          style={{
            fontSize: '0.72rem',
            padding: '3px 10px',
            height: '28px',
            borderRadius: '4px',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            border: '1px solid var(--color-border, #ece7de)',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
          }}
        >
          + Add Ingredient
        </Button>
      </div>

      <datalist id="master-ingredients-datalist">
        {masterIngredients.map((m) => (
          <option key={m._id || m.name} value={m.name} />
        ))}
      </datalist>

      {/* Table Headers & Rows in responsive scroll wrapper */}
      <div className="admin-table-scroll">
        <div className="ingredients-table-track" style={{ minWidth: '320px' }}>
          {/* Table Headers */}
          <div
            className="ingredients-table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 85px 75px 30px',
              gap: '6px',
              padding: '5px 8px',
              backgroundColor: '#f6f3eb',
              borderRadius: '3px',
              border: '1px solid #ede8df',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a453e' }}>
              Ingredient Name
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a453e', textAlign: 'right' }}>
              Qty / 2
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a453e' }}>
              Unit
            </span>
            <span />
          </div>

          {/* Ingredient Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {ingredients.map((ing, idx) => {
              const isRowMissingName = Boolean(error && !ing.name?.trim());
              return (
                <div
                  key={idx}
                  className="ingredients-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 85px 75px 30px',
                    gap: '6px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    list="master-ingredients-datalist"
                    className="ingredients-input-name"
                    placeholder="e.g. Ribeye Steak, Salmon Fillet, Fresh Thyme"
                    value={ing.name}
                    disabled={disabled}
                    onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: isRowMissingName
                        ? '1px solid var(--color-danger, #c53030)'
                        : '1px solid var(--color-border, #ece7de)',
                      backgroundColor: isRowMissingName ? '#fef2f2' : 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      boxShadow: 'none',
                      outline: 'none',
                      height: '32px',
                    }}
                  />

                  <input
                    type="number"
                    className="ingredients-input-qty"
                    placeholder="Qty"
                    step="any"
                    min="0"
                    value={ing.qtyPer2 === 0 ? '' : ing.qtyPer2}
                    disabled={disabled}
                    onChange={(e) => handleFieldChange(idx, 'qtyPer2', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      fontSize: '0.76rem',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      textAlign: 'right',
                      boxShadow: 'none',
                      outline: 'none',
                      height: '32px',
                    }}
                  />

                  <input
                    type="text"
                    className="ingredients-input-unit"
                    placeholder="Unit"
                    value={ing.unit}
                    disabled={disabled}
                    onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      fontSize: '0.76rem',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      boxShadow: 'none',
                      outline: 'none',
                      height: '32px',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="ingredients-remove-btn"
                      disabled={disabled || ingredients.length <= 1}
                  onClick={() => onRemoveRow && onRemoveRow(idx)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '3px',
                    backgroundColor: ingredients.length <= 1 ? '#f5f3ef' : '#fef2f2',
                    border: `1px solid ${ingredients.length <= 1 ? '#e7e2d8' : '#fee2e2'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: ingredients.length <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease',
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (ingredients.length > 1 && !disabled) {
                      e.currentTarget.style.backgroundColor = '#fecaca';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (ingredients.length > 1 && !disabled) {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }
                  }}
                  title="Remove ingredient"
                >
                  <TrashIcon size={11} color={ingredients.length <= 1 ? '#a8a29e' : '#dc2626'} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
}
