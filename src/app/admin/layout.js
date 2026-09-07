import { ConsoleShell } from '@/components/console';

export const metadata = {
  title: 'State Admin Console | Driving License Form',
  description: 'State-level oversight, service configuration, and audit management portal',
};

export default function AdminLayout({ children }) {
  return <ConsoleShell role="admin">{children}</ConsoleShell>;
}
