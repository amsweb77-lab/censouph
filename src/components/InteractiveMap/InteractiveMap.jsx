import React, { useState } from 'react';
import styles from './InteractiveMap.module.css';

// SVG viewBox based on the physical dimensions: 772x1024
const regionsConfig = [
  {
    id: 'norte-i',
    name: 'Norte I',
    color: '#004D40', // Verde Esmeralda/Teal
    hoverColor: 'rgba(0, 77, 64, 0.45)',
    strokeColor: '#004D40',
    points: '20,250 120,280 180,285 245,295 240,360 300,340 330,300 330,170 270,140 270,40 190,50 110,85 20,140',
    labelX: 200,
    labelY: 200
  },
  {
    id: 'norte-ii',
    name: 'Norte II',
    color: '#1B5E20', // Verde Floresta
    hoverColor: 'rgba(27, 94, 32, 0.45)',
    strokeColor: '#1B5E20',
    points: '330,170 330,300 370,300 480,410 560,380 550,290 630,230 630,150 550,140 490,50 410,70 330,170',
    labelX: 470,
    labelY: 210
  },
  {
    id: 'nordeste',
    name: 'Nordeste',
    color: '#BF360C', // Vermelho Quente/Laranja
    hoverColor: 'rgba(191, 54, 12, 0.45)',
    strokeColor: '#BF360C',
    points: '630,150 630,230 550,290 560,380 660,400 680,420 740,310 750,230 710,170 630,150',
    labelX: 660,
    labelY: 290
  },
  {
    id: 'centro-oeste',
    name: 'Centro-Oeste',
    color: '#E65100', // Dourado/Laranja Cerrado
    hoverColor: 'rgba(230, 81, 0, 0.45)',
    strokeColor: '#E65100',
    points: '240,360 300,340 330,300 370,300 480,410 530,410 530,500 480,600 370,580 300,390 240,360',
    labelX: 410,
    labelY: 460
  },
  {
    id: 'sudeste-i',
    name: 'Sudeste I',
    color: '#2196F3', // Azul Royal
    hoverColor: 'rgba(33, 150, 243, 0.45)',
    strokeColor: '#2196F3',
    points: '530,410 660,400 680,420 650,540 650,600 570,600 530,500 530,410',
    labelX: 610,
    labelY: 520
  },
  {
    id: 'sudeste-ii',
    name: 'Sudeste II',
    color: '#0D47A1', // Azul Marinho
    hoverColor: 'rgba(13, 71, 161, 0.45)',
    strokeColor: '#0D47A1',
    points: '480,600 570,600 650,600 630,660 530,670 480,630 480,600',
    labelX: 560,
    labelY: 640
  },
  {
    id: 'sul',
    name: 'Sul',
    color: '#880E4F', // Vinho/Borgonha
    hoverColor: 'rgba(136, 14, 79, 0.45)',
    strokeColor: '#880E4F',
    points: '370,580 480,600 480,630 530,670 480,740 410,810 365,710 370,580',
    labelX: 440,
    labelY: 740
  }
];

export default function InteractiveMap({ onRegionClick, regioes }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const handleRegionClick = (regionName) => {
    if (onRegionClick) {
      const matched = regioes.find(r => r.nome.toLowerCase() === regionName.toLowerCase());
      if (matched) {
        onRegionClick(matched);
      } else {
        onRegionClick({ nome: regionName });
      }
    }
  };

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.mapContainer}>
        {/* Base Map Image */}
        <img 
          src="/mapa_cnhp.png" 
          alt="Mapa CNHP" 
          className={styles.mapImage}
        />
        
        {/* Interactive SVG Overlay */}
        <svg 
          viewBox="0 0 772 1024" 
          className={styles.svgOverlay}
        >
          {regionsConfig.map((region) => {
            const isHovered = hoveredRegion === region.id;
            return (
              <g 
                key={region.id}
                className={styles.regionGroup}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick(region.name)}
              >
                {/* Clickable transparent/colored polygon */}
                <polygon 
                  points={region.points}
                  className={styles.regionPolygon}
                  style={{
                    fill: isHovered ? region.hoverColor : 'rgba(0, 0, 0, 0)',
                    stroke: isHovered ? region.strokeColor : 'transparent',
                    strokeWidth: isHovered ? 4 : 0,
                  }}
                />
                
                {/* Centered pulsing dot for visual affordance */}
                <circle 
                  cx={region.labelX} 
                  cy={region.labelY} 
                  r="6" 
                  className={styles.pulseCircle}
                  style={{ fill: region.color }}
                />
                
                {/* Text Label overlay */}
                <g className={styles.labelGroup}>
                  <rect
                    x={region.labelX - 60}
                    y={region.labelY - 32}
                    width="120"
                    height="24"
                    rx="12"
                    className={styles.labelBackground}
                  />
                  <text
                    x={region.labelX}
                    y={region.labelY - 17}
                    textAnchor="middle"
                    className={styles.labelText}
                  >
                    {region.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Dynamic Detail Card under the map */}
      <div className={styles.infoCard}>
        {hoveredRegion ? (() => {
          const activeRegion = regionsConfig.find(r => r.id === hoveredRegion);
          return (
            <div className={styles.activeInfo} style={{ borderColor: activeRegion.color }}>
              <span className={styles.badge} style={{ backgroundColor: activeRegion.color }}>
                Região
              </span>
              <h3 className={styles.regionName} style={{ color: activeRegion.color }}>
                {activeRegion.name}
              </h3>
              <p className={styles.regionDesc}>
                Toque para consultar todas as Confederações Sinodais, Federações e UPHs da região {activeRegion.name}.
              </p>
              <button 
                className={styles.actionBtn}
                style={{ backgroundColor: activeRegion.color }}
                onClick={() => handleRegionClick(activeRegion.name)}
              >
                Ver Estatísticas ➔
              </button>
            </div>
          );
        })() : (
          <div className={styles.idleInfo}>
            <p>🗺️ <strong>Toque em uma região</strong> no mapa de forma dinâmica para detalhar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
