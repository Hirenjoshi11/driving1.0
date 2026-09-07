import { ConsoleShell } from '@/components/console';

export const metadata = {
  title: 'RTO Operator Workbench | Driving License Form',
  description: 'RTO clerk daily processing queue and case verification workbench',
};

export default function OperatorLayout({ children }) {
  return <ConsoleShell role="operator">{children}</ConsoleShell>;
}
