import React from 'react';
import IngredientsEditor from './IngredientsEditor';
import ToggleSwitch from '../../shared/ToggleSwitch';
import { LockIcon, ChildIcon } from '../../shared/Icons';

/**
 * DishRecipeStep (Step 3)
 * Secret master recipe ingredients, private cooking instructions & publication settings.
 */
export default function DishRecipeStep({
  formData,
  ingredients = [],
  masterIngredients = [],
  onFieldChange,
  onIngredientsChange,
  onAddIngredient,
  onRemoveIngredient,
  disabled = false,
  errors = {},
}) {
  return (
    <div className="dish-step-recipe">
      {/* Master Ingredients Editor */}
      <IngredientsEditor
        ingredients={ingredients}
        masterIngredients={masterIngredients}
        onChange={onIngredientsChange}
        onAddRow={onAddIngredient}
        onRemoveRow={onRemoveIngredient}
        disabled={disabled}
        error={errors.ingredients}
      />

      {/* Secret Admin-Only Cooking Instructions */}
      <div
        className="dish-secret-instructions-card"
        style={{
          padding: '12px 14px',
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '4px',
          boxShadow: 'none',
          marginBottom: 'var(--spacing-md, 14px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <LockIcon size={16} color="#9a3412" />
          <label
            style={{
              fontWeight: 700,
              fontSize: '0.78rem',
              color: '#9a3412',
            }}
          >
            Private Chef Cooking Instructions (Admin Only &bull; Never Sent to Clients){' '}
            <span style={{ color: '#9a3412', fontSize: '0.68rem', fontWeight: 400 }}>(opt)</span>
          </label>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#9a3412', margin: '0 0 8px', lineHeight: 1.35 }}>
          Your confidential culinary secrets: precise sous-vide water bath temperatures, emulsion techniques, reduction timing, and presentation notes.
        </p>
        <textarea
          className="dish-secret-instructions-textarea"
          rows={4}
          value={formData.cookingInstructions || ''}
          onChange={(e) => onFieldChange('cookingInstructions', e.target.value)}
          placeholder="e.g. Sear on high carbon steel for 2 mins per side at 220°C. Deglaze with yuzu sake reduction. Rest for 5 mins before slicing..."
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid #fdba74',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-family-stack)',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            outline: 'none',
            resize: 'vertical',
            boxShadow: 'none',
          }}
        />
      </div>

      {/* Publication & Kids' Meal Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <ToggleSwitch
          id="isKidsMeal"
          label="Kids' Meal Option (Ages 1-5)"
          description="Tailored portion/seasoning suitable for toddlers and younger children in family meal prep."
          checked={Boolean(formData.isKidsMeal)}
          onChange={(val) => onFieldChange('isKidsMeal', val)}
          badge={formData.isKidsMeal ? <><ChildIcon size={12} color="#065f46" /> Kids' Friendly</> : ''}
          badgeColor="primary"
          disabled={disabled}
          optional
        />

        <ToggleSwitch
          id="isPublished"
          label="Publish to Client Menu Catalogue"
          description="When active, clients can view this dish in their portal and request it for upcoming visits."
          checked={formData.isPublished !== false}
          onChange={(val) => onFieldChange('isPublished', val)}
          badge={formData.isPublished !== false ? 'Live in Catalogue' : 'Draft / Hidden'}
          badgeColor={formData.isPublished !== false ? 'primary' : 'warning'}
          disabled={disabled}
          optional
        />
      </div>
    </div>
  );
}
