import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Clock, Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Componente do baú 3D
function TreasureChest({ isOpening, onAnimationComplete }) {
  const meshRef = useRef();
  const mixerRef = useRef();
  const clockRef = useRef(new Clock());
  
  // Carrega o modelo GLB
  const gltf = useLoader(GLTFLoader, '/treasure_chest_animation.glb');
  
  useEffect(() => {
    if (gltf.animations && gltf.animations.length > 0) {
      // Cria o mixer de animação
      mixerRef.current = new AnimationMixer(gltf.scene);
      
              if (isOpening) {
          // Reproduz a animação de abertura
          const openAction = mixerRef.current.clipAction(gltf.animations[0]);
          openAction.setLoop(1, 1); // Faz apenas 1 loop da animação
          openAction.clampWhenFinished = true; // Mantém a posição final
          openAction.play();
          
          // Chama o callback quando a animação terminar
          setTimeout(() => {
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }, gltf.animations[0].duration * 1000);
        }
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [gltf, isOpening, onAnimationComplete]);

  // Atualiza o mixer a cada frame
  useFrame(() => {
    if (mixerRef.current) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={gltf.scene} 
      scale={[0.8, 0.8, 0.8]}
      position={[0, -0.3, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
}

// Componente das moedas/prêmios voadores
function FloatingCoins({ show }) {
  const coinsRef = useRef();
  const [coins] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: new Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        (Math.random() - 0.5) * 4
      ),
      velocity: new Vector3(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.02 + 0.01,
        (Math.random() - 0.5) * 0.02
      ),
      rotationSpeed: (Math.random() - 0.5) * 0.1
    }))
  );

  useFrame(() => {
    if (show && coinsRef.current) {
      coins.forEach((coin, index) => {
        coin.position.add(coin.velocity);
        coin.velocity.y -= 0.0005; // Gravidade
        
        if (coinsRef.current.children[index]) {
          coinsRef.current.children[index].position.copy(coin.position);
          coinsRef.current.children[index].rotation.y += coin.rotationSpeed;
        }
      });
    }
  });

  if (!show) return null;

  return (
    <group ref={coinsRef}>
      {coins.map((coin) => (
        <mesh key={coin.id} position={coin.position.toArray()}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
          <meshPhongMaterial color="#FFD700" shininess={100} />
        </mesh>
      ))}
    </group>
  );
}

// Componente principal da animação
export default function TreasureChestAnimation({ show, onClose, cards = [] }) {
  const [isOpening, setIsOpening] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showRewards, setShowRewards] = useState(false);



  useEffect(() => {
    if (show) {
      // Inicia a animação de abertura após um pequeno delay
      const timer = setTimeout(() => {
        setIsOpening(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Reset do estado quando a animação é fechada
      setIsOpening(false);
      setShowCoins(false);
      setShowRewards(false);
    }
  }, [show]);

  const handleAnimationComplete = () => {
    setShowCoins(true);
    setShowRewards(true);
    
    // Removido o fechamento automático - usuário controla quando fechar
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Canvas 3D */}
        <Canvas
          camera={{ position: [0, 2, 5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            {/* Iluminação super melhorada */}
            <ambientLight intensity={1.5} />
            
            {/* Luzes principais mais intensas */}
            <pointLight position={[5, 8, 5]} intensity={4} color="#ffffff" />
            <pointLight position={[-5, 8, -5]} intensity={3.5} color="#ffffff" />
            <pointLight position={[0, 10, 0]} intensity={4} color="#fff8dc" />
            
            {/* Luzes de apoio mais brilhantes */}
            <pointLight position={[3, 3, 3]} intensity={3} color="#ffd700" />
            <pointLight position={[-3, 3, -3]} intensity={3} color="#ffd700" />
            
            {/* Luzes adicionais para iluminar melhor */}
            <pointLight position={[0, 5, 5]} intensity={3} color="#ffffff" />
            <pointLight position={[0, 5, -5]} intensity={2.5} color="#ffffff" />
            <pointLight position={[8, 5, 0]} intensity={2.5} color="#fff8dc" />
            <pointLight position={[-8, 5, 0]} intensity={2.5} color="#fff8dc" />
            
            <directionalLight 
              position={[5, 10, 5]} 
              intensity={3}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            {/* Luzes de realce no baú mais intensas */}
            <spotLight
              position={[0, 8, 3]}
              target-position={[0, 0, 0]}
              intensity={4}
              angle={Math.PI / 3}
              penumbra={0.1}
              color="#fff8dc"
            />
            
            <spotLight
              position={[3, 6, 3]}
              target-position={[0, 0, 0]}
              intensity={3}
              angle={Math.PI / 4}
              penumbra={0.2}
              color="#ffffff"
            />
            
            <spotLight
              position={[-3, 6, 3]}
              target-position={[0, 0, 0]}
              intensity={3}
              angle={Math.PI / 4}
              penumbra={0.2}
              color="#ffffff"
            />
            
            {/* Baú do tesouro */}
            <TreasureChest 
              isOpening={isOpening}
              onAnimationComplete={handleAnimationComplete}
            />
            
            {/* Moedas voadores */}
            <FloatingCoins show={showCoins} />
            
            {/* Controles de órbita */}
            <OrbitControls 
              enablePan={false}
              enableZoom={false}
              enableRotate={true}
              autoRotate={false}
            />
          </Suspense>
        </Canvas>

        {/* UI Overlay */}
        <AnimatePresence>
          {showRewards && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none w-full h-full"
            >

              
              <Motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl p-6 shadow-xl bg-black/60 w-full h-full flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-6">
                   First access rewards:
                  </div>
                  
                  {cards && cards.length > 0 ? (
                    <div className="flex flex-col items-center gap-8">
                      {/* Descrição dos prêmios */}
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold drop-shadow-lg">+100 $CHIPS</div>
                        <div className="text-xl font-bold">+ {cards.length} special card{cards.length > 1 ? 's' : ''}</div>
                      </div>

                      {/* Container das imagens lado a lado */}
                      <div className="flex items-center justify-center pointer-events-auto">
                        {/* Imagem dos CHIPS */}
                        <div className="flex flex-col items-center">
                          <img 
                            src="/chips-fanatique.png" 
                            alt="CHIPS"
                            className="w-36 h-auto object-contain drop-shadow-2xl rounded-xl z-30"
                          />
                        </div>

                        {/* Leque de cartas sem animação */}
                        <div className="relative flex items-center justify-center pointer-events-auto" style={{ width: '275px', height: '250px' }}>
                          {cards.map((card, index) => {
                            const totalCards = cards.length;
                            const maxRotation = 40; // Ângulo máximo do leque
                            const rotationStep = totalCards > 1 ? maxRotation / (totalCards - 1) : 0;
                            const rotation = totalCards > 1 ? -maxRotation / 2.2 + index * rotationStep : 0;
                            const offsetX = index * (totalCards > 3 ? 15 : 40); // Sobreposição horizontal
                            const offsetY = Math.abs(rotation) * 0.2; // Curvatura do leque
                            
                            return (
                              <div
                                key={card.id || index}
                                className="absolute transition-all duration-300 ease-out group cursor-pointer pointer-events-auto"
                                style={{
                                  transform: `translateX(${offsetX - (totalCards * 15)}px) translateY(${offsetY}px) rotate(${rotation}deg)`,
                                  zIndex: index,
                                  transformOrigin: 'center bottom'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.zIndex = '999';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.zIndex = index.toString();
                                }}
                              >
                                <div 
                                  className="w-36 rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 ease-out group-hover:rotate-0 group-hover:scale-110 group-hover:-translate-y-4 group-hover:shadow-3xl group-hover:border-white/40"
                                  style={{
                                    transformOrigin: 'center bottom'
                                  }}
                                >
                                  {/* Card Image */}
                                  <div className="aspect-[9/11] bg-gradient-to-br from-gray-800 to-gray-900/50 relative overflow-hidden group-hover:from-gray-700 group-hover:to-gray-800 transition-all duration-300">
                                    <img
                                      src={`/pack/${card.image_name}`}
                                      alt={card.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    
                                    {/* Efeito de brilho no hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Rarity glow effect no hover */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                                      card.rarity === 'lendaria' ? 'bg-yellow-400/30' :
                                      card.rarity === 'rara' ? 'bg-blue-400/30' :
                                      'bg-gray-400/30'
                                    }`} />
                                  </div>

                                  {/* Card Info */}
                                  <div className="p-2 bg-gradient-to-r from-black/40 to-black/30 group-hover:from-black/60 group-hover:to-black/50 transition-all duration-300">
                                    <h3 className="text-xs font-bold text-white mb-1 text-left group-hover:text-white transition-all duration-300">
                                      {card.name}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-1 transition-all duration-300 group-hover:w-3 group-hover:h-3 ${
                                          card.rarity === 'lendaria' ? 'bg-yellow-400 group-hover:shadow-yellow-400/50' :
                                          card.rarity === 'rara' ? 'bg-blue-400 group-hover:shadow-blue-400/50' :
                                          'bg-gray-400 group-hover:shadow-gray-400/50'
                                        } group-hover:shadow-lg`} />
                                        <span className="text-xs text-white/60 capitalize group-hover:text-white/80 transition-all duration-300">
                                          {card.rarity}
                                        </span>
                                      </div>
                                      <div className="text-xs text-white/60 group-hover:text-white/80 transition-all duration-300">
                                        #{card.id}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Fallback apenas com CHIPS se não há cartas */
                    <div className="flex flex-col items-center gap-8">
                      {/* Descrição do prêmio */}
                      <div className="text-center text-white space-y-4">
                        <div className="text-4xl font-bold drop-shadow-lg">+100 $CHIPS</div>
                        <div className="text-lg opacity-90 font-medium">Fanatique utility token</div>
                        <p className="text-white/80 text-sm max-w-md">🎉 Congratulations! You earned $CHIPS tokens to use on Fanatique!</p>
                      </div>
                      
                      {/* Imagem dos CHIPS */}
                      <div className="flex flex-col items-center">
                        <img 
                          src="/chips-fanatique.png" 
                          alt="CHIPS"
                          className="w-40 h-48 object-contain drop-shadow-2xl rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Botão de fechar melhorado */}
        <button
          onClick={onClose}
          className="absolute top-12 right-12  text-white text-4xl font-bold z-20 transition-all duration-200 pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 border-2 border-white/20 hover:border-white/40"
        >
          ×
        </button>
      </div>
    </div>
  );
} 