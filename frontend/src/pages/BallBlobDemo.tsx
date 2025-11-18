import React, { useState } from 'react';
import BallBlob from '../components/BallBlob';
import AnimatedBlob from '../components/AnimatedBlob';
import ProfessionalAIBlob from '../components/ProfessionalAIBlob';

/**
 * BallBlobDemo - Interactive demonstration of 3D ball blob effects
 */
const BallBlobDemo: React.FC = () => {
  const [ballCount, setBallCount] = useState(3);
  const [ballSize, setBallSize] = useState(300);
  const [enableGlow, setEnableGlow] = useState(true);
  const [ballOpacity, setBallOpacity] = useState(0.35);
  const [showBackground, setShowBackground] = useState(true);
  const [showAIBlob, setShowAIBlob] = useState(true);
  const [aiIntensity, setAiIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiActive, setAiActive] = useState(true);

  const colors = [
    { hex: '#667eea', name: 'Indigo' },
    { hex: '#43e97b', name: 'Green' },
    { hex: '#f093fb', name: 'Pink' },
    { hex: '#4facfe', name: 'Blue' },
    { hex: '#FF9800', name: 'Orange' },
    { hex: '#9C27B0', name: 'Purple' },
    { hex: '#4CAF50', name: 'Emerald' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* AI Assistant Blob */}
      {showAIBlob && (
        <div style={{
          position: 'fixed',
          top: '20%',
          right: '5%',
          zIndex: 5
        }}>
          <ProfessionalAIBlob 
            size={200}
            primaryColor="#667eea"
            secondaryColor="#43e97b"
            isActive={aiActive}
            intensity={aiIntensity}
          />
        </div>
      )}

      {/* Background blobs */}
      {showBackground && (
        <>
          <AnimatedBlob position="top-left" color="#667eea" size={400} delay={0} opacity={0.15} duration={25} animationType="liquid" blur={80} />
          <AnimatedBlob position="bottom-right" color="#f093fb" size={450} delay={2} opacity={0.15} duration={30} animationType="wave" blur={75} />
        </>
      )}

      {/* Ball Blobs */}
      {ballCount >= 1 && (
        <BallBlob 
          position="center" 
          color="#43e97b" 
          size={ballSize} 
          delay={0} 
          opacity={ballOpacity} 
          duration={25} 
          enableGlow={enableGlow} 
        />
      )}
      {ballCount >= 2 && (
        <BallBlob 
          position="top-left" 
          color="#667eea" 
          size={ballSize * 0.7} 
          delay={2} 
          opacity={ballOpacity * 0.9} 
          duration={30} 
          enableGlow={enableGlow} 
        />
      )}
      {ballCount >= 3 && (
        <BallBlob 
          position="bottom-right" 
          color="#f093fb" 
          size={ballSize * 0.8} 
          delay={4} 
          opacity={ballOpacity * 0.85} 
          duration={28} 
          enableGlow={enableGlow} 
        />
      )}
      {ballCount >= 4 && (
        <BallBlob 
          position="top-right" 
          color="#4facfe" 
          size={ballSize * 0.6} 
          delay={3} 
          opacity={ballOpacity * 0.8} 
          duration={32} 
          enableGlow={enableGlow} 
        />
      )}
      {ballCount >= 5 && (
        <BallBlob 
          position="bottom-left" 
          color="#FF9800" 
          size={ballSize * 0.75} 
          delay={5} 
          opacity={ballOpacity * 0.9} 
          duration={26} 
          enableGlow={enableGlow} 
        />
      )}

      {/* Control Panel */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #667eea, #43e97b, #f093fb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🤖 AI Blob Demo
          </h1>
          <p style={{ fontSize: '20px', color: '#ccc' }}>
            Professional AI assistant blob with wave effects and animations
          </p>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '30px', color: '#43e97b' }}>
            🎮 AI Blob Controls
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {/* AI Intensity */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '18px',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                🎯 AI Intensity: {aiIntensity}
              </label>
              <select
                value={aiIntensity}
                onChange={(e) => setAiIntensity(e.target.value as 'low' | 'medium' | 'high')}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#000',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Ball Size */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '18px',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                📏 Ball Size: {ballSize}px
              </label>
              <input
                type="range"
                min="150"
                max="500"
                value={ballSize}
                onChange={(e) => setBallSize(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Opacity */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '18px',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                💫 Opacity: {(ballOpacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={ballOpacity}
                onChange={(e) => setBallOpacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Toggle Options */}
          <div style={{
            marginTop: '30px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              <input
                type="checkbox"
                checked={showAIBlob}
                onChange={(e) => setShowAIBlob(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>🤖 Show AI Assistant</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              <input
                type="checkbox"
                checked={aiActive}
                onChange={(e) => setAiActive(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>⚡ AI Active State</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              <input
                type="checkbox"
                checked={enableGlow}
                onChange={(e) => setEnableGlow(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>✨ Enable Ball Glow</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              <input
                type="checkbox"
                checked={showBackground}
                onChange={(e) => setShowBackground(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>🌊 Show Background Blobs</span>
            </label>
          </div>
        </div>

        {/* Features */}
        <div style={{
          marginTop: '40px',
          backgroundColor: 'rgba(67, 233, 123, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(67, 233, 123, 0.2)'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#43e97b' }}>
            ✨ AI Blob Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Professional AI</h4>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                Modern AI assistant design with gradient effects and smooth animations
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌊</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Wave Effects</h4>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                Dynamic ripple waves that emanate from the AI core when active
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Interactive States</h4>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                Responsive to user interaction with hover and active animations
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Customizable</h4>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                Animated light reflections simulate realistic surface materials
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Glowing Aura</h4>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                Optional glow effect with inner light and outer halos
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Smooth Animation</h4>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                Floating, pulsing, and rotating effects for living motion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallBlobDemo;
