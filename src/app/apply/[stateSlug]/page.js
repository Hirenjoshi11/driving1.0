import { notFound, redirect } from 'next/navigation';
const { getDb } = require('@/lib/db');
import ServiceSelectionView from '@/components/ServiceSelectionView';

export async function generateMetadata({ params }) {
  const { stateSlug } = await params;
  const db = getDb();
  const state = db.prepare('SELECT name FROM states WHERE slug = ?').get(stateSlug);
  return {
    title: `${state ? state.name : 'State'} Driving Licence Services | Driving License Form`,
    description: `Select and apply for driving licence services in ${state ? state.name : 'your state'}. Guided step-by-step preparation with instant document validation.`,
  };
}

export default async function ServiceSelectionPage({ params }) {
  const { stateSlug } = await params;
  const db = getDb();

  const state = db.prepare('SELECT * FROM states WHERE slug = ?').get(stateSlug);
  if (!state) {
    const serviceCheck = db.prepare('SELECT slug FROM licence_services WHERE slug = ?').get(stateSlug);
    if (serviceCheck) {
      redirect(`/apply/gujarat/${serviceCheck.slug}`);
    }
    notFound();
  }

  const services = db.prepare(`
    SELECT 
      ls.id,
      ls.name,
      ls.name_hi,
      ls.name_gu,
      ls.slug,
      ls.description,
      ls.description_hi,
      ls.description_gu,
      ls.icon,
      ls.estimated_days,
      ls.requires_driving_test,
      ROUND(COALESCE(fs.government_fee, 0) + COALESCE(fs.service_fee, 0) + COALESCE(fs.smart_card_fee, 0) + COALESCE(fs.test_fee, 0) + COALESCE(fs.gateway_fee, 0)) AS total_payable,
      fs.government_fee,
      fs.service_fee
    FROM licence_services ls
    INNER JOIN state_services ss ON ls.id = ss.service_id
    LEFT JOIN fee_structure fs ON fs.service_id = ls.id AND fs.state_id = ss.state_id AND fs.is_active = 1
    WHERE ss.state_id = ? AND ss.is_active = 1 AND ls.is_active = 1
    ORDER BY ls.sort_order
  `).all(state.id);

  return <ServiceSelectionView state={state} services={services} />;
}
