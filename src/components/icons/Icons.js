/* ============================================================
   ICON SET
   One drawn system: 24x24 viewBox, 1.75 stroke, round caps and
   joins, currentColor. Replaces emoji standing in for icons.
   Decorative by default (aria-hidden) — the surrounding text
   carries the meaning for assistive tech.
   ============================================================ */

function Svg({ children, size = 24, strokeWidth = 1.75, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* Guided, step-by-step flow — a rail with three marked stops. */
export function IconSteps(props) {
  return (
    <Svg {...props}>
      <path d="M6 5.5v13" />
      <circle cx="6" cy="6" r="1.6" />
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="6" cy="18" r="1.6" />
      <path d="M11 6h8M11 12h8M11 18h5" />
    </Svg>
  );
}

/* A document with a folded corner and body copy. */
export function IconDocument(props) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </Svg>
  );
}

/* A price tag — itemized, named charges. */
export function IconTag(props) {
  return (
    <Svg {...props}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.83 0l-7.2-7.2A2 2 0 0 1 2.8 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.42.59l7.2 7.2a2 2 0 0 1 0 2.83z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </Svg>
  );
}

/* A globe — the three working languages. */
export function IconGlobe(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
    </Svg>
  );
}

/* An open book — the learner's licence, first step. */
export function IconBook(props) {
  return (
    <Svg {...props}>
      <path d="M12 7.5v12" />
      <path d="M12 7.5A5 5 0 0 0 7.5 4.5H3v12h4.5A5 5 0 0 1 12 19.5" />
      <path d="M12 7.5A5 5 0 0 1 16.5 4.5H21v12h-4.5A5 5 0 0 0 12 19.5" />
    </Svg>
  );
}

/* An ID card — the driving licence itself. */
export function IconLicence(props) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2" />
      <path d="M15 10.5h4M15 14h3" />
    </Svg>
  );
}

/* Confirmation. */
export function IconCheck(props) {
  return (
    <Svg {...props}>
      <path d="M20 6.5 9.5 17 4 11.5" />
    </Svg>
  );
}

/* Forward motion. */
export function IconArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M4.5 12h14M12.5 6l6 6-6 6" />
    </Svg>
  );
}

/* Backward motion. */
export function IconArrowLeft(props) {
  return (
    <Svg {...props}>
      <path d="M19.5 12h-14M11.5 6l-6 6 6 6" />
    </Svg>
  );
}

/* Quick action / instant fill. */
export function IconBolt(props) {
  return (
    <Svg {...props}>
      <path d="M13 2.5 4.5 13.5H11l-.5 8L19 10.5h-6.5z" />
    </Svg>
  );
}

/* Restore a saved draft. */
export function IconRestore(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5V10H9" />
      <path d="M12 8v4.3l3 1.8" />
    </Svg>
  );
}

/* Breadcrumb separator. */
export function IconChevronRight(props) {
  return (
    <Svg {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </Svg>
  );
}

/* Elapsed / estimated time. */
export function IconClock(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </Svg>
  );
}

/* Renewal — a cycle returning to its start. */
export function IconRenew(props) {
  return (
    <Svg {...props}>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 4.5V10h-5.5" />
    </Svg>
  );
}

/* Duplicate — a second copy behind the first. */
export function IconDuplicate(props) {
  return (
    <Svg {...props}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 5.5A2.5 2.5 0 0 0 13 3H6a2.5 2.5 0 0 0-2.5 2.5v7A2.5 2.5 0 0 0 6 15" />
    </Svg>
  );
}

/* Vehicle class. */
export function IconCar(props) {
  return (
    <Svg {...props}>
      <path d="M3 13.5 5 8a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5.5" />
      <path d="M3 13.5h18v4a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-11v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M6.5 16h.01M17.5 16h.01" />
    </Svg>
  );
}

/* Address — a located place. */
export function IconPin(props) {
  return (
    <Svg {...props}>
      <path d="M19 10.5c0 5.2-7 11-7 11s-7-5.8-7-11a7 7 0 1 1 14 0z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </Svg>
  );
}

/* Name change — an amendment. */
export function IconEdit(props) {
  return (
    <Svg {...props}>
      <path d="M12.5 6.5H6a2 2 0 0 0-2 2v9.5a2 2 0 0 0 2 2h9.5a2 2 0 0 0 2-2V12" />
      <path d="M16.5 4.2a2.1 2.1 0 0 1 3 3L13 13.7l-3.5.8.8-3.5z" />
    </Svg>
  );
}

/* Itemised charges. */
export function IconReceipt(props) {
  return (
    <Svg {...props}>
      <path d="M5 21V4.5a1 1 0 0 1 1.5-.87L9 5l2.5-1.5L14 5l2.5-1.5L19 5V21l-2.5-1.5L14 21l-2.5-1.5L9 21z" />
      <path d="M9 9.5h6M9 13.5h4" />
    </Svg>
  );
}

/* Card payment. */
export function IconCard(props) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6 15h3" />
    </Svg>
  );
}

/* UPI / phone payment. */
export function IconMobile(props) {
  return (
    <Svg {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </Svg>
  );
}

/* Net banking. */
export function IconBank(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 9.5 12 4.5l8.5 5" />
      <path d="M5.5 9.5v8M9.5 9.5v8M14.5 9.5v8M18.5 9.5v8" />
      <path d="M3 20.5h18" />
    </Svg>
  );
}

/* Secure / encrypted. */
export function IconLock(props) {
  return (
    <Svg {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

/* Something needs attention. */
export function IconAlert(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.3h.01" />
    </Svg>
  );
}

/* A person / applicant. */
export function IconUser(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c.9-3.8 3.9-5.8 7.5-5.8s6.6 2 7.5 5.8" />
    </Svg>
  );
}

/* A residence / address. */
export function IconHome(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.8V20a.8.8 0 0 0 .8.8h11.4a.8.8 0 0 0 .8-.8V9.8" />
      <path d="M9.8 20.8v-6h4.4v6" />
    </Svg>
  );
}

/* A checklist / declaration. */
export function IconClipboard(props) {
  return (
    <Svg {...props}>
      <path d="M9 4.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2.5" width="6" height="4" rx="1.2" />
      <path d="M8.8 12h6.4M8.8 16h4" />
    </Svg>
  );
}

/* Explanatory note. */
export function IconInfo(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16.5V11M12 7.7h.01" />
    </Svg>
  );
}

/* Legal protection / safeguard. */
export function IconShield(props) {
  return (
    <Svg {...props}>
      <path d="M12 2.8 5 5.7v5.6c0 4.4 2.9 8.5 7 9.9 4.1-1.4 7-5.5 7-9.9V5.7z" />
      <path d="M9.2 12.1l2 2 3.6-4" />
    </Svg>
  );
}

/* Lookup / find. */
export function IconSearch(props) {
  return (
    <Svg {...props}>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="M15.8 15.8 20.5 20.5" />
    </Svg>
  );
}

/* Print. */
export function IconPrinter(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 9.5V3.5h11v6" />
      <path d="M6.5 17.5H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1.5" />
      <rect x="6.5" y="14.5" width="11" height="6" rx="1" />
    </Svg>
  );
}

/* Completed / issued. */
export function IconAward(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.6 13.6 7.5 21l4.5-2.4 4.5 2.4-1.1-7.4" />
    </Svg>
  );
}

/* Nothing here yet. */
export function IconInbox(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 13.5h4l1.4 2.4h6.2l1.4-2.4h4" />
      <path d="M6 4.5h12l3 9v4.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13.5z" />
    </Svg>
  );
}

/* Export / download a copy. */
export function IconDownload(props) {
  return (
    <Svg {...props}>
      <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Svg>
  );
}

/* Statutory rights / legal balance. */
export function IconScale(props) {
  return (
    <Svg {...props}>
      <path d="M12 4v16M7 20.5h10" />
      <path d="M12 6.5 4.5 8.5M12 6.5 19.5 8.5" />
      <path d="M2.2 14.2 4.5 8.5l2.3 5.7a2.6 2.6 0 0 1-4.6 0z" />
      <path d="M17.2 14.2 19.5 8.5l2.3 5.7a2.6 2.6 0 0 1-4.6 0z" />
    </Svg>
  );
}

/* Nomination / entrusting another person. */
export function IconHandshake(props) {
  return (
    <Svg {...props}>
      <path d="M11 8.5 8.6 10.9a1.8 1.8 0 0 0 2.5 2.5l1.2-1.2 3 3a1.7 1.7 0 0 0 2.4-2.4" />
      <path d="M2.5 8.5 6 6h4l2 2" />
      <path d="M21.5 8.5 18 6h-3.5L12 8" />
      <path d="M2.5 8.5v6h2M21.5 8.5v6h-2" />
    </Svg>
  );
}

/* A notice or policy document. */
export function IconScroll(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </Svg>
  );
}

/* Grouped records. */
export function IconFolder(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2.4h7.4a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
    </Svg>
  );
}

/* Erasure / deletion. */
export function IconTrash(props) {
  return (
    <Svg {...props}>
      <path d="M4 6.5h16" />
      <path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6.5 6.5 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </Svg>
  );
}

/* Telephone support. */
export function IconPhone(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </Svg>
  );
}

/* Email. */
export function IconMail(props) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Svg>
  );
}

/* Conversation / assisted help. */
export function IconChat(props) {
  return (
    <Svg {...props}>
      <path d="M20.5 12.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.4-.75L4.5 20.5l1.3-4.6A7.5 7.5 0 1 1 20.5 12.5z" />
    </Svg>
  );
}

/* A question. */
export function IconHelp(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.7" />
      <path d="M12 17.2h.01" />
    </Svg>
  );
}

/* Purpose / what the data is used for. */
export function IconTarget(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </Svg>
  );
}

/* Preferences and controls. */
export function IconSettings(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.1 14.5a1.6 1.6 0 0 0 .32 1.76l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.46v.17a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.76.32l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-1H3.2a1.9 1.9 0 1 1 0-3.8h.09a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.76l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.06.06a1.6 1.6 0 0 0 1.76.32h.08a1.6 1.6 0 0 0 1-1.46V3.2a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 1 1.46 1.6 1.6 0 0 0 1.77-.32l.05-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.06a1.6 1.6 0 0 0-.32 1.76v.08a1.6 1.6 0 0 0 1.46 1h.17a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.46 1z" />
    </Svg>
  );
}

/* Dismiss. */
export function IconClose(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/* A point worth noticing. */
export function IconBulb(props) {
  return (
    <Svg {...props}>
      <path d="M9.2 17.5h5.6M10 20.5h4" />
      <path d="M12 3.2a6 6 0 0 1 3.6 10.8c-.5.4-.8 1-.8 1.6H9.2c0-.6-.3-1.2-.8-1.6A6 6 0 0 1 12 3.2z" />
    </Svg>
  );
}

/* Service / assistance work. */
export function IconBriefcase(props) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="7.5" width="19" height="13" rx="2.5" />
      <path d="M8.8 7.5V5.8a2 2 0 0 1 2-2h2.4a2 2 0 0 1 2 2v1.7" />
      <path d="M2.5 12.5h19" />
    </Svg>
  );
}

/* Fallback for a service with no dedicated mark. */
export function IconFile(props) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Svg>
  );
}
