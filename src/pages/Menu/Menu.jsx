import { MdLogin, MdLogout } from 'react-icons/md';
import { menuItems } from '../../data/mockData';
import ListItem from '../../components/ListItem/ListItem';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Menu.module.css';

export default function Menu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Estatísticas do trabalho masculino
        </h2>
        <div className={styles.list}>
          {menuItems.estatisticas.map((item, index) => (
            <div
              key={item.path}
              className={styles.itemWrap}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ListItem
                label={item.label}
                path={item.path}
                onClick={() => navigate(item.path)}
              />
            </div>
          ))}
        </div>
      </section>

      {user && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Cadastros
          </h2>
          <div className={styles.list}>
            {menuItems.cadastros.map((item, index) => (
              <div
                key={item.path}
                className={styles.itemWrap}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <ListItem
                  label={item.label}
                  path={item.path}
                  onClick={() => navigate(item.path)}
                  disabled={item.disabled}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={styles.loginSection}>
        {user ? (
          <button 
            className={styles.loginBtn} 
            style={{ backgroundColor: 'var(--color-danger)' }}
            onClick={() => signOut()}
          >
            <MdLogout size={20} />
            <span>SAIR</span>
          </button>
        ) : (
          <button 
            className={styles.loginBtn}
            onClick={() => navigate('/login')}
          >
            <MdLogin size={20} />
            <span>LOGIN</span>
          </button>
        )}
      </div>
    </div>
  );
}
