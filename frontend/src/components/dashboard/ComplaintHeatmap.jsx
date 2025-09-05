import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

// India GeoJSON map data
const INDIA_TOPO_JSON = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json';

// Mock data for complaints across India
const MOCK_COMPLAINT_DATA = [
  { state: 'Andhra Pradesh', count: 45, lat: 15.9129, lng: 79.74 },
  { state: 'Arunachal Pradesh', count: 12, lat: 28.218, lng: 94.7278 },
  { state: 'Assam', count: 28, lat: 26.2006, lng: 92.9376 },
  { state: 'Bihar', count: 67, lat: 25.0961, lng: 85.3131 },
  { state: 'Chhattisgarh', count: 31, lat: 21.2787, lng: 81.8661 },
  { state: 'Goa', count: 8, lat: 15.2993, lng: 74.124 },
  { state: 'Gujarat', count: 52, lat: 22.2587, lng: 71.1924 },
  { state: 'Haryana', count: 39, lat: 29.0588, lng: 76.0856 },
  { state: 'Himachal Pradesh', count: 15, lat: 31.1048, lng: 77.1734 },
  { state: 'Jharkhand', count: 33, lat: 23.6102, lng: 85.2799 },
  { state: 'Karnataka', count: 58, lat: 15.3173, lng: 75.7139 },
  { state: 'Kerala', count: 42, lat: 10.8505, lng: 76.2711 },
  { state: 'Madhya Pradesh', count: 49, lat: 22.9734, lng: 78.6569 },
  { state: 'Maharashtra', count: 78, lat: 19.7515, lng: 75.7139 },
  { state: 'Manipur', count: 9, lat: 24.6637, lng: 93.9063 },
  { state: 'Meghalaya', count: 11, lat: 25.467, lng: 91.3662 },
  { state: 'Mizoram', count: 7, lat: 23.1645, lng: 92.9376 },
  { state: 'Nagaland', count: 8, lat: 26.1584, lng: 94.5624 },
  { state: 'Odisha', count: 36, lat: 20.9517, lng: 85.0985 },
  { state: 'Punjab', count: 41, lat: 31.1471, lng: 75.3412 },
  { state: 'Rajasthan', count: 55, lat: 27.0238, lng: 74.2179 },
  { state: 'Sikkim', count: 5, lat: 27.533, lng: 88.5122 },
  { state: 'Tamil Nadu', count: 63, lat: 11.1271, lng: 78.6569 },
  { state: 'Telangana', count: 47, lat: 18.1124, lng: 79.0193 },
  { state: 'Tripura', count: 10, lat: 23.9408, lng: 91.9882 },
  { state: 'Uttar Pradesh', count: 89, lat: 26.8467, lng: 80.9462 },
  { state: 'Uttarakhand', count: 19, lat: 30.0668, lng: 79.0193 },
  { state: 'West Bengal', count: 59, lat: 22.9868, lng: 87.855 },
  { state: 'Delhi', count: 72, lat: 28.7041, lng: 77.1025 },
];

const ComplaintHeatmap = () => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [data, setData] = useState(MOCK_COMPLAINT_DATA);
  const [loading, setLoading] = useState(false);

  // Color scale for the heatmap
  const colorScale = scaleQuantile()
    .domain(data.map(d => d.count))
    .range([
      '#ffedea',
      '#ffcec5',
      '#ffad9f',
      '#ff8a75',
      '#ff5533',
      '#e2492d',
      '#be3d26',
      '#9a311f',
      '#782618'
    ]);

  const getStateColor = (geo) => {
    const stateData = data.find(s => s.state === geo.properties.name);
    return stateData ? colorScale(stateData.count) : '#EEE';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Complaint Heatmap Across India
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Distribution of civic complaints across different states
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Box height="400px">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
              center: [78.9629, 22.5937] // Centered on India
            }}
            width={800}
            height={400}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={INDIA_TOPO_JSON}>
              {({ geographies }) =>
                geographies.map(geo => {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getStateColor(geo)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        const { name } = geo.properties;
                        const stateData = data.find(s => s.state === name);
                        setTooltipContent(
                          `${name}: ${stateData ? stateData.count : 'No'} complaints`
                        );
                      }}
                      onMouseLeave={() => {
                        setTooltipContent('');
                      }}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: '#F53' },
                        pressed: { outline: 'none' }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          {/* Simple inline tooltip text for accessibility without external lib */}
          {tooltipContent && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                {tooltipContent}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          * Data shown is for demonstration purposes only
        </Typography>
      </Box>
    </Paper>
  );
};

export default ComplaintHeatmap;