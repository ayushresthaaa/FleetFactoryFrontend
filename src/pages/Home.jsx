const cards = [
  { label: 'Total Orders',  value: '690',  sub: '3 pending',   change: '+28%' },
  { label: 'Total Sales',   value: '$600', sub: '4 new sales',  change: '+28%' },
  { label: 'Total Profit',  value: '$800', sub: '5 new orders', change: '+36%' },
  { label: 'Total Revenue', value: '$900', sub: '7 new outlets', change: '+36%', highlight: true },
]

export default function Home() {
  return (
    <div>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 13 }}>
        Welcome back — here's what's happening today.
      </p>

      <div style={styles.grid}>
        {cards.map((c) => (
          <div key={c.label} style={{ ...styles.card, ...(c.highlight ? styles.cardHighlight : {}) }}>
            <div style={{ color: c.highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {c.label}
            </div>
            <div style={{ ...styles.cardValue, color: c.highlight ? '#fff' : 'var(--text-primary)' }}>{c.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ ...styles.badge, background: c.highlight ? 'rgba(255,255,255,0.2)' : 'var(--accent-muted)', color: c.highlight ? '#fff' : 'var(--accent)' }}>
                {c.change}
              </span>
              <span style={{ fontSize: 12, color: c.highlight ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>vs last week</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: c.highlight ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartBox}>
        <div style={styles.chartHeader}>
          <span style={styles.chartTitle}>Activity Overview</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sales &amp; Revenue — 2024</span>
        </div>
        <div style={styles.chartPlaceholder}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chart coming soon</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 22px',
    boxShadow: 'var(--shadow-card)',
  },
  cardHighlight: {
    background: 'var(--accent)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'var(--shadow-accent)',
  },
  cardValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.1,
    marginTop: 8,
    letterSpacing: '-1px',
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
  chartBox: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 28px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--text-primary)',
  },
  chartPlaceholder: {
    height: 220,
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--border-strong)',
  },
}