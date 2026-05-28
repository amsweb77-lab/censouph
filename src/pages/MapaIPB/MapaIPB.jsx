import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { supabase } from '../../lib/supabaseClient';
import { MdMap, MdLocationCity, MdList } from 'react-icons/md';
import styles from './MapaIPB.module.css';

// Mapping states to CNHP Regions
const stateToRegion = {
  'AC': 'Norte I', 'AM': 'Norte I', 'RO': 'Norte I', 'RR': 'Norte I',
  'PA': 'Norte II', 'AP': 'Norte II',
  'MA': 'Nordeste', 'PI': 'Nordeste', 'CE': 'Nordeste', 'RN': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'AL': 'Nordeste', 'SE': 'Nordeste', 'BA': 'Nordeste',
  'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'DF': 'Centro-Oeste', 'TO': 'Centro-Oeste',
  'MG': 'Sudeste I', 'ES': 'Sudeste I',
  'SP': 'Sudeste II', 'RJ': 'Sudeste II',
  'PR': 'Sul', 'SC': 'Sul', 'RS': 'Sul'
};

// Region Colors (Matching the reference image style)
const regionColors = {
  'Norte I': '#2ecc71',      // Green (emerald/teal green)
  'Norte II': '#1abc9c',     // Teal/Aqua (turquoise)
  'Nordeste': '#f39c12',     // Orange/Yellow (warm orange)
  'Centro-Oeste': '#e74c3c', // Pinkish-Red (magenta/coral red)
  'Sudeste I': '#3498db',    // Blue (light royal blue)
  'Sudeste II': '#9b59b6',   // Purple (lavender/purple)
  'Sul': '#00bcd4'           // Cyan (bright sky blue)
};

// Fallback statistics from the reference image
const fallbackStats = {
  'Norte I': { sinodais: 3, federacoes: 8 },
  'Norte II': { sinodais: 2, federacoes: 6 },
  'Sudeste I': { sinodais: 16, federacoes: 35 },
  'Sudeste II': { sinodais: 16, federacoes: 30 },
  'Nordeste': { sinodais: 12, federacoes: 25 },
  'Sul': { sinodais: 4, federacoes: 10 },
  'Centro-Oeste': { sinodais: 6, federacoes: 12 }
};

export default function MapaIPB() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [activeTab, setActiveTab] = useState('Todas'); // 'Todas' | 'Sinodais' | 'Federações'
  const [selectedState, setSelectedState] = useState(null);
  const [stats, setStats] = useState(fallbackStats);
  const [loading, setLoading] = useState(true);
  const geojsonRef = useRef(null);

  // Fetch local GeoJSON and dynamic stats from Supabase
  useEffect(() => {
    // 1. Fetch Local GeoJSON
    fetch('/brazil-states.json')
      .then(response => response.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error('Erro ao carregar GeoJSON local:', err));

    // 2. Fetch statistics dynamically from Supabase
    async function loadStats() {
      try {
        setLoading(true);
        const { data: dbRegioes } = await supabase.from('regioes').select('*');
        const { data: dbSinodais } = await supabase.from('sinodais').select('*');
        const { data: dbFederacoes } = await supabase.from('federacoes').select('*');

        if (dbRegioes && dbSinodais && dbFederacoes) {
          // Initialize empty stats
          const newStats = {};
          dbRegioes.forEach(r => {
            newStats[r.nome] = { sinodais: 0, federacoes: 0 };
          });

          // Create lookup maps
          const regiaoMap = {};
          dbRegioes.forEach(r => { regiaoMap[r.id] = r.nome; });
          
          const sinodalRegiaoMap = {};
          dbSinodais.forEach(s => {
            sinodalRegiaoMap[s.id] = regiaoMap[s.regiao_id];
            const rName = regiaoMap[s.regiao_id];
            if (rName && newStats[rName]) {
              newStats[rName].sinodais += 1;
            }
          });

          dbFederacoes.forEach(f => {
            const rName = sinodalRegiaoMap[f.sinodal_id];
            if (rName && newStats[rName]) {
              newStats[rName].federacoes += 1;
            }
          });

          // Verify if we have meaningful data, if so, update stats
          const totalSinodais = Object.values(newStats).reduce((acc, curr) => acc + curr.sinodais, 0);
          if (totalSinodais > 0) {
            setStats(newStats);
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar Supabase, utilizando dados de fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  // Compute maximum values for color saturation formula
  const maxSinodais = Math.max(...Object.values(stats).map(s => s.sinodais), 1);
  const maxFederacoes = Math.max(...Object.values(stats).map(s => s.federacoes), 1);

  // Dynamic style for each GeoJSON feature (State)
  const getFeatureStyle = (feature) => {
    const sigla = feature.properties.sigla || 'AC';
    const region = stateToRegion[sigla] || 'Norte I';
    const baseColor = regionColors[region] || '#cccccc';

    let opacity = 0.85;

    // Saturation logic based on active tab
    if (activeTab === 'Sinodais') {
      const count = stats[region]?.sinodais || 0;
      opacity = 0.35 + (count / maxSinodais) * 0.55;
    } else if (activeTab === 'Federações') {
      const count = stats[region]?.federacoes || 0;
      opacity = 0.35 + (count / maxFederacoes) * 0.55;
    }

    return {
      fillColor: baseColor,
      weight: 1.5,
      opacity: 1,
      color: '#ffffff', // White boundaries matching the style
      fillOpacity: opacity
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#ffffff',
          fillOpacity: 0.95
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        geojsonRef.current?.resetStyle(layer);
      },
      click: (e) => {
        const name = feature.properties.name || 'Estado';
        setSelectedState(name);
      }
    });
  };

  // Compute totals
  const totalSinodais = Object.values(stats).reduce((acc, curr) => acc + curr.sinodais, 0);
  const totalFederacoes = Object.values(stats).reduce((acc, curr) => acc + curr.federacoes, 0);

  // Find selected state's region and details
  const getSelectedStateDetails = () => {
    if (!selectedState) return null;
    // Find state feature in GeoJSON to extract sigla
    const feature = geojsonData?.features?.find(f => f.properties.name === selectedState);
    const sigla = feature?.properties?.sigla || 'DF';
    const region = stateToRegion[sigla] || 'Centro-Oeste';
    return {
      sigla,
      region,
      color: regionColors[region],
      sinodais: stats[region]?.sinodais || 0,
      federacoes: stats[region]?.federacoes || 0
    };
  };

  const selectedDetails = getSelectedStateDetails();

  return (
    <div className={styles.page}>
      {/* Title Banner Header */}
      <div className={styles.headerTitleBanner}>
        <div className={styles.headerIconContainer}>
          <MdMap size={24} color="#1B5E20" />
        </div>
        <span className={styles.headerTitleText}>Distribuição Regional — CNHP</span>
      </div>

      <div className={styles.mainLayout}>
        {/* Left Side: Leaflet Interactive Map */}
        <div className={styles.mapColumn}>
          {geojsonData ? (
            <MapContainer
              center={[-14.235, -51.925]} // Centered on Brazil
              zoom={4}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              {/* Clean light CartoDB base tiles without labels */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <GeoJSON
                ref={geojsonRef}
                data={geojsonData}
                style={getFeatureStyle}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
          ) : (
            <div className={styles.mapLoading}>
              <div className={styles.spinner}></div>
              <p>Carregando mapa interativo...</p>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Legend & Stats Panel */}
        <div className={styles.panelColumn}>
          {/* Tab switches */}
          <div className={styles.tabsHeader}>
            {['Todas', 'Sinodais', 'Federações'].map(tab => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Todas' ? 'Todas' : tab === 'Sinodais' ? '🏛️ Sinodais' : '⛪ Federações'}
              </button>
            ))}
          </div>

          {/* Details / State Click Card */}
          <div className={styles.interactiveCard}>
            {selectedState && selectedDetails ? (
              <div className={styles.stateDetail} style={{ borderColor: selectedDetails.color }}>
                <div className={styles.stateDetailHeader}>
                  <h4 className={styles.stateName}>{selectedState} ({selectedDetails.sigla})</h4>
                  <span className={styles.regionBadge} style={{ backgroundColor: selectedDetails.color }}>
                    Região {selectedDetails.region}
                  </span>
                </div>
                <div className={styles.detailStats}>
                  <div className={styles.detailStatBox}>
                    <span className={styles.detailLabel}>Sinodais na Região</span>
                    <span className={styles.detailVal}>{selectedDetails.sinodais}</span>
                  </div>
                  <div className={styles.detailStatBox}>
                    <span className={styles.detailLabel}>Federações na Região</span>
                    <span className={styles.detailVal}>{selectedDetails.federacoes}</span>
                  </div>
                </div>
                <button 
                  className={styles.clearSelectionBtn}
                  onClick={() => setSelectedState(null)}
                >
                  Limpar Seleção
                </button>
              </div>
            ) : (
              <div className={styles.clickPrompt}>
                <span className={styles.promptIcon}>👆</span>
                <span className={styles.promptText}>CLIQUE EM UM ESTADO NO MAPA</span>
              </div>
            )}
          </div>

          {/* Dynamic Legend List */}
          <div className={styles.legendContainer}>
            <div className={styles.legendList}>
              {Object.keys(regionColors).map(region => {
                const color = regionColors[region];
                const active = !selectedDetails || selectedDetails.region === region;
                return (
                  <div 
                    key={region} 
                    className={`${styles.legendItem} ${active ? '' : styles.legendInactive}`}
                  >
                    <div className={styles.legendLabelContainer}>
                      <span className={styles.legendColorCircle} style={{ backgroundColor: color }}></span>
                      <span className={styles.legendRegionName}>{region}</span>
                    </div>
                    <span className={styles.legendCounts}>
                      {activeTab !== 'Federações' && `${stats[region]?.sinodais || 0} sin. `}
                      {activeTab !== 'Sinodais' && `${stats[region]?.federacoes || 0} fed.`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Summaries */}
          <div className={styles.summaryFooter}>
            <div className={styles.summaryBox}>
              <span className={styles.summaryVal}>{totalSinodais}</span>
              <span className={styles.summaryLabel}>Sinodais</span>
            </div>
            <div className={styles.summaryBox}>
              <span className={styles.summaryVal}>{totalFederacoes}</span>
              <span className={styles.summaryLabel}>Federações</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
