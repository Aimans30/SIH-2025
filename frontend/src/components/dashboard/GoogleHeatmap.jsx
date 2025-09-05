import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, ToggleButtonGroup, ToggleButton, Stack, Divider, Chip } from '@mui/material';
import { GoogleMap, HeatmapLayer, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';

// Map container style
const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: 8,
  overflow: 'hidden'
};

// Default center (India)
const defaultCenter = { lat: 22.5937, lng: 78.9629 };

const libraries = ['visualization'];

function normalizePoint(c) {
  // Try to extract lat/lng from various possible shapes
  const loc = c?.location || {};
  if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    return new window.google.maps.LatLng(loc.lat, loc.lng);
  }
  if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
    const [lng, lat] = loc.coordinates; // GeoJSON order
    if (typeof lat === 'number' && typeof lng === 'number') {
      return new window.google.maps.LatLng(lat, lng);
    }
  }
  if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return new window.google.maps.LatLng(loc.latitude, loc.longitude);
  }
  return null;
}

const GoogleHeatmap = ({ complaints = [] }) => {
  // Metric selection for mock data
  const [metric, setMetric] = useState('reported'); // 'reported' | 'resolved' | 'pending'
  const [activeCity, setActiveCity] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries
  });

  const dataPoints = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    const pts = complaints
      .map(normalizePoint)
      .filter(Boolean);
    return pts;
  }, [complaints, isLoaded]);

  // Fallback demo dataset (major Indian cities) if no complaint points are available
  const mockCities = useMemo(() => ([
    { name: 'Delhi', lat: 28.6139, lng: 77.2090, reported: 240, resolved: 180 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, reported: 210, resolved: 120 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, reported: 130, resolved: 95 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, reported: 160, resolved: 140 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, reported: 150, resolved: 100 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, reported: 140, resolved: 110 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, reported: 90, resolved: 60 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, reported: 85, resolved: 52 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882, reported: 60, resolved: 40 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, reported: 120, resolved: 90 },
    { name: 'Varanasi', lat: 25.3176, lng: 82.9739, reported: 45, resolved: 28 },
    { name: 'Indore', lat: 22.7196, lng: 75.8577, reported: 70, resolved: 50 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, reported: 40, resolved: 32 },
    { name: 'Goa', lat: 15.2993, lng: 74.1240, reported: 35, resolved: 22 },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, reported: 38, resolved: 26 },
  ].map(c => ({ ...c, pending: Math.max(c.reported - c.resolved, 0) }))), []);

  const demoPoints = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    const g = window.google;
    // Density-based: duplicate LatLngs proportional to metric to make the layer very visible
    const pts = [];
    for (const c of mockCities) {
      const count = Math.max(1, Math.ceil(c[metric] / 12)); // tune divisor for density
      for (let i = 0; i < count; i++) {
        // small random jitter to spread points slightly
        const jLat = c.lat + (Math.random() - 0.5) * 0.2; // ~ +/- 0.1 deg
        const jLng = c.lng + (Math.random() - 0.5) * 0.2;
        pts.push(new g.maps.LatLng(jLat, jLng));
      }
    }
    return pts;
  }, [isLoaded, mockCities, metric]);

  const demoMax = useMemo(() => {
    const vals = mockCities.map(c => c[metric]);
    const max = vals.length ? Math.max(...vals) : 50;
    return Math.max(10, Math.round(max / 6)); // keep maxIntensity small so colors pop
  }, [mockCities, metric]);

  const gradient = useMemo(() => [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ], []);

  // Decide which points to render and prepare MVCArray (must be declared before any early return)
  const pointsToRender = dataPoints.length ? dataPoints : demoPoints;
  const pointsMvc = useMemo(() => {
    if (!isLoaded || !window.google) return null;
    return new window.google.maps.MVCArray(pointsToRender);
  }, [pointsToRender, isLoaded]);

  // Some API keys/basemaps may not expose the visualization heatmap (deprecation path).
  // Detect availability and provide a strong visual fallback.
  const hasHeatmapLib = !!(window.google && window.google.maps && window.google.maps.visualization && window.google.maps.visualization.HeatmapLayer);

  if (loadError) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Complaint Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Failed to load Google Maps. Please set VITE_GOOGLE_MAPS_API_KEY in your environment.
        </Typography>
      </Paper>
    );
  }

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  // hooks already declared above; proceed to render

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">Complaint Heatmap</Typography>
        {/* Metric toggle only affects demo mode */}
        {!dataPoints.length && (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={metric}
            onChange={(e, v) => v && setMetric(v)}
          >
            <ToggleButton value="reported">Reported</ToggleButton>
            <ToggleButton value="resolved">Resolved</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={5} options={{ streetViewControl: false, mapTypeControl: false }}>
        {hasHeatmapLib && pointsMvc && (
          <HeatmapLayer
            data={pointsMvc}
            options={{
              radius: 52,
              dissipating: true,
              gradient,
              opacity: 0.8,
              maxIntensity: dataPoints.length ? undefined : demoMax
            }}
          />
        )}

        {/* Labeled markers and faint circles in demo mode to show city stats clearly */}
        {!dataPoints.length && mockCities.map((c) => (
          <Marker
            key={c.name}
            position={{ lat: c.lat, lng: c.lng }}
            label={{ text: `${c.name}`, className: 'gm-label', color: '#1e88e5', fontSize: '12px', fontWeight: '600' }}
            icon={{
              path: window.google && window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#e53935',
              fillOpacity: 0.9,
              strokeWeight: 0
            }}
            onClick={() => setActiveCity(c)}
          />
        ))}

        {/* Circle-based heat halo (always in demo mode for extra clarity) */}
        {!dataPoints.length && mockCities.map((c) => {
          // Normalize per-city intensity for circle sizing
          const maxVal = Math.max(...mockCities.map(x => x[metric]));
          const norm = maxVal ? c[metric] / maxVal : 0.5;
          const base = 30000; // 30 km base radius
          const r1 = base * (1 + norm * 2);
          const r2 = base * (0.6 + norm * 1.5);
          const r3 = base * (0.3 + norm);
          return (
            <React.Fragment key={`${c.name}-rings`}>
              <Circle center={{ lat: c.lat, lng: c.lng }} radius={r1} options={{ strokeOpacity: 0, fillColor: '#ef5350', fillOpacity: 0.22 }} />
              <Circle center={{ lat: c.lat, lng: c.lng }} radius={r2} options={{ strokeOpacity: 0, fillColor: '#fb8c00', fillOpacity: 0.24 }} />
              <Circle center={{ lat: c.lat, lng: c.lng }} radius={r3} options={{ strokeOpacity: 0, fillColor: '#ffd54f', fillOpacity: 0.26 }} />
            </React.Fragment>
          );
        })}

        {activeCity && (
          <InfoWindow position={{ lat: activeCity.lat, lng: activeCity.lng }} onCloseClick={() => setActiveCity(null)}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeCity.name}</Typography>
              <Typography variant="body2">Reported: {activeCity.reported}</Typography>
              <Typography variant="body2" color="success.main">Resolved: {activeCity.resolved}</Typography>
              <Typography variant="body2" color="warning.main">Pending: {activeCity.pending}</Typography>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Intensity</Typography>
        <Box sx={{ height: 10, width: 120, background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[5]}, ${gradient[9]}, ${gradient[13]})`, borderRadius: 1 }} />
        {!dataPoints.length && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Chip size="small" label={`Metric: ${metric}`} />
            <Typography variant="caption" color="text.secondary">Cities: {mockCities.length}</Typography>
            <Typography variant="caption" color="text.secondary">Click a city label for details</Typography>
          </>
        )}
      </Stack>

      {!dataPoints.length && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Showing mock distribution across major Indian cities. Provide coordinates in complaint.location to visualize real data.
        </Typography>
      )}
    </Box>
  );
};

export default GoogleHeatmap;
