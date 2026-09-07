'use client';
import { useApp } from '@/contexts/AppContext';

export default function DisclaimerBar() {
  const { t } = useApp();

  return (
    <div className="disclaimer-bar">
      ⓘ {t('common.disclaimer') || 'This is not an official Government portal. We assist you with the driving licence application process.'}
    </div>
  );
}
