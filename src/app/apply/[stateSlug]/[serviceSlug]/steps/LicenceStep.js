'use client';
import { useApp } from '@/contexts/AppContext';
import FieldError from '@/components/validation/FieldError';
import styles from './steps.module.css';

export default function LicenceStep({
  formData,
  updateFormData,
  service,
  selectedState,
  localize,
  t,
  stepErrors = {},
}) {
  const { t: contextT } = useApp();
  const tr = t || contextT;

  const isNewDL = service?.slug === 'new-driving-licence';
  const isDuplicate = service?.slug === 'duplicate';
  const isNameChange = service?.slug === 'change-name';
  const isIDP = service?.slug === 'international-permit';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>
          {isNewDL ? tr('form.learnerLicenceNo') : tr('form.licenceDetails')}
        </h3>
        <p className={styles.stepDesc}>
          {tr('form.licenceSubhead')}
        </p>
      </div>

      {isNewDL ? (
        /* Learner Licence Section for New DL */
        <div className={styles.stepContainer}>
          <div className={styles.noticeBox}>
            <span>ℹ️</span>
            <div>
              <strong>{tr('form.learnerLicenceNo')}</strong>
              <p>{tr('form.licenceSubhead')}</p>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-learnerLicenceNumber">
                {tr('form.learnerLicenceNo')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-learnerLicenceNumber"
                name="learnerLicenceNumber"
                className={`${styles.input} ${stepErrors.learnerLicenceNumber ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.learnerLicenceNumber}
                aria-describedby={stepErrors.learnerLicenceNumber ? 'err-learnerLicenceNumber' : undefined}
                placeholder="e.g. GJ01/0012345/2024"
                value={formData.learnerLicenceNumber || ''}
                onChange={(e) => updateFormData('learnerLicenceNumber', e.target.value.toUpperCase())}
                required
              />
              <FieldError error={stepErrors.learnerLicenceNumber} id="err-learnerLicenceNumber" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-licenceIssueDate">
                {tr('form.issueDate')} <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="field-licenceIssueDate"
                name="licenceIssueDate"
                className={`${styles.input} ${stepErrors.licenceIssueDate ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.licenceIssueDate}
                aria-describedby={stepErrors.licenceIssueDate ? 'err-licenceIssueDate' : undefined}
                value={formData.licenceIssueDate || ''}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFormData('licenceIssueDate', e.target.value)}
                required
              />
              <FieldError error={stepErrors.licenceIssueDate} id="err-licenceIssueDate" />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-licenceExpiryDate">
                {tr('form.expiryDate')} <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="field-licenceExpiryDate"
                name="licenceExpiryDate"
                className={`${styles.input} ${stepErrors.licenceExpiryDate ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.licenceExpiryDate}
                aria-describedby={stepErrors.licenceExpiryDate ? 'err-licenceExpiryDate' : undefined}
                value={formData.licenceExpiryDate || ''}
                onChange={(e) => updateFormData('licenceExpiryDate', e.target.value)}
                required
              />
              <FieldError error={stepErrors.licenceExpiryDate} id="err-licenceExpiryDate" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-issuingAuthority">
                {tr('form.issuingAuthority')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-issuingAuthority"
                name="issuingAuthority"
                className={`${styles.input} ${stepErrors.issuingAuthority ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.issuingAuthority}
                aria-describedby={stepErrors.issuingAuthority ? 'err-issuingAuthority' : undefined}
                placeholder={tr('form.issuingAuthority')}
                value={formData.issuingAuthority || ''}
                onChange={(e) => updateFormData('issuingAuthority', e.target.value)}
                required
              />
              <FieldError error={stepErrors.issuingAuthority} id="err-issuingAuthority" />
            </div>
          </div>
        </div>
      ) : (
        /* Existing Licence Section for Renewal, Duplicate, Add Class, etc. */
        <div className={styles.stepContainer}>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-existingDlNumber">
                {tr('form.existingLicenceNo')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-existingDlNumber"
                name="existingDlNumber"
                className={`${styles.input} ${stepErrors.existingDlNumber ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.existingDlNumber}
                aria-describedby={stepErrors.existingDlNumber ? 'err-existingDlNumber' : undefined}
                placeholder="e.g. GJ01 20180012345"
                value={formData.existingDlNumber || ''}
                onChange={(e) => updateFormData('existingDlNumber', e.target.value.toUpperCase())}
                required
              />
              <FieldError error={stepErrors.existingDlNumber} id="err-existingDlNumber" />
              {!stepErrors.existingDlNumber && <span className={styles.hint}>{tr('form.licenceDetails')}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-licenceIssueDate">
                {tr('form.issueDate') || 'Original Date of Issue'} <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="field-licenceIssueDate"
                name="licenceIssueDate"
                className={`${styles.input} ${stepErrors.licenceIssueDate ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.licenceIssueDate}
                aria-describedby={stepErrors.licenceIssueDate ? 'err-licenceIssueDate' : undefined}
                value={formData.licenceIssueDate || ''}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFormData('licenceIssueDate', e.target.value)}
                required
              />
              <FieldError error={stepErrors.licenceIssueDate} id="err-licenceIssueDate" />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-licenceExpiryDate">
                {tr('form.expiryDate') || 'Current Expiry Date'} <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="field-licenceExpiryDate"
                name="licenceExpiryDate"
                className={`${styles.input} ${stepErrors.licenceExpiryDate ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.licenceExpiryDate}
                aria-describedby={stepErrors.licenceExpiryDate ? 'err-licenceExpiryDate' : undefined}
                value={formData.licenceExpiryDate || ''}
                onChange={(e) => updateFormData('licenceExpiryDate', e.target.value)}
                required
              />
              <FieldError error={stepErrors.licenceExpiryDate} id="err-licenceExpiryDate" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-issuingAuthority">
                {tr('form.issuingAuthority') || 'Issuing RTO Authority'} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-issuingAuthority"
                name="issuingAuthority"
                className={`${styles.input} ${stepErrors.issuingAuthority ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.issuingAuthority}
                aria-describedby={stepErrors.issuingAuthority ? 'err-issuingAuthority' : undefined}
                placeholder="e.g. RTO Jaipur (RJ-14)"
                value={formData.issuingAuthority || ''}
                onChange={(e) => updateFormData('issuingAuthority', e.target.value)}
                required
              />
              <FieldError error={stepErrors.issuingAuthority} id="err-issuingAuthority" />
            </div>
          </div>

          {/* Additional fields for Duplicate Licence */}
          {isDuplicate && (
            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: 'var(--space-3)' }}>
                Duplicate Licence Reason
              </h4>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-duplicateReason">
                    Reason for Duplicate <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="field-duplicateReason"
                    name="duplicateReason"
                    className={styles.select}
                    value={formData.duplicateReason || 'lost'}
                    onChange={(e) => updateFormData('duplicateReason', e.target.value)}
                  >
                    <option value="lost">Lost / Misplaced</option>
                    <option value="stolen">Stolen / Theft</option>
                    <option value="damaged">Mutilated / Torn / Damaged</option>
                    <option value="defaced">Defaced / Illegible</option>
                    <option value="destroyed">Completely Destroyed</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-firNumber">
                    Police Complaint / FIR Number {(formData.duplicateReason === 'lost' || formData.duplicateReason === 'stolen') && <span className={styles.required}>*</span>}
                  </label>
                  <input
                    type="text"
                    id="field-firNumber"
                    name="firNumber"
                    className={`${styles.input} ${stepErrors.firNumber ? 'fieldErrorBorder' : ''}`}
                    aria-invalid={!!stepErrors.firNumber}
                    aria-describedby={stepErrors.firNumber ? 'err-firNumber' : undefined}
                    placeholder="e.g. FIR-2024-09823"
                    value={formData.firNumber || ''}
                    onChange={(e) => updateFormData('firNumber', e.target.value)}
                  />
                  <FieldError error={stepErrors.firNumber} id="err-firNumber" />
                  {!stepErrors.firNumber && <span className={styles.hint}>Required if licence was lost or stolen.</span>}
                </div>
              </div>
            </div>
          )}

          {/* Additional fields for Change of Name */}
          {isNameChange && (
            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: 'var(--space-3)' }}>
                Name Change Details
              </h4>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-previousName">
                    Previous Name as on Existing DL <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="field-previousName"
                    name="previousName"
                    className={`${styles.input} ${stepErrors.previousName ? 'fieldErrorBorder' : ''}`}
                    aria-invalid={!!stepErrors.previousName}
                    aria-describedby={stepErrors.previousName ? 'err-previousName' : undefined}
                    placeholder="Old name on licence"
                    value={formData.previousName || ''}
                    onChange={(e) => updateFormData('previousName', e.target.value)}
                    required
                  />
                  <FieldError error={stepErrors.previousName} id="err-previousName" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-nameChangeReason">
                    Reason for Name Change <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="field-nameChangeReason"
                    name="nameChangeReason"
                    className={styles.select}
                    value={formData.nameChangeReason || 'marriage'}
                    onChange={(e) => updateFormData('nameChangeReason', e.target.value)}
                  >
                    <option value="marriage">After Marriage</option>
                    <option value="gazette">State Official Gazette Notification</option>
                    <option value="correction">Spelling Correction / Alias</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Additional fields for International Driving Permit (IDP) */}
          {isIDP && (
            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: 'var(--space-3)' }}>
                Passport & Travel Details for IDP
              </h4>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-passportNumber">
                    Indian Passport Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="field-passportNumber"
                    name="passportNumber"
                    className={`${styles.input} ${stepErrors.passportNumber ? 'fieldErrorBorder' : ''}`}
                    aria-invalid={!!stepErrors.passportNumber}
                    aria-describedby={stepErrors.passportNumber ? 'err-passportNumber' : undefined}
                    placeholder="e.g. Z1234567"
                    value={formData.passportNumber || ''}
                    onChange={(e) => updateFormData('passportNumber', e.target.value.toUpperCase())}
                    required
                  />
                  <FieldError error={stepErrors.passportNumber} id="err-passportNumber" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-passportExpiryDate">
                    Passport Expiry Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    id="field-passportExpiryDate"
                    name="passportExpiryDate"
                    className={`${styles.input} ${stepErrors.passportExpiryDate ? 'fieldErrorBorder' : ''}`}
                    aria-invalid={!!stepErrors.passportExpiryDate}
                    aria-describedby={stepErrors.passportExpiryDate ? 'err-passportExpiryDate' : undefined}
                    value={formData.passportExpiryDate || ''}
                    onChange={(e) => updateFormData('passportExpiryDate', e.target.value)}
                    required
                  />
                  <FieldError error={stepErrors.passportExpiryDate} id="err-passportExpiryDate" />
                  {!stepErrors.passportExpiryDate && <span className={styles.hint}>Passport must be valid for at least 1 year.</span>}
                </div>
              </div>

              <div className={styles.grid2} style={{ marginTop: 'var(--space-3)' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-visitingCountry">
                    Country Visiting <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="field-visitingCountry"
                    name="visitingCountry"
                    className={`${styles.input} ${stepErrors.visitingCountry ? 'fieldErrorBorder' : ''}`}
                    aria-invalid={!!stepErrors.visitingCountry}
                    aria-describedby={stepErrors.visitingCountry ? 'err-visitingCountry' : undefined}
                    placeholder="e.g. United Kingdom, USA, UAE"
                    value={formData.visitingCountry || ''}
                    onChange={(e) => updateFormData('visitingCountry', e.target.value)}
                    required
                  />
                  <FieldError error={stepErrors.visitingCountry} id="err-visitingCountry" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="field-visaType">Visa Type</label>
                  <input
                    type="text"
                    id="field-visaType"
                    name="visaType"
                    className={styles.input}
                    placeholder="e.g. Tourist / Business / Work"
                    value={formData.visaType || ''}
                    onChange={(e) => updateFormData('visaType', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
