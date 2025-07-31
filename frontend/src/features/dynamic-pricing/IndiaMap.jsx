import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const INDIA_TOPOJSON_URL = 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@bcbcba3/topojson/india.json';

const demandColors = {
  high: '#9B177E',
  normal: '#E5E7EB',
  low: '#f3e8ff'
};

const getRegionFill = (region, isSelected, mapMode) => {
  if (isSelected) return "#9B177E";
  if (!region) return '#E5E7EB';
  if (mapMode === 'demand') {
    return region.demandFactor > 1
      ? demandColors.high
      : region.demandFactor < 1
        ? demandColors.low
        : demandColors.normal;
  }
  if (mapMode === 'population') {
    if (region.population > 100000000) return '#9B177E';
    if (region.population > 50000000) return '#b380cc';
    if (region.population > 20000000) return '#d1b3e0';
    if (region.population > 10000000) return '#e5d5f7';
    if (region.population > 5000000) return '#f3e8ff';
    return '#ffe4fa';
  }
  return '#E5E7EB';
};

const IndiaMap = ({ regions = [], onSelect, selectedRegion, mapMode }) => {
  const [indiaTopoJson, setIndiaTopoJson] = useState(null);

  // Ensure regions is always an array
  const safeRegions = Array.isArray(regions) ? regions : [];

  useEffect(() => {
    fetch(INDIA_TOPOJSON_URL)
      .then(res => res.json())
      .then(setIndiaTopoJson)
      .catch(err => {
        console.error('Failed to load India TopoJSON:', err);
      });
  }, []);

  if (!indiaTopoJson) {
    return <div className="text-center py-8">Loading India map...</div>;
  }

  return (
    <div className="relative py-2">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [82.8, 22.59], scale: 1200 }}
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto', background: '#fff' }}
      >
        <Geographies geography={indiaTopoJson}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const region = safeRegions.find(r =>
                geo.properties && (r.stateCode === geo.id || r.name === geo.properties.st_nm)
              );
              const isSelected = selectedRegion && region && selectedRegion.name === region.name;
              const fill = getRegionFill(region, isSelected, mapMode);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#FFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#9B177E", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                  onClick={() => region && onSelect(region)}
                />
              );
            })
          }
        </Geographies>
        {safeRegions.map((region) => (
          <Marker key={region.name} coordinates={region.coordinates}>
            <circle
              r={6}
              fill={region.demandFactor > 1 ? "#9B177E" : "#6B7280"}
              stroke="#FFF"
              strokeWidth={2}
              onClick={() => onSelect(region)}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={10}
              y={5}
              textAnchor="start"
              style={{ fontFamily: 'system-ui', fill: '#374151', fontSize: '12px' }}
            >
              {region.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
      <div className="mt-4 flex justify-center items-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#9B177E] mr-2"></div>
          <span className="text-sm">High Demand / High Population</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#E5E7EB] mr-2"></div>
          <span className="text-sm">Normal</span>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;