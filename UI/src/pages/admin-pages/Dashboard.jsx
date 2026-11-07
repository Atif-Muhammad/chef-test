import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/shared/api';
import { EyeIcon } from '../../components/shared/Icons';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import {
  KpiSkeleton,
  ChartSkeleton,
  PopularDishesSkeleton,
  TableSkeleton,
  DonutSkeleton,
  SystemOverviewSkeleton,
} from '../../components/skeletons';

const getDefaultDates = () => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
  };
};

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState(getDefaultDates);

  const [stats, setStats] = useState({
    dishesCount: 0,
    clientsCount: 0,
    submissionsCount: 0,
    categoriesCount: 0,
    dietaryTagsCount: 0,
    allergensCount: 0,
    pendingVisitsCount: 0,
    confirmedVisitsCount: 0,
    completedVisitsCount: 0,
  });

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [trendPoints, setTrendPoints] = useState([]);

  // Individual loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [popularDishesLoading, setPopularDishesLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [dietaryLoading, setDietaryLoading] = useState(true);

  // Individual API calls for each dashboard section
  const fetchStats = async (dates = dateFilter) => {
    setStatsLoading(true);
    try {
      const res = await api.get('/admin/analytics/stats', { params: dates });
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTrends = async (dates = dateFilter) => {
    setTrendsLoading(true);
    try {
      const res = await api.get('/admin/analytics/trends', { params: dates });
      if (Array.isArray(res.data?.trendPoints)) {
        setTrendPoints(res.data.trendPoints);
      }
    } catch (err) {
      console.error('Failed to load trends', err);
    } finally {
      setTrendsLoading(false);
    }
  };

  const fetchPopularDishes = async (dates = dateFilter) => {
    setPopularDishesLoading(true);
    try {
      const res = await api.get('/admin/analytics/popular-dishes', { params: dates });
      if (Array.isArray(res.data?.popularDishes)) {
        setPopularDishes(res.data.popularDishes);
      }
    } catch (err) {
      console.error('Failed to load popular dishes', err);
    } finally {
      setPopularDishesLoading(false);
    }
  };

  const fetchRecentSubmissions = async (dates = dateFilter) => {
    setSubmissionsLoading(true);
    try {
      const res = await api.get('/admin/analytics/recent-submissions', { params: dates });
      if (Array.isArray(res.data?.recentVisits)) {
        const mapped = res.data.recentVisits.map((v) => ({
          id: v._id,
          clientName: v.userId?.name || 'Client',
          visitDate: new Date(v.visitDate).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          dishes: `${v.dishes?.length || 0} dishes`,
          status: v.status === 'confirmed' ? 'Confirmed' : v.status === 'pending' ? 'Submitted' : v.status,
        }));
        setRecentSubmissions(mapped);
      }
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchDietaryPreferences = async (dates = dateFilter) => {
    setDietaryLoading(true);
    try {
      const res = await api.get('/admin/analytics/dietary-preferences', { params: dates });
      if (Array.isArray(res.data?.dietaryPreferences)) {
        setDietaryPreferences(res.data.dietaryPreferences);
      }
    } catch (err) {
      console.error('Failed to load dietary preferences', err);
    } finally {
      setDietaryLoading(false);
    }
  };

  const fetchAllData = (dates = dateFilter) => {
    fetchStats(dates);
    fetchTrends(dates);
    fetchPopularDishes(dates);
    fetchRecentSubmissions(dates);
    fetchDietaryPreferences(dates);
  };

  useEffect(() => {
    fetchAllData(dateFilter);
  }, []);

  // Dynamic Chart Points Calculation
  const maxTrendVal = Math.max(...(trendPoints.length > 0 ? trendPoints.map((p) => p.val) : [0]), 4);
  const chartPoints =
    trendPoints.length > 0
      ? trendPoints.map((p, idx) => ({
          x: 35 + idx * 52,
          y: Math.max(20, Math.round(115 - (p.val / maxTrendVal) * 85)),
          date: p.date,
          val: p.val,
        }))
      : [
          { x: 35, y: 115, date: 'Start', val: 0 },
          { x: 87, y: 115, date: '—', val: 0 },
          { x: 139, y: 115, date: '—', val: 0 },
          { x: 191, y: 115, date: '—', val: 0 },
          { x: 243, y: 115, date: '—', val: 0 },
          { x: 295, y: 115, date: '—', val: 0 },
          { x: 347, y: 115, date: 'End', val: 0 },
        ];

  const linePathD = `M ${chartPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaPathD = `${linePathD} L ${chartPoints[chartPoints.length - 1].x},118 L ${chartPoints[0].x},118 Z`;

  // Dynamic SVG Donut Segments
  const circumference = 2 * Math.PI * 14; // ~87.96
  let currentOffset = 0;
  const donutSegments = dietaryPreferences.map((d) => {
    const dash = (d.pct / 100) * circumference;
    const segment = {
      ...d,
      dashArray: `${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}`,
      dashOffset: (-currentOffset).toFixed(2),
    };
    currentOffset += dash;
    return segment;
  });

  return (
    <div className="admin-page-container">
      {/* Title & From-To Filter Header */}
      <div className="admin-header-flex">
        <div>
          <h1 style={{ fontSize: '1.45rem', color: '#1a1814', marginBottom: '2px', letterSpacing: '-0.3px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>
            Live overview of meal prep platform activity, client requests, and inventory.
          </p>
        </div>

        {/* From-To Date Range Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            <label htmlFor="filter-from" style={{ fontWeight: 600 }}>From:</label>
            <CustomDatePicker
              id="filter-from"
              value={dateFilter.from}
              onChange={(e) => {
                const next = { ...dateFilter, from: e.target.value };
                setDateFilter(next);
                fetchAllData(next);
              }}
              style={{
                height: '30px',
                fontSize: '0.74rem',
                width: '130px',
              }}
              wrapperStyle={{ width: '130px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            <label htmlFor="filter-to" style={{ fontWeight: 600 }}>To:</label>
            <CustomDatePicker
              id="filter-to"
              value={dateFilter.to}
              onChange={(e) => {
                const next = { ...dateFilter, to: e.target.value };
                setDateFilter(next);
                fetchAllData(next);
              }}
              style={{
                height: '30px',
                fontSize: '0.74rem',
                width: '130px',
              }}
              wrapperStyle={{ width: '130px' }}
            />
          </div>

          <button
            onClick={() => fetchAllData(dateFilter)}
            title="Refresh dashboard stats"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm, 6px)',
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b665c" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="admin-kpi-grid">
        {statsLoading ? (
          <KpiSkeleton />
        ) : (
          <>
            {/* KPI 1: Dishes */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--border-radius-md, 12px)',
                border: '1px solid var(--color-border)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f6ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M18 2v20M14 2v20M6 2v6a4 4 0 0 0 4 4v10M6 2a4 4 0 0 1 4 4v2"></path>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Dishes</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                    {stats.dishesCount}
                  </span>
                  <span style={{ fontSize: '0.70rem', fontWeight: 600, color: 'var(--color-primary)' }}>Active Catalogue</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Clients */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--border-radius-md, 12px)',
                border: '1px solid var(--color-border)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f6ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Clients</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                    {stats.clientsCount}
                  </span>
                  <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#15803d' }}>Registered</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Submissions */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--border-radius-md, 12px)',
                border: '1px solid var(--color-border)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f6ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Submissions</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                    {stats.submissionsCount}
                  </span>
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: stats.pendingVisitsCount > 0 ? '#d97706' : '#15803d',
                    }}
                  >
                    {stats.pendingVisitsCount > 0 ? `${stats.pendingVisitsCount} Pending` : 'All Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Row 2: Submissions Chart + Popular Dishes + Quick Actions */}
      <div className="admin-dashboard-row">
        {/* Trend Chart */}
        {trendsLoading ? (
          <ChartSkeleton />
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radius-md, 12px)',
              border: '1px solid var(--color-border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>Menu Submissions</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Filtered Range Trend</span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '130px' }}>
              <svg viewBox="0 0 380 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaGradientCompact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e3b12" stopOpacity="0.25" />
                    <stop offset="90%" stopColor="#2e3b12" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="30" y1="25" x2="365" y2="25" stroke="#f0eee8" strokeWidth="1" />
                <line x1="30" y1="55" x2="365" y2="55" stroke="#f0eee8" strokeWidth="1" />
                <line x1="30" y1="85" x2="365" y2="85" stroke="#f0eee8" strokeWidth="1" />
                <line x1="30" y1="115" x2="365" y2="115" stroke="#f0eee8" strokeWidth="1" />

                <text x="18" y="28" fill="#a8a298" fontSize="8" textAnchor="end">
                  {maxTrendVal}
                </text>
                <text x="18" y="58" fill="#a8a298" fontSize="8" textAnchor="end">
                  {Math.round(maxTrendVal * 0.66)}
                </text>
                <text x="18" y="88" fill="#a8a298" fontSize="8" textAnchor="end">
                  {Math.round(maxTrendVal * 0.33)}
                </text>
                <text x="18" y="118" fill="#a8a298" fontSize="8" textAnchor="end">
                  0
                </text>

                <path d={areaPathD} fill="url(#areaGradientCompact)" />
                <path d={linePathD} fill="none" stroke="#2e3b12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {chartPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="3" fill="#2e3b12" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={p.x} y="126" fill="#8c857b" fontSize="7.4" textAnchor="middle">
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* Popular Dishes Card (Aligned top-to-bottom) */}
        {popularDishesLoading ? (
          <PopularDishesSkeleton />
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radius-md, 12px)',
              border: '1px solid var(--color-border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>Popular Dishes</h3>
              <Link to="/admin/dishes" style={{ fontSize: '0.76rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'flex-start' }}>
              {popularDishes.length > 0 ? (
                popularDishes.map((dish) => (
                  <div key={dish.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5eee3' }}>
                      <img
                        src={dish.img}
                        alt={dish.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.80rem',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {dish.name}
                      </span>
                      <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                        &hearts; {dish.favCount} {dish.favCount === 1 ? 'favourite' : 'favourites'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                  No dishes in catalogue yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions (Thunder icon removed, "+" removed from Add New Dish) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-md, 12px)',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: '0 0 12px', fontWeight: 700 }}>
            Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-around' }}>
            <Link
              to="/admin/dishes/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '0.80rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <span>Add New Dish</span>
              <span>&rsaquo;</span>
            </Link>

            <Link
              to="/admin/dishes"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: 'var(--color-text)',
                fontSize: '0.80rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <span>Manage Dishes</span>
              <span>&rsaquo;</span>
            </Link>

            <Link
              to="/admin/selections"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: 'var(--color-text)',
                fontSize: '0.80rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <span>Menu Submissions</span>
              <span>&rsaquo;</span>
            </Link>

            <Link
              to="/admin/clients"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: 'var(--color-text)',
                fontSize: '0.80rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <span>Manage Clients</span>
              <span>&rsaquo;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Submissions Table + Donut + System Overview */}
      <div className="admin-dashboard-row">
        {/* Recent Menu Submissions Table */}
        {submissionsLoading ? (
          <TableSkeleton />
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radius-md, 12px)',
              border: '1px solid var(--color-border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>Recent Menu Submissions</h3>
              <Link to="/admin/selections" style={{ fontSize: '0.76rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div className="admin-table-scroll">
              <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ color: '#8c857b', borderBottom: '1px solid #f0eee8', textAlign: 'left' }}>
                    <th style={{ padding: '6px 4px 8px', fontWeight: 600 }}>Client Name</th>
                    <th style={{ padding: '6px 4px 8px', fontWeight: 600 }}>Visit Date</th>
                    <th style={{ padding: '6px 4px 8px', fontWeight: 600 }}>Dishes</th>
                    <th style={{ padding: '6px 4px 8px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '6px 4px 8px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f8f6f2' }}>
                        <td style={{ padding: '8px 4px', color: 'var(--color-text)', fontWeight: 500 }}>{row.clientName}</td>
                        <td style={{ padding: '8px 4px', color: 'var(--color-text-muted)' }}>{row.visitDate}</td>
                        <td style={{ padding: '8px 4px', color: 'var(--color-text-muted)' }}>{row.dishes}</td>
                        <td style={{ padding: '8px 4px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.70rem',
                              fontWeight: 600,
                              backgroundColor: row.status === 'Confirmed' ? '#e8f0fe' : '#e6f4ea',
                              color: row.status === 'Confirmed' ? '#1a73e8' : '#137333',
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          <Link
                            to={`/admin/shopping-list/${row.id}`}
                            style={{ color: '#6b665c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="View details"
                          >
                            <EyeIcon size={15} color="#6b665c" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No client submissions recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donut Chart: Dietary Preferences */}
        {dietaryLoading ? (
          <DonutSkeleton />
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radius-md, 12px)',
              border: '1px solid var(--color-border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: '0 0 12px', fontWeight: 700 }}>Dietary Preferences</h3>

            {dietaryPreferences.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '90px', height: '90px', position: 'relative', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f4efe6" strokeWidth="5.5" />
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="5.5"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                      />
                    ))}
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                      {stats.clientsCount}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>Clients</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, fontSize: '0.68rem' }}>
                  {dietaryPreferences.map((d) => (
                    <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color }} />
                        <span style={{ color: 'var(--color-text)' }}>{d.label}</span>
                      </div>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  No client dietary preferences declared yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* System Overview (Gear icon removed) */}
        {statsLoading ? (
          <SystemOverviewSkeleton />
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radius-md, 12px)',
              border: '1px solid var(--color-border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: '0 0 12px', fontWeight: 700 }}>
              System Overview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-around', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Active Clients</span>
                <strong style={{ color: 'var(--color-text)' }}>{stats.clientsCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Dishes</span>
                <strong style={{ color: 'var(--color-text)' }}>{stats.dishesCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Categories</span>
                <strong style={{ color: 'var(--color-text)' }}>{stats.categoriesCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Dietary Tags</span>
                <strong style={{ color: 'var(--color-text)' }}>{stats.dietaryTagsCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Allergens</span>
                <strong style={{ color: 'var(--color-text)' }}>{stats.allergensCount}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
