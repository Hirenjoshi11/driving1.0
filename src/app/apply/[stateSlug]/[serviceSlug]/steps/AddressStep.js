'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import FieldError from '@/components/validation/FieldError';
import styles from './steps.module.css';

export default function AddressStep({
  formData,
  updateFormData,
  stateId,
  selectedState,
  localize,
  t,
  stepErrors = {},
}) {
  const { t: contextT } = useApp();
  const tr = t || contextT;

  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  // Fetch districts for the selected state
  useEffect(() => {
    if (!stateId) return;
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`/api/districts?stateId=${stateId}`);
        const data = await res.json();
        setDistricts(data.districts || []);
        
        // Auto-select first district if not selected
        if (!formData.districtId && data.districts && data.districts.length > 0) {
          updateFormData('districtId', data.districts[0].id);
          updateFormData('currentDistrictName', data.districts[0].name);
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId]);

  const sameAsCurrent = formData.sameAsCurrent !== false;

  const handleDistrictChange = (e) => {
    const distId = parseInt(e.target.value, 10);
    updateFormData('districtId', distId);
    const found = districts.find((d) => d.id === distId);
    if (found) {
      updateFormData('currentDistrictName', found.name);
    }
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('form.addressDetails')}</h3>
        <p className={styles.stepDesc}>
          {tr('form.addressSubhead')}
        </p>
      </div>

      {/* Present / Current Address Section */}
      <div>
        <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: 'var(--space-3)' }}>
          {tr('form.currentAddress')}
        </h4>

        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-currentHouse">
              {tr('form.houseFlat')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="field-currentHouse"
              name="currentHouse"
              className={`${styles.input} ${stepErrors.currentHouse ? 'fieldErrorBorder' : ''}`}
              aria-invalid={!!stepErrors.currentHouse}
              aria-describedby={stepErrors.currentHouse ? 'err-currentHouse' : undefined}
              placeholder={tr('form.houseFlat')}
              value={formData.currentHouse || ''}
              onChange={(e) => updateFormData('currentHouse', e.target.value)}
              required
            />
            <FieldError error={stepErrors.currentHouse} id="err-currentHouse" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-currentStreet">
              {tr('form.street')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="field-currentStreet"
              name="currentStreet"
              className={`${styles.input} ${stepErrors.currentStreet ? 'fieldErrorBorder' : ''}`}
              aria-invalid={!!stepErrors.currentStreet}
              aria-describedby={stepErrors.currentStreet ? 'err-currentStreet' : undefined}
              placeholder={tr('form.street')}
              value={formData.currentStreet || ''}
              onChange={(e) => updateFormData('currentStreet', e.target.value)}
              required
            />
            <FieldError error={stepErrors.currentStreet} id="err-currentStreet" />
          </div>
        </div>

        <div className={styles.grid3} style={{ marginTop: 'var(--space-3)' }}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-currentCity">
              {tr('form.city')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="field-currentCity"
              name="currentCity"
              className={`${styles.input} ${stepErrors.currentCity ? 'fieldErrorBorder' : ''}`}
              aria-invalid={!!stepErrors.currentCity}
              aria-describedby={stepErrors.currentCity ? 'err-currentCity' : undefined}
              placeholder={tr('form.city')}
              value={formData.currentCity || ''}
              onChange={(e) => updateFormData('currentCity', e.target.value)}
              required
            />
            <FieldError error={stepErrors.currentCity} id="err-currentCity" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-districtId">
              {tr('form.district')} <span className={styles.required}>*</span>
            </label>
            <select
              id="field-districtId"
              name="districtId"
              className={`${styles.select} ${stepErrors.districtId ? 'fieldErrorBorder' : ''}`}
              aria-invalid={!!stepErrors.districtId}
              aria-describedby={stepErrors.districtId ? 'err-districtId' : undefined}
              value={formData.districtId || ''}
              onChange={handleDistrictChange}
              disabled={loadingDistricts}
              required
            >
              {loadingDistricts ? (
                <option value="">{tr('common.loading')}</option>
              ) : (
                districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {localize ? localize(d, 'name') : d.name}
                  </option>
                ))
              )}
            </select>
            <FieldError error={stepErrors.districtId} id="err-districtId" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-currentTaluka">{tr('form.taluka')}</label>
            <input
              type="text"
              id="field-currentTaluka"
              name="currentTaluka"
              className={styles.input}
              placeholder={tr('form.taluka')}
              value={formData.currentTaluka || ''}
              onChange={(e) => updateFormData('currentTaluka', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.grid2} style={{ marginTop: 'var(--space-3)' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{tr('form.state')}</label>
            <input
              type="text"
              className={styles.input}
              value={localize ? localize(selectedState, 'name') : (selectedState?.name || '')}
              disabled
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="field-currentPincode">
              {tr('form.pincode')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="field-currentPincode"
              name="currentPincode"
              className={`${styles.input} ${stepErrors.currentPincode ? 'fieldErrorBorder' : ''}`}
              aria-invalid={!!stepErrors.currentPincode}
              aria-describedby={stepErrors.currentPincode ? 'err-currentPincode' : undefined}
              maxLength={6}
              placeholder="6-digit PIN"
              value={formData.currentPincode || ''}
              onChange={(e) => updateFormData('currentPincode', e.target.value.replace(/\D/g, ''))}
              required
            />
            <FieldError error={stepErrors.currentPincode} id="err-currentPincode" />
          </div>
        </div>
      </div>

      {/* Permanent Address Checkbox */}
      <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)' }}>
        <label className={styles.checkboxLabel} htmlFor="input-sameAsCurrent">
          <input
            type="checkbox"
            id="input-sameAsCurrent"
            className={styles.checkbox}
            checked={sameAsCurrent}
            onChange={(e) => updateFormData('sameAsCurrent', e.target.checked)}
          />
          <span style={{ fontWeight: 600 }}>
            {tr('form.sameAsCurrent')}
          </span>
        </label>
      </div>

      {/* Permanent Address Fields if unchecked */}
      {!sameAsCurrent && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: 'var(--space-3)' }}>
            {tr('form.permanentAddress')}
          </h4>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-permanentHouse">
                {tr('form.houseFlat')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-permanentHouse"
                name="permanentHouse"
                className={`${styles.input} ${stepErrors.permanentHouse ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.permanentHouse}
                aria-describedby={stepErrors.permanentHouse ? 'err-permanentHouse' : undefined}
                placeholder={tr('form.houseFlat')}
                value={formData.permanentHouse || ''}
                onChange={(e) => updateFormData('permanentHouse', e.target.value)}
                required
              />
              <FieldError error={stepErrors.permanentHouse} id="err-permanentHouse" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-permanentStreet">
                {tr('form.street')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-permanentStreet"
                name="permanentStreet"
                className={`${styles.input} ${stepErrors.permanentStreet ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.permanentStreet}
                aria-describedby={stepErrors.permanentStreet ? 'err-permanentStreet' : undefined}
                placeholder={tr('form.street')}
                value={formData.permanentStreet || ''}
                onChange={(e) => updateFormData('permanentStreet', e.target.value)}
                required
              />
              <FieldError error={stepErrors.permanentStreet} id="err-permanentStreet" />
            </div>
          </div>

          <div className={styles.grid3} style={{ marginTop: 'var(--space-3)' }}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-permanentCity">
                {tr('form.city')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-permanentCity"
                name="permanentCity"
                className={`${styles.input} ${stepErrors.permanentCity ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.permanentCity}
                aria-describedby={stepErrors.permanentCity ? 'err-permanentCity' : undefined}
                placeholder={tr('form.city')}
                value={formData.permanentCity || ''}
                onChange={(e) => updateFormData('permanentCity', e.target.value)}
                required
              />
              <FieldError error={stepErrors.permanentCity} id="err-permanentCity" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-permanentState">{tr('form.state')}</label>
              <input
                type="text"
                id="field-permanentState"
                name="permanentState"
                className={styles.input}
                placeholder={tr('form.state')}
                value={formData.permanentState || (localize ? localize(selectedState, 'name') : selectedState?.name) || ''}
                onChange={(e) => updateFormData('permanentState', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-permanentPincode">
                {tr('form.pincode')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-permanentPincode"
                name="permanentPincode"
                className={`${styles.input} ${stepErrors.permanentPincode ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.permanentPincode}
                aria-describedby={stepErrors.permanentPincode ? 'err-permanentPincode' : undefined}
                maxLength={6}
                placeholder="6-digit PIN"
                value={formData.permanentPincode || ''}
                onChange={(e) => updateFormData('permanentPincode', e.target.value.replace(/\D/g, ''))}
                required
              />
              <FieldError error={stepErrors.permanentPincode} id="err-permanentPincode" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
