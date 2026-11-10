import React, { useRef } from 'react';
import FormInput from '../../shared/FormInput';
import CustomSelect from '../../shared/CustomSelect';
import TagInput from '../../shared/TagInput';
import SpiceLevelSelector from '../../shared/SpiceLevelSelector';
import { CameraIcon } from '../../shared/Icons';

/**
 * DishBasicStep (Step 1)
 * Left column: Core dish details, categorisation, presentation & spice level.
 * Right column: Multi-photo uploader (max 3 images, slot 1 = primary cover).
 */
export default function DishBasicStep({
  formData,
  categories = [],
  photos = [],
  onFieldChange,
  onAddPhotos,
  onRemovePhoto,
  onSetCoverPhoto,
  errors = {},
}) {
  const fileInputRef = useRef(null);

  const commonCuisinePresets = [
    'British',
    'Italian',
    'French',
    'Asian',
    'Japanese',
    'Mediterranean',
    'Mexican',
    'Middle Eastern',
    'Nordic',
    'Korean',
    'Chinese',
    'Thai',
    'Russian',
    'German',
    'American',
    'South American',
  ];

  const handleFilesSelected = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddPhotos(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddPhotos(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const coverPhoto = photos[0] || null;
  const photo2 = photos[1] || null;
  const photo3 = photos[2] || null;

  return (
    <div className="dish-step-basic">
      {/* LEFT COLUMN: Dish Core Details */}
      <div className="dish-basic-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Dish Name - Optimized to prevent iOS Safari Payment Card Autofill */}
        <FormInput
          label="Dish Name"
          id="dish_title"
          name="dish_title"
          autoComplete="off"
          data-form-type="other"
          data-lpignore="true"
          autoCapitalize="words"
          spellCheck="false"
          value={formData.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
          placeholder="e.g. Pan-Seared Salmon with Herb Butter"
          required
          error={errors.name}
        />

        {/* Category & Course Type in 2-column grid */}
        <div
          className="dish-basic-category-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: 'var(--spacing-sm, 10px)',
          }}
        >
          <CustomSelect
            label="Category"
            required
            value={formData.categoryId || ''}
            onChange={(val) => onFieldChange('categoryId', val)}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            placeholder="-- Select Category --"
            error={errors.categoryId}
          />

          <CustomSelect
            label="Course Type"
            required
            value={formData.type || 'main'}
            onChange={(val) => onFieldChange('type', val)}
            options={[
              { value: 'main', label: 'Main' },
              { value: 'side', label: 'Side' },
              { value: 'soup', label: 'Soup' },
              { value: 'dessert', label: 'Dessert' },
              { value: 'kids', label: "Kids' Meals" },
            ]}
          />
        </div>

        {/* Description */}
        <FormInput
          label="Description"
          id="dishDesc"
          type="textarea"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="A clear and simple description of this dish for families..."
          helperText="Shown to clients when planning their menu."
          optional
        />

        {/* Cuisine Tags */}
        <TagInput
          label="Cuisine Tags"
          id="cuisineTags"
          value={formData.cuisineTags}
          onChange={(tags) => onFieldChange('cuisineTags', tags)}
          presets={commonCuisinePresets}
          placeholder="Add cuisine tag (e.g. Modern French, Kaiseki)..."
          helperText="Clients can filter dishes by these cuisine tags."
          optional
        />

        {/* Spice Level Selector */}
        <SpiceLevelSelector
          value={formData.spiceLevel || 'none'}
          onChange={(level) => onFieldChange('spiceLevel', level)}
          label="Spice Level"
          required
        />
      </div>

      {/* RIGHT COLUMN: Dish Photography Uploader (max 3 images) */}
      <div
        className="dish-photo-uploader-card"
        style={{
          backgroundColor: 'var(--color-bg, #fbf9f5)',
          borderRadius: '4px',
          border: '1px solid var(--color-border, #ece7de)',
          padding: '16px',
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-primary, #2e3b12)',
              margin: 0,
            }}
          >
            Dish Photography
          </label>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '3px',
              backgroundColor: photos.length === 3 ? '#eef3ea' : '#f2eee6',
              color: photos.length === 3 ? 'var(--color-primary, #2e3b12)' : 'var(--color-text-muted, #716c62)',
              border: '1px solid var(--color-border, #ece7de)',
            }}
          >
            {photos.length} / 3 images
          </span>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #716c62)', margin: '0 0 14px', lineHeight: 1.35 }}>
          Upload up to 3 high-resolution photos. The primary cover photo is displayed prominently in client menu catalogues.
        </p>

        {/* Hidden Multi-File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesSelected}
          style={{ display: 'none' }}
        />

        {/* Primary Cover Slot (Slot 1) */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-muted, #716c62)', marginBottom: '5px' }}>
            Primary Cover Photo
          </div>

          {coverPhoto ? (
            <div
              className="dish-cover-photo-slot"
              style={{
                position: 'relative',
                height: '180px',
                width: '100%',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid var(--color-border, #ece7de)',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
              }}
            >
              <img
                src={coverPhoto.url}
                alt="Primary dish cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Badge */}
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: 'var(--color-primary, #2e3b12)',
                  color: '#ffffff',
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '3px',
                }}
              >
                ★ Primary Cover
              </span>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemovePhoto(0)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(197, 48, 48, 0.9)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  lineHeight: 1,
                  boxShadow: 'none',
                }}
                title="Remove cover photo"
              >
                &times;
              </button>
            </div>
          ) : (
            <div
              className="dish-cover-dropzone"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                height: '160px',
                width: '100%',
                borderRadius: '4px',
                border: '1px dashed var(--color-border, #ece7de)',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <CameraIcon size={28} color="#716c62" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary, #2e3b12)', marginTop: '8px' }}>
                Upload Cover Photo
              </span>
              <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted, #716c62)', marginTop: '2px' }}>
                Click or drag & drop (JPG, PNG, WebP)
              </span>
            </div>
          )}
        </div>

        {/* Secondary Slots (Slots 2 & 3) */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-muted, #716c62)', marginBottom: '5px' }}>
            Additional Angles / Plating (Max 2)
          </div>

          <div
            className="dish-secondary-slots"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {/* Slot 2 */}
            {photo2 ? (
              <div
                className="dish-secondary-photo-slot"
                style={{
                  position: 'relative',
                  height: '100px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                }}
              >
                <img
                  src={photo2.url}
                  alt="Dish angle 2"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '2px',
                  }}
                >
                  Photo 2
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(1)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(197, 48, 48, 0.9)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    lineHeight: 1,
                  }}
                  title="Remove photo 2"
                >
                  &times;
                </button>
                <button
                  type="button"
                  onClick={() => onSetCoverPhoto(1)}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    right: '4px',
                    padding: '2px 0',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    color: 'var(--color-primary, #2e3b12)',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Promote to Cover Photo"
                >
                  Set as Cover
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (photos.length < 3 && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                style={{
                  height: '100px',
                  borderRadius: '4px',
                  border: '1px dashed var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: photos.length < 3 ? 'pointer' : 'default',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#a8a29e', lineHeight: 1 }}>+</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', marginTop: '4px' }}>
                  Photo 2
                </span>
              </div>
            )}

            {/* Slot 3 */}
            {photo3 ? (
              <div
                className="dish-secondary-photo-slot"
                style={{
                  position: 'relative',
                  height: '100px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                }}
              >
                <img
                  src={photo3.url}
                  alt="Dish angle 3"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '2px',
                  }}
                >
                  Photo 3
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(2)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(197, 48, 48, 0.9)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    lineHeight: 1,
                  }}
                  title="Remove photo 3"
                >
                  &times;
                </button>
                <button
                  type="button"
                  onClick={() => onSetCoverPhoto(2)}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    right: '4px',
                    padding: '2px 0',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    color: 'var(--color-primary, #2e3b12)',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Promote to Cover Photo"
                >
                  Set as Cover
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (photos.length < 3 && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                style={{
                  height: '100px',
                  borderRadius: '4px',
                  border: '1px dashed var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: photos.length < 3 ? 'pointer' : 'default',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#a8a29e', lineHeight: 1 }}>+</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', marginTop: '4px' }}>
                  Photo 3
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Help text */}
        {photos.length < 3 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '7px 12px',
              marginTop: '14px',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: 'var(--color-primary, #2e3b12)',
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            <CameraIcon size={15} color="var(--color-primary, #2e3b12)" />
            <span>Upload Photos ({photos.length}/3)</span>
          </button>
        ) : (
          <div
            style={{
              marginTop: '14px',
              padding: '6px 10px',
              borderRadius: '3px',
              backgroundColor: '#f6f3eb',
              border: '1px solid var(--color-border, #ece7de)',
              fontSize: '0.68rem',
              color: 'var(--color-text-muted, #716c62)',
              textAlign: 'center',
            }}
          >
            Maximum 3 images reached. Remove an image to upload another.
          </div>
        )}
      </div>
    </div>
  );
}
