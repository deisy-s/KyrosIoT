import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import '../App.css';

const ProductCard = ({ products, loading }) => {
    if (loading) return <div className="text-white">Cargando productos...</div>;

    if (products.length === 0) {
        return <div className="text-on-surface-variant p-10 text-center">No se encontraron productos disponibles.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {products.map((product) => {
                return (
                    <div key={product.id} className="bg-surface-container cursor-default rounded-2xl border border-brand-blue/10 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col">
                        <div className="h-36 bg-surface-container flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-6xl! pt-5 text-brand-blue/20">
                                {product.image_url}
                            </span>
                            <span className="absolute top-4 left-4 bg-brand-blue/10 text-brand-blue text-sm font-bold uppercase px-2 py-1 rounded tracking-tighter">
                                {product.category === 'Hub' ? 'Puerta de enlace' : (product.category === 'Package' ? 'Paquete' : 'Sensor')}
                            </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-on-surface font-bold text-base mb-1">{product.name}</h3>
                            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{product.description}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-on-surface font-black text-base">${Number(product.price).toLocaleString()} <span className="text-base font-normal text-on-surface">MXN</span></span>
                                <button className="p-2 bg-brand-blue text-white rounded-lg hover:scale-110 transition-transform cursor-pointer">
                                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await insforge
                    .from('products')
                    .select('*')
                
                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const packages = products.filter(product =>
        product.category === 'Package'
    );

    const hardware = products.filter(product =>
        product.category !== 'Package'
    );

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                {/* Encabezado */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Catálogo de Hardware y Servicios</h1>
                        <p className="text-on-surface-variant text-base mt-2 max-w-xl">
                            Equipa tu planta con dispositivos KYROS de última generación y gestiona tus analíticas.
                        </p>
                    </div>

                    <span className='px-4 py-2 rounded-full font-bold text-[14px] border uppercase tracking-widest bg-brand-blue text-white'>
                        Licencia Starter
                    </span>
                </header>

                {/* Paquetes */}
                <h2 className="text-base font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl!">deployed_code</span>
                    Paquetes de Sensores y Soluciones Integrales
                </h2>

                <ProductCard 
                    products={packages}
                    loading={loading}
                />

                {/* Módulos */}
                <h2 className="text-base font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl!">inventory</span>
                    Hardware & Sensores Satélite
                </h2>

                <ProductCard 
                    products={hardware}
                    loading={loading}
                />

                {/* Membresía */}
                <h2 className="text-base font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl!">cloud_done</span>
                    Planes de Suscripción (SaaS)
                </h2>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-surface-container p-8 rounded-2xl border-2 border-brand-blue relative overflow-hidden flex flex-col justify-between shadow-xl shadow-brand-blue/5">
                        <div className="absolute top-0 right-0 bg-brand-blue text-white px-4 py-1 text-[9px] font-black uppercase rounded-bl-xl tracking-widest">Starter</div>
                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Plan Actual</span>
                            <h2 className="text-3xl font-black text-on-surface mt-2 tracking-tighter">KYROS Starter</h2>
                            <ul className="mt-6 space-y-3 text-xs text-on-surface">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-base!">check_circle</span> Telemetría en vivo</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-base!">check_circle</span> 3 Cores Máximo</li>
                                <li className="flex items-center gap-2 text-on-surface-variant/30"><span className="material-symbols-outlined text-base!">cancel</span> Analítica de Big Data</li>
                            </ul>
                        </div>
                        <button disabled className="mt-8 w-full py-3 bg-surface-container-low text-on-surface-variant/40 rounded-xl font-bold text-xs border border-outline-variant/10">Licencia en Uso</button>
                    </div>

                    <div className="bg-surface-container p-8 rounded-2xl border-2 border-brand-blue relative overflow-hidden flex flex-col justify-between shadow-xl shadow-brand-blue/5">
                        <div className="absolute top-0 right-0 bg-brand-blue text-white px-4 py-1 text-[9px] font-black uppercase rounded-bl-xl tracking-widest">Enterprise</div>
                        <div>
                            <h2 className="text-3xl font-black text-on-surface mt-2 tracking-tighter">KYROS Enterprise</h2>
                            <ul className="mt-6 space-y-3 text-xs text-on-surface">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-base!">check_circle</span> Cores Ilimitados</li>
                                <li className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-brand-blue text-base!">psychology</span> Motor Predictivo de Big Data</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-base!">check_circle</span> Automatización Autónoma</li>
                            </ul>
                        </div>
                        <button className="mt-8 w-full py-3 technical-gradient text-white rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">Actualizar Licencia</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Shop;