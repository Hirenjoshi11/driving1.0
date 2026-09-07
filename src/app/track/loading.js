export default function TrackLoading() {
  return (
    <div className="loading-center" style={{ minHeight: '50vh' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        Retrieving application record & timeline...
      </p>
    </div>
  );
}
