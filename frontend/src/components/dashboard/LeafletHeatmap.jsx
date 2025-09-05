import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const containerStyle = { width: '100%', height: 400, borderRadius: 8, overflow: 'hidden' };
const defaultCenter = [22.5937, 78.9629]; // India

// Minimal React wrapper around leaflet.heat
function HeatLayer({ points, options }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points || !points.length) return;
    const layer = L.heatLayer(points, options).addTo(map);
    return () => {
      try { map.removeLayer(layer); } catch (e) {}
    };
  }, [map, points, options]);
  return null;
}

const LeafletHeatmap = ({ complaints = [] }) => {
  const [metric, setMetric] = useState('reported'); // reported | resolved | pending

  // Demo cities with stats
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

  // Build heat points: leaflet.heat expects [lat, lng, intensity(0..1)]
  const heatPoints = useMemo(() => {
    const vals = mockCities.map(c => c[metric]);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const scale = (v) => max === min ? 0.6 : (v - min) / (max - min);
    return mockCities.flatMap(c => {
      // Duplicate to strengthen density
      const copies = Math.max(3, Math.ceil(c[metric] / (max / 10)));
      const arr = [];
      for (let i = 0; i < copies; i++) {
        const jLat = c.lat + (Math.random() - 0.5) * 0.15;
        const jLng = c.lng + (Math.random() - 0.5) * 0.15;
        arr.push([jLat, jLng, Math.max(0.3, scale(c[metric]))]);
      }
      return arr;
    });
  }, [mockCities, metric]);

  // Fallback circles — always visible
  const circles = useMemo(() => {
    const maxVal = Math.max(...mockCities.map(c => c[metric]));
    return mockCities.map(c => {
      const norm = maxVal ? c[metric] / maxVal : 0.5;
      const base = 20000; // 20 km
      return {
        center: [c.lat, c.lng],
        r1: base * (1 + norm * 2.2),
        r2: base * (0.7 + norm * 1.6),
        r3: base * (0.4 + norm * 1.0),
        city: c
      };
    });
  }, [mockCities, metric]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Complaint Heatmap</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setMetric('reported')} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', background: metric === 'reported' ? '#1976d2' : '#fff', color: metric === 'reported' ? '#fff' : '#000' }}>Reported</button>
          <button onClick={() => setMetric('resolved')} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', background: metric === 'resolved' ? '#1976d2' : '#fff', color: metric === 'resolved' ? '#fff' : '#000' }}>Resolved</button>
          <button onClick={() => setMetric('pending')} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', background: metric === 'pending' ? '#1976d2' : '#fff', color: metric === 'pending' ? '#fff' : '#000' }}>Pending</button>
        </div>
      </div>

      <MapContainer center={defaultCenter} zoom={5} style={containerStyle} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Leaflet heat layer */}
        <HeatLayer points={heatPoints} options={{ radius: 25, blur: 18, maxZoom: 9 }} />

        {/* Always-on visual halos */}
        {circles.map(({ center, r1, r2, r3, city }) => (
          <React.Fragment key={`${city.name}-rings`}>
            <Circle center={center} radius={r1} pathOptions={{ stroke: false, fillColor: '#ef5350', fillOpacity: 0.22 }} />
            <Circle center={center} radius={r2} pathOptions={{ stroke: false, fillColor: '#fb8c00', fillOpacity: 0.24 }} />
            <Circle center={center} radius={r3} pathOptions={{ stroke: false, fillColor: '#ffd54f', fillOpacity: 0.26 }} />
          </React.Fragment>
        ))}

        {/* City dot + tooltip */}
        {mockCities.map(c => (
          <CircleMarker key={c.name} center={[c.lat, c.lng]} radius={5} pathOptions={{ color: '#e53935', fillColor: '#e53935', fillOpacity: 0.95 }}>
            <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{c.name}</div>
            </Tooltip>
            <Tooltip sticky>
              <div style={{ fontSize: 12 }}>
                <div><b>Reported:</b> {c.reported}</div>
                <div style={{ color: 'green' }}><b>Resolved:</b> {c.resolved}</div>
                <div style={{ color: '#ff9800' }}><b>Pending:</b> {Math.max(c.reported - c.resolved, 0)}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Intensity</span>
        <div style={{ height: 10, width: 120, background: 'linear-gradient(90deg, rgba(33,150,243,0.2), rgba(33,150,243,1), rgba(244,67,54,1))', borderRadius: 4 }} />
        <span style={{ fontSize: 12, color: '#666' }}>Metric: {metric}</span>
      </div>
    </div>
  );
};

export default LeafletHeatmap;
