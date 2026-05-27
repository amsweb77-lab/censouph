import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdBarChart,
  MdFolder,
  MdFolderOpen,
  MdList,
  MdLogin,
  MdLogout,
  MdPeople,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdDescription,
  MdAssignment,
  MdAccountBalanceWallet
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Navigation states for accordion tree
  const [isExpanded, setIsExpanded] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [atasOpen, setAtasOpen] = useState(false);
  const [ceDocsOpen, setCeDocsOpen] = useState(false);
  const [congressosOpen, setCongressosOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);

  const handleDeepItemClick = (label) => {
    // Navigate to downloads and optionally we could pass filter state
    navigate('/downloads', { state: { filter: label } });
  };

  const primaryItems = [
    { label: 'Painel de Controle', path: '/', icon: <MdDashboard size={20} /> },
    { label: 'Diretoria da CNHP', path: '/cnhp', icon: <MdPeople size={20} /> },
    { label: 'Notícias da UPH', path: '/noticias', icon: <MdList size={20} /> },
    { label: 'Estatística', path: '/menu', icon: <MdBarChart size={20} /> },
  ];

  const secondaryItems = [
    { label: 'Formulários', path: '/formularios', icon: <MdAssignment size={20} /> },
    { label: 'Tesouraria', path: '/tesouraria', icon: <MdAccountBalanceWallet size={20} /> },
  ];

  return (
    <aside
      className={styles.sidebar}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setDocsOpen(false);
        setAtasOpen(false);
        setCeDocsOpen(false);
        setCongressosOpen(false);
        setProjetosOpen(false);
      }}
    >
      {/* Sidebar Header */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="Logo UPH" className={styles.logo} />
        </div>
        <span className={styles.appName}>SECNHP</span>
      </div>

      {/* Navigation Items */}
      <nav className={styles.nav}>
        {primaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}

        {/* Collapsible Docts. e Resoluções Multi-level Tree */}
        <div className={styles.submenuContainer}>
          <button
            onClick={() => setDocsOpen(!docsOpen)}
            className={styles.submenuHeader}
            type="button"
          >
            <span className={styles.icon}>{docsOpen ? <MdFolderOpen size={20} /> : <MdFolder size={20} />}</span>
            <span className={styles.label}>Docts. e Resoluções</span>
            {isExpanded && (
              <span className={styles.toggleIcon}>
                {docsOpen ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
              </span>
            )}
          </button>

          {/* Submenu Level 1: Categories */}
          {docsOpen && isExpanded && (
            <div className={styles.nestedGroup}>
              {/* Category A: Atas Reuniões */}
              <div>
                <button
                  onClick={() => setAtasOpen(!atasOpen)}
                  className={styles.nestedItem}
                  type="button"
                >
                  {atasOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                  <span>Atas Reuniões</span>
                </button>
                {atasOpen && (
                  <div className={styles.deepGroup}>
                    {['Atas CE CNHP', 'Reuniões da Diretoria', 'Convocação', 'Boletins'].map((doc) => (
                      <button
                        key={doc}
                        onClick={() => handleDeepItemClick(doc)}
                        className={styles.deepItem}
                        type="button"
                      >
                        <MdDescription size={14} />
                        <span>{doc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category B: Docts. CE CNHP */}
              <div>
                <button
                  onClick={() => setCeDocsOpen(!ceDocsOpen)}
                  className={styles.nestedItem}
                  type="button"
                >
                  {ceDocsOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                  <span>Docts. CE CNHP</span>
                </button>
                {ceDocsOpen && (
                  <div className={styles.deepGroup}>
                    {[
                      'CE CNHP 2014',
                      'CE CNHP 2015',
                      'CE CNHP 2016',
                      'CE CNHP 2017',
                      'CE CNHP 2018',
                      'CE CNHP 2019',
                      'CE CNHP 2023',
                      'CE CNHP 2024',
                      'CE CNHP 2025'
                    ].map((doc) => (
                      <button
                        key={doc}
                        onClick={() => handleDeepItemClick(doc)}
                        className={styles.deepItem}
                        type="button"
                      >
                        <MdDescription size={14} />
                        <span>{doc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category C: Docts. Congressos */}
              <div>
                <button
                  onClick={() => setCongressosOpen(!congressosOpen)}
                  className={styles.nestedItem}
                  type="button"
                >
                  {congressosOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                  <span>Docts. Congressos</span>
                </button>
                {congressosOpen && (
                  <div className={styles.deepGroup}>
                    {['Congresso 2026', 'Congresso 2022', 'Congresso 2018', 'Congresso 2014'].map((doc) => (
                      <button
                        key={doc}
                        onClick={() => handleDeepItemClick(doc)}
                        className={styles.deepItem}
                        type="button"
                      >
                        <MdDescription size={14} />
                        <span>{doc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category D: Projetos CNHP */}
              <div>
                <button
                  onClick={() => setProjetosOpen(!projetosOpen)}
                  className={styles.nestedItem}
                  type="button"
                >
                  {projetosOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                  <span>Projetos CNHP</span>
                </button>
                {projetosOpen && (
                  <div className={styles.deepGroup}>
                    {['Prêmio Homem Padrão'].map((doc) => (
                      <button
                        key={doc}
                        onClick={() => handleDeepItemClick(doc)}
                        className={styles.deepItem}
                        type="button"
                      >
                        <MdDescription size={14} />
                        <span>{doc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {secondaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Login Actions */}
      <div className={styles.footer}>
        {user ? (
          <button onClick={signOut} className={`${styles.actionBtn} ${styles.logout}`}>
            <MdLogout size={20} />
            <span>Sair do Censo</span>
          </button>
        ) : (
          <NavLink to="/login" className={({ isActive }) => `${styles.actionBtn} ${isActive ? styles.actionBtnActive : ''}`}>
            <MdLogin size={20} />
            <span>Entrar / Login</span>
          </NavLink>
        )}
        <span className={styles.copyright}>© CNHP 2026</span>
      </div>
    </aside>
  );
}
