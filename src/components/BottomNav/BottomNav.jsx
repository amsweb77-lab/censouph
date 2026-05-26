import { useLocation, useNavigate } from 'react-router-dom';
import { MdHome, MdGroups, MdNewspaper, MdDownload, MdMenu } from 'react-icons/md';
import styles from './BottomNav.module.css';

const tabs = [
  { label: 'Home', icon: MdHome, path: '/' },
  { label: 'CNHP', icon: MdGroups, path: '/cnhp' },
  { label: 'Notícias', icon: MdNewspaper, path: '/noticias' },
  { label: 'Downloads', icon: MdDownload, path: '/downloads' },
  { label: 'Menu', icon: MdMenu, path: '/menu' },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <button
            key={tab.path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
            type="button"
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className={styles.iconWrapper}>
              <Icon size={24} />
            </span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
