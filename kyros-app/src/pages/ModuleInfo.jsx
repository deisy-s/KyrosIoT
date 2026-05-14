import { useNavigate } from 'react-router-dom';
import '../App.css'

const ModuleInfo = () => {
    const navigate = useNavigate();

    const handleModuleClick = () => {
        navigate('/modules');
    };

    return(
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="col-span-12 mb-10 flex justify-between items-end">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                            <span onClick={handleModuleClick} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! active:scale-95">arrow_back</span>
                            <span>Montaje de cables</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span>Módulos</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-on-surface">Módulo de Temperatura</span>
                        </nav>
                        <h1 className="text-4xl font-inter text-on-surface tracking-tighter">Módulo de Temperatura
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

                </div>
            </main>
        </div>
    )
}

export default ModuleInfo;