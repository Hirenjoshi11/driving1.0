'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import FieldError from '@/components/validation/FieldError';
import styles from './steps.module.css';

export default function RtoStep({ formData, updateFormData, stateId, service, selectedState, localize, t, stepErrors = {} }) {
  const { t: contextT } = useApp();
  const tr = t || contextT;

  const [districts, setDistricts] = useState([]);
  const [rtoOffices, setRtoOffices] = useState([]);
  const [testCentres, setTestCentres] = useState([]);
  const [loadingDistrict, setLoadingDistrict] = useState(true);
  const [loadingRto, setLoadingRto] = useState(false);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [isFallbackDistrict, setIsFallbackDistrict] = useState(false);

  // Does this service require a driving test centre appointment?
  const requiresTestCentre = 
    service?.requires_driving_test === 1 || 
    service?.slug === 'new-driving-licence' || 
    service?.slug === 'add-vehicle-class';

  // 1. Fetch districts
  useEffect(() => {
    if (!stateId) return;
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`/api/districts?stateId=${stateId}`);
        const data = await res.json();
        setDistricts(data.districts || []);

        const activeDistId = formData.districtId || (data.districts && data.districts[0]?.id);
        if (activeDistId && !formData.districtId) {
          updateFormData('districtId', activeDistId);
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId]);

  // 2. Fetch RTOs when district changes
  useEffect(() => {
    const activeDistrictId = formData.districtId;
    if (!activeDistrictId) return;

    const fetchRtos = async () => {
      setLoadingRto(true);
      try {
        const res = await fetch(`/api/rto-offices?districtId=${activeDistrictId}`);
        const data = await res.json();
        const rtos = data.rtoOffices || [];
        setRtoOffices(rtos);

        if (rtos.length > 0) {
          setIsFallbackDistrict(false);
          // Select first RTO if none selected or selected doesn't belong
          const match = rtos.find(r => r.id === formData.rtoId);
          const chosen = match || rtos[0];
          updateFormData('rtoId', chosen.id);
          updateFormData('rtoName', chosen.name);
          updateFormData('rtoCode', chosen.rto_code);
          updateFormData('rtoAddress', chosen.address);
        } else {
          // If no RTO in this district, fetch state-level RTOs and make fallback visible (FLOW-09)
          setIsFallbackDistrict(true);
          const stateRes = await fetch(`/api/rto-offices?stateId=${stateId}`);
          const stateData = await stateRes.json();
          const fallbackRtos = stateData.rtoOffices || [];
          setRtoOffices(fallbackRtos);

          // Never silently auto-select an office from a different district
          const match = fallbackRtos.find(r => r.id === formData.rtoId);
          if (match) {
            updateFormData('rtoId', match.id);
            updateFormData('rtoName', match.name);
            updateFormData('rtoCode', match.rto_code);
            updateFormData('rtoAddress', match.address);
          } else {
            updateFormData('rtoId', null);
            updateFormData('rtoName', '');
            updateFormData('rtoCode', '');
            updateFormData('rtoAddress', '');
          }
        }
      } catch (err) {
        console.error('Failed to load RTOs:', err);
      } finally {
        setLoadingRto(false);
      }
    };

    fetchRtos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.districtId, stateId]);

  // 3. Fetch Test Centres when RTO changes
  useEffect(() => {
    if (!formData.rtoId) return;

    const fetchTestCentres = async () => {
      setLoadingCentres(true);
      try {
        let res = await fetch(`/api/test-centres?rtoId=${formData.rtoId}`);
        let data = await res.json();
        let centres = data.testCentres || [];

        // If no centre for this specific RTO, fetch state centres
        if (centres.length === 0 && stateId) {
          res = await fetch(`/api/test-centres?stateId=${stateId}`);
          data = await res.json();
          centres = data.testCentres || [];
        }

        setTestCentres(centres);

        const activeCentres = centres.filter(c => c.status === 'active');
        const defaultCentre = activeCentres.length > 0 ? activeCentres[0] : null;

        if (defaultCentre && (!formData.testCentreId || !centres.find(c => c.id === formData.testCentreId && c.status === 'active'))) {
          updateFormData('testCentreId', defaultCentre.id);
          updateFormData('testCentreName', defaultCentre.name);
          updateFormData('testCentreAddress', defaultCentre.address);
        }
      } catch (err) {
        console.error('Failed to load test centres:', err);
      } finally {
        setLoadingCentres(false);
      }
    };

    fetchTestCentres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.rtoId, stateId]);

  const handleDistrictChange = (e) => {
    const distId = parseInt(e.target.value, 10);
    updateFormData('districtId', distId);
    const found = districts.find(d => d.id === distId);
    if (found) {
      updateFormData('currentDistrictName', found.name);
    }
  };

  const handleRtoChange = (e) => {
    const id = parseInt(e.target.value, 10);
    const chosen = rtoOffices.find(r => r.id === id);
    if (chosen) {
      updateFormData('rtoId', chosen.id);
      updateFormData('rtoName', chosen.name);
      updateFormData('rtoCode', chosen.rto_code);
      updateFormData('rtoAddress', chosen.address);
    }
  };

  const handleCentreChange = (e) => {
    const id = parseInt(e.target.value, 10);
    const chosen = testCentres.find(c => c.id === id);
    if (chosen) {
      updateFormData('testCentreId', chosen.id);
      updateFormData('testCentreName', chosen.name);
      updateFormData('testCentreAddress', chosen.address);
    }
  };

  const selectedRto = rtoOffices.find(r => r.id === formData.rtoId);
  const selectedCentre = testCentres.find(c => c.id === formData.testCentreId);
  const selectedDistrict = districts.find(d => d.id === formData.districtId);
  const errors = stepErrors || {};

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('form.rtoSelection')}</h3>
        <p className={styles.stepDesc}>
          {tr('form.rtoSubhead')}
        </p>
      </div>

      {/* Calm Informational Guidance Card (No warning icons or raw keys) */}
      <div style={{
        background: '#EAF6EE',
        border: '1px solid rgba(21, 148, 71, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        color: '#18232D',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', lineHeight: 1 }}>ℹ️</span>
        <div>
          <strong style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '2px' }}>
            {tr('validation.rtoGuidanceTitle') || 'Select your RTO'}
          </strong>
          <div style={{ fontSize: '0.85rem', color: '#5B6470', lineHeight: 1.5 }}>
            {tr('validation.rtoGuidanceDesc') || 'To continue your application, select your RTO office and available driving test track.'}
          </div>
        </div>
      </div>

      {/* Citizen-Friendly Empty State if no RTOs are available */}
      {rtoOffices.length === 0 && !loadingRto && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(24, 35, 45, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.5rem' }}>📍</div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#18232D', margin: '0 0 0.4rem 0' }}>
            {tr('validation.rtoUnavailableTitle') || 'RTO selection is currently unavailable'}
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#5B6470', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            {tr('validation.rtoUnavailableDesc') ||
              "We couldn't find an available RTO or driving test location for your selected area. Please review your district selection or try again later."}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('field-districtId');
                if (el) el.focus();
              }}
              className="btn btn-secondary btn-sm"
            >
              {tr('validation.reviewDistrictBtn') || 'Review District'}
            </button>
            <button
              type="button"
              onClick={() => handleDistrictChange({ target: { value: formData.districtId } })}
              className="btn btn-primary btn-sm"
            >
              {tr('validation.tryAgainBtn') || 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* District & RTO Selector */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-districtId">
            {tr('form.selectDistrict')} <span className={styles.required}>*</span>
          </label>
          <select
            id="field-districtId"
            name="districtId"
            className={`${styles.select} ${errors.districtId ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!errors.districtId}
            aria-describedby={errors.districtId ? 'err-districtId' : undefined}
            value={formData.districtId || ''}
            onChange={handleDistrictChange}
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {localize ? localize(d, 'name') : d.name}
              </option>
            ))}
          </select>
          {errors.districtId && <FieldError error={errors.districtId} id="err-districtId" />}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-rtoId">
            {tr('form.selectRto')} <span className={styles.required}>*</span>
          </label>
          <select
            id="field-rtoId"
            name="rtoId"
            className={`${styles.select} ${errors.rtoId ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!errors.rtoId}
            aria-describedby={errors.rtoId ? 'err-rtoId' : undefined}
            value={formData.rtoId || ''}
            onChange={handleRtoChange}
            disabled={loadingRto}
          >
            {loadingRto ? (
              <option value="">{tr('common.loading')}</option>
            ) : (
              <>
                {(!formData.rtoId || isFallbackDistrict) && (
                  <option value="">-- {tr('form.selectRto')} --</option>
                )}
                {rtoOffices.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.rto_code})
                  </option>
                ))}
              </>
            )}
          </select>
          {errors.rtoId && <FieldError error={errors.rtoId} id="err-rtoId" />}
        </div>
      </div>

      {/* Selected RTO Office Details Card */}
      {selectedRto && (
        <div className={styles.officeCard}>
          <div className={styles.officeCardHeader}>
            <span className={styles.officeName}>
              🏢 {selectedRto.name}
            </span>
            <span className={styles.officeBadge}>{selectedRto.rto_code}</span>
          </div>
          <p className={styles.officeDetail}>
            <strong>{tr('form.address')}:</strong> {selectedRto.address}, {selectedRto.city}
          </p>
        </div>
      )}

      {/* Driving Test Centre (Separate from RTO Office - FLOW-12) */}
      {requiresTestCentre && (
        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-5)' }}>
          <div className={styles.noticeBox} style={{ marginBottom: 'var(--space-4)' }}>
            <span>📍</span>
            <div>
              <strong>{tr('form.testCentre')}</strong>
              <p>
                {tr('form.rtoSubhead')}
              </p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-testCentreId">
              {tr('form.testCentre')} <span className={styles.required}>*</span>
            </label>
            <select
              id="field-testCentreId"
              name="testCentreId"
              className={`${styles.select} ${errors.testCentreId ? 'fieldErrorBorder' : ''}`}
              aria-invalid={!!errors.testCentreId}
              aria-describedby={errors.testCentreId ? 'err-testCentreId' : undefined}
              value={formData.testCentreId || ''}
              onChange={handleCentreChange}
              disabled={loadingCentres}
            >
              {loadingCentres ? (
                <option value="">{tr('common.loading')}</option>
              ) : testCentres.length > 0 ? (
                testCentres.map((c) => {
                  const badge = c.status === 'active' ? `🟢 ${tr('form.trackActive')}` : c.status === 'temporarily_unavailable' ? `🔴 ${tr('form.trackUnavailable')}` : `🟡 ${tr('form.trackVerify')}`;
                  return (
                    <option key={c.id} value={c.id} disabled={c.status === 'temporarily_unavailable'}>
                      {badge} — {c.name} ({c.address})
                    </option>
                  );
                })
              ) : (
                <option value="">{tr('form.testCentre')}</option>
              )}
            </select>
            {errors.testCentreId && <FieldError error={errors.testCentreId} id="err-testCentreId" />}
          </div>

          {selectedCentre && (
            <div className={styles.officeCard} style={{ borderColor: selectedCentre.status === 'active' ? 'var(--color-primary)' : 'var(--color-warning)' }}>
              <div className={styles.officeCardHeader}>
                <span className={styles.officeName}>
                  🏁 {selectedCentre.name}
                </span>
                <span className={styles.officeBadge} style={{ background: selectedCentre.status === 'active' ? 'var(--color-primary)' : 'var(--color-warning)' }}>
                  {selectedCentre.status === 'active' ? `● ${tr('form.trackActive')}` : `● ${tr('form.trackUnavailable')}`}
                </span>
              </div>
              <p className={styles.officeDetail}>
                <strong>{tr('form.testCentreAddress')}</strong> {selectedCentre.address}, {selectedCentre.city}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
