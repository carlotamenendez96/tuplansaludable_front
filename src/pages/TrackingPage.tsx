import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProgressLog } from '../types';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/ui/Icons';
import { progress, upload } from '../services/apiService';

interface TrackingPageProps {
  userId: string;
  isTrainerContext?: boolean;
}

const measurementLabels: { [key: string]: string } = {
    waist: 'Cintura',
    hip: 'Cadera',
    thigh: 'Muslo',
    biceps: 'Bíceps',
};

const metricDisplayConfig: { [key: string]: { label: string; unit: string } } = {
  weight: { label: 'Peso', unit: 'kg' },
  waist: { label: 'Cintura', unit: 'cm' },
  hip: { label: 'Cadera', unit: 'cm' },
  thigh: { label: 'Muslo', unit: 'cm' },
  biceps: { label: 'Bíceps', unit: 'cm' },
};


const TrackingPage: React.FC<TrackingPageProps> = ({ userId, isTrainerContext }) => {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [newLog, setNewLog] = useState<Partial<ProgressLog>>({
    date: new Date().toISOString().split('T')[0],
    sensations: '',
    dietCompliance: 5,
    measurements: {},
    weight: undefined,
  });
  const [photos, setPhotos] = useState<{
    front: File | null;
    side: File | null;
    back: File | null;
  }>({ front: null, side: null, back: null });
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await progress.getProgressLogs(userId, { sortBy: 'date', sortOrder: 'desc' });
      setLogs(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching progress logs:', err);
      setError(err.response?.data?.message || 'Error al cargar los registros de progreso.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgressLogs();
  }, [fetchProgressLogs]);

  const logsWithPhotos = useMemo(() => logs.filter(log => log.photos && log.photos.front && log.photos.side && log.photos.back), [logs]);
  
  const [frontIndex, setFrontIndex] = useState(0);
  const [sideIndex, setSideIndex] = useState(0);
  const [backIndex, setBackIndex] = useState(0);

  useEffect(() => {
    if (logsWithPhotos.length > 0) {
      setFrontIndex(logsWithPhotos.length - 1);
      setSideIndex(logsWithPhotos.length - 1);
      setBackIndex(logsWithPhotos.length - 1);
    }
  }, [logsWithPhotos.length]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewLog(prev => ({...prev, [name]: value}));
  };

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLog(prev => {
      const prevMeasurements = prev.measurements || {};
      const newMeasurements: { [key: string]: number } = { ...prevMeasurements };
      if (value === '') {
        delete newMeasurements[name];
      } else {
        newMeasurements[name] = parseFloat(value);
      }
      return {
        ...prev,
        measurements: newMeasurements
      };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      setPhotos(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let uploadedPhotos = { front: '', side: '', back: '' };
      const photoFiles = [];
      if (photos.front) photoFiles.push(photos.front);
      if (photos.side) photoFiles.push(photos.side);
      if (photos.back) photoFiles.push(photos.back);

      if (photoFiles.length > 0) {
        const uploadResponse = await upload.uploadProgressImages(photoFiles);
        // Assuming the backend returns an array of URLs in the same order as files were sent
        // This part might need adjustment based on actual backend response structure
        uploadedPhotos = {
          front: photos.front ? uploadResponse.data.data[0] : '',
          side: photos.side ? uploadResponse.data.data[photos.front ? 1 : 0] : '',
          back: photos.back ? uploadResponse.data.data[photos.front && photos.side ? 2 : (photos.front || photos.side ? 1 : 0)] : '',
        };
      }

      const logToAdd: Partial<ProgressLog> = {
          date: newLog.date || new Date().toISOString().split('T')[0],
          weight: newLog.weight ? Number(newLog.weight) : undefined,
          sensations: newLog.sensations || '',
          dietCompliance: Number(newLog.dietCompliance),
          measurements: newLog.measurements,
          photos: uploadedPhotos,
      };
      
      await progress.createProgressLog(userId, logToAdd);
      await fetchProgressLogs(); // Re-fetch logs to update the list
      
      setNewLog({
          date: new Date().toISOString().split('T')[0],
          sensations: '',
          dietCompliance: 5,
          weight: undefined,
          measurements: {},
      });
      setPhotos({ front: null, side: null, back: null });
      alert('Reporte semanal enviado con éxito!');

    } catch (err: any) {
      console.error('Error submitting progress log:', err);
      setError(err.response?.data?.message || 'Error al enviar el reporte de progreso.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return logs.map(log => {
        const value = selectedMetric === 'weight'
            ? log.weight
            : log.measurements?.[selectedMetric];
        
        return {
            date: new Date(log.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            value: value,
        };
    }).filter(item => item.value !== undefined && item.value !== null).reverse(); // Ensure chronological order for chart
  }, [logs, selectedMetric]);

  if (loading && logs.length === 0) {
    return <div className="text-center p-8">Cargando registros de progreso...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Seguimiento Semanal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!isTrainerContext && (
            <div className="lg:col-span-1">
            <Card>
                <h2 className="text-xl font-bold mb-4">Registrar Progreso</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Fecha</label>
                        <input type="date" name="date" value={newLog.date} onChange={handleInputChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Peso (kg)</label>
                        <input type="number" step="0.1" name="weight" value={newLog.weight || ''} onChange={handleInputChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2"/>
                    </div>
                    
                    <fieldset className="border-t border-base-200 pt-4">
                        <legend className="text-sm font-medium text-text-muted">Medidas Corporales (cm)</legend>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {Object.keys(measurementLabels).map(key => (
                                <div key={key}>
                                    <label htmlFor={key} className="sr-only">{measurementLabels[key]}</label>
                                    <input 
                                        type="number" step="0.1" name={key} id={key} placeholder={measurementLabels[key]} 
                                        value={newLog.measurements?.[key] ?? ''} 
                                        onChange={handleMeasurementChange} 
                                        className="block w-full border border-base-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </fieldset>

                        <div>
                        <label className="block text-sm font-medium text-text-muted">Cumplimiento Dieta (1-10)</label>
                        <input type="range" min="1" max="10" name="dietCompliance" value={newLog.dietCompliance} onChange={handleInputChange} className="mt-1 block w-full"/>
                        <div className="text-center font-bold text-primary">{newLog.dietCompliance}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Sensaciones</label>
                        <textarea name="sensations" value={newLog.sensations} onChange={handleInputChange} rows={3} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                        <fieldset className="border-t border-base-200 pt-4">
                        <legend className="text-sm font-medium text-text-muted">Fotos de Progreso</legend>
                            <div className="space-y-2 mt-2">
                            <div>
                                <label className="block text-xs font-medium text-text-muted">Foto de Frente</label>
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 'front')} className="mt-1 block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                            </div>
                                <div>
                                <label className="block text-xs font-medium text-text-muted">Foto de Lado</label>
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 'side')} className="mt-1 block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                            </div>
                                <div>
                                <label className="block text-xs font-medium text-text-muted">Foto de Espaldas</label>
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 'back')} className="mt-1 block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                            </div>
                            </div>
                    </fieldset>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus" disabled={loading}>
                      {loading ? 'Enviando...' : 'Enviar Reporte'}
                    </button>
                </form>
            </Card>
            </div>
        )}

        <div className={isTrainerContext ? "lg:col-span-3 space-y-6" : "lg:col-span-2 space-y-6"}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Evolución de {metricDisplayConfig[selectedMetric].label}</h2>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="p-2 border border-base-300 rounded-md bg-white text-sm focus:ring-primary focus:border-primary"
                aria-label="Seleccionar métrica para el gráfico"
              >
                {Object.entries(metricDisplayConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} ${metricDisplayConfig[selectedMetric].unit}`, metricDisplayConfig[selectedMetric].label]}/>
                    <Legend />
                    <Line type="monotone" dataKey="value" name={metricDisplayConfig[selectedMetric].label} stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} connectNulls />
                </LineChart>
            </ResponsiveContainer>
          </Card>
          
           <Card>
                <h2 className="text-xl font-bold mb-4">Comparativa de Fotos</h2>
                {logsWithPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Carousel Frente */}
                        <div className="text-center">
                            <h3 className="font-semibold mb-2">Frente</h3>
                            <div className="relative aspect-[3/4] bg-base-200 rounded-lg overflow-hidden">
                                <img src={logsWithPhotos[frontIndex]?.photos?.front} alt={`Frente - ${logsWithPhotos[frontIndex]?.date}`} className="w-full h-full object-cover"/>
                                <button onClick={() => setFrontIndex(i => Math.max(0, i - 1))} disabled={frontIndex === 0} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 rounded-full p-1 disabled:opacity-30"><ChevronLeftIcon className="w-6 h-6"/></button>
                                <button onClick={() => setFrontIndex(i => Math.min(logsWithPhotos.length - 1, i + 1))} disabled={frontIndex >= logsWithPhotos.length - 1} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 rounded-full p-1 disabled:opacity-30"><ChevronRightIcon className="w-6 h-6"/></button>
                            </div>
                            <p className="text-sm text-text-muted mt-2">{new Date(logsWithPhotos[frontIndex]?.date).toLocaleDateString('es-ES')}</p>
                        </div>
                        {/* Carousel Lado */}
                        <div className="text-center">
                            <h3 className="font-semibold mb-2">Lado</h3>
                             <div className="relative aspect-[3/4] bg-base-200 rounded-lg overflow-hidden">
                                <img src={logsWithPhotos[sideIndex]?.photos?.side} alt={`Lado - ${logsWithPhotos[sideIndex]?.date}`} className="w-full h-full object-cover"/>
                                <button onClick={() => setSideIndex(i => Math.max(0, i - 1))} disabled={sideIndex === 0} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 rounded-full p-1 disabled:opacity-30"><ChevronLeftIcon className="w-6 h-6"/></button>
                                <button onClick={() => setSideIndex(i => Math.min(logsWithPhotos.length - 1, i + 1))} disabled={sideIndex >= logsWithPhotos.length - 1} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 rounded-full p-1 disabled:opacity-30"><ChevronRightIcon className="w-6 h-6"/></button>
                            </div>
                            <p className="text-sm text-text-muted mt-2">{new Date(logsWithPhotos[sideIndex]?.date).toLocaleDateString('es-ES')}</p>
                        </div>
                        {/* Carousel Espalda */}
                        <div className="text-center">
                            <h3 className="font-semibold mb-2">Espalda</h3>
                             <div className="relative aspect-[3/4] bg-base-200 rounded-lg overflow-hidden">
                                <img src={logsWithPhotos[backIndex]?.photos?.back} alt={`Espalda - ${logsWithPhotos[backIndex]?.date}`} className="w-full h-full object-cover"/>
                                <button onClick={() => setBackIndex(i => Math.max(0, i - 1))} disabled={backIndex === 0} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 rounded-full p-1 disabled:opacity-30"><ChevronLeftIcon className="w-6 h-6"/></button>
                                <button onClick={() => setBackIndex(i => Math.min(logsWithPhotos.length - 1, i + 1))} disabled={backIndex >= logsWithPhotos.length - 1} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 rounded-full p-1 disabled:opacity-30"><ChevronRightIcon className="w-6 h-6"/></button>
                            </div>
                             <p className="text-sm text-text-muted mt-2">{new Date(logsWithPhotos[backIndex]?.date).toLocaleDateString('es-ES')}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-text-muted text-center py-8">No hay fotos de progreso para mostrar.</p>
                )}
            </Card>

            {isTrainerContext && (
                 <Card>
                    <h2 className="text-xl font-bold mb-4">Historial de Reportes</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {logs.map((log, index) => (
                            <div key={log.date + '-' + index} className="p-4 bg-base-100 rounded-lg">
                                <p className="font-bold text-text-base">{new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                    <p><strong>Peso:</strong> {log.weight || 'N/A'} kg</p>
                                    {log.measurements && Object.entries(log.measurements).map(([key, value]) => (
                                        <p key={key}><strong>{measurementLabels[key]}:</strong> {value} cm</p>
                                    ))}
                                    <p><strong>Cumplimiento:</strong> {log.dietCompliance}/10</p>
                                </div>
                                <p className="mt-3 text-sm text-text-muted"><strong>Sensaciones:</strong> {log.sensations}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

        </div>
      </div>
    </div>
  );
};



export default TrackingPage;

