import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ComplaintLocationMap = ({ lat, lng, address }) => {
  // Add debug logging to help diagnose issues
  console.log('ComplaintLocationMap received props:', { lat, lng, address });
  
  // Check if we have valid coordinates
  const hasValidCoordinates = lat && lng && 
    parseFloat(lat) !== 0 && parseFloat(lng) !== 0 &&
    !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  
  // Default to Jaipur if no valid coordinates provided
  const defaultPosition = [26.9124, 75.7873]; // Jaipur center
  
  const position = hasValidCoordinates ? 
    [parseFloat(lat), parseFloat(lng)] : 
    defaultPosition;
  
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '4px'
  };

  // If no valid coordinates, show a message
  if (!hasValidCoordinates) {
    return (
      <div>
        <div style={{
          ...mapContainerStyle,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666',
          border: '1px solid #ddd'
        }}>
          <p>No valid location coordinates available.</p>
          <p>Showing default map of Jaipur.</p>
        </div>
        <MapContainer 
          center={defaultPosition} 
          zoom={12} 
          style={mapContainerStyle} 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={mapContainerStyle} 
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          {address || 'Complaint Location'}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default ComplaintLocationMap;
