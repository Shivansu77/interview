import React, { useState } from 'react';
import AnimatedBlob from './AnimatedBlob';

const BlobShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('all');

  const animationTypes = [
    { type: 'morph', color: '#667eea', description: 'Shape-shifting with rotation' },
    { type: 'liquid', color: '#764ba2', description: 'Organic wave-like transformations' },
    { type: 'pulse', color: '#f093fb', description: 'Breathing glow effect' },
    { type: 'breathe', color: '#4facfe', description: 'Gentle scaling animation' },
    { type: 'float', color: '#43e97b', description: 'Multi-directional floating' },
    { type: 'rotate', color: '#FF9800', description: 'Continuous rotation' },
    { type: 'default', color: '#2196F3', description: 'Combined morph + pulse' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '48px' }}>
          🎨 Animated Blob Showcase
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', color: '#ccc', fontSize: '18px' }}>
          Explore different blob animation types for your interview app
        </p>

        {/* Demo Selector */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveDemo('all')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeDemo === 'all' ? '#667eea' : 'transparent',
              border: '1px solid #667eea',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            All Animations
          </button>
          {animationTypes.map(({ type }) => (
            <button
              key={type}
              onClick={() => setActiveDemo(type)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeDemo === type ? '#667eea' : 'transparent',
                border: '1px solid #667eea',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Animation Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {animationTypes.map(({ type, color, description }) => (
            <div
              key={type}
              style={{
                display: activeDemo === 'all' || activeDemo === type ? 'block' : 'none',
                position: 'relative',
                height: '300px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <AnimatedBlob
                position="center"
                color={color}
                size={200}
                delay={0}
                opacity={0.4}
                duration={15}
                animationType={type as any}
                blur={50}
              />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '15px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '20px', 
                  textTransform: 'capitalize',
                  color: color
                }}>
                  {type}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Demo */}
        {activeDemo === 'all' && (
          <div style={{
            position: 'relative',
            height: '500px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            marginBottom: '40px'
          }}>
            <AnimatedBlob position="top-left" color="#667eea" size={300} delay={0} opacity={0.25} duration={20} animationType="morph" blur={70} />
            <AnimatedBlob position="top-right" color="#764ba2" size={280} delay={2} opacity={0.2} duration={25} animationType="liquid" blur={65} />
            <AnimatedBlob position="bottom-left" color="#f093fb" size={260} delay={4} opacity={0.15} duration={22} animationType="breathe" blur={60} />
            <AnimatedBlob position="bottom-right" color="#4facfe" size={320} delay={6} opacity={0.2} duration={18} animationType="pulse" blur={75} />
            <AnimatedBlob position="center" color="#43e97b" size={220} delay={3} opacity={0.15} duration={30} animationType="float" blur={55} />
            
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '30px 40px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Combined Effect</h2>
              <p style={{ fontSize: '16px', color: '#ccc', margin: 0 }}>
                All animation types working together
              </p>
            </div>
          </div>
        )}

        {/* Configuration Guide */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px' }}>⚙️ Configuration Tips</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '10px' }}>🎨 Colors</h3>
              <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>
                Use complementary colors with low opacity (0.15-0.25) for subtle effects
              </p>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: '#764ba2', marginBottom: '10px' }}>⏱️ Timing</h3>
              <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>
                Duration: 18-30s, Delay: 2-6s between blobs for natural staggering
              </p>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: '#f093fb', marginBottom: '10px' }}>📐 Sizing</h3>
              <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>
                Size: 350-550px for corners, 200-350px for center blobs
              </p>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: '#4facfe', marginBottom: '10px' }}>💫 Blur</h3>
              <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>
                Blur: 50-80px for optimal performance and aesthetic appeal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlobShowcase;
