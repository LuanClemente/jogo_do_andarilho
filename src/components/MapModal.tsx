import type { Player } from '../types';

interface MapModalProps {
    player: Player;
    onClose: () => void;
}

export default function MapModal({ player, onClose }: MapModalProps) {
    // Exemplo de regiões. Lógica: A cada 15 encontros totais, muda a região (simulado)
    const regions = [
        { name: "Campos Secos", level: "1-5", boss: "Lobo Alpha" },
        { name: "Floresta das Sombras", level: "6-10", boss: "Aranha Rainha" },
        { name: "Montanha de Ferro", level: "11-20", boss: "Golem de Lava" }
    ];

    // Calcula em qual região estamos baseada no progresso (Simulado)
    const currentRegionIndex = Math.floor((player.encounters_today + (player.day - 1) * 3) / 15);
    const progress = (player.encounters_today + (player.day - 1) * 3) % 15;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-[#1a1510] border-4 border-[#8b7355] rounded-lg max-w-3xl w-full h-[80vh] relative flex flex-col p-6 shadow-2xl">
                
                <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-[#8b7355] hover:text-white">✕</button>

                <h2 className="text-3xl font-medieval text-[#e8d9a8] text-center mb-8 border-b border-[#8b7355]/30 pb-4">
                    🗺️ Mapa do Mundo
                </h2>

                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                    {regions.map((region, idx) => {
                        const isUnlocked = idx <= currentRegionIndex;
                        const isCurrent = idx === currentRegionIndex;

                        return (
                            <div key={idx} className={`relative p-6 rounded-lg border-2 transition-all ${
                                isUnlocked 
                                ? 'bg-[#2a221b] border-[#8b7355] opacity-100' 
                                : 'bg-[#0f0e0d] border-gray-800 opacity-50 grayscale'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-medieval text-white">{region.name}</h3>
                                        <p className="text-sm text-gray-400">Nível Recomendado: {region.level}</p>
                                        <p className="text-sm text-red-400 mt-1">Chefe da Área: {region.boss}</p>
                                    </div>
                                    {isUnlocked && !isCurrent && <span className="text-green-500 font-bold">✓ Conquistado</span>}
                                    {!isUnlocked && <span className="text-gray-600 font-bold">🔒 Bloqueado</span>}
                                </div>

                                {/* Barra de Progresso do Chefe (Só na região atual) */}
                                {isCurrent && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-[#e8d9a8] mb-1">
                                            <span>Progresso da Área</span>
                                            <span>{progress} / 15 Encontros</span>
                                        </div>
                                        <div className="w-full bg-black h-4 rounded-full border border-gray-600 overflow-hidden">
                                            <div 
                                                className="bg-red-700 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white"
                                                style={{ width: `${(progress / 15) * 100}%` }}
                                            >
                                                {progress >= 15 ? 'BOSS!' : ''}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 italic">
                                            "Derrote inimigos para atrair a atenção do Chefe desta região..."
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}