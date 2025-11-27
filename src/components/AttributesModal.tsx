import type { Player } from '../types';

interface AttributesModalProps {
    player: Player;
    onClose: () => void;
    onDistribute: (stat: string) => void;
}

export default function AttributesModal({ player, onClose, onDistribute }: AttributesModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#1a1510] border-2 border-blue-500/50 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-blue-400 hover:text-white">✕</button>

                <h2 className="text-3xl font-medieval text-blue-300 text-center mb-6">Atributos</h2>
                
                <div className="text-center mb-6">
                    <p className="text-gray-400 text-sm">Pontos Disponíveis</p>
                    <p className="text-4xl font-bold text-white">{player.statPoints}</p>
                </div>

                <div className="space-y-4">
                    {[
                        { k: 'str', label: 'FORÇA', desc: 'Aumenta Dano Físico' },
                        { k: 'agi', label: 'AGILIDADE', desc: 'Esquiva e Iniciativa' },
                        { k: 'vit', label: 'VITALIDADE', desc: 'HP e Stamina' },
                        { k: 'int', label: 'INTELIGÊNCIA', desc: 'Mana e Dano Mágico' }
                    ].map((stat) => (
                        <div key={stat.k} className="flex justify-between items-center bg-[#0f0e0d] p-3 rounded border border-white/10">
                            <div>
                                <div className="text-blue-200 font-bold">{stat.label}</div>
                                <div className="text-[10px] text-gray-500">{stat.desc}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-mono text-white">{player[stat.k as keyof Player]}</span>
                                {player.statPoints > 0 && (
                                    <button 
                                        onClick={() => onDistribute(stat.k)}
                                        className="bg-green-700 hover:bg-green-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-xl"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}