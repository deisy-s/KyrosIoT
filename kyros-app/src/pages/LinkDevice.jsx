import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LinkDevice() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();

  const handleVinculacion = async (e) => {
    e.preventDefault();
    // Llamada al backend
    const res = await fetch('http://localhost:3000/api/vincular-dispositivo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoVinculacion: codigo, nombreSector: nombre })
    });

    if (res.ok) {
      alert("¡KYROS Core detectado y vinculado!");
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-surface min-h-screen pt-25 px-6 md:px-12">
      <div className="max-w-md mx-auto bg-surface-container p-8 rounded-2xl ambient-glow">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-brand-blue text-5xl mb-4">qr_code_scanner</span>
          <h1 className="text-2xl font-bold text-on-surface">Vincular Nuevo Core</h1>
          <p className="text-on-surface-variant text-sm mt-2">Introduce el código PIN que se encuentra en la etiqueta de tu dispositivo KYROS.</p>
        </div>

        <form onSubmit={handleVinculacion} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Código de Vinculación (PIN)</label>
            <input 
              type="text" 
              placeholder="Ej: KY-F6A4"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface focus:border-brand-blue outline-none transition-all"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Nombre del Sector</label>
            <input 
              type="text" 
              placeholder="Ej: Planta Procesado A"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface focus:border-brand-blue outline-none transition-all"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
            Confirmar Vinculación
          </button>
        </form>
      </div>
    </div>
  );
}