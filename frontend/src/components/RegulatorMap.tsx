import { useEffect, useState, Fragment } from 'react';


import { API_BASE_URL } from '../config';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Trees, Bird, Waves, Users, Factory, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Project {
  id: number;
  title: string;
  applicant: string;
  status: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskSummary: string;
  description: string;
}

export default function RegulatorMap() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, [token]);

  const filteredProjects = projects.filter(p => {
    const matchesType = filterType === 'All' || p.title.includes(filterType);
    const matchesRisk = filterRisk === 'All' || 
                       (filterRisk === 'High' && p.riskScore > 70) ||
                       (filterRisk === 'Medium' && p.riskScore <= 70 && p.riskScore > 30) ||
                       (filterRisk === 'Low' && p.riskScore <= 30);
    return matchesType && matchesRisk;
  });

  const getRiskColor = (score: number) => {
    if (score < 30) return '#10b981'; // Green
    if (score < 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const createCustomIcon = (color: string) => {
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium">Loading GIS Data...</p>
        </div>
      </div>
    );
  }

  // Mock Ecological Data with better spatial distribution
  const ECOLOGICAL_DATA = {
    forests: [
      { name: 'Western Ghats Reserved Forest', coords: [15.5, 74.5] as [number, number], radius: 25000 },
      { name: 'Sundarbans Mangrove Zone', coords: [21.9, 88.9] as [number, number], radius: 40000 },
      { name: 'Gir Conservation Forest', coords: [21.1, 70.8] as [number, number], radius: 30000 },
    ],
    protectedAreas: [
      { name: 'Silent Valley National Park', coords: [11.1, 76.4] as [number, number], radius: 15000 },
      { name: 'Jim Corbett Buffer Zone', coords: [29.5, 78.8] as [number, number], radius: 20000 },
    ],
    villages: [
      { name: 'Amboli Settlement', coords: [15.9, 74.0] as [number, number], pop: 1200 },
      { name: 'Khatra Tribal Village', coords: [22.9, 86.8] as [number, number], pop: 850 },
    ]
  };

  return (
    <div className="h-[calc(100vh-120px)] w-full relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
      <MapContainer 
        center={[22.9734, 78.6569]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Reserved Forests">
            <LayerGroup>
              {ECOLOGICAL_DATA.forests.map((f, i) => (
                <Circle key={i} center={f.coords} radius={f.radius} pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.1, weight: 1 }}>
                  <Popup><span className="font-bold text-emerald-400">Forest:</span> {f.name}</Popup>
                </Circle>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Protected Areas">
            <LayerGroup>
              {ECOLOGICAL_DATA.protectedAreas.map((p, i) => (
                <Circle key={i} center={p.coords} radius={p.radius} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, dashArray: '5, 5' }}>
                  <Popup><span className="font-bold text-red-400">Protected Area:</span> {p.name}</Popup>
                </Circle>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Human Settlements">
            <LayerGroup>
              {ECOLOGICAL_DATA.villages.map((v, i) => (
                <Marker key={i} position={v.coords}>
                  <Popup><span className="font-bold text-blue-400">Village:</span> {v.name}<br/><span className="text-zinc-500">Pop: {v.pop}</span></Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Industrial Clusters">
            <LayerGroup>
              <Circle center={[22.5, 72.5]} radius={150000} pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.2, weight: 1 }} />
              <Circle center={[13, 80]} radius={120000} pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.2, weight: 1 }} />
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>



        {filteredProjects.map((project) => (
          <Fragment key={project.id}>

            <Marker 
              position={[project.lat, project.lng]}
              icon={createCustomIcon(getRiskColor(project.riskScore))}
            >
              <Popup className="custom-regulator-popup">
                <div className="p-3 min-w-[240px] bg-zinc-900 text-zinc-100 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base leading-tight">{project.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      project.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      project.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Users size={14} className="text-zinc-500" />
                      <span>{project.applicant}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-zinc-300">Risk Score:</div>
                      <div className={`text-sm font-bold ${
                        project.riskScore > 70 ? 'text-red-500' : project.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {project.riskScore}/100
                      </div>
                    </div>
                  </div>

                  <button 
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={() => window.location.href = `/regulator/pending`}
                  >
                    View Full Details <ChevronRight size={14} />
                  </button>
                </div>
              </Popup>
            </Marker>
            {/* Project KML Boundary Visualization (Mocked as a polygon around the center) */}
            <Polygon 
              positions={[
                [project.lat + 0.1, project.lng - 0.1],
                [project.lat + 0.1, project.lng + 0.1],
                [project.lat - 0.1, project.lng + 0.1],
                [project.lat - 0.1, project.lng - 0.1]
              ]}
              pathOptions={{
                color: '#FF9933',
                fillColor: '#FF9933',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '8, 8'
              }}
            />

            {/* Impact Radius Visualization */}
            {/* Project Boundary Polygon (Synthetic) */}
            <Polygon 
              positions={[
                [project.lat + 0.015, project.lng - 0.015],
                [project.lat + 0.015, project.lng + 0.015],
                [project.lat - 0.015, project.lng + 0.015],
                [project.lat - 0.015, project.lng - 0.015]
              ]}
              pathOptions={{ 
                color: getRiskColor(project.riskScore), 
                fillColor: getRiskColor(project.riskScore), 
                fillOpacity: 0.25,
                weight: 2
              }} 
            />
            {/* Impact Radius */}
            <Circle 
              center={[project.lat, project.lng]} 
              radius={8000} 
              pathOptions={{ 
                color: '#ffffff', 
                fillColor: 'transparent', 
                weight: 1, 
                dashArray: '5, 10',
                opacity: 0.3
              }} 
            />
          </Fragment>
        ))}

      </MapContainer>

      {/* Filter Panel Overlay */}
      <div className="absolute top-6 left-6 z-[1000] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl w-64">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Filter size={16} className="text-emerald-500" /> Map Filters
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Project Type</label>
            <select 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Wind">Wind Farm</option>
              <option value="Solar">Solar Park</option>
              <option value="Industrial">Industrial</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Risk Level</label>
            <select 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk (&gt;70)</option>
              <option value="Medium">Medium Risk (30-70)</option>
              <option value="Low">Low Risk (&lt;30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Environmental Risk</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-xs text-zinc-300 font-medium">High Risk</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            <span className="text-xs text-zinc-300 font-medium">Medium Risk</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs text-zinc-300 font-medium">Low Risk</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">GIS Layers</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <Trees size={12} className="text-emerald-500" /> Forest
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <Bird size={12} className="text-amber-500" /> Wildlife
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <Waves size={12} className="text-blue-500" /> Water
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <Factory size={12} className="text-red-500" /> Pollution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
