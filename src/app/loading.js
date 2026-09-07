export default function GlobalLoading() {
  return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
        Loading driving licence portal...
      </p>
    </div>
  );
}
