import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

const styles = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-base)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px',
  },
}

export default function MainLayout() {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar />
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}