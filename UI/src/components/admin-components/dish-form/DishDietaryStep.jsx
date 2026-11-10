import React from 'react';
import { Clock } from 'lucide-react';
import FormInput from '../../shared/FormInput';
import TagInput from '../../shared/TagInput';
import ToggleSwitch from '../../shared/ToggleSwitch';
import AllergenSelector from '../../shared/AllergenSelector';
import { SnowflakeIcon, HerbIcon, SparkleIcon } from '../../shared/Icons';

/**
 * DishDietaryStep (Step 2)
 * Dietary tags, nutritional highlights, allergen safety, storage & reheating.
 */
export default function DishDietaryStep({
  formData,
  masterAllergens = [],
  onFieldChange,
  onToggleAllergen,
}) {
  const commonDietaryPresets = [
    'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Pescatarian', 'Halal', 'Kosher', 'Low Sodium'
  ];

  const commonNutritionalPresets = [
    'High Protein', 'Omega-3', 'High Fibre', 'Low Carb', 'Iron Rich', 'Antioxidant Rich', 'Heart Healthy', 'Low Sugar'
  ];

  return (
    <div className="dish-step-dietary">
      {/* Standard Base Servings Notice */}
      <div
        className="dish-dietary-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#fbf9f5',
          borderRadius: '4px',
          border: '1px solid var(--color-border, #ece7de)',
          boxShadow: 'none',
          marginBottom: 'var(--spacing-md, 12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-primary-light, #f1f6ec)',
              color: 'var(--color-primary, #2e3b12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            2
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary, #2e3b12)', display: 'block' }}>
              Base Servings: 2 Portions Standard
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)' }}>
              All recipes are standardized for 2 servings. Quantities scale dynamically for visits.
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 600,
            padding: '2px 8px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            borderRadius: '3px',
            border: '1px solid var(--color-border, #ece7de)',
            color: 'var(--color-primary, #2e3b12)',
          }}
        >
          Chef Missy Standard
        </span>
      </div>

      {/* Time-Intensive Toggle */}
      <ToggleSwitch
        id="isTimeIntensive"
        label="Time-Intensive Preparation (30+ Minutes)"
        description="Dishes requiring 30+ minutes of preparation. Clients are restricted to at most 2 time-intensive dishes per visit."
        checked={Boolean(formData.isTimeIntensive)}
        onChange={(val) => onFieldChange('isTimeIntensive', val)}
        badge={<><Clock size={12} color="#92400e" style={{ flexShrink: 0 }} /> Max 2 / Visit</>}
        badgeColor="warning"
        optional
      />

      {/* Freezing Suitability Toggle */}
      <ToggleSwitch
        id="freezingSuitability"
        label="Suitable for Freezing"
        description="Dish retains its moisture, texture, and flavor profile when stored in a home freezer."
        checked={Boolean(formData.freezingSuitability)}
        onChange={(val) => onFieldChange('freezingSuitability', val)}
        badge={formData.freezingSuitability ? <><SnowflakeIcon size={12} color="#065f46" /> Freezer Safe</> : ''}
        badgeColor="primary"
        optional
      />

      {/* Dietary Information Tags */}
      <TagInput
        label="Dietary Information Tags"
        id="dietaryTags"
        value={formData.dietaryTags}
        onChange={(tags) => onFieldChange('dietaryTags', tags)}
        presets={commonDietaryPresets}
        placeholder="Add dietary tag (e.g. Gluten-Free, Dairy-Free)..."
        helperText="Row 1 in client portal: verified dietary classifications."
        optional
      />

      {/* Nutritional Highlights Tags */}
      <TagInput
        label="Nutritional Highlights"
        id="nutritionalHighlights"
        value={formData.nutritionalHighlights}
        onChange={(tags) => onFieldChange('nutritionalHighlights', tags)}
        presets={commonNutritionalPresets}
        placeholder="Add highlight (e.g. High Protein, Omega-3, High Fibre)..."
        helperText="Row 2 in client portal: key nutritional wellness benefits."
        optional
      />

      {/* Canonical Master Allergens Selector */}
      <AllergenSelector
        masterAllergens={masterAllergens}
        selectedAllergens={formData.allergens || []}
        onToggleAllergen={onToggleAllergen}
        optional
      />

      {/* Storage Duration & Storage Instructions */}
      <div
        className="dish-dietary-storage-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: 'var(--spacing-sm, 10px)',
        }}
      >
        <FormInput
          label="Storage Duration"
          id="storageDuration"
          value={formData.storageDuration || ''}
          onChange={(e) => onFieldChange('storageDuration', e.target.value)}
          placeholder="e.g. 3-4 days in airtight container at 4°C"
          helperText="Expected freshness period in client refrigerator."
          optional
        />

        <FormInput
          label="Storage Instructions"
          id="storageInstructions"
          value={formData.storageInstructions || ''}
          onChange={(e) => onFieldChange('storageInstructions', e.target.value)}
          placeholder="e.g. Keep refrigerated in airtight glass container."
          optional
        />
      </div>

      {/* Reheating Instructions */}
      <FormInput
        label="Reheating Instructions (Client Facing)"
        id="reheatingInstructions"
        type="textarea"
        rows={2}
        value={formData.reheatingInstructions || ''}
        onChange={(e) => onFieldChange('reheatingInstructions', e.target.value)}
        placeholder="e.g. Preheat oven to 160°C. Reheat covered with foil for 12 minutes until heated through."
        helperText="Clear guidance for the client on finishing and serving the dish at home."
        optional
      />
    </div>
  );
}
