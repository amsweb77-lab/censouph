import { MdPerson } from 'react-icons/md';
import styles from './MemberCard.module.css';

function MemberCard({ cargo, nome, telefone, email, foto, dataNascimento }) {
  const formatarDataBR = (dataStr) => {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dataStr;
  };

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        {foto ? (
          <img
            className={styles.avatar}
            src={foto}
            alt={nome}
            loading="lazy"
            style={cargo === 'Secretário Executivo' ? { transform: 'scale(1.0)', objectPosition: 'center 15%' } : {}}
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
        {dataNascimento && (
          <span className={styles.nascimento}>
            Nascimento: {formatarDataBR(dataNascimento)}
          </span>
        )}
      </div>
    </div>
  );
}

export default MemberCard;
