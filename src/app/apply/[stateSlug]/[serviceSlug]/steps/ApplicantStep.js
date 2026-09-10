'use client';
import { useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { calculateAge, isMinorAge } from '@/lib/age.js';
import FieldError from '@/components/validation/FieldError';
import styles from './steps.module.css';

export default function ApplicantStep({
  formData,
  updateFormData,
  localize,
  t,
  stepErrors = {},
}) {
  const { t: contextT, dispatch } = useApp();
  const tr = t || contextT;
  const params = useParams();
  const router = useRouter();

  const stateSlug = params?.stateSlug || 'gujarat';
  const serviceSlug = params?.serviceSlug || 'learner-licence';

  // Calculate applicant age
  const age = useMemo(() => calculateAge(formData.dob), [formData.dob]);
  const isMinor = isMinorAge(formData.dob);

  const handleStateChange = async (e) => {
    const selectedStateSlug = e.target.value;
    updateFormData('state', selectedStateSlug);
    updateFormData('stateSlug', selectedStateSlug);
    // Reset dependent location fields since RTOs/districts belong to this state
    updateFormData('districtId', '');
    updateFormData('district', '');
    updateFormData('rtoCode', '');
    updateFormData('rtoOffice', '');
    updateFormData('currentDistrictName', '');

    if (selectedStateSlug) {
      try {
        const res = await fetch('/api/states');
        const data = await res.json();
        const found = (data.states || []).find((s) => s.slug === selectedStateSlug);
        if (found) {
          dispatch({ type: 'SET_STATE', payload: found });
        }
      } catch (err) {
        console.error('Failed to sync state:', err);
      }
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/apply/${selectedStateSlug}/${serviceSlug}`);
      }
    }
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('form.applicantDetails')}</h3>
        <p className={styles.stepDesc}>
          {tr('form.applicantSubhead')}
        </p>
      </div>

      {/* State Field */}
      <div
        className={`${styles.formGroup} ${stepErrors.state ? styles.hasError : ''}`}
        style={{
          marginBottom: 'var(--space-6)',
          background: stepErrors.state ? '#FEF2F2' : '#F8FAFC',
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          border: stepErrors.state ? '1.5px solid var(--color-danger, #ef4444)' : '1.5px solid var(--color-border)',
          transition: 'all 0.2s ease',
        }}
      >
        <label
          className={styles.label}
          htmlFor="field-state"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: stepErrors.state ? 'var(--color-danger, #b91c1c)' : 'var(--color-text-dark)',
          }}
        >
          <span>🏛️</span>
          <span>{tr('form.applyingFrom') || 'From where you are applying from?'}</span>
          <span className={styles.required}>*</span>
        </label>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '2px 0 10px 0' }}>
          {tr('form.stateSelectDesc') || 'Select from which state you belong (Gujarat, Rajasthan, or Uttar Pradesh)'}
        </p>
        <select
          id="field-state"
          name="state"
          className={`${styles.select} ${stepErrors.state ? styles.inputError : ''}`}
          value={formData.state || ''}
          onChange={handleStateChange}
          style={{
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            background: '#ffffff',
            borderColor: stepErrors.state ? 'var(--color-danger, #ef4444)' : undefined,
          }}
          required
        >
          <option value="">{tr('form.selectStatePrompt') || '-- Select State You Are Applying From --'}</option>
          <option value="gujarat">Gujarat (ગુજરાત)</option>
          <option value="rajasthan">Rajasthan (राजस्थान)</option>
          <option value="uttar-pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
        </select>
        {stepErrors.state && <FieldError error={stepErrors.state} />}
      </div>

      {/* Minor Notice if age < 18 */}
      {isMinor && (
        <div className={styles.warningBox}>
          <span>⚠️</span>
          <div>
            <strong>{tr('form.ageNote', { age: age ?? '' })}</strong>
            <p>
              {tr('form.minorEligibilityNotice', { age: age ?? '' })}
            </p>
          </div>
        </div>
      )}

      {/* Name Details */}
      <div className={styles.grid3}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-firstName">
            {tr('form.firstName')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="field-firstName"
            name="firstName"
            className={`${styles.input} ${stepErrors.firstName ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.firstName}
            aria-describedby={stepErrors.firstName ? 'err-firstName' : undefined}
            placeholder={tr('form.firstName')}
            value={formData.firstName || ''}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            required
          />
          <FieldError error={stepErrors.firstName} id="err-firstName" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-middleName">{tr('form.middleName')}</label>
          <input
            type="text"
            id="field-middleName"
            name="middleName"
            className={styles.input}
            placeholder={tr('form.middleName')}
            value={formData.middleName || ''}
            onChange={(e) => updateFormData('middleName', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-lastName">
            {tr('form.lastName')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="field-lastName"
            name="lastName"
            className={`${styles.input} ${stepErrors.lastName ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.lastName}
            aria-describedby={stepErrors.lastName ? 'err-lastName' : undefined}
            placeholder={tr('form.lastName')}
            value={formData.lastName || ''}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            required
          />
          <FieldError error={stepErrors.lastName} id="err-lastName" />
        </div>
      </div>

      {/* Relation Details */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-relationType">
            {tr('form.relationType')} <span className={styles.required}>*</span>
          </label>
          <select
            id="field-relationType"
            name="relationType"
            className={styles.select}
            value={formData.relationType || 'Father'}
            onChange={(e) => updateFormData('relationType', e.target.value)}
          >
            <option value="Father">{tr('form.relFather')}</option>
            <option value="Mother">{tr('form.relMother')}</option>
            <option value="Husband">{tr('form.relHusband')}</option>
            <option value="Guardian">{tr('form.relGuardian')}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-relationName">
            {tr('form.fatherName')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="field-relationName"
            name="relationName"
            className={`${styles.input} ${stepErrors.relationName ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.relationName}
            aria-describedby={stepErrors.relationName ? 'err-relationName' : undefined}
            placeholder={tr('form.fatherName')}
            value={formData.relationName || ''}
            onChange={(e) => updateFormData('relationName', e.target.value)}
            required
          />
          <FieldError error={stepErrors.relationName} id="err-relationName" />
        </div>
      </div>

      {/* Gender & DOB */}
      <div className={styles.grid3}>
        <div className={styles.formGroup}>
          <label className={styles.label} id="label-gender">
            {tr('form.gender')} <span className={styles.required}>*</span>
          </label>
          <div
            id="field-gender"
            tabIndex={-1}
            className={`${styles.radioGroup} ${stepErrors.gender ? 'fieldErrorBorder' : ''}`}
            role="radiogroup"
            aria-labelledby="label-gender"
            style={{ outline: 'none', borderRadius: '8px' }}
          >
            {[
              { val: 'Male', label: tr('form.male') },
              { val: 'Female', label: tr('form.female') },
              { val: 'Other', label: tr('form.other') }
            ].map(({ val, label }) => (
              <label
                key={val}
                className={`${styles.radioLabel} ${(formData.gender || 'Male') === val ? styles.radioLabelActive : ''}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={val}
                  checked={(formData.gender || 'Male') === val}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
          <FieldError error={stepErrors.gender} id="err-gender" />
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className={styles.label} htmlFor="field-dob">
              {tr('form.dateOfBirth')} <span className={styles.required}>*</span>
            </label>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', cursor: 'pointer' }} title={tr('privacy.whyAskDob')}>
              ℹ️ {tr('privacy.whyAskThis') || 'Why do we ask?'}
            </span>
          </div>
          <input
            type="date"
            id="field-dob"
            name="dob"
            className={`${styles.input} ${stepErrors.dob ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.dob}
            aria-describedby={stepErrors.dob ? 'err-dob' : undefined}
            value={formData.dob || ''}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => updateFormData('dob', e.target.value)}
            required
          />
          <FieldError error={stepErrors.dob} id="err-dob" />
          {age !== null && !stepErrors.dob && (
            <span className={styles.hint}>{tr('form.ageNote', { age: age ?? '' })}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-bloodGroup">{tr('form.bloodGroup')}</label>
          <select
            id="field-bloodGroup"
            name="bloodGroup"
            className={styles.select}
            value={formData.bloodGroup || 'Unknown'}
            onChange={(e) => updateFormData('bloodGroup', e.target.value)}
          >
            <option value="Unknown">{tr('common.all')} / Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Contact Details */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className={styles.label} htmlFor="field-mobile">
              {tr('form.mobileNumber')} <span className={styles.required}>*</span>
            </label>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', cursor: 'pointer' }} title={tr('privacy.whyAskMobile')}>
              ℹ️ {tr('privacy.whyAskThis') || 'Why do we ask?'}
            </span>
          </div>
          <input
            type="tel"
            id="field-mobile"
            name="mobile"
            className={`${styles.input} ${stepErrors.mobile ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.mobile}
            aria-describedby={stepErrors.mobile ? 'err-mobile' : undefined}
            placeholder="10-digit mobile number"
            maxLength={10}
            value={formData.mobile || ''}
            onChange={(e) => updateFormData('mobile', e.target.value.replace(/\D/g, ''))}
            required
          />
          <FieldError error={stepErrors.mobile} id="err-mobile" />
          {!stepErrors.mobile && <span className={styles.hint}>{tr('form.mobileHelp')}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-email">{tr('form.email')}</label>
          <input
            type="email"
            id="field-email"
            name="email"
            className={`${styles.input} ${stepErrors.email ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.email}
            aria-describedby={stepErrors.email ? 'err-email' : undefined}
            placeholder="e.g. name@example.com"
            value={formData.email || ''}
            onChange={(e) => updateFormData('email', e.target.value)}
          />
          <FieldError error={stepErrors.email} id="err-email" />
        </div>
      </div>

      {/* Education & Identification */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-education">{tr('form.education')}</label>
          <select
            id="field-education"
            name="education"
            className={styles.select}
            value={formData.education || '10th Standard'}
            onChange={(e) => updateFormData('education', e.target.value)}
          >
            <option value="Below 8th">{tr('form.eduIlliterate')}</option>
            <option value="8th Standard">{tr('form.edu8th')}</option>
            <option value="10th Standard">{tr('form.edu10th')}</option>
            <option value="10+2 / Higher Secondary">{tr('form.edu12th')}</option>
            <option value="Diploma">Diploma / ITI</option>
            <option value="Graduate">{tr('form.eduGraduate')}</option>
            <option value="Post Graduate">{tr('form.eduPostGraduate')}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-identificationMark">{tr('form.identificationMark')}</label>
          <input
            type="text"
            id="field-identificationMark"
            name="identificationMark"
            className={styles.input}
            placeholder={tr('form.identificationMark')}
            value={formData.identificationMark || ''}
            onChange={(e) => updateFormData('identificationMark', e.target.value)}
          />
        </div>
      </div>

      {/* Identity Proof */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-identityType">
            {tr('form.identityType')} <span className={styles.required}>*</span>
          </label>
          <select
            id="field-identityType"
            name="identityType"
            className={styles.select}
            value={formData.identityType || 'aadhaar'}
            onChange={(e) => updateFormData('identityType', e.target.value)}
          >
            <option value="aadhaar">Aadhaar Card (UIDAI)</option>
            <option value="voter_id">Voter ID Card (EPIC)</option>
            <option value="passport">Indian Passport</option>
            <option value="pan_card">PAN Card</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="field-identityNumber">
            {tr('form.identityNumber')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="field-identityNumber"
            name="identityNumber"
            className={`${styles.input} ${stepErrors.identityNumber ? 'fieldErrorBorder' : ''}`}
            aria-invalid={!!stepErrors.identityNumber}
            aria-describedby={stepErrors.identityNumber ? 'err-identityNumber' : undefined}
            placeholder={
              (formData.identityType || 'aadhaar') === 'aadhaar'
                ? tr('form.identityNumber')
                : tr('form.identityType')
            }
            value={formData.identityNumber || ''}
            onChange={(e) => updateFormData('identityNumber', e.target.value.toUpperCase())}
            required
          />
          <FieldError error={stepErrors.identityNumber} id="err-identityNumber" />
        </div>
      </div>

      {/* Minor Guardian Consent Section */}
      {isMinor && (
        <div className={styles.stepContainer} style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-dark)' }}>
            {tr('form.guardianSection')}
          </h4>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            {tr('form.guardianSectionHelp')}
          </p>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-guardianName">
                {tr('form.guardianName')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="field-guardianName"
                name="guardianName"
                className={`${styles.input} ${stepErrors.guardianName ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.guardianName}
                aria-describedby={stepErrors.guardianName ? 'err-guardianName' : undefined}
                placeholder={tr('form.guardianName')}
                value={formData.guardianName || ''}
                onChange={(e) => updateFormData('guardianName', e.target.value)}
                required
              />
              <FieldError error={stepErrors.guardianName} id="err-guardianName" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-guardianRelation">
                {tr('form.relationType')} <span className={styles.required}>*</span>
              </label>
              <select
                id="field-guardianRelation"
                name="guardianRelation"
                className={styles.select}
                value={formData.guardianRelation || 'Father'}
                onChange={(e) => updateFormData('guardianRelation', e.target.value)}
              >
                <option value="Father">{tr('form.relFather')}</option>
                <option value="Mother">{tr('form.relMother')}</option>
                <option value="Legal Guardian">{tr('form.relGuardian')}</option>
              </select>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-guardianMobile">
                {tr('form.guardianMobile')} <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="field-guardianMobile"
                name="guardianMobile"
                className={`${styles.input} ${stepErrors.guardianMobile ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.guardianMobile}
                aria-describedby={stepErrors.guardianMobile ? 'err-guardianMobile' : undefined}
                maxLength={10}
                placeholder="10-digit mobile number"
                value={formData.guardianMobile || ''}
                onChange={(e) => updateFormData('guardianMobile', e.target.value.replace(/\D/g, ''))}
                required
              />
              <FieldError error={stepErrors.guardianMobile} id="err-guardianMobile" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-guardianAadhaar">{tr('form.guardianAadhaar')}</label>
              <input
                type="text"
                id="field-guardianAadhaar"
                name="guardianAadhaar"
                className={`${styles.input} ${stepErrors.guardianAadhaar ? 'fieldErrorBorder' : ''}`}
                aria-invalid={!!stepErrors.guardianAadhaar}
                aria-describedby={stepErrors.guardianAadhaar ? 'err-guardianAadhaar' : undefined}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                value={formData.guardianAadhaar || ''}
                onChange={(e) => updateFormData('guardianAadhaar', e.target.value.replace(/\D/g, ''))}
              />
              <FieldError error={stepErrors.guardianAadhaar} id="err-guardianAadhaar" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
