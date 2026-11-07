import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ShoppingListSkeleton } from '../../components/skeletons';
import {
  PrinterIcon,
  WarningIcon,
  CheckCircleIcon,
  ClipboardIcon,
  TrashIcon,
  SearchIcon,
} from '../../components/shared/Icons';
import { formatArrivalWindow, formatLocalDate } from '../../utils/formatters';

export default function ShoppingList() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // "Fill from Previous Shopping List" modal state
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [availableVisits, setAvailableVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copySearch, setCopySearch] = useState('');

  useEffect(() => {
    fetchShoppingList();
  }, [id]);

  const fetchShoppingList = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/visits/${id}/shopping-list`);
      setData(res.data);
      setItems(res.data.shoppingList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCopyModal = async () => {
    setCopyModalOpen(true);
    setLoadingVisits(true);
    try {
      const res = await api.get('/admin/visits');
      const all = res.data.visits || [];
      // Filter visits that have non-empty shopping list and are not this visit
      const withLists = all.filter(
        (v) => v._id !== id && Array.isArray(v.shoppingList) && v.shoppingList.length > 0
      );
      setAvailableVisits(withLists);
    } catch (err) {
      console.error('Failed to load past visits for shopping list copying', err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleCopyFromVisit = async (sourceVisit) => {
    setCopying(true);
    try {
      const res = await api.post(`/admin/visits/${id}/shopping-list/copy`, {
        sourceVisitId: sourceVisit._id,
      });
      setItems(res.data.shoppingList || []);
      setSaveMessage(
        `Filled ${res.data.shoppingList?.length || 0} items from previous visit on ${formatLocalDate(
          sourceVisit.visitDate
        )}! You can now adjust quantities, notes, or add items before saving.`
      );
      setCopyModalOpen(false);
    } catch (err) {
      alert(`Copy error: ${err.response?.data?.message || err.message}`);
    } finally {
      setCopying(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const next = [...items];
    next[index][field] = field === 'quantity' ? parseFloat(value) || 0 : value;
    setItems(next);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: '', quantity: 1, unit: 'pcs', substitution: '', notes: '', adminAdjustment: true },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await api.patch(`/admin/visits/${id}/shopping-list`, { shoppingList: items });
      setSaveMessage('Shopping list saved for this visit! Master recipes remain untouched.');
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (
      !window.confirm(
        'Recalculate shopping list based on current dish recipes and guests count? Existing custom substitutions and notes will be preserved.'
      )
    ) {
      return;
    }
    setRecalculating(true);
    setSaveMessage('');
    try {
      const res = await api.post(`/admin/visits/${id}/shopping-list/regenerate`);
      setItems(res.data.shoppingList || []);
      setSaveMessage('Shopping list refreshed from current master recipes!');
    } catch (err) {
      setSaveMessage(`Error recalculating: ${err.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ShoppingListSkeleton />;
  if (!data)
    return (
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '12px 0' }}>Visit not found.</div>
    );

  const currentClientId = data.client?._id || data.client?.id;

  // Filter available visits in copy modal
  const filteredCopyVisits = availableVisits.filter((v) => {
    if (!copySearch.trim()) return true;
    const q = copySearch.toLowerCase();
    const cName = v.userId?.name?.toLowerCase() || '';
    const dishesStr = (v.dishes || [])
      .map((d) => (d.dishId?.name || '').toLowerCase())
      .join(' ');
    return cName.includes(q) || dishesStr.includes(q);
  });

  return (
    <div className="admin-page-container">
      {/* Navigation & Print Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/admin/selections"
            style={{
              color: 'var(--color-primary, #2e3b12)',
              fontSize: '0.76rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <span>&larr;</span> Back to Client Selections
          </Link>
          <span style={{ color: 'var(--color-border, #ece7de)' }}>&bull;</span>
          <Link
            to="/admin/shopping-lists"
            style={{
              color: 'var(--color-text-muted, #716c62)',
              fontSize: '0.76rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            All Shopping Lists
          </Link>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            background: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: '#1e1b16',
            boxShadow: 'none',
          }}
        >
          <PrinterIcon size={14} color="var(--color-primary, #2e3b12)" /> Print Shopping List
        </button>
      </div>

      {/* Header Banner */}
      <div className="admin-header-flex">
        <div>
          <h1
            style={{
              color: 'var(--color-primary, #2e3b12)',
              fontSize: '1.25rem',
              margin: '0 0 2px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ClipboardIcon size={20} color="var(--color-primary, #2e3b12)" />
            Visit Shopping List
          </h1>
          <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: 0 }}>
            Client: <strong>{data.client?.name}</strong> &bull; Scheduled:{' '}
            <strong>{formatLocalDate(data.visitDate)}</strong> &bull; Guests:{' '}
            <strong>{data.guests}</strong> &bull; Items: <strong>{items.length}</strong>
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={addItem}
            style={{
              borderRadius: '4px',
              boxShadow: 'none',
              height: '34px',
              fontSize: '0.74rem',
              padding: '0 12px',
            }}
          >
            + Add Item
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenCopyModal}
            style={{
              borderRadius: '4px',
              boxShadow: 'none',
              height: '34px',
              fontSize: '0.74rem',
              padding: '0 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              borderColor: '#fed7aa',
              backgroundColor: '#fff7ed',
              color: '#9a3412',
            }}
          >
            <ClipboardIcon size={12} color="#9a3412" />
            Fill from Prev List
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            disabled={recalculating}
            style={{
              borderRadius: '4px',
              boxShadow: 'none',
              height: '34px',
              fontSize: '0.74rem',
              padding: '0 12px',
            }}
          >
            {recalculating ? 'Recalculating...' : '↻ Recalculate'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            style={{
              borderRadius: '4px',
              boxShadow: 'none',
              height: '34px',
              fontSize: '0.74rem',
              padding: '0 14px',
            }}
          >
            {saving ? 'Saving...' : '✓ Save Shopping List'}
          </Button>
        </div>
      </div>

      {/* Client Overview Card */}
      <Card
        style={{
          padding: '12px 14px',
          marginBottom: '14px',
          backgroundColor: 'var(--color-bg, #fbf9f5)',
          borderRadius: '4px',
          border: '1px solid var(--color-border, #ece7de)',
          boxShadow: 'none',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            fontSize: '0.74rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted, #716c62)', display: 'block', fontSize: '0.66rem' }}>
              Client Contact
            </span>
            <strong style={{ color: '#1e1b16' }}>{data.client?.name}</strong> &bull;{' '}
            {data.client?.phone || 'No phone'}
            <div style={{ color: '#655e53', fontSize: '0.70rem', marginTop: '2px' }}>
              {data.client?.location || 'Client residence'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #716c62)', display: 'block', fontSize: '0.66rem' }}>
              Arrival Window & Status
            </span>
            <strong style={{ color: '#065f46', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} color="#065f46" style={{ flexShrink: 0 }} /> {formatArrivalWindow(data.arrivalWindow)}
            </strong>
            <span
              style={{
                marginLeft: '6px',
                textTransform: 'capitalize',
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '0.64rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              }}
            >
              {data.status || 'Pending'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #716c62)', display: 'block', fontSize: '0.66rem' }}>
              Allergies & Safety
            </span>
            {data.client?.allergies?.length > 0 ? (
              <span
                style={{
                  fontSize: '0.66rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  border: '1px solid #fecaca',
                }}
              >
                <WarningIcon size={11} color="#b91c1c" /> {data.client.allergies.join(', ')}
              </span>
            ) : (
              <span
                style={{
                  color: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.70rem',
                }}
              >
                <CheckCircleIcon size={12} color="#15803d" /> No declared allergies
              </span>
            )}
          </div>
        </div>

        {/* Selected Dishes for this visit */}
        {data.dishes?.length > 0 && (
          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border, #ece7de)',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)' }}>
              Dishes in menu:
            </span>
            {data.dishes.map((d, i) => (
              <span
                key={i}
                style={{
                  padding: '1.5px 7px',
                  borderRadius: '3px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border, #ece7de)',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  color: '#1e1b16',
                }}
              >
                {d.dishId?.name || 'Dish'} ({d.course})
              </span>
            ))}
          </div>
        )}
      </Card>

      {saveMessage && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: saveMessage.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
            color: saveMessage.startsWith('Error') ? '#b91c1c' : '#15803d',
            border: `1px solid ${saveMessage.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '0.76rem',
          }}
        >
          {saveMessage}
        </div>
      )}

      {/* Main Ingredient Checklist Card */}
      <Card
        style={{
          padding: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg, #fbf9f5)',
          borderRadius: '4px',
          border: '1px solid var(--color-border, #ece7de)',
          boxShadow: 'none',
        }}
      >
        <div
          style={{
            padding: '8px 14px',
            backgroundColor: '#f6f3eb',
            borderBottom: '1px solid #ede8df',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e1b16' }}>
            Aggregated Ingredients ({items.length} Items)
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)' }}>
            Serving Formula: qtyPer2 &times; ({data.guests} / 2)
          </span>
        </div>

        <div style={{ padding: '10px 14px' }}>
          {items.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--color-text-muted, #716c62)',
                padding: '24px 0',
                fontSize: '0.78rem',
              }}
            >
              No ingredients present in shopping list. Click "↻ Recalculate" or "Fill from Prev List" above.
            </p>
          ) : (
            <div className="admin-table-scroll">
              <div style={{ minWidth: '540px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Header labels */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 2fr) 75px 65px minmax(200px, 2fr) 30px',
                  gap: '6px',
                  padding: '2px 4px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#716c62',
                }}
              >
                <span>Ingredient</span>
                <span style={{ textAlign: 'right' }}>Quantity</span>
                <span>Unit</span>
                <span>Substitutions / Notes</span>
                <span />
              </div>

              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px, 2fr) 75px 65px minmax(200px, 2fr) 30px',
                    gap: '6px',
                    alignItems: 'center',
                    padding: '4px 6px',
                    backgroundColor: item.substitution ? '#fffbeb' : '#ffffff',
                    border: `1px solid ${item.substitution ? '#fde68a' : '#ede8df'}`,
                    borderRadius: '4px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      textAlign: 'right',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={item.unit}
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Substitutions / Notes (e.g. olive oil instead of butter)"
                    value={item.substitution || ''}
                    onChange={(e) => handleItemChange(idx, 'substitution', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fde68a',
                      backgroundColor: '#fffdf5',
                      fontSize: '0.74rem',
                      color: '#92400e',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    className="no-print"
                    onClick={() => removeItem(idx)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '3px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fee2e2',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Remove item"
                  >
                    <TrashIcon size={10} color="#dc2626" />
                  </button>
                </div>
              ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* "Fill from Previous Shopping List" Modal Dialog */}
      {copyModalOpen && (
        <Dialog
          isOpen={copyModalOpen}
          onClose={() => !copying && setCopyModalOpen(false)}
          title="Fill from Previous Shopping List"
          maxWidth="640px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '18px 20px',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCopyModalOpen(false)}
                disabled={copying}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 12px',
                }}
              >
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-text-muted, #716c62)' }}>
              Select a previous visit shopping list to copy into this appointment. Custom items, substitutions, and quantities will be populated for you to review and edit.
            </p>

            {/* Search filter for past lists */}
            <div style={{ position: 'relative', width: '100%' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SearchIcon size={13} color="#716c62" />
              </span>
              <input
                type="text"
                placeholder="Filter past lists by client name or dish..."
                value={copySearch}
                onChange={(e) => setCopySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.76rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {loadingVisits ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ece7de',
                      backgroundColor: '#fbf9f5',
                    }}
                  >
                    <div className="skeleton-box" style={{ width: '40%', height: '14px', marginBottom: '6px' }} />
                    <div className="skeleton-box" style={{ width: '70%', height: '12px' }} />
                  </div>
                ))}
              </div>
            ) : filteredCopyVisits.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#a8a29e', padding: '16px 0', fontSize: '0.74rem' }}>
                No prior visits with shopping lists found.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                {filteredCopyVisits.map((v) => {
                  const isSameClient = v.userId?._id === currentClientId || v.userId?.id === currentClientId;
                  const dishNames = (v.dishes || [])
                    .map((d) => (d.dishId && typeof d.dishId === 'object' ? d.dishId.name : ''))
                    .filter(Boolean);

                  return (
                    <div
                      key={v._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: isSameClient ? '1.5px solid #fed7aa' : '1px solid #ede8df',
                        backgroundColor: isSameClient ? '#fff7ed' : '#ffffff',
                        gap: '8px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                            {v.userId?.name || 'Client'}
                          </strong>
                          {isSameClient && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                backgroundColor: '#fef3e2',
                                color: '#9a5b13',
                                fontWeight: 700,
                                border: '1px solid #fde68a',
                              }}
                            >
                              Same Client
                            </span>
                          )}
                          <span style={{ fontSize: '0.68rem', color: '#716c62' }}>
                            {formatLocalDate(v.visitDate)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#716c62', marginTop: '2px' }}>
                          <strong>{v.shoppingList?.length || 0} items</strong> &bull; {v.guests} guests
                          {dishNames.length > 0 && ` &bull; ${dishNames.slice(0, 2).join(', ')}${dishNames.length > 2 ? '...' : ''}`}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCopyFromVisit(v)}
                        disabled={copying}
                        style={{
                          borderRadius: '4px',
                          boxShadow: 'none',
                          height: '28px',
                          fontSize: '0.70rem',
                          padding: '0 10px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {copying ? 'Copying...' : 'Copy to this List'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside, header { display: none !important; }
          main { padding: 0 !important; }
          body { background: #ffffff !important; }
        }
      `}</style>
    </div>
  );
}
