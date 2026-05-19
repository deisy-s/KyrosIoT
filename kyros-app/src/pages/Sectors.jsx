import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { LayoutGrid, Plus, MoreVertical, Factory, Warehouse, Truck, Settings, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getSectorIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('quimica') || n.includes('química')) return <Factory size={24} />;
  if (n.includes('almacen') || n.includes('almacén')) return <Warehouse size={24} />;
  if (n.includes('logistica') || n.includes('logística')) return <Truck size={24} />;
  return <Settings size={24} />;
};

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchSectors = async () => {
    setLoading(true);
    try {
      const _u = JSON.parse(localStorage.getItem('user'));
      const user = _u ? { ..._u, companyId: _u.companyId ?? _u.id } : null;
      const { data, error } = await insforge
        .from('sectors')
        .select('*')
        .eq('company_id', user?.companyId);
      
      if (error) throw error;
      setSectors(data || []);
    } catch (err) {
      console.error("Error cargando sectores:", err);
      MySwal.fire('Error', 'No se pudieron cargar los sectores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    
    // Cerrar menú al hacer clic fuera
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateSector = () => {
    MySwal.fire({
      title: 'Crear Nuevo Sector',
      html: `
        <div class="text-left space-y-4 font-manrope">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nombre del Sector</label>
            <input id="swal-name" class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" placeholder="Ej. Planta Química">
          </div>
        </div>
      `,
      confirmButtonText: 'Crear Sector',
      confirmButtonColor: '#0061FF',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      },
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        if (!name) {
          Swal.showValidationMessage('El nombre es obligatorio');
        }
        return { name };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const _u = JSON.parse(localStorage.getItem('user'));
      const user = _u ? { ..._u, companyId: _u.companyId ?? _u.id } : null;
          const newSector = {
            name: result.value.name,
            sector_id: `SEC-${Date.now()}`,
            status: 'online',
            company_id: user?.companyId
          };

          const { error } = await insforge.from('sectors').insert([newSector]);
          if (error) throw error;

          MySwal.fire('¡Éxito!', 'El sector ha sido creado correctamente.', 'success');
          fetchSectors();
        } catch (err) {
          console.error("Error creando sector:", err);
          MySwal.fire('Error', 'No se pudo crear el sector', 'error');
        }
      }
    });
  };

  const handleDeleteSector = async (id, name) => {
    const result = await MySwal.fire({
      title: '¿Eliminar sector?',
      text: `Estás a punto de eliminar "${name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        const { error } = await insforge.from('sectors').delete().eq('id', id);
        if (error) throw error;
        
        MySwal.fire('Eliminado', 'El sector ha sido eliminado.', 'success');
        fetchSectors();
      } catch (err) {
        console.error("Error eliminando sector:", err);
        MySwal.fire('Error', 'No se pudo eliminar el sector', 'error');
      }
    }
  };

  const handleEditSector = (sector) => {
    MySwal.fire({
      title: 'Editar Sector',
      html: `
        <div class="text-left space-y-4 font-manrope">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nombre del Sector</label>
            <input id="swal-edit-name" class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" value="${sector.name}" placeholder="Ej. Planta Química">
          </div>
        </div>
      `,
      confirmButtonText: 'Guardar Cambios',
      confirmButtonColor: '#0061FF',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      },
      preConfirm: () => {
        const name = document.getElementById('swal-edit-name').value;
        if (!name) {
          Swal.showValidationMessage('El nombre es obligatorio');
        }
        return { name };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await insforge
            .from('sectors')
            .update({ name: result.value.name })
            .eq('id', sector.id);

          if (error) throw error;

          MySwal.fire('¡Actualizado!', 'El sector ha sido modificado correctamente.', 'success');
          fetchSectors();
        } catch (err) {
          console.error("Error editando sector:", err);
          MySwal.fire('Error', 'No se pudo actualizar el sector', 'error');
        }
      }
    });
  };

  return (
    <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2">Gestión de Sectores</h1>
          <p className="text-on-surface-variant font-medium">Organiza y supervisa tus instalaciones industriales.</p>
        </div>
        
        <button 
          onClick={handleCreateSector}
          className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-brand-blue/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={20} />
          Nuevo Sector
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => {
            const isOffline = sector.status === 'offline' || sector.status === 'disconnected';
            return (
              <div key={sector.id} className="bg-surface-container rounded-3xl p-6 border border-on-surface-variant/5 hover:border-brand-blue/30 transition-all group relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                    {getSectorIcon(sector.name)}
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === sector.id ? null : sector.id);
                      }}
                      className="text-on-surface-variant hover:bg-on-surface-variant/10 p-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenu === sector.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-on-surface-variant/10 rounded-xl shadow-xl p-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={() => handleEditSector(sector)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-on-surface hover:bg-brand-blue/5 rounded-lg transition-colors text-left"
                        >
                          <Edit2 size={16} /> Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteSector(sector.id, sector.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-error hover:bg-error/5 rounded-lg transition-colors text-left"
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-on-surface mb-1">{sector.name}</h3>
                <p className="text-xs text-on-surface-variant mb-6 font-mono opacity-60">{sector.sector_id}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-on-surface-variant/5">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={16} className="text-brand-blue" />
                    <span className="text-sm font-bold text-on-surface">-- Módulos</span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    isOffline ? 'bg-error/10 text-error' : (sector.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500')
                  }`}>
                    {sector.status || 'unknown'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sectors;

