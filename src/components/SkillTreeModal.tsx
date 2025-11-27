import type { Player } from '../types';

interface SkillTreeProps {
    player: Player;
    onClose: () => void;
    onLearnSkill: (skillName: string, cost: number) => void;
}

export default function SkillTreeModal({ player, onClose, onLearnSkill }: SkillTreeProps) {
    const skills = [
        { name: "Ataque de Fúria", cost: 1, type: 'atk', desc: "Custa 3 Mana. Dano Dobrado." },
        { name: "Cura Menor", cost: 1, type: 'magic', desc: "Custa 5 Mana. Cura 8 HP." },
        { name: "Pele de Pedra", cost: 2, type: 'def', desc: "Custa 4 Mana. Defesa +5 por 1 turno." },
        { name: "Bola de Fogo", cost: 3, type: 'magic', desc: "Custa 8 Mana. 15 Dano Fixo." },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-[#120f1f] border-2 border-purple-500/50 rounded-xl max-w-4xl w-full h-[85vh] shadow-[0_0_50px_rgba(168,85,247,0.2)] relative flex flex-col p-6">
                <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-purple-400 hover:text-white">✕</button>

                <h2 className="text-3xl font-medieval text-purple-300 text-center mb-2">🔮 Grimório de Habilidades</h2>
                <p className="text-center text-gray-400 mb-8 font-mono">
                    Pontos Disponíveis: <span className="text-white font-bold text-xl">{player.skillPoints}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
                    {skills.map((skill, idx) => {
                        const learned = player.learnedSkills?.includes(skill.name);
                        return (
                            <div key={idx} className={`border p-4 rounded-lg flex flex-col transition-colors group ${learned ? 'bg-purple-900/20 border-purple-500' : 'bg-[#1a1626] border-purple-900/50'}`}>
                                <div className="flex justify-between">
                                    <h3 className="text-lg font-bold text-white">{skill.name}</h3>
                                    {learned && <span className="text-green-400 text-xs">APRENDIDO</span>}
                                </div>
                                <p className="text-sm text-gray-400 flex-1 mb-4">{skill.desc}</p>
                                
                                {!learned && (
                                    <button 
                                        disabled={player.skillPoints < skill.cost}
                                        onClick={() => onLearnSkill(skill.name, skill.cost)}
                                        className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded font-bold transition-colors"
                                    >
                                        Aprender (Custo: {skill.cost})
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}