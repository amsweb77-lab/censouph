import { MdPerson } from 'react-icons/md';
import styles from './MemberCard.module.css';

function MemberCard({ cargo, nome, telefone, email, foto }) {
  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        {foto ? (
          <img
            className={styles.avatar}
            src={foto}
            alt={nome}
            loading="lazy"
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <MdPerson size={32} />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.cargo}>{cargo}</span>
        <span className={styles.nome}>{nome}</span>
        {telefone && (
          <a className={styles.link} href={`tel:${telefone}`}>
            {telefone}
          </a>
        )}
        {email && (
          <a className={styles.link} href={`mailto:${email}`}>
            {email}
          </a>
        )}
      </div>
    </div>
  );
}

export default MemberCard;
