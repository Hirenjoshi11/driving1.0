'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { validateStep } from '@/lib/validation.js';
import FormErrorSummary from '@/components/validation/FormErrorSummary';
import ValidationToast from '@/components/validation/ValidationToast';
import SessionExpiredDialog from '@/components/validation/SessionExpiredDialog';
import UnsavedChangesDialog from '@/components/validation/UnsavedChangesDialog';
import validationStyles from '@/components/validation/validation.module.css';
import {
  IconCheck,
  IconBolt,
  IconRestore,
  IconArrowLeft,
  IconArrowRight,
  IconChevronRight,
} from '@/components/icons/Icons';
import styles from './form.module.css';

// Step Components
import ApplicantStep from './steps/ApplicantStep';
import AddressStep from './steps/AddressStep';
import LicenceStep from './steps/LicenceStep';
import VehicleStep from './steps/VehicleStep';
import RtoStep from './steps/RtoStep';
import DocumentsStep from './steps/DocumentsStep';
import ReviewStep from './steps/ReviewStep';
import PaymentStep from './steps/PaymentStep';

const STEP_COMPONENTS = {
  applicant: ApplicantStep,
  address: AddressStep,
  licence: LicenceStep,
  vehicle: VehicleStep,
  rto: RtoStep,
  documents: DocumentsStep,
  review: ReviewStep,
  payment: PaymentStep,
};

export default function FormPage() {
  const { state: appState, dispatch, t, localize, language } = useApp();
  const router = useRouter();
  const params = useParams();
  const { stateSlug, serviceSlug } = params;

  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [draftApplicationId, setDraftApplicationId] = useState(null);
  const [stepErrors, setStepErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const [demoFilledToast, setDemoFilledToast] = useState(false);

  // Dialog & state machine states
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'idle' | 'saving' | 'saved'
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'failed' | 'reconciling'
  const [paymentResult, setPaymentResult] = useState(null);
  const [fees, setFees] = useState(null);

  const draftStorageKey = `dlf_draft_${serviceSlug}`;
  const saveTimeoutRef = useRef(null);

  // Auto-scroll and focus to the first invalid field
  const scrollToAndFocusFirstError = useCallback((errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    const firstKey = errorKeys[0];

    const candidateSelectors = [
      `#field-${firstKey}`,
      `[name="${firstKey}"]`,
      `#input-${firstKey}`,
      `#field-doc-${firstKey.replace('doc_', '')}`,
    ];

    let target = null;
    for (const sel of candidateSelectors) {
      target = document.querySelector(sel);
      if (target) break;
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof target.focus === 'function') {
        setTimeout(() => target.focus(), 150);
      }
    } else {
      const summary = document.getElementById('step-error-summary');
      if (summary) {
        summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        summary.focus();
      }
    }
  }, []);

  const handleJumpToField = useCallback((fieldKey) => {
    const candidateSelectors = [
      `#field-${fieldKey}`,
      `[name="${fieldKey}"]`,
      `#input-${fieldKey}`,
      `#field-doc-${fieldKey.replace('doc_', '')}`,
    ];
    for (const sel of candidateSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus();
        break;
      }
    }
  }, []);



  // Read draft from localStorage on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(draftStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.formData && Object.keys(parsed.formData).length > 0) {
            queueMicrotask(() => {
              setHasSavedDraft(true);
            });
          }
        }
      } catch (err) {
        console.warn('Failed to read draft from storage:', err);
      }
    }
  }, [draftStorageKey]);

  // Window beforeunload protection (only for native tab close/refresh)
  useEffect(() => {
    const isDirty = !submitted && Object.keys(formData).length > 0;
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes in your licence application. Do you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, submitted]);

  const resumeDraft = () => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.currentStepIndex !== undefined) setCurrentStepIndex(parsed.currentStepIndex);
        if (parsed.draftApplicationId) setDraftApplicationId(parsed.draftApplicationId);
      }
    } catch (err) {
      console.warn('Failed to resume draft:', err);
    }
    setHasSavedDraft(false);
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftStorageKey);
    } catch (err) {
      console.warn('Failed to discard draft:', err);
    }
    setHasSavedDraft(false);
  };

  // Safe Auto-Save to localStorage with debounce
  useEffect(() => {
    if (typeof window !== 'undefined' && !submitted && Object.keys(formData).length > 0) {
      setAutoSaveStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const { documentFiles, ...serializable } = formData;
          localStorage.setItem(
            draftStorageKey,
            JSON.stringify({
              formData: serializable,
              currentStepIndex,
              draftApplicationId,
              updatedAt: new Date().toISOString(),
            })
          );
          setAutoSaveStatus('saved');
        } catch (err) {
          console.warn('Failed to save draft to storage:', err);
          setAutoSaveStatus('idle');
        }
      }, 500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, currentStepIndex, draftApplicationId, submitted, draftStorageKey]);

  // Load state + service + steps
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        let activeState = appState.selectedState;
        const statesRes = await fetch('/api/states');
        const statesData = await statesRes.json();
        const allStates = statesData.states || [];

        if (stateSlug && stateSlug !== 'start' && stateSlug !== 'select') {
          const found = allStates.find((s) => s.slug === stateSlug);
          if (found) {
            activeState = found;
            dispatch({ type: 'SET_STATE', payload: found });
          }
        }

        const resolvedStateId = activeState?.id;
        const svcRes = await fetch(resolvedStateId ? `/api/services?stateId=${resolvedStateId}` : '/api/services');
        const svcData = await svcRes.json();
        const svc = (svcData.services || []).find((s) => s.slug === serviceSlug);

        if (!svc) {
          router.push('/apply');
          return;
        }

        setService(svc);
        dispatch({ type: 'SET_SERVICE', payload: svc });

        // Load steps
        const stepsRes = await fetch(`/api/steps?serviceId=${svc.id}`);
        const stepsData = await stepsRes.json();
        setSteps(stepsData.steps || []);

        // Load fees if state is resolved
        if (resolvedStateId) {
          const feeRes = await fetch(`/api/fees?serviceId=${svc.id}&stateId=${resolvedStateId}`);
          const feeData = await feeRes.json();
          if (feeData.fees) setFees(feeData.fees);
        }
      } catch (e) {
        console.error('Error initializing form page:', e);
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateSlug, serviceSlug, dispatch, router]);

  // Dynamically load fees whenever state is selected/changed
  useEffect(() => {
    if (appState.selectedState?.id && service?.id) {
      fetch(`/api/fees?serviceId=${service.id}&stateId=${appState.selectedState.id}`)
        .then((res) => res.json())
        .then((feeData) => {
          if (feeData.fees) setFees(feeData.fees);
        })
        .catch((e) => console.error('Failed to load state fees:', e));
    }
  }, [appState.selectedState?.id, service?.id]);

  const updateFormData = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear specific field error as soon as user types or modifies it
    setStepErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  const handleFillDemoData = async () => {
    let resolvedSlug = formData.state || appState.selectedState?.slug || (stateSlug !== 'start' && stateSlug !== 'select' ? stateSlug : 'gujarat');
    
    if (!appState.selectedState || appState.selectedState.slug !== resolvedSlug) {
      try {
        const res = await fetch('/api/states');
        const data = await res.json();
        const found = (data.states || []).find((s) => s.slug === resolvedSlug);
        if (found) {
          dispatch({ type: 'SET_STATE', payload: found });
        }
      } catch (err) {
        console.error('Failed to sync demo state:', err);
      }
    }

    const demoValues = {
      state: resolvedSlug,
      stateSlug: resolvedSlug,
      firstName: 'Rahul',
      lastName: 'Sharma',
      middleName: 'Kumar',
      relationType: 'Father',
      relationName: 'Suresh Sharma',
      gender: 'Male',
      dob: '1998-05-15',
      mobile: '9876543210',
      email: 'rahul.sharma@example.com',
      identityType: 'aadhaar',
      identityNumber: '999988887777',
      bloodGroup: 'O+',
      education: 'Graduate',
      identificationMark: 'Mole on right forearm',
      addressLine1: '102, Shivalik Heights',
      addressLine2: 'Near Central Station',
      pincode: '380001',
      sameAsCurrent: true,
      vehicleClass: ['LMV', 'MCWG'],
    };

    setFormData((prev) => ({
      ...prev,
      ...demoValues,
    }));

    setStepErrors({});
    setDemoFilledToast(true);
    setTimeout(() => setDemoFilledToast(false), 3000);
  };

  const handleNext = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep) {
      const validation = validateStep(currentStep.step_key, formData, {
        serviceSlug,
        service,
      });

      if (!validation.success) {
        setStepErrors(validation.errors);
        scrollToAndFocusFirstError(validation.errors);
        return;
      }
    }

    setStepErrors({});
    setSubmitError('');

    // Server-side draft sync in background once applicant details are entered
    if (formData.firstName && formData.mobile && !submitted) {
      const nextStepIdx = Math.min(currentStepIndex + 1, steps.length - 1);
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDraft: true,
          applicationId: draftApplicationId,
          stateId: appState.selectedState?.id,
          serviceId: service?.id,
          current_step: nextStepIdx + 1,
          completed_steps: steps.slice(0, currentStepIndex + 1).map((s) => s.step_key),
          formData,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.applicationId && !draftApplicationId) {
            setDraftApplicationId(data.applicationId);
          }
        })
        .catch((err) => console.warn('Background draft sync warning:', err));
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStepErrors({});
    setSubmitError('');
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (index) => {
    if (index <= currentStepIndex) {
      setStepErrors({});
      setSubmitError('');
      setCurrentStepIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Safe Navigation Handler for Unsaved Changes Modal
  const handleInterceptedNavigation = (url) => {
    const isDirty = !submitted && Object.keys(formData).length > 0;
    if (isDirty) {
      setPendingNavigationUrl(url);
      setShowUnsavedChanges(true);
    } else {
      router.push(url);
    }
  };

  // SECURE PAYMENT & FINAL APPLICATION SUBMISSION (Requirements 22 - 40)
  const handlePaymentAndSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setStepErrors({});
    setPaymentStatus('processing');

    try {
      // 1. Ensure draft application is saved on server first
      const draftRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateId: appState.selectedState?.id,
          serviceId: service?.id,
          districtId: formData.districtId,
          rtoId: formData.rtoId,
          testCentreId: formData.testCentreId,
          formData,
          paymentMethod: formData.paymentMethod || 'upi',
          isDraft: true,
          applicationId: draftApplicationId,
        }),
      });

      if (draftRes.status === 401) {
        setShowSessionExpired(true);
        setPaymentStatus('idle');
        return;
      }

      const draftData = await draftRes.json();
      if (!draftRes.ok || !draftData.success) {
        throw new Error(draftData.error || 'Failed to initialize application record');
      }

      const appId = draftData.applicationId;
      setDraftApplicationId(appId);

      // 2. Upload attached documents if any
      const filesToUpload = formData.documentFiles || {};
      for (const [docTypeId, file] of Object.entries(filesToUpload)) {
        if (file instanceof File || (typeof Blob !== 'undefined' && file instanceof Blob)) {
          const uploadForm = new FormData();
          uploadForm.append('file', file);
          uploadForm.append('documentTypeId', docTypeId);

          const upRes = await fetch(`/api/applications/${appId}/documents`, {
            method: 'POST',
            body: uploadForm,
          });

          if (upRes.status === 401) {
            setShowSessionExpired(true);
            setPaymentStatus('idle');
            return;
          }

          const upData = await upRes.json();
          if (!upRes.ok || !upData.success) {
            throw new Error(upData.error || `Failed to upload document (${file.name || docTypeId})`);
          }
        }
      }

      // 3. Initiate Payment Order on server (Idempotent, Server-Calculated Amount)
      const idempotencyKey = `PAY-${appId}-${currentStepIndex}-${formData.paymentMethod || 'upi'}`;
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_order',
          applicationId: appId,
          paymentMethod: formData.paymentMethod || 'upi',
          idempotencyKey,
        }),
      });

      if (orderRes.status === 401) {
        setShowSessionExpired(true);
        setPaymentStatus('idle');
        return;
      }

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success || !orderData.order) {
        throw new Error(orderData.message || 'Payment order initialization failed');
      }

      const createdOrder = orderData.order;

      // 4. Verify Payment Server-side (Simulating secure gateway handshake)
      let verifyRes;
      try {
        verifyRes = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify_payment',
            orderId: createdOrder.order_id,
            paymentMethod: formData.paymentMethod || 'upi',
          }),
        });
      } catch (netErr) {
        // Network failure during handshake -> Reconciliation State (Requirement 39)
        console.warn('Network issue during payment verification, reconciling:', netErr);
        setPaymentStatus('reconciling');

        // Reconnect & check status with server
        await new Promise((r) => setTimeout(r, 2000));
        const checkRes = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check_status',
            orderId: createdOrder.order_id,
          }),
        });
        const checkData = await checkRes.json();
        if (checkData.success && (checkData.paymentStatus === 'completed' || checkData.status === 'completed')) {
          setPaymentStatus('success');
          setPaymentResult({
            paymentReference: checkData.reference || createdOrder.order_id,
            amountPaid: checkData.amount,
            applicationNumber: checkData.applicationNumber,
          });
          setSubmitted(true);
          if (typeof window !== 'undefined') localStorage.removeItem(draftStorageKey);
          return;
        } else {
          setPaymentStatus('failed');
          return;
        }
      }

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success || !verifyData.verified) {
        setPaymentStatus('failed');
        return;
      }

      // Success verified strictly by backend
      setPaymentStatus('success');
      setPaymentResult({
        paymentReference: verifyData.paymentReference,
        amountPaid: verifyData.amountPaid,
        applicationNumber: verifyData.applicationNumber || draftData.applicationNumber,
      });
      setApplicationNumber(verifyData.applicationNumber || draftData.applicationNumber);
      setSubmitted(true);

      if (typeof window !== 'undefined') {
        localStorage.removeItem(draftStorageKey);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Submission error:', e);
      const isAuthIssue =
        e.message?.toLowerCase().includes('authentication') ||
        e.message?.toLowerCase().includes('session') ||
        e.message?.includes('AUTH_REQUIRED');

      if (isAuthIssue) {
        setShowSessionExpired(true);
      } else {
        setSubmitError(e.message || 'An error occurred while submitting your application.');
      }
      setPaymentStatus('failed');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner spinner-lg"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep ? STEP_COMPONENTS[currentStep.step_key] : null;
  const isPaymentStep = currentStep?.step_key === 'payment';
  const totalAmount = fees?.total_payable || 500;
  const numErrors = Object.keys(stepErrors).length;

  return (
    <div className={styles.pageWrapper}>
      {/* Session Expired Auth Recovery Modal (Requirement 30 & 31) */}
      <SessionExpiredDialog
        isOpen={showSessionExpired}
        onClose={() => setShowSessionExpired(false)}
        returnRoute={typeof window !== 'undefined' ? window.location.pathname : `/apply/${stateSlug}/${serviceSlug}`}
        applicationId={draftApplicationId}
        currentStep={currentStepIndex}
        language={language}
      />

      {/* Unsaved Changes Navigation Protection Modal (Requirement 32 & 33) */}
      <UnsavedChangesDialog
        isOpen={showUnsavedChanges}
        onStay={() => {
          setShowUnsavedChanges(false);
          setPendingNavigationUrl(null);
        }}
        onSaveAndContinue={() => {
          setShowUnsavedChanges(false);
          if (pendingNavigationUrl) router.push(pendingNavigationUrl);
        }}
        onLeaveWithoutSaving={() => {
          setShowUnsavedChanges(false);
          if (pendingNavigationUrl) router.push(pendingNavigationUrl);
        }}
      />

      {/* Single Field Error Floating Toast (Requirement 3 & 8) */}
      {numErrors === 1 && (
        <ValidationToast
          title={t('validation.alertTitleSingle')}
          description={Object.values(stepErrors)[0]}
          onClose={() => setStepErrors({})}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <button
              type="button"
              onClick={() => handleInterceptedNavigation('/')}
              className={styles.breadcrumbLink}
            >
              {t('common.home')}
            </button>
            <IconChevronRight size={13} className={styles.breadcrumbSep} />
            <button
              type="button"
              onClick={() => handleInterceptedNavigation('/apply')}
              className={styles.breadcrumbLink}
            >
              {t('common.apply')}
            </button>
            {appState?.selectedState?.slug && (
              <>
                <IconChevronRight size={13} className={styles.breadcrumbSep} />
                <button
                  type="button"
                  onClick={() => handleInterceptedNavigation(`/apply/${appState.selectedState.slug}`)}
                  className={styles.breadcrumbLink}
                >
                  {localize ? localize(appState.selectedState, 'name') : appState.selectedState.name}
                </button>
              </>
            )}
            <IconChevronRight size={13} className={styles.breadcrumbSep} />
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {localize ? localize(service, 'name') : service?.name}
            </span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.formLayout}>
          {/* Header with Title & Auto-Save Badge (Requirement 34) */}
          <div className={styles.formHeader}>
            <div className={styles.formHeaderRow}>
              <div>
                <h1 className={styles.serviceTitle}>
                  {localize ? localize(service, 'name') : service?.name}
                </h1>
                <p className={styles.serviceDesc}>
                  {localize ? localize(service, 'description') : service?.description}
                </p>
              </div>

              {/* Real-time Draft Auto-save status */}
              <div className={styles.formHeaderActions}>
                {autoSaveStatus === 'saving' && (
                  <span className={validationStyles.autoSaveSaving}>
                    <span className={`spinner ${styles.autoSaveSpinner}`}></span>
                    {t('validation.autoSaveSaving')}
                  </span>
                )}
                {autoSaveStatus === 'saved' && !submitted && (
                  <span className={validationStyles.autoSaveSaved}>
                    <IconCheck size={13} />
                    {t('validation.autoSaveSaved')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Demo Data Filled Success Banner */}
          {demoFilledToast && (
            <div className={styles.demoToast} role="status" aria-live="polite">
              <IconCheck size={16} />
              <span>{t('apply.demoDataFilled')}</span>
            </div>
          )}

          {/* Mobile Progress Bar */}
          <div className={styles.mobileProgressWrap}>
            <div className={styles.mobileStepHeader}>
              <span className={styles.mobileStepIndex}>
                {t('common.step') || 'Step'} {currentStepIndex + 1} {t('common.of') || 'of'} {steps.length}
              </span>
              <span className={styles.mobileStepCurrentTitle}>
                {localize ? localize(currentStep, 'label') : currentStep?.label}
              </span>
            </div>
            <div
              className={styles.mobileProgressBarTrack}
              role="progressbar"
              aria-valuenow={currentStepIndex + 1}
              aria-valuemin={1}
              aria-valuemax={steps.length || 1}
              aria-label={t('common.step')}
            >
              <div
                className={styles.mobileProgressBarFill}
                style={{ transform: `scaleX(${(currentStepIndex + 1) / (steps.length || 1)})` }}
              />
            </div>
          </div>

          {/* Stepper Wizard Bar */}
          <div className={styles.stepperWrapper}>
            <div className={styles.stepper}>
              {steps.map((s, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const stepTitle = localize ? localize(s, 'label') : s.label;
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    className={`${styles.stepItem} ${isCompleted ? styles.stepCompleted : ''} ${
                      isCurrent ? styles.stepActive : ''
                    }`}
                    onClick={() => isCompleted && goToStep(idx)}
                    disabled={!isCompleted}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`${t('common.step')} ${idx + 1} ${t('common.of')} ${steps.length}: ${stepTitle}`}
                  >
                    <span className={styles.stepCircle} aria-hidden="true">
                      {isCompleted ? <IconCheck size={13} /> : idx + 1}
                    </span>
                    <span className={styles.stepLabel}>{stepTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Draft Resume Banner if available */}
          {hasSavedDraft && (
            <div className={styles.draftBanner}>
              <div className={styles.draftBannerMessage}>
                <IconRestore size={18} />
                <span>{t('apply.draftFound')}</span>
              </div>
              <div className={styles.draftBannerActions}>
                <button
                  type="button"
                  onClick={resumeDraft}
                  className="btn btn-primary btn-sm"
                >
                  {t('apply.draftResume')}
                </button>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="btn btn-secondary btn-sm"
                >
                  {t('apply.draftDiscard')}
                </button>
              </div>
            </div>
          )}

          {/* Clean Decoupled Submit Error Alert (Requirement 28 & 41) */}
          {submitError && (
            <div className={styles.submitErrorAlert} role="alert">
              <strong>{t('validation.submitErrorTitle')}</strong>
              <div className={styles.submitErrorBody}>{submitError}</div>
            </div>
          )}

          {/* Global Multi-Field Error Summary (Requirements 2, 4, 43) */}
          {numErrors > 1 && (
            <FormErrorSummary
              errors={stepErrors}
              onJumpToField={handleJumpToField}
              title={t('validation.alertTitleMulti')}
              description={t('validation.alertDescMulti', { count: numErrors })}
            />
          )}

          {/* Step Component Area */}
          <div className={styles.formCard}>
            {StepComponent ? (
              <StepComponent
                formData={formData}
                updateFormData={updateFormData}
                stateId={appState.selectedState?.id}
                serviceId={service?.id}
                service={service}
                selectedState={appState.selectedState}
                localize={localize}
                t={t}
                stepErrors={stepErrors}
                submitting={submitting}
                paymentStatus={paymentStatus}
                paymentResult={paymentResult}
                onRetryPayment={handlePaymentAndSubmit}
                onBackToApp={() => {
                  setPaymentStatus('idle');
                  setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
                }}
              />
            ) : (
              <div className="loading-center">
                <p>{t('apply.stepNotFound', { stepKey: currentStep?.step_key })}</p>
              </div>
            )}
          </div>

          {/* Bottom Navigation & Sticky Mobile Payment CTA (Requirements 26 & 27) */}
          {paymentStatus !== 'success' && (
            <div className={styles.formNav}>
              <div className={styles.formNavSecondary}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0 || submitting}
                >
                  <IconArrowLeft size={16} />
                  {t('common.back')}
                </button>

                <button
                  type="button"
                  id="btn-fill-demo-data-nav"
                  className={styles.demoDataBtnSecondary}
                  onClick={handleFillDemoData}
                  title={t('common.fillDemoData')}
                >
                  <IconBolt size={14} />
                  <span>{t('common.fillDemoData')}</span>
                </button>
              </div>

              {isPaymentStep ? (
                <button
                  type="button"
                  id="btn-pay-secure"
                  className={`btn btn-primary btn-lg ${styles.payCta}`}
                  onClick={handlePaymentAndSubmit}
                  disabled={submitting || paymentStatus === 'processing' || paymentStatus === 'reconciling'}
                >
                  {submitting || paymentStatus === 'processing'
                    ? t('payment.processing')
                    : paymentStatus === 'reconciling'
                    ? t('payment.reconciling')
                    : t('payment.proceedToPay', { amount: totalAmount })}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  {t('common.next')}
                  <IconArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
