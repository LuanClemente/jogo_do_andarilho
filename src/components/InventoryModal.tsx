import type { Player } from '../types';

interface InventoryModalProps {
    player: Player;
    onClose: () => void;
}

export default function InventoryModal({ player, onClose }: InventoryModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[#1a1510] border-2 border-[#8b7355] p-6 rounded-lg max-w-md w-full shadow-2xl relative">
                
                {/* Botão Fechar */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-3 text-[#8b7355] hover:text-white font-bold text-xl"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-medieval text-[#e8d9a8] text-center mb-6 border-b border-[#8b7355]/30 pb-2 flex items-center justify-center gap-2">
                    <span>🎒</span> Mochila do Viajante
                </h2>

                {/* --- REMOVEMOS A ÁREA DE OURO DAQUI --- */}

                {/* Lista de Itens */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {player.inventory.length === 0 ? (
                        <div className="text-center py-8 opacity-70">
                            <p className="text-rpg-gold font-medieval mb-2">A mochila está vazia.</p>
                            <p className="text-xs text-gray-500 font-mono italic">Apenas poeira e sonhos de riqueza...</p>
                        </div>
                    ) : (
                        player.inventory.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#25201b] p-3 rounded border border-white/5 hover:border-[#8b7355]/50 transition-colors animate-fade-in">
                                <div className="flex items-center gap-3">
                                    {/* Ícone simples baseado no tipo */}
                                    <span className="text-xl opacity-80">
                                        {item.type === 'weapon' && '⚔️'}
                                        {item.type === 'armor' && '🛡️'}
                                        {item.type === 'potion' && '🧪'}
                                        {item.type === 'material' && '📦'}
                                    </span>
                                    <span className={`font-medieval tracking-wide ${
                                        item.type === 'weapon' ? 'text-red-300' :
                                        item.type === 'armor' ? 'text-blue-300' :
                                        item.type === 'potion' ? 'text-green-300' : 'text-gray-300'
                                    }`}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-xs text-[#8b7355] font-mono bg-black/30 px-2 py-1 rounded">
                                    {item.value} $
                                </span>
                            </div>
                        ))
                    )}
                </div>
                {/* Footer do Modal */}
                <div className="mt-6 text-center border-t border-[#8b7355]/20 pt-4">
                    <p className="text-xs text-gray-500 font-mono">Capacidade: {player.inventory.length} itens</p>
                </div>
            </div>
        </div>
    );
}