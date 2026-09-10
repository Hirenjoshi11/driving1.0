const { getDb } = require('@/lib/db');
import ApplyStateView from '@/components/ApplyStateView';

export const metadata = {
  title: 'Select State | Driving License Form',
  description: 'Choose your state — Gujarat, Rajasthan, or Uttar Pradesh — to begin your driving licence application.',
};

export default async function ApplyPage() {
  const db = getDb();
  const states = await db.prepare('SELECT * FROM states ORDER BY id').all();

  return <ApplyStateView states={states} />;
}
