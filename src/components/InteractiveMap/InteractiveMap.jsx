import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../lib/supabaseClient';
import { MdLocationOn, MdDomain, MdPeople } from 'react-icons/md';
import styles from './InteractiveMap.module.css';

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

// Region Colors (Matching the official icalvinus/CNHP style)
const regionColors = {
  'Norte I': '#2ecc71',      // Green (emerald/teal green)
  'Norte II': '#1abc9c',     // Teal/Aqua (turquoise)
  'Nordeste': '#f39c12',     // Orange/Yellow (warm orange)
  'Centro-Oeste': '#e74c3c', // Pinkish-Red (magenta/coral red)
  'Sudeste I': '#3498db',    // Blue (light royal blue)
  'Sudeste II': '#9b59b6',   // Purple (lavender/purple)
  'Sul': '#00bcd4'           // Cyan (bright sky blue)
};

const customOrder = ['Norte I', 'Norte II', 'Sudeste I', 'Sudeste II', 'Nordeste', 'Sul', 'Centro-Oeste'];

export default function InteractiveMap({ onRegionClick }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [regioesList, setRegioesList] = useState([]);
  const [sinodaisList, setSinodaisList] = useState([]);
  const [federacoesList, setFederacoesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Todas'); // 'Todas' | 'Sinodais' | 'Federações'
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [stateLabels, setStateLabels] = useState([]);
  
  const geojsonRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load local GeoJSON map
        const response = await fetch('/brazil-states.json');
        const data = await response.json();
        setGeojsonData(data);

        // Fetch CNHP data from Supabase
        const { data: dbRegioes, error: re } = await supabase.from('regioes').select('*');
        if (re) throw re;

        const { data: dbSinodais, error: se } = await supabase.from('sinodais').select('*').eq('situacao', 'ativa');
        if (se) throw se;

        const { data: dbFederacoes, error: fe } = await supabase.from('federacoes').select('*');
        if (fe) throw fe;

        setRegioesList(dbRegioes || []);
        setSinodaisList(dbSinodais || []);
        setFederacoesList(dbFederacoes || []);
      } catch (err) {
        console.error('Erro ao carregar dados no mapa interativo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute state label centroids dynamically once geojson is loaded
  useEffect(() => {
    if (geojsonData) {
      const labels = [];
      L.geoJSON(geojsonData).eachLayer((layer) => {
        const sigla = layer.feature.properties.sigla;
        if (!sigla) return;
        
        const center = layer.getBounds().getCenter();
        let lat = center.lat;
        let lng = center.lng;
        
        // Fine-tune offsets for perfect visual centering
        if (sigla === 'RN') { lat -= 0.05; lng += 0.12; }
        if (sigla === 'PB') { lat -= 0.08; lng += 0.08; }
        if (sigla === 'PE') { lat -= 0.08; }
        if (sigla === 'AL') { lat -= 0.05; lng += 0.08; }
        if (sigla === 'SE') { lat -= 0.05; lng += 0.06; }
        if (sigla === 'AC') { lng -= 0.15; }
        if (sigla === 'DF') { lat -= 0.02; }
        if (sigla === 'SC') { lat -= 0.08; }
        if (sigla === 'SP') { lat -= 0.08; lng += 0.08; }
        if (sigla === 'RJ') { lat -= 0.08; lng += 0.15; }
        if (sigla === 'ES') { lng += 0.06; }
        if (sigla === 'AM') { lat -= 0.3; lng -= 0.2; }
        if (sigla === 'PA') { lat -= 0.3; }
        if (sigla === 'BA') { lat -= 0.1; }
        if (sigla === 'MA') { lat -= 0.1; }
        if (sigla === 'PI') { lat -= 0.1; }
        if (sigla === 'RS') { lat -= 0.2; }
        if (sigla === 'PR') { lat -= 0.05; }
        if (sigla === 'TO') { lat -= 0.1; }
        if (sigla === 'GO') { lat -= 0.1; lng -= 0.05; }
        if (sigla === 'MS') { lat -= 0.05; }
        if (sigla === 'MT') { lat -= 0.1; }
        if (sigla === 'MG') { lat -= 0.1; }
        
        labels.push({ sigla, lat, lng });
      });
      setStateLabels(labels);
    }
  }, [geojsonData]);

  // Organize regions based on standard custom order
  const sortedRegioes = [...regioesList].sort((a, b) => {
    const idxA = customOrder.indexOf(a.nome);
    const idxB = customOrder.indexOf(b.nome);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  // Calculate dynamic stats
  const regionStats = {};
  sortedRegioes.forEach(r => {
    regionStats[r.id] = {
      id: r.id,
      nome: r.nome,
      sinodais: 0,
      federacoes: 0,
      color: regionColors[r.nome] || '#cccccc'
    };
  });

  sinodaisList.forEach(s => {
    if (regionStats[s.regiao_id]) {
      regionStats[s.regiao_id].sinodais++;
    }
  });

  const sinodalToReg = {};
  sinodaisList.forEach(s => {
    sinodalToReg[s.id] = s.regiao_id;
  });

  federacoesList.forEach(f => {
    const regId = sinodalToReg[f.sinodal_id];
    if (regId && regionStats[regId]) {
      regionStats[regId].federacoes++;
    }
  });

  const getFeatureStyle = (feature) => {
    const sigla = feature.properties.sigla || 'AC';
    const region = stateToRegion[sigla] || 'Norte I';
    const baseColor = regionColors[region] || '#cccccc';

    // Highlight state if its region is hovered or selected
    const isHovered = hoveredRegion === region;
    const isSelected = selectedRegion === region;

    return {
      fillColor: baseColor,
      weight: (isHovered || isSelected) ? 2.5 : 1.2,
      opacity: 1,
      color: (isHovered || isSelected) ? '#212529' : '#ffffff', // High contrast border
      fillOpacity: isHovered ? 0.95 : isSelected ? 0.90 : 0.80
    };
  };

  // Re-style map layers when hovered or selected region changes
  useEffect(() => {
    if (geojsonRef.current) {
      geojsonRef.current.eachLayer((layer) => {
        const style = getFeatureStyle(layer.feature);
        layer.setStyle(style);
      });
    }
  }, [hoveredRegion, selectedRegion]);

  const handleRegionClick = (regionName) => {
    setSelectedRegion(regionName);
    const matched = regioesList.find(r => r.nome.toLowerCase() === regionName.toLowerCase());
    if (matched && onRegionClick) {
      onRegionClick(matched);
    }
  };

  const onEachFeature = (feature, layer) => {
    const sigla = feature.properties.sigla || 'DF';
    const regionName = stateToRegion[sigla] || 'Centro-Oeste';

    layer.on({
      mouseover: () => {
        setHoveredRegion(regionName);
      },
      mouseout: () => {
        setHoveredRegion(null);
      },
      click: () => {
        handleRegionClick(regionName);
      }
    });
  };

  // Helper to create transparent divIcons for high-contrast labels
  const createLabelIcon = (sigla) => {
    return L.divIcon({
      html: `<div class="${styles.stateLabelText}">${sigla}</div>`,
      className: styles.stateLabelContainer,
      iconSize: [24, 16],
      iconAnchor: [12, 8]
    });
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.headerIcon}>
          <MdLocationOn />
        </span>
        <h3 className={styles.headerTitle}>Distribuição Regional — CNHP</h3>
      </div>

      <div className={styles.cardBody}>
        {/* Left Column: Leaflet Map */}
        <div className={styles.mapColumn}>
          {!loading && geojsonData ? (
            <MapContainer
              center={[-14.235, -51.925]} // Centered on Brazil
              zoom={4}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              scrollWheelZoom={false}
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
              
              {/* Render High-Contrast Centered State Abbreviations */}
              {stateLabels.map((label) => (
                <Marker
                  key={label.sigla}
                  position={[label.lat, label.lng]}
                  icon={createLabelIcon(label.sigla)}
                  interactive={false}
                />
              ))}
            </MapContainer>
          ) : (
            <div className={styles.mapLoading}>
              <div className={styles.spinner}></div>
              <p>Carregando mapa interativo...</p>
            </div>
          )}
        </div>

        {/* Right Column: Controls and Legend */}
        <div className={styles.sidePanel}>
          {/* Segmented controls / Tabs */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === 'Todas' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('Todas')}
            >
              Todas
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'Sinodais' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('Sinodais')}
            >
              <span className={styles.tabIcon}><MdDomain /></span>
              Sinodais
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'Federações' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('Federações')}
            >
              <span className={styles.tabIcon}><MdPeople /></span>
              Federações
            </button>
          </div>

          <div className={styles.legendTitle}>CLIQUE EM UM ESTADO</div>

          {/* List of Regions */}
          <div className={styles.regionsList}>
            {sortedRegioes.map((reg) => {
              const stats = regionStats[reg.id] || { sinodais: 0, federacoes: 0, color: '#cccccc' };
              const isSelected = selectedRegion === reg.nome;
              const isHovered = hoveredRegion === reg.nome;

              return (
                <div
                  key={reg.id}
                  className={`${styles.regionItem} ${(isSelected || isHovered) ? styles.regionItemActive : ''}`}
                  onClick={() => handleRegionClick(reg.nome)}
                  onMouseEnter={() => setHoveredRegion(reg.nome)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  <div className={styles.regionLabel}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: stats.color }}
                    ></span>
                    <span className={styles.regionNameText}>{reg.nome}</span>
                  </div>

                  <span className={styles.regionCountsText}>
                    {activeTab === 'Todas' && (
                      <>
                        <span className={styles.sinCount}>{stats.sinodais} sin.</span>
                        {' '}
                        <span className={styles.fedCount}>{stats.federacoes} fed.</span>
                      </>
                    )}
                    {activeTab === 'Sinodais' && (
                      <span className={styles.sinCount}>{stats.sinodais} sin.</span>
                    )}
                    {activeTab === 'Federações' && (
                      <span className={styles.fedCount}>{stats.federacoes} fed.</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals Summary */}
          <div className={styles.totalsBlock}>
            <div className={styles.totalCol}>
              <span className={styles.totalNumber}>{sinodaisList.length}</span>
              <span className={styles.totalLabel}>Sinodais</span>
            </div>
            <div className={styles.totalCol}>
              <span className={styles.totalNumber}>{federacoesList.length}</span>
              <span className={styles.totalLabel}>Federações</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
