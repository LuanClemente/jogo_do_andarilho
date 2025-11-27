import { useState } from 'react';
import { loginUser, registerUser } from '../services/fakeDB';
import type { RankEntry } from '../types'; // Importando o tipo corretamente

interface LoginScreenProps {
    onLoginSuccess: (username: string, hasSave: boolean) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [msg, setMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    // Rankings Fictícios para Demo
    const rankPersistencia: RankEntry[] = [
        { name: "IronWall", title: "Guardião", days: 45 },
        { name: "SafeTraveller", title: "Andarilho", days: 32 },
    ];
    const rankInsanidade: RankEntry[] = [
        { name: "MadMax", title: "O Louco", days: 12 },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        if (!username || !password) {
            setMsg({ text: "Preencha tudo.", type: 'error' });
            return;
        }
        if (isRegistering) {
            const res = registerUser(username, password);
            if (res.success) {
                setMsg({ text: res.message, type: 'success' });
                setIsRegistering(false); setPassword('');
            } else {
                setMsg({ text: res.message, type: 'error' });
            }
        } else {
            const res = loginUser(username, password);
            if (res.success) {
                onLoginSuccess(username, res.hasSave);
            } else {
                setMsg({ text: res.message, type: 'error' });
            }
        }
    };

    return (
        <div className="min-h-screen bg-rpg-bg flex items-center justify-center p-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-rpg-panel border-2 border-rpg-border p-8 rounded-lg shadow-2xl relative animate-fade-in">
                    <h1 className="text-4xl font-medieval text-rpg-gold text-center mb-2">Ciclo Sísifo</h1>
                    <div className="flex border-b border-rpg-border mb-6">
                        <button onClick={() => setIsRegistering(false)} className={`flex-1 pb-2 ${!isRegistering ? 'text-rpg-gold border-b-2 border-rpg-gold' : 'text-gray-500'}`}>Entrar</button>
                        <button onClick={() => setIsRegistering(true)} className={`flex-1 pb-2 ${isRegistering ? 'text-rpg-gold border-b-2 border-rpg-gold' : 'text-gray-500'}`}>Criar Conta</button>
                    </div>
                    {msg && <div className={`mb-4 p-2 rounded text-sm text-center ${msg.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>{msg.text}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#0d1320] border border-rpg-border text-white p-3 rounded outline-none focus:border-rpg-gold" />
                        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0d1320] border border-rpg-border text-white p-3 rounded outline-none focus:border-rpg-gold" />
                        <button className="w-full btn-dd py-3 mt-2">{isRegistering ? 'Registrar' : 'Jogar'}</button>
                    </form>
                </div>
                
                {/* Rankings */}
                <div className="space-y-4">
                    <div className="bg-rpg-panel border border-rpg-border p-4 rounded">
                        <h3 className="text-blue-400 font-medieval border-b border-white/10 pb-2 mb-2">🛡️ Rank Persistência</h3>
                        {rankPersistencia.map((r, i) => <div key={i} className="flex justify-between text-sm text-gray-300"><span>{i+1}. {r.name}</span><span>{r.days} Dias</span></div>)}
                    </div>
                    <div className="bg-rpg-panel border border-red-900/30 p-4 rounded">
                        <h3 className="text-red-500 font-medieval border-b border-white/10 pb-2 mb-2">💀 Rank Insanidade</h3>
                        {rankInsanidade.map((r, i) => <div key={i} className="flex justify-between text-sm text-gray-300"><span>{i+1}. {r.name}</span><span>{r.days} Dias</span></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}