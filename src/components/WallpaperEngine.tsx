'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type BackgroundType = 'stars' | 'waves' | 'particles';

export function WallpaperEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBackground, setCurrentBackground] = useState<BackgroundType>('stars');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Determine which background to show based on day
  useEffect(() => {
    const getBackgroundForDay = (): BackgroundType => {
      const now = new Date();
      const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
      const backgrounds: BackgroundType[] = ['stars', 'waves', 'particles'];
      return backgrounds[daysSinceEpoch % 3];
    };

    setCurrentBackground(getBackgroundForDay());

    // Check for day change at 12 PM
    const checkDayChange = () => {
      const now = new Date();
      if (now.getHours() === 12 && now.getMinutes() === 0) {
        setCurrentBackground(getBackgroundForDay());
      }
    };

    // Check every minute
    const interval = setInterval(checkDayChange, 60000);

    return () => clearInterval(interval);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Create particle system based on current background
    let particles: THREE.Points;
    let geometry: THREE.BufferGeometry;
    let material: THREE.PointsMaterial;

    if (currentBackground === 'stars') {
      // Starfield background
      geometry = new THREE.BufferGeometry();
      const starCount = 5000;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;

        // Star colors (white, blue, yellow)
        const colorChoice = Math.random();
        if (colorChoice < 0.7) {
          colors[i] = colors[i + 1] = colors[i + 2] = 1; // White
        } else if (colorChoice < 0.85) {
          colors[i] = 0.6; colors[i + 1] = 0.8; colors[i + 2] = 1; // Blue
        } else {
          colors[i] = 1; colors[i + 1] = 0.9; colors[i + 2] = 0.6; // Yellow
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation
      const animate = () => {
        particles.rotation.y += 0.0002;
        particles.rotation.x += 0.0001;
        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

    } else if (currentBackground === 'waves') {
      // Wave particles background
      geometry = new THREE.BufferGeometry();
      const waveCount = 10000;
      const positions = new Float32Array(waveCount * 3);
      const velocities = new Float32Array(waveCount);

      for (let i = 0; i < waveCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 40;
        positions[i + 1] = (Math.random() - 0.5) * 40;
        positions[i + 2] = (Math.random() - 0.5) * 40;
        velocities[i / 3] = Math.random() * 0.02;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      material = new THREE.PointsMaterial({
        size: 0.03,
        color: 0x00aaff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation with wave motion
      const animate = () => {
        const positions = geometry.attributes.position.array as Float32Array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < waveCount * 3; i += 3) {
          positions[i + 1] = Math.sin(time + positions[i] * 0.3) * 2;
        }

        geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;
        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

    } else {
      // Floating particles background
      geometry = new THREE.BufferGeometry();
      const particleCount = 3000;
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = (Math.random() - 0.5) * 30;
        positions[i + 2] = (Math.random() - 0.5) * 30;
        
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = (Math.random() - 0.5) * 0.02;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      material = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation with floating motion
      const animate = () => {
        const positions = geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];

          // Boundary check
          if (Math.abs(positions[i]) > 15) velocities[i] *= -1;
          if (Math.abs(positions[i + 1]) > 15) velocities[i + 1] *= -1;
          if (Math.abs(positions[i + 2]) > 15) velocities[i + 2] *= -1;
        }

        geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0005;
        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [currentBackground]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
