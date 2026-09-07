'use client';
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { calculateAge, isMinorAge } from '@/lib/age.js';
import FieldError from '@/components/validation/FieldError';
import styles from './steps.module.css';

const VEHICLE_ICONS = {
  MC50CC: '🛵',
  MCWOG: '🛵',
  MCWG: '🏍️',
  LMV: '🚗',
  'LMV-NT': '🚙',
  'LMV-TR': '🛺',
  HMV: '🚚',
  HTV: '🚛',
  BUS: '🚌',
  TRAIL: '🚜',
};

export default function VehicleStep({
  formData,
  updateFormData,
  serviceId,
  stateId,
  localize,
  t,
  stepErrors = {},
}) {
  const { t: contextT } = useApp();
  const tr = t || contextT;

  const [vehicleClasses, setVehicleClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classError, setClassError] = useState('');

  // Compute age from dob
  const age = useMemo(() => calculateAge(formData.dob) ?? 18, [formData.dob]);
  const isMinor = isMinorAge(formData.dob);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let res = await fetch(`/api/vehicle-classes?serviceId=${serviceId || 1}&stateId=${stateId || 1}`);
        let data = await res.json();
        if (!data.vehicleClasses || data.vehicleClasses.length === 0) {
          res = await fetch('/api/vehicle-classes');
          data = await res.json();
        }
        setVehicleClasses(data.vehicleClasses || []);

        // Pre-select first eligible class if none selected
        const currentSelected = formData.selectedVehicleClasses || [];
        if (currentSelected.length === 0 && data.vehicleClasses && data.vehicleClasses.length > 0) {
          const eligible = data.vehicleClasses.find((vc) => vc.min_age <= age);
          if (eligible) {
            updateFormData('selectedVehicleClasses', [eligible.id]);
            updateFormData('selectedVehicleClassNames', [eligible.name]);
          }
        }
      } catch (err) {
        console.error('Failed to load vehicle classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, stateId]);

  const selectedClassIds = formData.selectedVehicleClasses || [];

  const handleToggleClass = (vc) => {
    setClassError('');

    // If minor, prevent selecting non-MCWOG classes
    if (isMinor && vc.code !== 'MCWOG' && vc.code !== 'MC50CC') {
      setClassError(
        `As a minor applicant (age ${age}), you are eligible exclusively for Motorcycle Without Gear (MCWOG / up to 50cc).`
      );
      return;
    }

    if (vc.min_age > age) {
      setClassError(`You must be at least ${vc.min_age} years old to apply for ${vc.name}.`);
      return;
    }

    let updatedIds;
    let updatedNames;
    const exists = selectedClassIds.includes(vc.id);

    if (exists) {
      if (selectedClassIds.length === 1) {
        return;
      }
      updatedIds = selectedClassIds.filter((id) => id !== vc.id);
      const currentNames = formData.selectedVehicleClassNames || [];
      updatedNames = currentNames.filter((name) => name !== vc.name);
    } else {
      updatedIds = [...selectedClassIds, vc.id];
      const currentNames = formData.selectedVehicleClassNames || [];
      updatedNames = [...currentNames, vc.name];
    }

    updateFormData('selectedVehicleClasses', updatedIds);
    updateFormData('selectedVehicleClassNames', updatedNames);
  };

  const vehicleError = stepErrors.selectedVehicleClasses || stepErrors.vehicleClasses;

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('form.selectVehicleClass')}</h3>
        <p className={styles.stepDesc}>
          {tr('form.vehicleSubhead')}
        </p>
      </div>

      {classError && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-error-light)',
            border: '1.5px solid var(--color-error)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-error)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
          }}
        >
          {classError}
        </div>
      )}

      {isMinor ? (
        <div className={styles.warningBox}>
          <span>ℹ️</span>
          <div>
            <strong>{tr('form.minorEligibilityNotice', { age: age ?? '' })}</strong>
          </div>
        </div>
      ) : null}

      <div id="field-selectedVehicleClasses" tabIndex={-1} style={{ outline: 'none' }}>
        {vehicleError && <FieldError error={vehicleError} id="err-vehicleClasses" />}

        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>{tr('common.loading')}</p>
          </div>
        ) : (
          <div className={styles.vehicleGrid} style={{ marginTop: vehicleError ? '8px' : 0 }}>
            {vehicleClasses.map((vc) => {
              const isSelected = selectedClassIds.includes(vc.id);
              const isEligible = isMinor
                ? vc.code === 'MCWOG' || vc.code === 'MC50CC'
                : vc.min_age <= age;
              const icon = VEHICLE_ICONS[vc.code] || '🚗';

              return (
                <div
                  key={vc.id}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={isEligible ? 0 : -1}
                  className={`${styles.vehicleCard} ${isSelected ? styles.vehicleCardSelected : ''} ${
                    vehicleError ? 'fieldErrorBorder' : ''
                  }`}
                  onClick={() => handleToggleClass(vc)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleClass(vc);
                    }
                  }}
                  style={{
                    opacity: isEligible ? 1 : 0.55,
                    cursor: isEligible ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div className={styles.vehicleCardIcon}>{icon}</div>

                  <div className={styles.vehicleCardContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.vehicleCode}>{vc.code}</span>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        readOnly
                        disabled={!isEligible}
                      />
                    </div>

                    <h4 className={styles.vehicleName}>
                      {localize ? localize(vc, 'name') : vc.name}
                    </h4>
                    <p className={styles.vehicleDesc}>
                      {localize ? localize(vc, 'description') : vc.description}
                    </p>

                    <div className={styles.vehicleMeta}>
                      <span>Min Age: {vc.min_age} yrs</span>
                      {vc.requires_medical === 1 && <span>• Medical Cert Required</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedClassIds.length > 0 && (
        <div style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
            Selected Classes ({selectedClassIds.length}):
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {(formData.selectedVehicleClassNames || []).map((name, i) => (
              <span key={i} style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                ✓ {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
