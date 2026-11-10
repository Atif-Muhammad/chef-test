import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Loader from '../../components/shared/Loader';
import StepProgressBar from '../../components/shared/StepProgressBar';

// Modular Step Components
import DishBasicStep from '../../components/admin-components/dish-form/DishBasicStep';
import DishDietaryStep from '../../components/admin-components/dish-form/DishDietaryStep';
import DishRecipeStep from '../../components/admin-components/dish-form/DishRecipeStep';

export default function DishForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [masterAllergens, setMasterAllergens] = useState([]);
  const [masterIngredients, setMasterIngredients] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    type: 'main',
    isTimeIntensive: false,
    isPublished: true,
    isKidsMeal: false,
    suitableForAges1to5: false,
    cuisineTags: [],
    dietaryTags: [],
    nutritionalHighlights: [],
    allergens: [],
    spiceLevel: 'none',
    baseServings: 2,
    storageDuration: '',
    storageInstructions: '',
    freezingSuitability: false,
    reheatingInstructions: '',
    cookingInstructions: '',
    photoUrl: '',
  });

  const [ingredients, setIngredients] = useState([
    { name: '', qtyPer2: 100, unit: 'g' },
  ]);

  const [photos, setPhotos] = useState([]); // Array of { id, url, file } (max 3)

  const steps = [
    { title: 'Dish Basics', subtitle: 'Name, type & media' },
    { title: 'Dietary & Safety', subtitle: 'Allergens & shelf life' },
    { title: 'Master Recipe', subtitle: 'Confidential formula' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [catRes, algRes, ingRes] = await Promise.all([
        api.get('/admin/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/admin/allergens').catch(() => ({ data: { allergens: [] } })),
        api.get('/admin/ingredients').catch(() => ({ data: { ingredients: [] } })),
      ]);

      const loadedCats = catRes.data.categories || [];
      const loadedAllergens = algRes.data.allergens || [];
      const loadedIngredients = ingRes.data.ingredients || [];

      setCategories(loadedCats);
      setMasterAllergens(loadedAllergens);
      setMasterIngredients(loadedIngredients);

      if (isEdit) {
        const dishRes = await api.get(`/admin/dishes/${id}`);
        const d = dishRes.data.dish;

        setFormData({
          name: d.name || '',
          description: d.description || '',
          categoryId: d.categoryId?._id || d.categoryId || '',
          type: d.type || 'main',
          isTimeIntensive: Boolean(d.isTimeIntensive),
          isPublished: d.isPublished !== false,
          isKidsMeal: Boolean(d.isKidsMeal || d.suitableForAges1to5),
          suitableForAges1to5: Boolean(d.suitableForAges1to5 || d.isKidsMeal),
          cuisineTags: Array.isArray(d.cuisineTags) ? d.cuisineTags : [],
          dietaryTags: Array.isArray(d.dietaryTags) ? d.dietaryTags : [],
          nutritionalHighlights: Array.isArray(d.nutritionalHighlights) ? d.nutritionalHighlights : [],
          allergens: Array.isArray(d.allergens) ? d.allergens : [],
          spiceLevel: d.spiceLevel || 'none',
          baseServings: 2,
          storageDuration: d.storageDuration || '',
          storageInstructions: d.storageInstructions || '',
          freezingSuitability: Boolean(d.freezingSuitability),
          reheatingInstructions: d.reheatingInstructions || '',
          cookingInstructions: d.cookingInstructions || '',
          photoUrl: d.photoUrl || '',
        });

        // Initialize photos array (up to 3)
        const initialPhotos = [];
        if (Array.isArray(d.photos) && d.photos.length > 0) {
          d.photos.forEach((p, idx) => {
            if (p) initialPhotos.push({ id: `existing-${idx}-${p}`, url: p, file: null });
          });
        } else if (d.photoUrl) {
          initialPhotos.push({ id: `existing-0-${d.photoUrl}`, url: d.photoUrl, file: null });
        }
        setPhotos(initialPhotos);

        if (d.ingredients && d.ingredients.length > 0) {
          setIngredients(d.ingredients);
        }
      } else if (loadedCats.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: loadedCats[0]._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load initial dish data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleAllergen = (allergenName) => {
    setFormData((prev) => {
      const exists = prev.allergens.includes(allergenName);
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((a) => a !== allergenName)
          : [...prev.allergens, allergenName],
      };
    });
  };

  const handleAddPhotos = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const currentCount = photos.length;
    const available = 3 - currentCount;
    if (available <= 0) return;

    const filesArray = Array.from(fileList).slice(0, available);
    const newItems = filesArray.map((file) => ({
      id: `blob-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...prev, ...newItems].slice(0, 3));
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => {
      const item = prev[index];
      if (item && item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetCoverPhoto = (index) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', qtyPer2: 100, unit: 'g' }]);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientsChange = (updated) => {
    setIngredients(updated);
    if (fieldErrors.ingredients && updated.some((i) => i.name?.trim())) {
      setFieldErrors((prev) => ({ ...prev, ingredients: '' }));
      setError('');
    }
  };

  // Step Validation
  const validateStep = (stepNumber) => {
    const errors = { ...fieldErrors };
    if (stepNumber === 1) {
      let hasError = false;
      if (!formData.name?.trim()) {
        errors.name = 'Dish name is required.';
        hasError = true;
      } else {
        delete errors.name;
      }
      if (!formData.categoryId) {
        errors.categoryId = 'Please select a category.';
        hasError = true;
      } else {
        delete errors.categoryId;
      }
      setFieldErrors(errors);
      if (hasError) {
        setError('Please fill in the required fields marked with * on this step.');
        return false;
      }
    } else if (stepNumber === 3) {
      const validIngredients = ingredients.filter((ing) => ing.name?.trim());
      if (validIngredients.length === 0) {
        errors.ingredients = 'Please enter at least one recipe ingredient with a valid name.';
        setFieldErrors(errors);
        setError('Please specify at least one ingredient for the master recipe.');
        return false;
      } else {
        delete errors.ingredients;
        setFieldErrors(errors);
      }
    }

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep > currentStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    // Comprehensive validation across all required steps:
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Dish name is required.';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category.';
    }

    const validIngredients = ingredients.filter((ing) => ing.name?.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Please enter at least one recipe ingredient with a valid name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please resolve the highlighted required fields marked with *.');

      // Jump to the step containing missing fields:
      if (newErrors.name || newErrors.categoryId) {
        setCurrentStep(1);
      } else if (newErrors.ingredients) {
        setCurrentStep(3);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: (formData.description || '').trim(),
        categoryId: formData.categoryId,
        type: formData.type || 'main',
        isTimeIntensive: Boolean(formData.isTimeIntensive),
        isPublished: formData.isPublished !== false,
        isKidsMeal: Boolean(formData.isKidsMeal || formData.suitableForAges1to5),
        suitableForAges1to5: Boolean(formData.suitableForAges1to5 || formData.isKidsMeal),
        cuisineTags: Array.isArray(formData.cuisineTags) ? formData.cuisineTags : [],
        dietaryTags: Array.isArray(formData.dietaryTags) ? formData.dietaryTags : [],
        nutritionalHighlights: Array.isArray(formData.nutritionalHighlights) ? formData.nutritionalHighlights : [],
        allergens: formData.allergens || [],
        spiceLevel: formData.spiceLevel || 'none',
        baseServings: 2,
        storageDuration: (formData.storageDuration || '').trim(),
        storageInstructions: (formData.storageInstructions || '').trim(),
        freezingSuitability: Boolean(formData.freezingSuitability),
        reheatingInstructions: (formData.reheatingInstructions || '').trim(),
        cookingInstructions: (formData.cookingInstructions || '').trim(),
        ingredients: ingredients
          .filter((ing) => ing.name && ing.name.trim())
          .map((ing) => ({
            name: ing.name.trim(),
            qtyPer2: parseFloat(ing.qtyPer2) || 0,
            unit: ing.unit.trim(),
          })),
      };

      let savedDishId = id;
      const keepPhotos = photos.filter((p) => !p.file).map((p) => p.url);
      payload.photos = keepPhotos;
      payload.photoUrl = keepPhotos[0] || '';

      if (isEdit) {
        await api.put(`/admin/dishes/${id}`, payload);
      } else {
        const createRes = await api.post('/admin/dishes', payload);
        savedDishId = createRes.data.dish._id;
      }

      // Sync photos directly to /uploads/[dish-name]/ and delete removed files from disk
      const newFiles = photos.filter((p) => p.file).map((p) => p.file);
      if (savedDishId && (newFiles.length > 0 || isEdit)) {
        const photoFormData = new FormData();
        photoFormData.append('keepPhotos', JSON.stringify(keepPhotos));
        newFiles.forEach((f) => {
          photoFormData.append('photos', f);
        });
        await api.post(`/admin/dishes/${savedDishId}/photos`, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/admin/dishes');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving dish.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading dish formula..." />;

  return (
    <div className="admin-page-container">
      {/* Module Title Row with Icon Action Button */}
      <div className="admin-title-row" style={{ marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/admin/dishes"
              className="admin-action-btn-outline"
              title="Back to Dish Catalogue"
              style={{ width: '32px', height: '32px' }}
            >
              <ArrowLeft size={16} />
            </Link>
            <h1 className="admin-page-title" style={{ margin: 0 }}>
              {isEdit ? 'Edit Dish Recipe' : 'Create New Dish'}
            </h1>
          </div>
          <p className="admin-page-subtitle">
            Standardized 2-serving base recipes, allergen controls, and confidential preparation methods.
          </p>
        </div>
      </div>

      <Card className="dish-form-card" style={{ backgroundColor: 'var(--color-bg, #fbf9f5)', borderRadius: '4px', border: '1px solid var(--color-border, #ece7de)', boxShadow: 'none' }}>
        {/* Multi-Step Nav Pan (Matching visual reference) */}
        <StepProgressBar
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-danger-bg, #feefef)',
              color: 'var(--color-danger, #c53030)',
              borderRadius: '4px',
              marginBottom: 'var(--spacing-md, 12px)',
              fontSize: '0.76rem',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {fieldErrors.ingredients && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-danger-bg, #feefef)',
              color: 'var(--color-danger, #c53030)',
              borderRadius: '4px',
              marginBottom: 'var(--spacing-md, 12px)',
              fontSize: '0.76rem',
              border: '1px solid #fecaca',
            }}
          >
            {fieldErrors.ingredients}
          </div>
        )}

        {/* Form Body - Step by Step */}
        <form noValidate onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
          {currentStep === 1 && (
            <DishBasicStep
              formData={formData}
              categories={categories}
              photos={photos}
              onFieldChange={handleFieldChange}
              onAddPhotos={handleAddPhotos}
              onRemovePhoto={handleRemovePhoto}
              onSetCoverPhoto={handleSetCoverPhoto}
              errors={fieldErrors}
            />
          )}

          {currentStep === 2 && (
            <DishDietaryStep
              formData={formData}
              masterAllergens={masterAllergens}
              onFieldChange={handleFieldChange}
              onToggleAllergen={handleToggleAllergen}
            />
          )}

          {currentStep === 3 && (
            <DishRecipeStep
              formData={formData}
              ingredients={ingredients}
              masterIngredients={masterIngredients}
              onFieldChange={handleFieldChange}
              onIngredientsChange={handleIngredientsChange}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              disabled={submitting}
              errors={fieldErrors}
            />
          )}

          {/* Stepper Navigation Footer */}
          <div className="dish-form-footer">
            {/* Step Counter Indicator */}
            <span className="dish-form-footer-counter" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #716c62)', fontWeight: 600 }}>
              Step {currentStep} of {steps.length} &bull; {steps[currentStep - 1].title}
            </span>

            <div className="dish-form-footer-actions">
              {/* Previous Step Button */}
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  style={{ fontSize: '0.76rem', borderRadius: '4px', boxShadow: 'none' }}
                >
                  &larr; Previous Step
                </Button>
              ) : (
                <Link
                  to="/admin/dishes"
                  className="dish-form-cancel-link"
                  style={{
                    fontSize: '0.76rem',
                    color: 'var(--color-text-muted, #716c62)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '34px',
                    padding: '0 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                  }}
                >
                  Cancel
                </Link>
              )}

              {/* Next or Save Button */}
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNextStep}
                  style={{ fontSize: '0.76rem', borderRadius: '4px', boxShadow: 'none' }}
                >
                  Next Step: {steps[currentStep].title} &rarr;
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ fontSize: '0.78rem', minWidth: '130px', borderRadius: '4px', boxShadow: 'none' }}
                >
                  {submitting ? 'Saving Dish...' : isEdit ? '✓ Save Changes' : '✓ Create Dish'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
