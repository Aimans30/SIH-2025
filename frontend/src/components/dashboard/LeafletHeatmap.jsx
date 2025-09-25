import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const containerStyle = { 
  width: '100%', 
  height: 400, 
  borderRadius: 8, 
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1 // Lower z-index to prevent overlapping with UI elements
};
const defaultCenter = [26.9124, 75.7873]; // Jaipur city center

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

  // Jaipur neighborhoods with stats
  const mockCities = useMemo(() => ([
    { name: 'Malviya Nagar', lat: 26.8570, lng: 75.8120, reported: 85, resolved: 52 },
    { name: 'Mansarovar', lat: 26.8784, lng: 75.7713, reported: 67, resolved: 43 },
    { name: 'Vaishali Nagar', lat: 26.9236, lng: 75.7359, reported: 72, resolved: 48 },
    { name: 'C-Scheme', lat: 26.9056, lng: 75.7908, reported: 54, resolved: 38 },
    { name: 'Jagatpura', lat: 26.8236, lng: 75.8459, reported: 63, resolved: 41 },
    { name: 'Jhotwara', lat: 26.9547, lng: 75.7374, reported: 92, resolved: 58 },
    { name: 'Sanganer', lat: 26.8236, lng: 75.7930, reported: 78, resolved: 49 },
    { name: 'Raja Park', lat: 26.9034, lng: 75.8069, reported: 45, resolved: 32 },
    { name: 'Tonk Road', lat: 26.8568, lng: 75.8273, reported: 58, resolved: 39 },
    { name: 'Shastri Nagar', lat: 26.9496, lng: 75.7936, reported: 69, resolved: 47 },
    { name: 'Bani Park', lat: 26.9334, lng: 75.7873, reported: 51, resolved: 36 },
    { name: 'Adarsh Nagar', lat: 26.9124, lng: 75.8073, reported: 47, resolved: 33 },
    { name: 'Gopalpura', lat: 26.8834, lng: 75.7973, reported: 64, resolved: 42 },
    { name: 'Jawahar Nagar', lat: 26.9224, lng: 75.8173, reported: 53, resolved: 37 },
    { name: 'Tilak Nagar', lat: 26.8924, lng: 75.8073, reported: 49, resolved: 35 },
    { name: 'Vidhyadhar Nagar', lat: 26.9724, lng: 75.7773, reported: 73, resolved: 46 },
    { name: 'Sodala', lat: 26.9024, lng: 75.7773, reported: 56, resolved: 38 },
    { name: 'Durgapura', lat: 26.8524, lng: 75.8173, reported: 61, resolved: 40 },
    { name: 'Pratap Nagar', lat: 26.8324, lng: 75.7973, reported: 59, resolved: 39 },
    { name: 'Civil Lines', lat: 26.9124, lng: 75.7973, reported: 42, resolved: 31 },
    { name: 'Jaipur Airport', lat: 26.8242, lng: 75.8092, reported: 38, resolved: 29 },
    { name: 'Amer', lat: 26.9855, lng: 75.8513, reported: 44, resolved: 32 },
    { name: 'Sitapura', lat: 26.7697, lng: 75.8444, reported: 57, resolved: 38 },
    { name: 'Jamdoli', lat: 26.8824, lng: 75.8773, reported: 41, resolved: 30 },
    { name: 'Murlipura', lat: 26.9624, lng: 75.7673, reported: 52, resolved: 36 },
    { name: 'Jhotwara Industrial Area', lat: 26.9447, lng: 75.7274, reported: 68, resolved: 43 },
    { name: 'Ajmer Road', lat: 26.9124, lng: 75.7373, reported: 59, resolved: 39 },
    { name: 'Sirsi Road', lat: 26.8924, lng: 75.7473, reported: 47, resolved: 33 },
    { name: 'Agra Road', lat: 26.9224, lng: 75.8373, reported: 53, resolved: 37 },
    { name: 'Hawa Mahal', lat: 26.9239, lng: 75.8267, reported: 39, resolved: 29 },
    { name: 'Jantar Mantar', lat: 26.9247, lng: 75.8241, reported: 31, resolved: 24 },
    { name: 'City Palace', lat: 26.9258, lng: 75.8237, reported: 36, resolved: 27 },
    { name: 'Jal Mahal', lat: 26.9537, lng: 75.8463, reported: 43, resolved: 31 },
    { name: 'Albert Hall Museum', lat: 26.9117, lng: 75.8199, reported: 34, resolved: 26 },
    { name: 'Birla Mandir', lat: 26.8921, lng: 75.8144, reported: 29, resolved: 22 },
    { name: 'Nahargarh Fort', lat: 26.9373, lng: 75.8154, reported: 37, resolved: 28 },
    { name: 'Jaigarh Fort', lat: 26.9851, lng: 75.8451, reported: 33, resolved: 25 },
    { name: 'Amber Fort', lat: 26.9855, lng: 75.8513, reported: 45, resolved: 32 },
    { name: 'Ramganj Bazaar', lat: 26.9224, lng: 75.8373, reported: 62, resolved: 40 },
    { name: 'Johari Bazaar', lat: 26.9247, lng: 75.8241, reported: 58, resolved: 39 },
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

  // Fallback circles — always visible but much smaller for Jaipur neighborhoods
  const circles = useMemo(() => {
    const maxVal = Math.max(...mockCities.map(c => c[metric]));
    return mockCities.map(c => {
      const norm = maxVal ? c[metric] / maxVal : 0.5;
      const base = 300; // Much smaller base size (300m instead of 20km)
      return {
        center: [c.lat, c.lng],
        r1: base * (1 + norm * 1.5),
        r2: base * (0.7 + norm * 1.0),
        r3: base * (0.4 + norm * 0.6),
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

      <MapContainer center={defaultCenter} zoom={13} style={containerStyle} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Leaflet heat layer */}
        <HeatLayer points={heatPoints} options={{ radius: 15, blur: 12, maxZoom: 18 }} />

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
