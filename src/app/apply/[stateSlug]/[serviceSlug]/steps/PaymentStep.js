'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  IconCheck,
  IconReceipt,
  IconCard,
  IconMobile,
  IconBank,
  IconLock,
  IconAlert,
  IconRenew,
} from '@/components/icons/Icons';
import styles from './steps.module.css';
import pay from './payment.module.css';

const METHODS = [
  { value: 'upi', Icon: IconMobile, nameKey: 'payment.methodUpi', descKey: 'payment.methodUpiDesc' },
  { value: 'netbanking', Icon: IconBank, nameKey: 'payment.methodNetbanking', descKey: 'payment.methodNetbankingDesc' },
  { value: 'card', Icon: IconCard, nameKey: 'payment.methodCard', descKey: 'payment.methodCardDesc' },
];

export default function PaymentStep({
  formData,
  updateFormData,
  serviceId,
  stateId,
  service,
  selectedState,
  localize,
  t,
  paymentStatus = 'idle', // 'idle' | 'processing' | 'success' | 'failed' | 'reconciling'
  paymentResult = null,
  onRetryPayment,
  onBackToApp,
}) {
  const { t: contextT } = useApp();
  const tr = t || contextT;

  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const paymentMethod = formData.paymentMethod || 'upi';

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(`/api/fees?serviceId=${serviceId || 1}&stateId=${stateId || 1}`);
        const data = await res.json();
        setFees(data.fees);
      } catch (err) {
        console.error('Failed to load fees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [serviceId, stateId]);

  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  /* Each statutory charge is its own line — bundling them would
     undo the itemised breakdown the product promises. */
  const feeLines = fees
    ? [
        { key: 'govt', label: tr('payment.govtFee'), amount: fees.government_fee || 0 },
        { key: 'service', label: tr('payment.serviceFee'), amount: fees.service_fee || 0 },
        { key: 'test', label: tr('payment.testFee'), amount: fees.test_fee || 0 },
        { key: 'smartcard', label: tr('payment.smartCardFee'), amount: fees.smart_card_fee || 0 },
        { key: 'gateway', label: tr('payment.gatewayFee'), amount: fees.gateway_fee || 0 },
      ].filter((line) => line.amount > 0)
    : [];

  const totalAmount = fees
    ? fees.total_payable || feeLines.reduce((sum, l) => sum + l.amount, 0)
    : null;

  /* ---------- 1. SUCCESS ---------- */
  if (paymentStatus === 'success' && paymentResult) {
    return (
      <div className={styles.stepContainer}>
        <div className={`${pay.stateCard} ${pay.stateCardSuccess}`}>
          <span className={`${pay.stateIcon} ${pay.stateIconSuccess}`}>
            <IconCheck size={32} />
          </span>
          <h3 className={`${pay.stateTitle} ${pay.stateTitleSuccess}`}>
            {tr('payment.successTitle')}
          </h3>
          <p className={pay.stateDesc}>{tr('payment.successDesc')}</p>

          <div className={pay.receipt}>
            <div className={pay.receiptRow}>
              <span className={pay.receiptLabel}>{tr('payment.reference')}</span>
              <strong className={pay.receiptRef}>{paymentResult.paymentReference || '—'}</strong>
            </div>
            <div className={pay.receiptRow}>
              <span className={pay.receiptLabel}>{tr('payment.amountPaid')}</span>
              <strong className={pay.receiptAmount}>
                {money(paymentResult.amountPaid ?? totalAmount)}
              </strong>
            </div>
            <div className={pay.receiptRow}>
              <span className={pay.receiptLabel}>{tr('payment.appStatus')}</span>
              <span className={pay.receiptBadge}>{tr('payment.statusSubmitted')}</span>
            </div>
          </div>

          <div className={pay.stateActions}>
            {paymentResult.applicationNumber && (
              <a
                href={`/track?appNo=${encodeURIComponent(paymentResult.applicationNumber)}`}
                className="btn btn-primary"
              >
                {tr('payment.trackApp')}
              </a>
            )}
            <a href="/dashboard" className="btn btn-secondary">
              {tr('payment.viewDashboard')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 2. RECONCILING ---------- */
  if (paymentStatus === 'reconciling') {
    return (
      <div className={styles.stepContainer}>
        <div className={`${pay.stateCard} ${pay.stateCardPending}`} role="status" aria-live="polite">
          <span className={`${pay.stateIcon} ${pay.stateIconPending}`}>
            <IconRenew size={30} />
          </span>
          <h3 className={`${pay.stateTitle} ${pay.stateTitlePending}`}>
            {tr('payment.networkCheckingTitle')}
          </h3>
          <p className={pay.stateDesc}>{tr('payment.networkCheckingDesc')}</p>
          <div className="spinner spinner-lg"></div>
        </div>
      </div>
    );
  }

  /* ---------- 3. FAILED ---------- */
  if (paymentStatus === 'failed') {
    return (
      <div className={styles.stepContainer}>
        <div className={`${pay.stateCard} ${pay.stateCardFailed}`} role="alert">
          <span className={`${pay.stateIcon} ${pay.stateIconFailed}`}>
            <IconAlert size={30} />
          </span>
          <h3 className={`${pay.stateTitle} ${pay.stateTitleFailed}`}>
            {tr('payment.failedTitle')}
          </h3>
          <p className={pay.stateDesc}>{tr('payment.failedDesc')}</p>
          <div className={pay.stateActions}>
            <button type="button" onClick={onRetryPayment} className="btn btn-primary">
              {tr('payment.tryAgainBtn')}
            </button>
            <button type="button" onClick={onBackToApp} className="btn btn-secondary">
              {tr('payment.backToAppBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 4. CHECKOUT ---------- */
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('payment.checkoutHeading')}</h3>
        <p className={styles.stepDesc}>{tr('payment.checkoutSubhead')}</p>
      </div>

      <div className={pay.checkoutGrid}>
        {/* Itemised fee breakdown */}
        <section className={pay.panel}>
          <div className={pay.panelHead}>
            <h4 className={pay.panelTitle}>
              <IconReceipt size={18} className={pay.panelTitleIcon} />
              {tr('payment.summaryTitle')}
            </h4>
            <span className={pay.panelHeadMeta}>
              {localize ? localize(service, 'name') : service?.name}
            </span>
          </div>

          <div className={pay.metaGrid}>
            <div>
              <span className={pay.metaLabel}>{tr('payment.serviceCol')}</span>
              <strong className={pay.metaValue}>
                {localize ? localize(service, 'name') : service?.name}
              </strong>
            </div>
            <div>
              <span className={pay.metaLabel}>{tr('payment.stateJurisdiction')}</span>
              <strong className={pay.metaValue}>
                {selectedState?.name}
                {formData.rtoCode ? ` (${formData.rtoCode})` : ''}
              </strong>
            </div>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner"></div>
            </div>
          ) : !fees ? (
            /* Never show a fabricated amount on a payment screen. */
            <div className={pay.feeUnavailable}>
              <IconAlert size={16} />
              <span>{tr('payment.feeUnavailableNote')}</span>
            </div>
          ) : (
            <div className={pay.feeList}>
              {feeLines.map((line) => (
                <div key={line.key} className={pay.feeRow}>
                  <span>{line.label}</span>
                  <span className={pay.feeAmount}>{money(line.amount)}</span>
                </div>
              ))}

              <div className={pay.feeTotalRow}>
                <span className={pay.feeTotalLabel}>{tr('payment.totalPayable')}</span>
                <span className={pay.feeTotalAmount}>{money(totalAmount)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Payment method */}
        <section className={pay.panel}>
          <fieldset className={pay.methodFieldset}>
            <legend className={pay.methodLegend}>
              <IconCard size={18} className={pay.panelTitleIcon} />
              {tr('payment.selectMethod')}
            </legend>

            <div className={pay.methodList}>
              {METHODS.map(({ value, Icon, nameKey, descKey }) => (
                <label
                  key={value}
                  className={`${pay.method} ${paymentMethod === value ? pay.methodSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => updateFormData('paymentMethod', value)}
                    className={pay.methodRadio}
                  />
                  <span className={pay.methodIcon}>
                    <Icon size={18} />
                  </span>
                  <span className={pay.methodText}>
                    <strong className={pay.methodName}>{tr(nameKey)}</strong>
                    <span className={pay.methodDesc}>{tr(descKey)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={pay.trustNote}>
            <IconLock size={16} className={pay.trustNoteIcon} />
            <div>
              <strong className={pay.trustNoteTitle}>{tr('payment.trustBadgeTitle')}</strong>
              {tr('payment.trustBadgeDesc')}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
