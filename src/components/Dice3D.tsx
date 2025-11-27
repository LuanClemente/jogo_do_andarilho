import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Icosahedron, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function D20({ onRollDone }: { onRollDone: (val: number) => void }) {
    const mesh = useRef<THREE.Mesh>(null);
    
    const [isDragging, setIsDragging] = useState(false);
    const [isThrown, setIsThrown] = useState(false);
    
    // Física
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const angularVel = useRef(new THREE.Vector3(0, 0, 0));
    const lastPos = useRef(new THREE.Vector3(0, 0, 0));
    
    const { viewport, mouse } = useThree();

    useFrame((state, delta) => {
        if (!mesh.current) return;

        if (isDragging) {
            // MODO SEGURAR: Segue o mouse perfeitamente
            const x = (state.mouse.x * viewport.width) / 2;
            const y = (state.mouse.y * viewport.height) / 2;
            
            // Calcula a velocidade do arremesso baseado no movimento do mouse
            const newVel = new THREE.Vector3(
                (x - lastPos.current.x) * 60, // Multiplicador de força
                (y - lastPos.current.y) * 60, 
                0
            );
            
            // Suaviza a velocidade para não ficar zero se parar o mouse 1ms
            velocity.current.lerp(newVel, 0.5);
            
            mesh.current.position.set(x, y, 0);
            lastPos.current.set(x, y, 0);

            // Rotação leve enquanto segura (só pra mostrar que é 3D)
            mesh.current.rotation.x += delta;
            mesh.current.rotation.y += delta;

        } else if (isThrown) {
            // MODO VOO: Aplica a velocidade calculada
            mesh.current.position.add(velocity.current.clone().multiplyScalar(delta));
            
            mesh.current.rotation.x += angularVel.current.x * delta;
            mesh.current.rotation.y += angularVel.current.y * delta;
            mesh.current.rotation.z += angularVel.current.z * delta;

            // Colisões com a borda
            const w = viewport.width / 2 - 1.2;
            const h = viewport.height / 2 - 1.2;

            if (mesh.current.position.x > w || mesh.current.position.x < -w) {
                velocity.current.x *= -0.7; // Quica e perde energia
                mesh.current.position.x = mesh.current.position.x > 0 ? w : -w;
            }
            if (mesh.current.position.y > h || mesh.current.position.y < -h) {
                velocity.current.y *= -0.7;
                mesh.current.position.y = mesh.current.position.y > 0 ? h : -h;
            }

            // Gravidade e Atrito
            velocity.current.y -= 20 * delta; // Gravidade puxa pra baixo
            velocity.current.multiplyScalar(0.98); // Arito do ar
            angularVel.current.multiplyScalar(0.99);

            // Parada
            if (velocity.current.length() < 0.2 && Math.abs(mesh.current.position.y + h) < 1) {
                setIsThrown(false);
                const result = Math.floor(Math.random() * 20) + 1;
                onRollDone(result);
            }
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

        // Se soltou sem mover (clique simples), joga pra cima
        if (velocity.current.length() < 5) {
            velocity.current.set((Math.random() - 0.5) * 10, 20, 0);
        }

        // Adiciona rotação aleatória ao soltar
        angularVel.current.set(
            Math.random() * 15,
            Math.random() * 15,
            Math.random() * 15
        );
    };

    return (
        <Icosahedron ref={mesh} args={[1.5, 0]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.1} />
            <lineSegments>
                <wireframeGeometry args={[new THREE.IcosahedronGeometry(1.5, 0)]} />
                <lineBasicMaterial color="white" opacity={0.5} transparent />
            </lineSegments>
        </Icosahedron>
    );
}

export default function Dice3D({ onRollComplete }: { onRollComplete: (res: number) => void }) {
    const [result, setResult] = useState<number | null>(null);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {!result && (
                <div className="absolute top-20 w-full text-center pointer-events-none z-10 animate-pulse">
                    <h2 className="text-4xl font-medieval text-yellow-400 drop-shadow-lg">Sua vez...</h2>
                    <p className="text-white/70 font-mono text-sm mt-2">Segure, mire e jogue!</p>
                </div>
            )}
            <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Suspense fallback={null}>
                        {!result && <D20 onRollDone={(val) => { setResult(val); setTimeout(() => onRollComplete(val), 1500); }} />}
                    </Suspense>
                    <ContactShadows position={[0, -4, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
                </Canvas>
            </div>
            {result && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce-in">
                    <span className="text-9xl font-bold text-white font-medieval drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">{result}</span>
                </div>
            )}
            <style>{`.animate-bounce-in { animation: bounceIn 0.5s ease-out forwards; } @keyframes bounceIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
}