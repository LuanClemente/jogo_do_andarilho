import type { Player } from '../types';

interface SkillTreeProps {
    player: Player;
    onClose: () => void;
    onLearnSkill: (skillName: string, cost: number) => void;
}

export default function SkillTreeModal({ player, onClose, onLearnSkill }: SkillTreeProps) {
    const skills = [
        { name: "Ataque de Fúria", cost: 1, type: 'atk', desc: "+5 Dano por 3 turnos." },
        { name: "Pele de Pedra", cost: 1, type: 'def', desc: "+3 Defesa por 3 turnos." },
        { name: "Resiliência", cost: 2, type: 'res', desc: "Ataque duplo por 3 turnos." },
        { name: "Bola de Fogo Lv1", cost: 3, type: 'magic', desc: "5 Dano + Queimadura (Usa Mana)." },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-[#120f1f] border-2 border-purple-500/50 rounded-xl max-w-4xl w-full h-[85vh] shadow-[0_0_50px_rgba(168,85,247,0.2)] relative flex flex-col p-6">
                
                <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-purple-400 hover:text-white">✕</button>

                <h2 className="text-3xl font-medieval text-purple-300 text-center mb-2">
                    🔮 Árvore de Habilidades
                </h2>
                <p className="text-center text-gray-400 mb-8 font-mono">
                    Pontos de Habilidade Disponíveis: <span className="text-white font-bold text-xl">{player.skillPoints}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar">
                    {skills.map((skill, idx) => (
                        <div key={idx} className="bg-[#1a1626] border border-purple-900/50 p-4 rounded-lg flex flex-col hover:border-purple-500 transition-colors group">
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300">{skill.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded w-max mb-2 ${
                                skill.type === 'atk' ? 'bg-red-900/50 text-red-200' :
                                skill.type === 'def' ? 'bg-blue-900/50 text-blue-200' :
                                skill.type === 'magic' ? 'bg-purple-900/50 text-purple-200' : 'bg-green-900/50 text-green-200'
                            }`}>
                                {skill.type.toUpperCase()}
                            </span>
                            <p className="text-sm text-gray-400 flex-1 mb-4">{skill.desc}</p>
                            
                            <div className="mt-auto">
                                <p className="text-xs text-gray-500 mb-2">Custo: {skill.cost} Pontos</p>
                                <button 
                                    disabled={player.skillPoints < skill.cost}
                                    onClick={() => onLearnSkill(skill.name, skill.cost)}
                                    className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded font-bold transition-colors"
                                >
                                    {player.skillPoints < skill.cost ? "Pontos Insuficientes" : "Aprender"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}