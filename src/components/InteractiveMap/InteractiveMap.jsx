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
    points: '20,250 20,300 130,350 190,380 260,390 265,300 345,290 345,160 295,140 295,40 220,40 190,70 120,85 20,140',
    labelX: 180,
    labelY: 210
  },
  {
    id: 'norte-ii',
    name: 'Norte II',
    color: '#1B5E20', // Verde Floresta
    hoverColor: 'rgba(27, 94, 32, 0.45)',
    strokeColor: '#1B5E20',
    points: '345,290 345,160 295,140 295,40 380,80 430,90 410,30 460,30 490,140 550,140 535,260 485,320 535,330 520,530 460,530 460,400 345,290',
    labelX: 440,
    labelY: 230
  },
  {
    id: 'nordeste',
    name: 'Nordeste',
    color: '#BF360C', // Vermelho Quente/Laranja
    hoverColor: 'rgba(191, 54, 12, 0.45)',
    strokeColor: '#BF360C',
    points: '535,260 485,320 535,330 520,490 620,490 685,420 725,350 760,310 765,240 735,210 705,160 620,150 535,260',
    labelX: 620,
    labelY: 310
  },
  {
    id: 'centro-oeste',
    name: 'Centro-Oeste',
    color: '#E65100', // Dourado/Laranja Cerrado
    hoverColor: 'rgba(230, 81, 0, 0.45)',
    strokeColor: '#E65100',
    points: '260,390 265,300 345,290 485,320 535,330 520,530 460,530 540,530 540,580 475,595 470,710 360,710 305,580 260,390',
    labelX: 380,
    labelY: 490
  },
  {
    id: 'sudeste-i',
    name: 'Sudeste I',
    color: '#2196F3', // Azul Royal
    hoverColor: 'rgba(33, 150, 243, 0.45)',
    strokeColor: '#2196F3',
    points: '520,490 620,490 685,420 680,550 685,610 645,615 570,610 540,580 520,490',
    labelX: 590,
    labelY: 540
  },
  {
    id: 'sudeste-ii',
    name: 'Sudeste II',
    color: '#0D47A1', // Azul Marinho
    hoverColor: 'rgba(13, 71, 161, 0.45)',
    strokeColor: '#0D47A1',
    points: '475,595 570,610 645,615 650,660 540,680 470,710 475,595',
    labelX: 540,
    labelY: 640
  },
  {
    id: 'sul',
    name: 'Sul',
    color: '#880E4F', // Vinho/Borgonha
    hoverColor: 'rgba(136, 14, 79, 0.45)',
    strokeColor: '#880E4F',
    points: '470,710 540,680 520,770 490,890 380,880 395,780 430,750 470,710',
    labelX: 450,
    labelY: 780
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
