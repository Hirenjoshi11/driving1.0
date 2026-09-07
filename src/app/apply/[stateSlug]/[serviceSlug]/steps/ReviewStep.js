'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { isMinorAge } from '@/lib/age.js';
import FieldError from '@/components/validation/FieldError';
import {
  IconUser,
  IconHome,
  IconCar,
  IconBank,
  IconClipboard,
  IconInfo,
  IconShield,
  IconCheck,
} from '@/components/icons/Icons';
import styles from './steps.module.css';
import rv from './review.module.css';

export default function ReviewStep({
  formData,
  updateFormData,
  serviceId,
  stateId,
  service,
  selectedState,
  localize,
  t,
  stepErrors = {},
}) {
  const { t: contextT, language } = useApp();
  const tr = t || contextT;

  const [fees, setFees] = useState(null);
  const [loadingFees, setLoadingFees] = useState(true);
  const [showWhyAsking, setShowWhyAsking] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(`/api/fees?serviceId=${serviceId || 1}&stateId=${stateId || 1}`);
        const data = await res.json();
        setFees(data.fees);
      } catch (err) {
        console.error('Failed to load fees:', err);
      } finally {
        setLoadingFees(false);
      }
    };
    fetchFees();
  }, [serviceId, stateId]);

  const applicantName = `${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`.trim() || null;
  const uploadedCount = Object.keys(formData.uploadedDocuments || {}).length;
  const isMinor = isMinorAge(formData.dob);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('form.reviewApplication') || 'Application Review & Declaration'}</h3>
        <p className={styles.stepDesc}>
          {tr('validation.reviewSummaryDesc') || 'Please verify all details carefully before making payment and submitting your driving licence application.'}
        </p>
      </div>

      {/* 1. Applicant Section */}
      <div className={styles.reviewSection}>
        <div className={styles.reviewSectionHeader}>
          <span className={`${styles.reviewSectionTitle} ${rv.reviewSectionTitleRow}`}>
            <IconUser size={17} className={rv.sectionTitleIcon} />
            {tr('form.applicant')}
          </span>
        </div>
        <div className={styles.reviewGrid}>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.firstName') || 'Full Name'}</span>
            <span className={styles.reviewFieldValue}>{applicantName || tr('common.notSpecified')}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.relation')}{formData.relationType ? ` (${formData.relationType})` : ''}</span>
            <span className={styles.reviewFieldValue}>{formData.relationName || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.dateOfBirth') || 'Date of Birth'}</span>
            <span className={styles.reviewFieldValue}>{formData.dob || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.gender') || 'Gender'}</span>
            <span className={styles.reviewFieldValue}>{formData.gender || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.mobileNumber') || 'Mobile Number'}</span>
            <span className={styles.reviewFieldValue}>{formData.mobile || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.email') || 'Email'}</span>
            <span className={styles.reviewFieldValue}>{formData.email || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.bloodGroup') || 'Blood Group'}</span>
            <span className={styles.reviewFieldValue}>{formData.bloodGroup || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.education') || 'Education'}</span>
            <span className={styles.reviewFieldValue}>{formData.education || '—'}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.identityType') || 'Identity Document'}</span>
            <span className={styles.reviewFieldValue}>
              {formData.identityType?.toUpperCase() || 'AADHAAR'}: {
                formData.identityNumber 
                  ? (formData.identityType?.toLowerCase() === 'aadhaar' || /^\d{12}$/.test(formData.identityNumber)
                      ? `XXXX XXXX ${formData.identityNumber.slice(-4)}`
                      : `XXXX-${formData.identityNumber.slice(-4)}`)
                  : '—'
              }
            </span>
          </div>
        </div>
      </div>

      {/* 2. Address Section */}
      <div className={styles.reviewSection}>
        <div className={styles.reviewSectionHeader}>
          <span className={`${styles.reviewSectionTitle} ${rv.reviewSectionTitleRow}`}>
            <IconHome size={17} className={rv.sectionTitleIcon} />
            {tr('form.address')}
          </span>
        </div>
        <div className={styles.reviewGrid}>
          <div className={`${styles.reviewField} ${rv.fullRow}`}>
            <span className={styles.reviewFieldLabel}>{tr('form.currentAddress') || 'Current Address'}</span>
            <span className={styles.reviewFieldValue}>
              {[
                formData.currentHouse,
                formData.currentStreet,
                formData.currentCity,
                formData.currentTaluka,
                formData.currentDistrictName,
                selectedState?.name,
                formData.currentPincode,
              ]
                .filter(Boolean)
                .join(', ') || '—'}
            </span>
          </div>
          <div className={`${styles.reviewField} ${rv.fullRow}`}>
            <span className={styles.reviewFieldLabel}>{tr('form.permanentAddress') || 'Permanent Address'}</span>
            <span className={styles.reviewFieldValue}>
              {formData.sameAsCurrent !== false
                ? (tr('form.sameAsCurrent') || 'Same as present address')
                : [
                    formData.permanentHouse,
                    formData.permanentStreet,
                    formData.permanentCity,
                    formData.permanentState,
                    formData.permanentPincode,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Service & Vehicle Section */}
      <div className={styles.reviewSection}>
        <div className={styles.reviewSectionHeader}>
          <span className={`${styles.reviewSectionTitle} ${rv.reviewSectionTitleRow}`}>
            <IconCar size={17} className={rv.sectionTitleIcon} />
            {tr('form.licence')}
          </span>
        </div>
        <div className={styles.reviewGrid}>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.service')}</span>
            <span className={styles.reviewFieldValue}>{service?.name}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('payment.stateJurisdiction')}</span>
            <span className={styles.reviewFieldValue}>{selectedState?.name}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.vehicleClass')}</span>
            <span className={styles.reviewFieldValue}>
              {(formData.selectedVehicleClassNames || []).join(', ') || tr('common.notSpecified')}
            </span>
          </div>
          {formData.learnerLicenceNumber && (
            <div className={styles.reviewField}>
              <span className={styles.reviewFieldLabel}>{tr('form.learnerLicence')}</span>
              <span className={styles.reviewFieldValue}>{formData.learnerLicenceNumber}</span>
            </div>
          )}
          {formData.existingDlNumber && (
            <div className={styles.reviewField}>
              <span className={styles.reviewFieldLabel}>{tr('form.existingLicence')}</span>
              <span className={styles.reviewFieldValue}>{formData.existingDlNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. RTO & Test Centre Section */}
      <div className={styles.reviewSection}>
        <div className={styles.reviewSectionHeader}>
          <span className={`${styles.reviewSectionTitle} ${rv.reviewSectionTitleRow}`}>
            <IconBank size={17} className={rv.sectionTitleIcon} />
            {tr('form.rto')}
          </span>
        </div>
        <div className={styles.reviewGrid}>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.rtoOffice')}</span>
            <span className={styles.reviewFieldValue}>
              {formData.rtoName ? `${formData.rtoName} (${formData.rtoCode})` : '—'}
            </span>
          </div>
          <div className={`${styles.reviewField} ${styles.fullWidth}`}>
            <span className={styles.reviewFieldLabel}>{tr('form.testCentre') || 'Test Centre Facility'}</span>
            <span className={styles.reviewFieldValue}>
              {formData.testCentreName || tr('common.notSpecified')}
            </span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewFieldLabel}>{tr('form.documents') || 'Supporting Documents'}</span>
            <span className={styles.reviewFieldValue}>
              {uploadedCount > 0 ? tr('review.docsAttached', { count: uploadedCount }) : tr('review.docsPending')}
            </span>
          </div>
        </div>
      </div>

      {/* Fee Breakdown Card */}
      <div className={styles.feeCard}>
        <h4 className={styles.feeTitle}>{tr('form.payment')}</h4>
        {loadingFees ? (
          <p className={rv.feeLoading}>{tr('common.loading')}</p>
        ) : fees ? (
          <div>
            <div className={styles.feeRow}>
              <span>{tr('payment.govtFee')}</span>
              <span className={styles.feeAmount}>₹{fees.government_fee || 0}</span>
            </div>
            {fees.test_fee > 0 && (
              <div className={styles.feeRow}>
                <span>{tr('form.testCentre')}</span>
                <span className={styles.feeAmount}>₹{fees.test_fee}</span>
              </div>
            )}
            <div className={styles.feeRow}>
              <span>{tr('payment.serviceFee')}</span>
              <span className={styles.feeAmount}>{fees.service_fee !== undefined && fees.service_fee !== null ? `₹${fees.service_fee}` : '—'}</span>
            </div>
            <div className={styles.feeRowTotal}>
              <span>{tr('payment.totalPayable')}</span>
              <span className={styles.feeTotalAmount}>
                {fees.total_payable !== undefined && fees.total_payable !== null ? `₹${Number(fees.total_payable).toLocaleString('en-IN')}` : tr('common.feeUnavailable')}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.feeRowTotal}>
            <span>{tr('payment.totalPayable')}</span>
            <span className={styles.feeTotalAmount}>Fee unavailable</span>
          </div>
        )}
      </div>

      {/* Unified consent, statutory declaration and (for minors) guardian consent */}
      <div
        id="field-consentUnified"
        tabIndex={-1}
        className={`${rv.consentPanel} ${
          stepErrors.consentUnified || stepErrors.consent ? rv.consentPanelError : ''
        }`}
      >
        <div className={rv.consentHead}>
          <h4 className={rv.consentTitle}>
            <IconClipboard size={17} className={rv.consentTitleIcon} />
            {tr('consent.heading')}
          </h4>
          <span className={rv.dpdpBadge}>DPDP Act 2023</span>
        </div>

        {/* 1. Unified communication & service consent */}
        <div
          className={`${rv.consentBlock} ${
            stepErrors.consentUnified || stepErrors.consent ? rv.consentBlockError : ''
          }`}
        >
          <label htmlFor="input-consentUnified" className={rv.consentLabel}>
            <input
              type="checkbox"
              id="input-consentUnified"
              name="consentUnified"
              className={rv.consentCheckbox}
              checked={formData.consentUnified ?? (formData.consentProcessing ?? true)}
              onChange={(e) => {
                const checked = e.target.checked;
                updateFormData('consentUnified', checked);
                updateFormData('consentProcessing', checked);
                updateFormData('consentCommunication', checked);
              }}
            />
            <span>
              {tr('consent.unifiedCheckbox')}
              <span className={rv.consentLinks}>
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className={rv.consentLink}>
                  {tr('consent.privacyLink')}
                </a>
                <span aria-hidden="true">•</span>
                <a href="/terms" target="_blank" rel="noopener noreferrer" className={rv.consentLink}>
                  {tr('consent.termsLink')}
                </a>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  className={rv.whyButton}
                  aria-expanded={showWhyAsking}
                  onClick={() => setShowWhyAsking((prev) => !prev)}
                >
                  {tr('consent.whyAsking')}
                </button>
              </span>
            </span>
          </label>

          {showWhyAsking && (
            <div className={rv.whyPanel}>
              <IconInfo size={15} className={rv.whyPanelIcon} />
              <span>{tr('consent.whyAskingDesc')}</span>
            </div>
          )}

          {(stepErrors.consentUnified || stepErrors.consent) && (
            <div className={rv.consentError}>
              <FieldError error={stepErrors.consentUnified || stepErrors.consent} id="err-consentUnified" />
            </div>
          )}
        </div>

        {/* 2. Statutory accuracy declaration */}
        <div
          id="field-declared"
          tabIndex={-1}
          className={`${rv.consentBlock} ${rv.consentBlockPlain} ${
            stepErrors.declared ? rv.consentBlockError : ''
          }`}
        >
          <label htmlFor="input-declared" className={rv.consentLabel}>
            <input
              type="checkbox"
              id="input-declared"
              name="declared"
              className={rv.consentCheckbox}
              checked={formData.declared || false}
              onChange={(e) => updateFormData('declared', e.target.checked)}
            />
            <span>
              <strong>{tr('form.statutoryDeclaration')}:</strong> {tr('consent.declaration')}
            </span>
          </label>
          {stepErrors.declared && (
            <div className={rv.consentError}>
              <FieldError error={stepErrors.declared} id="err-declared" />
            </div>
          )}
        </div>

        {/* 3. Minor protection — DPDP Act s.9 */}
        {isMinor && (
          <div
            id="field-guardianConsent"
            tabIndex={-1}
            className={`${rv.guardianBlock} ${stepErrors.guardianConsent ? rv.guardianBlockError : ''}`}
          >
            <div className={rv.guardianNotice}>
              <IconShield size={15} />
              {tr('consent.guardianNoticeTitle')}
            </div>
            <label htmlFor="input-guardianConsent" className={rv.guardianLabel}>
              <input
                type="checkbox"
                id="input-guardianConsent"
                name="guardianConsent"
                className={rv.guardianCheckbox}
                checked={formData.guardianConsent || false}
                onChange={(e) => updateFormData('guardianConsent', e.target.checked)}
              />
              <span>
                <strong>{tr('review.guardianConsentLabel')}:</strong> {tr('consent.guardianConsent')}
              </span>
            </label>
            {stepErrors.guardianConsent && (
              <div className={rv.consentError}>
                <FieldError error={stepErrors.guardianConsent} id="err-guardianConsent" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
