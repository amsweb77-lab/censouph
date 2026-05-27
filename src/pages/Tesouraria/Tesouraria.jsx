import React, { useState } from 'react';
import { MdContentCopy, MdCheck, MdEmail, MdInfo } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './Tesouraria.module.css';

export default function Tesouraria() {
  const [copied, setCopied] = useState(false);

  const bankInfoText = `Favorecido: IPB Conf. Nac. Homens\nBanco: Banco do Brasil\nAgência: 083-3\nConta Corrente: 15.260-9`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bankInfoText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.page}>
      {/* Sleek Green Header Banner */}
      <div className={styles.banner}>
        <h2 className={styles.bannerTitle}>
          Pagamento da Anuidade ou Contribuição Individual <br />
          <span style={{ fontSize: '15px', fontWeight: '500', opacity: 0.9 }}>
            (antiga taxa Per Capita)
          </span>
        </h2>
      </div>

      <div className={styles.container}>
        {/* Intro text block */}
        <div className={styles.textBlock}>
          <p>
            Conforme estabelece o GTSI, a <span className={styles.highlightText}>Anuidade ou Contribuição Individual</span> (antiga <em>taxa per capita</em>) é devida por todos os sócios das UPHs organizadas, as quais deverão providenciar o pagamento diretamente à Federação que estão congregadas.
          </p>
          <p>
            As <span className={styles.highlightText}>Federações</span>, por sua vez, <span className={styles.highlightText}>deverão repassar</span> os respectivos percentuais para a <span className={styles.highlightText}>Confederação Nacional</span>, efetuando o depósito na conta nacional.
          </p>
        </div>

        {/* Premium Bank details Card */}
        <div className={styles.bankCard}>
          <h3 className={styles.bankCardTitle}>Dados para Depósito</h3>
          
          <div className={styles.bankDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Favorecido</span>
              <span className={styles.detailValue}>IPB Conf. Nac. Homens</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Banco</span>
              <span className={styles.detailValue}>Banco do Brasil</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Agência</span>
              <span className={styles.detailValue}>083-3</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Conta Corrente</span>
              <span className={styles.detailValue}>15.260-9</span>
            </div>
          </div>

          <button 
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <MdCheck size={18} />
                Dados Copiados!
              </>
            ) : (
              <>
                <MdContentCopy size={18} />
                Copiar Dados Bancários
              </>
            )}
          </button>
        </div>

        {/* Receipt instructions and contacts */}
        <div className={styles.contactsCard}>
          <h3 className={styles.contactsTitle}>Envio do Comprovante</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666666', lineHeight: 1.5 }}>
            Após realizar o depósito, a Federação ou Sinodal correspondente deverá encaminhar a cópia do comprovante informando o nome da sua respectiva entidade para a CNHP:
          </p>
          
          <div className={styles.contactButtons}>
            <a 
              href="mailto:marcuscosta.cnhp@gmail.com?subject=Comprovante de Pagamento Anuidade UPH"
              className={`${styles.contactLink} styles.emailLink`}
            >
              <MdEmail size={20} style={{ color: '#004D40' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>Enviar por E-mail</span>
                <span style={{ fontSize: '13px' }}>marcuscosta.cnhp@gmail.com</span>
              </div>
            </a>

            <a 
              href="https://wa.me/5561996841170?text=Olá,%20gostaria%20de%20enviar%20o%20comprovante%20de%20pagamento%20da%20anuidade%20da%20nossa%20UPH/Federação."
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.contactLink} ${styles.whatsappLink}`}
            >
              <FaWhatsapp size={20} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>Enviar por WhatsApp</span>
                <span style={{ fontSize: '13px' }}>(61) 99684-1170</span>
              </div>
            </a>
          </div>
        </div>

        {/* Important Warning Footer Alert */}
        <div className={styles.alertBox}>
          <MdInfo className={styles.alertIcon} size={24} />
          <p className={styles.alertText}>
            ATENÇÃO: Lembre-se de informar no comprovante o nome da Federação ou Sinodal a que se refere o depósito.
          </p>
        </div>
      </div>
    </div>
  );
}
