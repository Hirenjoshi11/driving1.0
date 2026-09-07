const { getDb } = require('@/lib/db');
import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: 'Driving License Form — Simplified DL & LL Applications',
  description: 'Prepare your driving licence application with guided steps, document checklists, and transparent statutory fee calculations.',
};

export default function HomePage() {
  const db = getDb();

  // Active core licence services with multilingual fields
  const services = db.prepare(`
    SELECT id, slug, name, name_hi, name_gu, description, description_hi, description_gu, icon
    FROM licence_services
    WHERE is_active = 1
    ORDER BY sort_order
  `).all();

  // Active supported states with district, RTO and service counts
  const states = db.prepare(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM districts d WHERE d.state_id = s.id) as district_count,
      (SELECT COUNT(*) FROM rto_offices r WHERE r.state_id = s.id) as rto_count,
      (SELECT COUNT(*) FROM state_services ss WHERE ss.state_id = s.id AND ss.is_active = 1) as service_count
    FROM states s
    ORDER BY s.id
  `).all();

  return <HomeContent services={services} states={states} />;
}
