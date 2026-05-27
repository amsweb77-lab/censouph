import { MdPerson } from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa'
import styles from './BirthdayList.module.css'

export default function BirthdayList({ membros }) {
  if (!membros || membros.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Nenhum aniversariante encontrado.</div>
      </div>
    )
  }

  // Função para obter o dia do aniversário
  const obterDiaAniversario = (dataNascimento) => {
    if (!dataNascimento) return ''
    const parts = dataNascimento.split('-')
    if (parts.length < 3) return ''
    const dia = parseInt(parts[2], 10)
    return `Dia ${dia}`
  }

  return (
    <div className={styles.container}>
      {membros.map((membro) => (
        <div key={membro.id} className={styles.item}>
          {membro.foto_url ? (
            <img src={membro.foto_url} alt={membro.nome} className={styles.avatar} />
          ) : (
            <div className={styles.avatar}>
              <MdPerson size={24} />
            </div>
          )}
          
          <div className={styles.info}>
            <div className={styles.name}>{membro.nome}</div>
            {membro.cargo && (
              <span className={styles.cargoBadge}>{membro.cargo}</span>
            )}
            <div className={styles.age}>{membro.telefone || 'Sem telefone'}</div>
          </div>

          {membro.telefone && (
            <a 
              href={membro.whatsapp ? `https://wa.me/55${membro.telefone.replace(/\D/g,'')}` : `https://wa.me/55${membro.telefone.replace(/\D/g,'')}`} 
              className={styles.callButton}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderRadius: '20px 8px 20px 8px' }}
            >
              <FaWhatsapp size={22} />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
