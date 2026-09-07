export default function HeroVisual() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer subtle protective circle */}
      <circle cx="90" cy="90" r="82" stroke="#EAF6EE" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Abstract Security Shield */}
      <path
        d="M90 26C112 36 128 42 142 42C142 90 126 130 90 152C54 130 38 90 38 42C52 42 68 36 90 26Z"
        fill="#FFFFFF"
        stroke="#159447"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Document Surface inside Shield */}
      <rect
        x="66"
        y="56"
        width="48"
        height="64"
        rx="6"
        fill="#F7FAF8"
        stroke="#18232D"
        strokeWidth="1.8"
      />

      {/* Document Folded Corner */}
      <path
        d="M102 56V68H114"
        stroke="#18232D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Identity User Avatar */}
      <circle
        cx="84"
        cy="78"
        r="7"
        stroke="#159447"
        strokeWidth="1.8"
        fill="#EAF6EE"
      />
      <path
        d="M74 96C74 91.5817 77.5817 88 82 88H86C90.4183 88 94 91.5817 94 96"
        stroke="#159447"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Secure Data Flow Lines */}
      <line x1="72" y1="104" x2="108" y2="104" stroke="#5B6470" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="72" y1="110" x2="98" y2="110" stroke="#5B6470" strokeWidth="1.6" strokeLinecap="round" />

      {/* Checkmark verification badge */}
      <circle cx="120" cy="116" r="14" fill="#159447" />
      <path
        d="M114 116L118 120L126 112"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
