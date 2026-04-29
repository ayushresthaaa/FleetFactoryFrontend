import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home',    path: '/home',    icon: HomeIcon },
  { label: 'Vendors', path: '/vendors', icon: VendorsIcon },
  { label: 'Items',   path: '/items',   icon: ItemsIcon },
]

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={styles.logoText}>FleetFactory</span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.navLabel}>MAIN MENU</span>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavItem key={path} label={label} path={path} Icon={Icon} />
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>GM</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Gavin Myers</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ label, path, Icon }) {
  return (
    <NavLink
      to={path}
      style={({ isActive }) => ({
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : {}),
      })}
    >
      {({ isActive }) => (
        <>
          <span style={{
            ...styles.navIcon,
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            <Icon />
          </span>
          <span>{label}</span>
          {isActive && <span style={styles.activeDot} />}
        </>
      )}
    </NavLink>
  )
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 28px',
    borderBottom: '1px solid var(--border)',
    marginBottom: 20,
  },
  logoMark: {
    width: 36,
    height: 36,
    background: 'var(--accent)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-accent)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 12px',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    padding: '0 8px 10px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    fontSize: 13.5,
    transition: 'all 0.15s ease',
    position: 'relative',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'var(--accent-muted)',
    color: 'var(--text-primary)',
    border: '1px solid var(--accent-border)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    width: 16,
    flexShrink: 0,
  },
  activeDot: {
    marginLeft: 'auto',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)',
  },
  bottom: {
    padding: '16px 12px 0',
    borderTop: '1px solid var(--border)',
    marginTop: 'auto',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 8px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
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
    flexShrink: 0,
  },
}

//Inline SVG icons
function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function VendorsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
function ItemsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="15" y="15" width="7" height="7"/><rect x="2" y="15" width="7" height="7"/>
    </svg>
  )
}