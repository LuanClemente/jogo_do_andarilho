import { useState } from 'react';
import type { RankEntry } from '../types';

interface LoginScreenProps {
    onLogin: (username: string, isNewAccount: boolean) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false); // Alternar entre Login/Criar

    // --- DADOS MOCKADOS (Fictícios para visualização) ---
    const rankPersistencia: RankEntry[] = [
        { name: "IronWall", title: "Guardião", days: 45 },
        { name: "SafeTraveler", title: "Andarilho", days: 32 },
        { name: "ShieldBearer", title: "Escudeiro", days: 28 },
    ];

    const rankInsanidade: RankEntry[] = [
        { name: "MadMax", title: "O Louco", days: 12 },
        { name: "YoloPlayer", title: "Temerário", days: 8 },
        { name: "DarkSoul", title: "Vazio", days: 5 },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            // Passamos se é conta nova ou login
            onLogin(username, isRegistering);
        }
    };

    return (
        <div className="min-h-screen bg-rpg-bg flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* COLUNA 1: LOGIN / CRIAR CONTA */}
                <div className="bg-rpg-panel border-2 border-rpg-border p-8 rounded-lg shadow-2xl animate-fade-in relative overflow-hidden">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-medieval text-rpg-gold mb-2 drop-shadow-md">Ciclo Sísifo</h1>
                        <p className="text-rpg-accent text-sm tracking-[0.3em] uppercase opacity-80">— Da Lama ao Trono —</p>
                    </div>

                    {/* Abas Entrar / Criar */}
                    <div className="flex border-b border-rpg-border mb-6">
                        <button 
                            onClick={() => setIsRegistering(false)}
                            className={`flex-1 pb-2 font-medieval text-lg transition-colors ${!isRegistering ? 'text-rpg-gold border-b-2 border-rpg-gold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Entrar
                        </button>
                        <button 
                            onClick={() => setIsRegistering(true)}
                            className={`flex-1 pb-2 font-medieval text-lg transition-colors ${isRegistering ? 'text-rpg-gold border-b-2 border-rpg-gold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-rpg-text font-medieval text-sm mb-2">
                                {isRegistering ? 'Nome do Novo Aventureiro' : 'Nome de Usuário'}
                            </label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#0d1320] border border-rpg-border text-rpg-text p-3 rounded focus:outline-none focus:border-rpg-gold transition-colors font-mono"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-rpg-text font-medieval text-sm mb-2">Senha</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0d1320] border border-rpg-border text-rpg-text p-3 rounded focus:outline-none focus:border-rpg-gold transition-colors font-mono"
                            />
                        </div>
                        <button type="submit" className="w-full btn-dd text-lg py-3 mt-4 hover:scale-[1.02]">
                            {isRegistering ? 'Forjar Novo Destino' : 'Continuar Jornada'}
                        </button>
                    </form>
                </div>

                {/* COLUNA 2: RANKINGS */}
                <div className="space-y-6">
                    
                    {/* RANK DA PERSISTÊNCIA (Moderado) */}
                    <div className="bg-rpg-panel border border-rpg-border p-5 rounded-lg shadow-lg">
                        <h3 className="text-xl font-medieval text-blue-400 text-center mb-4 border-b border-rpg-border pb-2">
                            🛡️ Rank da Persistência
                        </h3>
                        <div className="space-y-2">
                            {rankPersistencia.map((p, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-[#0d1320] rounded border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold font-mono ${i===0?'text-yellow-400':i===1?'text-gray-400':'text-orange-700'}`}>#{i+1}</span>
                                        <span className="text-gray-200">{p.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-rpg-accent">{p.title}</div>
                                        <div className="text-xs text-gray-500">{p.days} dias</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RANK DA INSANIDADE (Difícil) */}
                    <div className="bg-rpg-panel border border-red-900/30 p-5 rounded-lg shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-900/5 pointer-events-none"></div>
                        <h3 className="text-xl font-medieval text-red-500 text-center mb-4 border-b border-red-900/30 pb-2 relative z-10">
                            💀 Rank da Insanidade
                        </h3>
                        <div className="space-y-2 relative z-10">
                            {rankInsanidade.map((p, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-[#0d1320] rounded border border-red-900/20">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold font-mono ${i===0?'text-red-500':i===1?'text-red-700':'text-red-900'}`}>#{i+1}</span>
                                        <span className="text-gray-200">{p.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-rpg-accent">{p.title}</div>
                                        <div className="text-xs text-gray-500">{p.days} dias</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}