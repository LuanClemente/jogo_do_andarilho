import { useEffect, useRef } from 'react';

interface LogBoxProps {
    logs: string[];
}

export default function LogBox({ logs }: LogBoxProps) {
    const logEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll sempre que chegar novo log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="bg-rpg-panel border border-rpg-border rounded-lg p-4 shadow-xl flex flex-col h-full max-h-[500px]">
            <h3 className="text-2xl text-rpg-gold font-medieval mb-3 border-b border-rpg-border pb-2 text-center tracking-widest">
                Registro
            </h3>
            
            {/* O SEGREDO DO SCROLL: overflow-y-auto e font-mono */}
            <div className="flex-1 overflow-y-auto font-mono text-sm space-y-2 pr-2 custom-scrollbar bg-[#0d1320] p-3 rounded border border-rpg-border/50">
                {logs.length === 0 && <p className="text-gray-600 italic text-center mt-10">O grimório está vazio...</p>}
                
                {logs.map((log, index) => (
                    // Renderiza HTML vindo do log (para cores e negrito)
                    <div key={index} className="leading-relaxed border-b border-white/5 pb-1 last:border-0 animate-fade-in">
                        <span dangerouslySetInnerHTML={{ __html: log }} />
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>

            <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Histórico de Ações
                </p>
            </div>
        </div>
    );
}