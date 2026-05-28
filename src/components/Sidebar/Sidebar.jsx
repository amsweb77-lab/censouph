import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  MdAccountBalanceWallet,
  MdClose,
  MdMap,
  MdSettings,
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [atasOpen, setAtasOpen] = useState(false);
  const [ceDocsOpen, setCeDocsOpen] = useState(false);
  const [congressosOpen, setCongressosOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);

  const location = useLocation();
  const isFormulariosActive = location.pathname === '/relatorio-estatistica' || location.pathname === '/formularios';
  const [formulariosOpen, setFormulariosOpen] = useState(isFormulariosActive);

  const isAdminActive = location.pathname === '/gerenciar-banners';
  const [adminOpen, setAdminOpen] = useState(isAdminActive);

  useEffect(() => {
    if (isExpanded && isFormulariosActive) {
      setFormulariosOpen(true);
    }
  }, [isExpanded, isFormulariosActive]);

  useEffect(() => {
    if (isExpanded && isAdminActive) {
      setAdminOpen(true);
    }
  }, [isExpanded, isAdminActive]);

  const handleDeepItemClick = (label) => {
    navigate('/downloads', { state: { filter: label } });
    if (onClose) onClose();
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const primaryItems = [
    { label: 'Painel de Controle', path: '/', icon: <MdDashboard size={20} /> },
    { label: 'Diretoria da CNHP', path: '/cnhp', icon: <MdPeople size={20} /> },
    { label: 'Notícias da UPH', path: '/noticias', icon: <MdList size={20} /> },
    { label: 'Estatística', path: '/menu', icon: <MdBarChart size={20} /> },
    { label: 'Mapa IPB', path: '/mapa-ipb', icon: <MdMap size={20} /> },
  ];

  const secondaryItems = [
    { label: 'Tesouraria', path: '/tesouraria', icon: <MdAccountBalanceWallet size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay (backdrop) */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setDocsOpen(false);
          setAtasOpen(false);
          setCeDocsOpen(false);
          setCongressosOpen(false);
          setProjetosOpen(false);
          setFormulariosOpen(false);
          setAdminOpen(false);
        }}
        aria-label="Menu de navegação"
      >
        {/* Sidebar Header */}
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Logo UPH" className={styles.logo} />
          </div>
          <span className={styles.appName}>SECNHP</span>

          {/* Close button for mobile drawer */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar menu"
            type="button"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={styles.nav}>
          {primaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
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
              {(isExpanded || mobileOpen) && (
                <span className={styles.toggleIcon}>
                  {docsOpen ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
                </span>
              )}
            </button>

            {docsOpen && (isExpanded || mobileOpen) && (
              <div className={styles.nestedGroup}>
                {/* Atas Reuniões */}
                <div>
                  <button onClick={() => setAtasOpen(!atasOpen)} className={styles.nestedItem} type="button">
                    {atasOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                    <span>Atas Reuniões</span>
                  </button>
                  {atasOpen && (
                    <div className={styles.deepGroup}>
                      {['Atas CE CNHP', 'Reuniões da Diretoria', 'Convocação', 'Boletins'].map((doc) => (
                        <button key={doc} onClick={() => handleDeepItemClick(doc)} className={styles.deepItem} type="button">
                          <MdDescription size={14} />
                          <span>{doc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Docts. CE CNHP */}
                <div>
                  <button onClick={() => setCeDocsOpen(!ceDocsOpen)} className={styles.nestedItem} type="button">
                    {ceDocsOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                    <span>Docts. CE CNHP</span>
                  </button>
                  {ceDocsOpen && (
                    <div className={styles.deepGroup}>
                      {['CE CNHP 2014','CE CNHP 2015','CE CNHP 2016','CE CNHP 2017','CE CNHP 2018','CE CNHP 2019','CE CNHP 2023','CE CNHP 2024','CE CNHP 2025'].map((doc) => (
                        <button key={doc} onClick={() => handleDeepItemClick(doc)} className={styles.deepItem} type="button">
                          <MdDescription size={14} />
                          <span>{doc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Docts. Congressos */}
                <div>
                  <button onClick={() => setCongressosOpen(!congressosOpen)} className={styles.nestedItem} type="button">
                    {congressosOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                    <span>Docts. Congressos</span>
                  </button>
                  {congressosOpen && (
                    <div className={styles.deepGroup}>
                      {['Congresso 2026', 'Congresso 2022', 'Congresso 2018', 'Congresso 2014'].map((doc) => (
                        <button key={doc} onClick={() => handleDeepItemClick(doc)} className={styles.deepItem} type="button">
                          <MdDescription size={14} />
                          <span>{doc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projetos CNHP */}
                <div>
                  <button onClick={() => setProjetosOpen(!projetosOpen)} className={styles.nestedItem} type="button">
                    {projetosOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                    <span>Projetos CNHP</span>
                  </button>
                  {projetosOpen && (
                    <div className={styles.deepGroup}>
                      {['Prêmio Homem Padrão'].map((doc) => (
                        <button key={doc} onClick={() => handleDeepItemClick(doc)} className={styles.deepItem} type="button">
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

          {/* Collapsible Formulários Submenu */}
          <div className={styles.submenuContainer}>
            <button
              onClick={() => setFormulariosOpen(!formulariosOpen)}
              className={`${styles.submenuHeader} ${isFormulariosActive ? styles.submenuHeaderActive : ''}`}
              type="button"
            >
              <span className={styles.icon}><MdAssignment size={20} /></span>
              <span className={styles.label}>Formulários</span>
              {(isExpanded || mobileOpen) && (
                <span className={styles.toggleIcon}>
                  {formulariosOpen ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
                </span>
              )}
            </button>

            {formulariosOpen && (isExpanded || mobileOpen) && (
              <div className={styles.nestedGroup}>
                <NavLink
                  to="/relatorio-estatistica"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `${styles.nestedItem} ${isActive ? styles.navItemActive : ''}`
                  }
                >
                  <span className={styles.icon}><MdAssignment size={16} /></span>
                  <span className={styles.label}>Formulário de Estatística</span>
                </NavLink>
                <NavLink
                  to="/formularios"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `${styles.nestedItem} ${isActive ? styles.navItemActive : ''}`
                  }
                >
                  <span className={styles.icon}><MdFolderOpen size={16} /></span>
                  <span className={styles.label}>Outros Formulários</span>
                </NavLink>
              </div>
            )}
          </div>

          {secondaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ))}

          {/* Collapsible Adm Submenu */}
          {user && (
            <div className={styles.submenuContainer}>
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={`${styles.submenuHeader} ${isAdminActive ? styles.submenuHeaderActive : ''}`}
                type="button"
              >
                <span className={styles.icon}><MdSettings size={20} /></span>
                <span className={styles.label}>Adm</span>
                {(isExpanded || mobileOpen) && (
                  <span className={styles.toggleIcon}>
                    {adminOpen ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
                  </span>
                )}
              </button>

              {adminOpen && (isExpanded || mobileOpen) && (
                <div className={styles.nestedGroup}>
                  <NavLink
                    to="/gerenciar-banners"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `${styles.nestedItem} ${isActive ? styles.navItemActive : ''}`
                    }
                  >
                    <span className={styles.icon}><MdAssignment size={16} /></span>
                    <span className={styles.label}>Gerenciar Banners</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer / Login Actions */}
        <div className={styles.footer}>
          {user ? (
            <button onClick={() => { signOut(); handleNavClick(); }} className={`${styles.actionBtn} ${styles.logout}`}>
              <MdLogout size={20} />
              <span>Sair</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={handleNavClick}
              className={({ isActive }) => `${styles.actionBtn} ${isActive ? styles.actionBtnActive : ''}`}
            >
              <MdLogin size={20} />
              <span>Entrar / Login</span>
            </NavLink>
          )}
          <span className={styles.copyright}>© CNHP 2026</span>
        </div>
      </aside>
    </>
  );
}
