import type { Player } from '../types';

interface InventoryModalProps {
    player: Player;
    onClose: () => void;
}

export default function InventoryModal({ player, onClose }: InventoryModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1510] border-2 border-[#8b7355] p-6 rounded-lg max-w-md w-full shadow-2xl relative">
                
                {/* Botão Fechar */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-3 text-[#8b7355] hover:text-white font-bold text-xl"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-medieval text-[#e8d9a8] text-center mb-6 border-b border-[#8b7355]/30 pb-2">
                    🎒 Mochila do Viajante
                </h2>

                <div className="mb-4 flex items-center justify-center gap-2 bg-[#0f0e0d] p-3 rounded border border-[#8b7355]/20">
                    <span className="text-2xl">💰</span>
                    <span className="text-xl font-mono text-yellow-500 font-bold">{player.gold} Ouro</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {player.inventory.length === 0 ? (
                        <p className="text-gray-500 text-center italic py-8">
                            A mochila está vazia, apenas poeira e esperança...
                        </p>
                    ) : (
                        player.inventory.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#25201b] p-3 rounded border border-white/5 hover:border-[#8b7355]/50 transition-colors">
                                <span className={`font-medieval tracking-wide ${
                                    item.type === 'weapon' ? 'text-red-300' :
                                    item.type === 'potion' ? 'text-blue-300' :
                                    item.type === 'material' ? 'text-gray-400' : 'text-white'
                                }`}>
                                    {item.name}
                                </span>
                                <span className="text-xs text-[#8b7355] font-mono">
                                    Val: {item.value}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}