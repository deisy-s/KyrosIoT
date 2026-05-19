import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { insforge } from '../lib/insforge';
import { X, GripVertical, Activity, Thermometer, Zap, AlertTriangle } from 'lucide-react';

export function SortableWidget({ widget, isEditMode, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const [telemetry, setTelemetry] = useState({ value: '--', unit: '', timestamp: null });
  const [isOffline, setIsOffline] = useState(false);

  // --- FALLBACK POLLING (Requerimiento del Arquitecto) ---
  useEffect(() => {
    if (!widget.module_id) return;

    const fetchLastValue = async () => {
      try {
        const { data, error } = await insforge
          .from('telemetry')
          .select('value, type, timestamp')
          .eq('module_id', widget.module_id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`Sin datos para módulo ${widget.module_id}`);
          }
          return;
        }

        if (data) {
          const lastTime = new Date(data.timestamp).getTime();
          const now = Date.now();
          const diff = (now - lastTime) / 1000;
          
          const threshold = parseInt(localStorage.getItem('offlineThreshold')) || 10;
          setIsOffline(diff > threshold);
          
          setTelemetry({ 
            value: data.value, 
            unit: data.type === 'temperature' ? '°C' : (data.type === 'humidity' ? '%' : ''),
            timestamp: data.timestamp
          });
        }
      } catch (err) {
        console.error("Error en polling:", err);
      }
    };

    // Consulta inicial
    fetchLastValue();

    // Intervalo de Polling cada 3 segundos (Sustituye Realtime temporalmente)
    const interval = setInterval(fetchLastValue, 3000);

    // CLEANUP RIGUROSO
    return () => {
      clearInterval(interval);
    };
  }, [widget.module_id]);

  const getIcon = () => {
    if (isOffline) return <AlertTriangle className="text-error" />;
    switch (widget.type) {
      case 'metric': return <Thermometer className="text-brand-blue" />;
      case 'status': return <Zap className="text-yellow-500" />;
      default: return <Activity className="text-brand-blue" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${widget.size || 'col-span-4'} group relative bg-surface-container rounded-2xl p-6 border transition-all flex flex-col justify-between ${
        isOffline 
          ? 'border-error/30 bg-error/[0.02] shadow-[0_8px_32px_rgba(239,68,68,0.08)]' 
          : 'border-brand-blue/10 shadow-sm'
      } ${isEditMode ? 'ring-2 ring-brand-blue/30 ring-dashed cursor-default' : ''}`}
    >
      {/* Controles de Edición */}
      {isEditMode && (
        <>
          <button
            onClick={onRemove}
            className="absolute -top-3 -right-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
          >
            <X size={14} strokeWidth={3} />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="absolute top-4 left-4 p-1 bg-surface-container-high rounded-md cursor-grab active:cursor-grabbing text-on-surface-variant hover:text-brand-blue transition-colors"
          >
            <GripVertical size={20} />
          </div>
        </>
      )}

      <div className="w-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isOffline ? 'bg-error/10' : 'bg-brand-blue/10'
          } ${isEditMode ? 'ml-8' : ''}`}>
            {getIcon()}
          </div>
          <div className="text-right">
            {isOffline ? (
              <span className="text-[10px] font-black text-error uppercase tracking-widest animate-pulse">OFFLINE</span>
            ) : (
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Polling Activo</span>
            )}
          </div>
        </div>
        <h3 className={`font-bold tracking-tight mb-1 ${isOffline ? 'text-error/80' : 'text-on-surface'}`}>{widget.title}</h3>
      </div>

      <div className="mt-4 grow flex items-center">
        {widget.type === 'metric' && (
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black tracking-tighter transition-colors ${
              isOffline ? 'text-slate-400' : 'text-on-surface'
            }`}>
              {isOffline ? '--' : telemetry.value}
            </span>
            <span className="text-xl font-bold text-on-surface-variant">{telemetry.unit}</span>
          </div>
        )}
        {widget.type === 'status' && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
            isOffline ? 'bg-slate-200 text-slate-500' : 'bg-green-500/10 text-green-500'
          }`}>
            {!isOffline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            {isOffline ? 'DESCONECTADO' : 'ACTIVO'}
          </span>
        )}
      </div>
    </div>
  );
}

