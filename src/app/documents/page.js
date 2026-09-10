const { getDb } = require('@/lib/db');
import DocumentsView from '@/components/DocumentsView';

export async function generateMetadata({ searchParams }) {
  const query = await searchParams;
  const db = getDb();
  const state = query?.state ? await db.prepare('SELECT name FROM states WHERE slug = ?').get(query.state) : null;
  return {
    title: `Required Documents Directory ${state ? `— ${state.name}` : ''} | Driving License Form`,
    description: `Official document requirements, checklists, and acceptable photo/proof specifications for driving and learner licence applications in Gujarat, Rajasthan, and Uttar Pradesh.`,
  };
}

export default async function DocumentsPage({ searchParams }) {
  const query = (await searchParams) || {};
  const db = getDb();

  const states = await db.prepare('SELECT * FROM states ORDER BY id').all();
  const activeState = states.find((s) => s.slug === query.state) || states[0];

  const services = await db.prepare(`
    SELECT ls.* FROM licence_services ls
    INNER JOIN state_services ss ON ls.id = ss.service_id
    WHERE ss.state_id = ? AND ss.is_active = 1 AND ls.is_active = 1
    ORDER BY ls.sort_order
  `).all(activeState?.id || 1);

  const activeService = services.find((s) => s.slug === query.service) || services[0];

  const documents = activeService
    ? await db.prepare(`
        SELECT sd.*, dt.name, dt.name_hi, dt.name_gu, dt.code, dt.category, 
               dt.description, dt.description_hi, dt.description_gu,
               dt.where_to_get, dt.where_to_get_hi, dt.where_to_get_gu,
               dt.accepted_formats, dt.max_size_mb
        FROM service_documents sd
        INNER JOIN document_types dt ON sd.document_type_id = dt.id
        WHERE sd.service_id = ? AND sd.state_id = ? AND sd.is_active = 1 AND dt.is_active = 1
        ORDER BY sd.sort_order
      `).all(activeService.id, activeState?.id || 1)
    : [];

  return (
    <DocumentsView
      states={states}
      activeState={activeState}
      services={services}
      activeService={activeService}
      documents={documents}
    />
  );
}
