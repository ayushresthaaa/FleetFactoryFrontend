import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/home': 'Home',
  '/vendors': 'Vendors',
  '/items': 'Items',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Dashboard'

  return (
    <header style={styles.topbar}>
      <div style={styles.left}>
        <span style={styles.title}>{title}</span>
      </div>
      <div style={styles.right}>
        <div style={styles.searchBox}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input style={styles.searchInput} placeholder="Search..." />
        </div>
        <button style={styles.iconBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span style={styles.badge}>3</span>
        </button>
        <div style={styles.avatar}>GM</div>
      </div>
    </header>
  )
}

const styles = {
  topbar: {
    height: 'var(--topbar-height)',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    width: 200,
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    width: '100%',
  },
  iconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: 'var(--accent)',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-accent)',
  },
}