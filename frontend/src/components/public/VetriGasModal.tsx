import React, { useState } from 'react';
import { Truck, Fingerprint, Package, Camera, FileText, CheckCircle, RefreshCw, MapPin, X } from 'lucide-react';

interface VetriGasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VetriGasModal: React.FC<VetriGasModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gps' | 'biometric' | 'inventory' | 'dashcam' | 'orders'>('gps');

  // GPS State
  const [selectedVehicle, setSelectedVehicle] = useState('TN-38-AX-9941 (Truck #1)');
  const [vehicleStatus, setVehicleStatus] = useState({ speed: 42, fuel: 88, lat: 11.0168, lng: 76.9558, location: 'Avinashi Road, Coimbatore', driver: 'Ramesh K. (ID: DRV-882)' });
  const [pinging, setPinging] = useState(false);

  // Biometric State
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ name: string; role: string; time: string } | null>(null);
  const [logs, setLogs] = useState([
    { id: 1, name: 'Ramesh Kumar', role: 'Fleet Driver', time: '08:30 AM', verified: true },
    { id: 2, name: 'Senthil Nathan', role: 'Loadman Supervisor', time: '08:45 AM', verified: true },
    { id: 3, name: 'Mani Kandan', role: 'Storeroom Manager', time: '09:00 AM', verified: true },
  ]);

  // Inventory State
  const [domesticCylinders, setDomesticCylinders] = useState(450);
  const [commercialCylinders] = useState(120);
  const [emptyReturns, setEmptyReturns] = useState(88);
  const [dispatchCount, setDispatchCount] = useState(5);

  // Dashcam State
  const [snapshots, setSnapshots] = useState<{ id: string; time: string; vehicle: string; img: string }[]>([
    { id: 'SNAP-901', time: '09:45:12 AM', vehicle: 'TN-38-AX-9941', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60' },
    { id: 'SNAP-902', time: '09:30:05 AM', vehicle: 'TN-38-BZ-4012', img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=60' }
  ]);
  const [capturing, setCapturing] = useState(false);

  // Orders State
  const [custName, setCustName] = useState('Sri Lakshmi Hotel');
  const [cylType, setCylType] = useState('19kg Commercial');
  const [cylQty, setCylQty] = useState(4);
  const [bookedReceipt, setBookedReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const handlePingGps = () => {
    setPinging(true);
    setTimeout(() => {
      setVehicleStatus((prev) => ({
        ...prev,
        speed: Math.floor(35 + Math.random() * 25),
        fuel: Math.max(10, prev.fuel - 1),
        lat: Number((11.0168 + (Math.random() - 0.5) * 0.01).toFixed(4)),
        lng: Number((76.9558 + (Math.random() - 0.5) * 0.01).toFixed(4)),
      }));
      setPinging(false);
    }, 600);
  };

  const handleScanBiometric = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const names = [
        { name: 'Karthik Raja', role: 'Driver' },
        { name: 'Velu Swamy', role: 'Loadman' },
        { name: 'Prakash M.', role: 'Quality Checker' }
      ];
      const selected = names[Math.floor(Math.random() * names.length)];
      const newLog = {
        id: Date.now(),
        name: selected.name,
        role: selected.role,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        verified: true,
      };
      setLogs((prev) => [newLog, ...prev]);
      setScanResult(newLog);
      setScanning(false);
    }, 1200);
  };

  const handleDispatchBatch = () => {
    if (domesticCylinders >= dispatchCount) {
      setDomesticCylinders((prev) => prev - dispatchCount);
      setEmptyReturns((prev) => prev + dispatchCount);
    }
  };

  const handleCaptureDashcam = () => {
    setCapturing(true);
    setTimeout(() => {
      const newSnap = {
        id: 'SNAP-' + Math.floor(100 + Math.random() * 900),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        vehicle: selectedVehicle.split(' ')[0],
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'
      };
      setSnapshots((prev) => [newSnap, ...prev]);
      setCapturing(false);
    }, 800);
  };

  const handleBookOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = cylType.includes('19kg') ? 1850 : 950;
    const total = rate * cylQty;
    const receipt = {
      receiptNo: 'VG-2026-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString(),
      custName,
      cylType,
      qty: cylQty,
      rate,
      total,
      helpline: '+91 96008 70814',
      status: 'CONFIRMED & DISPATCHED'
    };
    setBookedReceipt(receipt);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'var(--card, #111827)', color: 'var(--text, #f9fafb)', border: '1px solid var(--border, #374151)', borderRadius: '16px', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #b91c1c 0%, #c2410c 100%)', color: '#ffffff' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.5s infinite' }}></span>
              Vetri Gas Live Enterprise Suite
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>Vetri Indane LPG Fleet & Biometrics</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border, #374151)', background: 'var(--surface, #1f2937)', overflowX: 'auto' }}>
          {[
            { id: 'gps', label: 'Fleet GPS', icon: <Truck size={16} /> },
            { id: 'biometric', label: 'Biometrics Sync', icon: <Fingerprint size={16} /> },
            { id: 'inventory', label: 'LPG Inventory', icon: <Package size={16} /> },
            { id: 'dashcam', label: 'Dashcam Snapshots', icon: <Camera size={16} /> },
            { id: 'orders', label: 'Order Booking', icon: <FileText size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#ea580c' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text3, #9ca3af)',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', flex: 1 }}>

          {/* TAB 1: FLEET GPS TRACKING */}
          {activeTab === 'gps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', fontWeight: 600 }}>Select Active Delivery Vehicle:</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border, #374151)', background: 'var(--card, #111827)', color: 'var(--text, #ffffff)', fontWeight: 600 }}
                  >
                    <option>TN-38-AX-9941 (Truck #1)</option>
                    <option>TN-38-BZ-4012 (Truck #2)</option>
                    <option>TN-38-CW-1109 (Mini Delivery)</option>
                  </select>
                </div>
                <button
                  onClick={handlePingGps}
                  disabled={pinging}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: pinging ? 0.7 : 1 }}
                >
                  <RefreshCw size={16} className={pinging ? 'spin' : ''} />
                  {pinging ? 'Pinging Telemetry...' : 'Ping Live Vehicle GPS'}
                </button>
              </div>

              {/* Vehicle Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>Current Speed</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>{vehicleStatus.speed} km/h</div>
                  <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>● GPS Speed Lock Active</span>
                </div>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>Fuel Tank Telemetry</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>{vehicleStatus.fuel}%</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text3, #9ca3af)' }}>Est. Range: 340 km</span>
                </div>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>Assigned Driver</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text, #ffffff)', marginTop: '0.2rem' }}>{vehicleStatus.driver}</div>
                  <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>Verified Biometric Duty</span>
                </div>
              </div>

              {/* Simulated GPS Map Container */}
              <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '1.5rem', position: 'relative', overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontWeight: 700 }}>
                    <MapPin size={16} /> Live GPS Coordinate Stream
                  </span>
                  <span>{vehicleStatus.lat}° N, {vehicleStatus.lng}° E</span>
                </div>
                <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(234, 88, 12, 0.2)', border: '1px solid #ea580c', padding: '0.75rem 1.5rem', borderRadius: '30px', color: '#fdba74', fontWeight: 700 }}>
                    <Truck size={22} style={{ animation: 'bounce 1s infinite' }} />
                    Vehicle in transit on {vehicleStatus.location}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                  📡 Connected to IoT Gateway · Coimbatore Central Fleet Station
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIOMETRIC HARDWARE SYNC */}
          {activeTab === 'biometric' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Fingerprint Scanner Demo */}
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border, #374151)', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>ZKTeco Biometric Scanner</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', marginBottom: '1.5rem' }}>
                    Tap to trigger live hardware fingerprint verification for staff attendance.
                  </p>
                  
                  <div
                    onClick={handleScanBiometric}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      margin: '0 auto 1.5rem',
                      background: scanning ? 'rgba(234, 88, 12, 0.2)' : scanResult ? 'rgba(34, 197, 94, 0.2)' : 'var(--card, #111827)',
                      border: `3px solid ${scanning ? '#ea580c' : scanResult ? '#22c55e' : 'var(--border, #374151)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Fingerprint size={48} color={scanning ? '#ea580c' : scanResult ? '#22c55e' : '#9ca3af'} />
                  </div>

                  <button
                    onClick={handleScanBiometric}
                    disabled={scanning}
                    style={{ width: '100%', padding: '0.75rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {scanning ? 'Reading Fingerprint Sensor...' : 'Scan Staff Fingerprint'}
                  </button>

                  {scanResult && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem', fontWeight: 700 }}>
                      <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.3rem' }} />
                      Verified: {scanResult.name} ({scanResult.role}) at {scanResult.time}
                    </div>
                  )}
                </div>

                {/* Duty Attendance Log */}
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Real-time Duty Check-in Logs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {logs.map((log) => (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'var(--card, #111827)', borderRadius: '8px', border: '1px solid var(--border, #374151)', fontSize: '0.85rem' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{log.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>{log.role}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LPG INVENTORY */}
          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', fontWeight: 600 }}>14.2 kg Domestic Stock</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>{domesticCylinders} Cylinders</div>
                  <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Ready for delivery</span>
                </div>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', fontWeight: 600 }}>19 kg Commercial Stock</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>{commercialCylinders} Cylinders</div>
                  <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Hotel & Business Grade</span>
                </div>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', fontWeight: 600 }}>Empty Returns Received</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: '0.2rem' }}>{emptyReturns} Units</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>Pending plant refill</span>
                </div>
              </div>

              <div style={{ background: 'var(--surface, #1f2937)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Simulate Dispatch Loading Batch</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>Transfer cylinders from Storeroom to Loadman truck batch.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={dispatchCount}
                    onChange={(e) => setDispatchCount(Number(e.target.value))}
                    style={{ width: '70px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border, #374151)', background: 'var(--card, #111827)', color: 'var(--text, #ffffff)', fontWeight: 700, textAlign: 'center' }}
                  />
                  <button
                    onClick={handleDispatchBatch}
                    style={{ padding: '0.6rem 1.25rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Dispatch Batch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DASHCAM SNAPSHOTS */}
          {activeTab === 'dashcam' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Fleet Cabin & Road Dashcam System</h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>Capture instant video frame snapshots from active delivery trucks.</p>
                </div>
                <button
                  onClick={handleCaptureDashcam}
                  disabled={capturing}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Camera size={16} />
                  {capturing ? 'Capturing Frame...' : 'Capture Instant Snapshot'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {snapshots.map((snap) => (
                  <div key={snap.id} style={{ background: 'var(--surface, #1f2937)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border, #374151)' }}>
                    <img src={snap.img} alt={snap.id} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text, #ffffff)' }}>{snap.id} · {snap.vehicle}</div>
                        <div style={{ color: 'var(--text3, #9ca3af)', fontSize: '0.75rem' }}>Captured: {snap.time}</div>
                      </div>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>HD Frame</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDER BOOKING & RECEIPT */}
          {activeTab === 'orders' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <form onSubmit={handleBookOrder} style={{ background: 'var(--surface, #1f2937)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #374151)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Book LPG Delivery Order</h3>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>Customer / Commercial Enterprise Name:</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    required
                    style={{ width: '100%', marginTop: '0.2rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border, #374151)', background: 'var(--card, #111827)', color: 'var(--text, #ffffff)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>Cylinder Type:</label>
                  <select
                    value={cylType}
                    onChange={(e) => setCylType(e.target.value)}
                    style={{ width: '100%', marginTop: '0.2rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border, #374151)', background: 'var(--card, #111827)', color: 'var(--text, #ffffff)' }}
                  >
                    <option>19kg Commercial</option>
                    <option>14.2kg Domestic</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={cylQty}
                    onChange={(e) => setCylQty(Number(e.target.value))}
                    required
                    style={{ width: '100%', marginTop: '0.2rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border, #374151)', background: 'var(--card, #111827)', color: 'var(--text, #ffffff)' }}
                  />
                </div>

                <button type="submit" style={{ padding: '0.75rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Generate Receipt & Book Order
                </button>
              </form>

              {/* Receipt Preview */}
              <div style={{ background: '#ffffff', color: '#111827', padding: '1.5rem', borderRadius: '12px', fontFamily: 'monospace', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {bookedReceipt ? (
                  <div>
                    <div style={{ borderBottom: '2px dashed #9ca3af', paddingBottom: '0.75rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#b91c1c' }}>VETRI INDANE LPG</h3>
                      <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>Authorized Indane Distributor</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem' }}>Helpline: {bookedReceipt.helpline}</div>
                    </div>

                    <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Receipt No:</span>
                        <span style={{ fontWeight: 700 }}>{bookedReceipt.receiptNo}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Date:</span>
                        <span>{bookedReceipt.date}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Customer:</span>
                        <span style={{ fontWeight: 700 }}>{bookedReceipt.custName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Item:</span>
                        <span>{bookedReceipt.cylType} x {bookedReceipt.qty}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '0.4rem', marginTop: '0.4rem', fontWeight: 800, fontSize: '1rem', color: '#166534' }}>
                        <span>TOTAL AMOUNT:</span>
                        <span>₹{bookedReceipt.total}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', textAlign: 'center', background: '#dcfce7', color: '#15803d', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      ✔ STATUS: {bookedReceipt.status}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', margin: 'auto', color: '#6b7280' }}>
                    <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Digital Receipt Preview</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Fill form to generate instant delivery voucher</div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border, #374151)', background: 'var(--surface, #1f2937)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>
          <span>Enterprise Platform built by RDK Industries</span>
          <button onClick={onClose} style={{ padding: '0.4rem 1rem', background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', color: 'var(--text, #ffffff)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Close Showcase
          </button>
        </div>

      </div>
    </div>
  );
};
