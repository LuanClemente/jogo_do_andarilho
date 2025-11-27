import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Icosahedron, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- O OBJETO DADO (D20) ---
function D20({ onRollDone }: { onRollDone: (val: number) => void }) {
    const mesh = useRef<THREE.Mesh>(null);
    
    // Estados de Física
    const [isDragging, setIsDragging] = useState(false);
    const [isThrown, setIsThrown] = useState(false);
    
    // Vetores para calcular movimento
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const angularVel = useRef(new THREE.Vector3(0, 0, 0));
    const lastPos = useRef(new THREE.Vector3(0, 0, 0));
    
    const { viewport, mouse } = useThree();

    // Loop de Animação
    useFrame((state, delta) => {
        if (!mesh.current) return;

        // 1. MODO ARRASTAR
        if (isDragging) {
            const x = (state.mouse.x * viewport.width) / 2;
            const y = (state.mouse.y * viewport.height) / 2;
            
            // Calcula força do arremesso
            velocity.current.set((x - lastPos.current.x) * 50, (y - lastPos.current.y) * 50, 0);
            
            mesh.current.position.set(x, y, 0);
            mesh.current.rotation.x += delta * 2;
            mesh.current.rotation.y += delta * 2;
            
            lastPos.current.set(x, y, 0);
        } 
        // 2. MODO ARREMESSADO
        else if (isThrown) {
            mesh.current.position.add(velocity.current.clone().multiplyScalar(delta));
            
            mesh.current.rotation.x += angularVel.current.x * delta;
            mesh.current.rotation.y += angularVel.current.y * delta;
            mesh.current.rotation.z += angularVel.current.z * delta;

            // Colisão com as paredes
            const w = viewport.width / 2 - 1.2;
            const h = viewport.height / 2 - 1.2;

            if (mesh.current.position.x > w || mesh.current.position.x < -w) {
                velocity.current.x *= -0.6;
                mesh.current.position.x = mesh.current.position.x > 0 ? w : -w;
            }
            if (mesh.current.position.y > h || mesh.current.position.y < -h) {
                velocity.current.y *= -0.6;
                mesh.current.position.y = mesh.current.position.y > 0 ? h : -h;
            }

            // Atrito
            velocity.current.multiplyScalar(0.98);
            angularVel.current.multiplyScalar(0.98);

            // Parada
            if (velocity.current.length() < 0.1 && angularVel.current.length() < 0.5) {
                setIsThrown(false);
                const result = Math.floor(Math.random() * 20) + 1;
                onRollDone(result);
            }
        } 
        // 3. MODO OCIOSO
        else {
            mesh.current.rotation.y += delta * 0.5;
            mesh.current.rotation.z += delta * 0.2;
        }
    });

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        if (isThrown) return;
        setIsDragging(true);
        // @ts-ignore
        document.body.style.cursor = 'grabbing';
    };

    const handlePointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        setIsThrown(true);
        // @ts-ignore
        document.body.style.cursor = 'default';

        if (velocity.current.length() < 1) {
            velocity.current.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0);
        }
        
        angularVel.current.set(
            (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20
        );
    };

    return (
        <Icosahedron 
            ref={mesh} 
            args={[1.5, 0]} 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            castShadow
        >
            {/* MATERIAL SEM DEPENDÊNCIA DE AMBIENTE EXTERNO */}
            <meshStandardMaterial 
                color="#dc2626" 
                roughness={0.3} 
                metalness={0.1}
            />
            <lineSegments>
                <wireframeGeometry args={[new THREE.IcosahedronGeometry(1.5, 0)]} />
                <lineBasicMaterial color="white" opacity={0.5} transparent />
            </lineSegments>
        </Icosahedron>
    );
}

// --- CENA PRINCIPAL ---
export default function Dice3D({ onRollComplete }: { onRollComplete: (res: number) => void }) {
    const [finishedResult, setFinishedResult] = useState<number | null>(null);

    const handleDone = (val: number) => {
        setFinishedResult(val);
        setTimeout(() => {
            onRollComplete(val);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            
            {!finishedResult && (
                <div className="absolute top-20 w-full text-center pointer-events-none z-10 animate-pulse">
                    <h2 className="text-4xl font-medieval text-yellow-400 drop-shadow-lg">Role o Destino</h2>
                    <p className="text-white/70 font-mono text-sm mt-2">Clique, segure e arremesse!</p>
                </div>
            )}

            <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
                    {/* LUZES LOCAIS (Sem internet necessária) */}
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, 10]} intensity={0.5} color="#ffaaaa" />
                    <directionalLight position={[0, 5, 5]} intensity={1} castShadow />

                    <Suspense fallback={null}>
                        {!finishedResult && <D20 onRollDone={handleDone} />}
                    </Suspense>
                    
                    <ContactShadows position={[0, -4, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
                </Canvas>
            </div>

            {finishedResult && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-bounce-in">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-64 h-64 bg-red-600 rotate-45 rounded-xl shadow-[0_0_60px_rgba(220,38,38,0.8)] animate-spin-slow opacity-90"></div>
                        <div className="absolute w-56 h-56 bg-red-800 rotate-12 rounded-xl opacity-90"></div>
                        <span className="relative text-9xl font-bold text-white font-medieval drop-shadow-lg">
                            {finishedResult}
                        </span>
                    </div>
                </div>
            )}

            <style>{`
                .animate-spin-slow { animation: spin 4s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes bounceIn {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .animate-bounce-in { animation: bounceIn 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}