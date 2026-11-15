'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Wind, 
  Ruler, 
  Flame, 
  Zap
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { EngineSelectorBar } from './EngineSelectorBar';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

export function CenterFlame2D() {
  const {
    currentResult,
    currentTime,
    setCurrentTime,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
    layers,
    toggleLayer,
    conditions,
    selectedEngine,
    isRunning,
    runSimulation,
    resetConditions,
  } = useSimulationStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [viewMode, setViewMode] = useState<'photorealistic' | 'scientific'>('photorealistic');
  const [enableHeatDistortion, setEnableHeatDistortion] = useState(true);

  // Current interpolated timepoint
  const currentPoint = useMemo(() => {
    if (!currentResult?.timeSeries?.length) return null;
    const series = currentResult.timeSeries;
    let closest = series[0];
    let minDiff = Math.abs(series[0].time - currentTime);
    for (let i = 1; i < series.length; i++) {
      const diff = Math.abs(series[i].time - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = series[i];
      }
    }
    return closest;
  }, [currentResult, currentTime]);

  const maxTime = currentResult?.timeSeries[currentResult.timeSeries.length - 1]?.time || 10;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `nasa-${selectedEngine.id}-plume-t${currentTime.toFixed(2)}s.png`;
    a.click();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
  };

  // High-Performance PixiJS & GLSL Rocket Thruster Shader Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = canvas.getContext('webgl2');
    if (!gl) {
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    }
    if (!gl) {
      console.error('WebGL not available for rocket thruster visualization.');
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Advanced Tone-Mapped GLSL Fragment Shader for Controlled, Detailed Supersonic Plumes
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform float u_time;
      uniform float u_gravity;        // g
      uniform float u_temperature;    // K
      uniform float u_chamber_pressure; // atm
      uniform float u_exhaust_velocity; // m/s
      uniform float u_thrust_force;   // N
      uniform float u_plume_length;   // mm
      uniform float u_plume_width;    // mm
      uniform float u_mach_number;    // M_e
      uniform float u_throttle;       // 0.1 to 1.0
      uniform int   u_propellant_type;// 0: Methane, 1: Hydrogen/LH2, 2: RP1, 3: Hypergolic, 4: Hydrazine, 5: Xenon
      uniform float u_quenched;       // 1.0 if off
      uniform vec2  u_resolution;
      uniform int   u_view_mode;      // 0: Photorealistic, 1: Scientific Mach/Isocontours
      uniform float u_heat_distortion;

      // Layer Toggles
      uniform int   u_layer_temperature;
      uniform int   u_layer_velocity;
      uniform int   u_layer_pressure;
      uniform int   u_layer_density;
      uniform int   u_layer_species;
      uniform int   u_layer_shock_structures;
      uniform int   u_layer_nozzle_geometry;

      // 2D Hash
      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      // Smooth Hermite Noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
              dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
          mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
              dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // 5-Octave Fractal Brownian Motion
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(cos(0.48), sin(0.48), -sin(0.48), cos(0.48));
        for (int i = 0; i < 5; ++i) {
          v += a * noise(p);
          p = rot * p * 2.02 + vec2(19.3, 27.7);
          a *= 0.5;
        }
        return v;
      }

      // Supersonic Shear Turbulence with Double Domain Warping
      float supersonicShear(vec2 p, float t, float speed) {
        vec2 q = vec2(
          fbm(p + vec2(-t * speed * 0.9, 0.0)),
          fbm(p + vec2(-t * speed * 0.7, 3.2))
        );
        vec2 r = vec2(
          fbm(p + 3.2 * q + vec2(-t * speed * 1.2, 1.7)),
          fbm(p + 3.2 * q + vec2(0.0, 8.4))
        );
        return fbm(p + 2.8 * r);
      }

      // ACES Filmic Tone Mapping to prevent washed-out white clipping
      vec3 tonemapACES(vec3 x) {
        const float a = 2.51;
        const float b = 0.03;
        const float c = 2.43;
        const float d = 0.59;
        const float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = vec2((uv.x - 0.22) * aspect, uv.y - 0.5);

        // Deep Midnight Navy Space Background (#070F21)
        vec3 finalColor = vec3(0.027, 0.059, 0.129);

        // Subtle Aerospace Coordinate Grid
        float gridX = abs(fract(uv.x * 20.0) - 0.5);
        float gridY = abs(fract(uv.y * 12.0) - 0.5);
        float gridLines = smoothstep(0.04, 0.0, min(gridX, gridY)) * 0.09;
        finalColor += vec3(0.10, 0.35, 0.75) * gridLines;

        // Optical Heat Shimmer / Schlieren Distortion in plume wake
        if (u_heat_distortion > 0.5 && u_quenched < 0.5 && p.x > 0.0) {
          float shimmer = noise(vec2(p.x * 12.0 - u_time * 7.0, p.y * 16.0)) * 0.012;
          float heatMask = exp(-abs(p.y) * 9.0) * smoothstep(0.0, 0.35, p.x);
          p.y += shimmer * heatMask;
        }

        // =====================================================================
        // 1. METALLIC DE LAVAL BELL THRUSTER NOZZLE (FIXED ON LEFT)
        // =====================================================================
        float nozzleX = (uv.x - 0.03) / 0.19; // 0.0 at gimbal mount, 1.0 at exit plane
        float nozzleY = abs(uv.y - 0.5);
        float throatX = 0.40;
        float halfHeight = 0.0;

        if (nozzleX < throatX) {
          halfHeight = mix(0.19, 0.062, nozzleX / throatX); // Converging chamber
        } else {
          float t = (nozzleX - throatX) / (1.0 - throatX);
          halfHeight = 0.062 + 0.138 * pow(t, 0.82); // Diverging parabolic bell
        }

        float wallThickness = 0.016;

        if (u_layer_nozzle_geometry == 1 && uv.x >= 0.03 && uv.x <= 0.22 && nozzleY <= halfHeight + wallThickness) {
          if (nozzleY > halfHeight) {
            // Metallic Casing (Titanium/Inconel/Columbium alloy with electric blue rim)
            float rimLighting = smoothstep(halfHeight, halfHeight + wallThickness, nozzleY);
            vec3 metalBase = vec3(0.10, 0.16, 0.26);
            vec3 metalSpecular = vec3(0.35, 0.65, 0.95);
            vec3 nozzleColor = mix(metalBase, metalSpecular, rimLighting * 0.75);

            // Circumferential Cooling Ribs
            float rib = abs(fract(nozzleX * 16.0) - 0.5);
            nozzleColor += vec3(0.12, 0.22, 0.38) * smoothstep(0.2, 0.0, rib);

            // Glowing Exit Lip
            if (uv.x > 0.215) {
              nozzleColor += vec3(0.35, 0.75, 1.0) * 0.8;
            }
            finalColor = nozzleColor;
          } else {
            // Inside Combustion Chamber & Throat Glow
            if (u_quenched < 0.5) {
              float throatGlow = exp(-abs(nozzleX - throatX) * 9.0);
              vec3 interiorColor = mix(vec3(0.85, 0.40, 0.10), vec3(0.95, 0.95, 1.0), throatGlow);
              finalColor = interiorColor * (0.95 + 0.15 * sin(u_time * 20.0));
            } else {
              finalColor = vec3(0.04, 0.06, 0.10);
            }
          }
        }

        // Spacecraft Bulkhead Mount Plate
        if (u_layer_nozzle_geometry == 1 && uv.x < 0.03 && abs(uv.y - 0.5) < 0.26) {
          float panelLine = smoothstep(0.02, 0.0, abs(fract(uv.y * 14.0) - 0.5));
          finalColor = mix(vec3(0.07, 0.11, 0.20), vec3(0.16, 0.26, 0.45), panelLine * 0.6);
        }

        // =====================================================================
        // 2. CONTROLLED, HIGH-DETAIL 2D SUPERSONIC EXHAUST PLUME
        // =====================================================================
        if (p.x > 0.0 && u_quenched < 0.5) {
          float speed = clamp(u_exhaust_velocity / 900.0, 1.8, 6.0);
          float plumeLenScale = max(0.4, u_plume_length / 65.0);
          float plumeWidthScale = max(0.2, u_plume_width / 28.0);

          vec2 plumeP = vec2(p.x / plumeLenScale, p.y / plumeWidthScale);

          // Supersonic Expansion Envelope into Space Vacuum
          float expansionHalfAngle = 0.14 + 0.16 * (u_gravity < 1e-4 ? 1.25 : 0.8);
          float plumeBoundary = max(0.062, 0.062 + plumeP.x * expansionHalfAngle);
          float distNorm = abs(plumeP.y) / plumeBoundary;

          // Decays smoothly along axis
          float axialDecay = exp(-plumeP.x * 1.45);
          float lateralCutoff = 1.0 - smoothstep(0.55, 1.28, distNorm);

          // High-frequency shear turbulence
          float turb = supersonicShear(vec2(plumeP.x * 4.2, plumeP.y * 6.5), u_time, speed * 2.2);

          // Plume Core Intensity (Controlled, non-clamping)
          float rawIntensity = clamp(lateralCutoff * axialDecay * (0.82 + turb * 0.45), 0.0, 1.0);

          // Standing Shock Diamonds (Mach Disks)
          float machSpacing = 0.16 * max(1.1, u_mach_number * 0.48);
          float diamondPhase = mod(plumeP.x, machSpacing) / machSpacing;
          float diamondShape = exp(-abs(plumeP.y) * 32.0) * exp(-plumeP.x * 2.0);
          float diamondPeak = smoothstep(0.38, 0.50, diamondPhase) * (1.0 - smoothstep(0.50, 0.62, diamondPhase));
          float shockDiamond = (u_layer_shock_structures == 1) ? diamondShape * diamondPeak * 1.8 : 0.0;

          // ===================================================================
          // PROPELLANT-SPECIFIC EMISSION SPECTRUM
          // ===================================================================
          vec3 colCore = vec3(0.92, 0.96, 1.0);    // Core incandescence
          vec3 colInner = vec3(0.12, 0.65, 1.0);   // Chemiluminescent blue/cyan
          vec3 colShear = vec3(0.92, 0.45, 0.12);   // Flame orange
          vec3 colOuter = vec3(0.95, 0.65, 0.18);   // Golden amber
          vec3 colHalo = vec3(0.30, 0.15, 0.70);    // Excited radical halo

          if (u_propellant_type == 1) {
            // Cryogenic LOX / LH2 (Clean faint blue with brilliant Mach disks)
            colCore = vec3(0.85, 0.95, 1.0);
            colInner = vec3(0.15, 0.55, 0.98);
            colShear = vec3(0.20, 0.40, 0.85);
            colOuter = vec3(0.45, 0.20, 0.75);
            colHalo = vec3(0.35, 0.10, 0.80);
          } else if (u_propellant_type == 2) {
            // LOX / RP-1 (Incandescent orange-white with heavy amber soot mantle)
            colCore = vec3(1.0, 0.92, 0.80);
            colInner = vec3(0.95, 0.60, 0.15);
            colShear = vec3(0.92, 0.38, 0.10);
            colOuter = vec3(0.85, 0.22, 0.06);
            colHalo = vec3(0.40, 0.12, 0.05);
          } else if (u_propellant_type == 3) {
            // Hypergolic MMH/N2O4 or Aerozine (Warm amber core with NO2 reddish-brown fringe)
            colCore = vec3(0.96, 0.92, 0.88);
            colInner = vec3(0.92, 0.50, 0.16);
            colShear = vec3(0.82, 0.30, 0.10);
            colOuter = vec3(0.65, 0.18, 0.08);
            colHalo = vec3(0.45, 0.15, 0.10);
          } else if (u_propellant_type == 5) {
            // Electric Xenon Plasma (Electric cyan and royal purple electrostatic glow)
            colCore = vec3(0.65, 0.95, 1.0);
            colInner = vec3(0.18, 0.72, 1.0);
            colShear = vec3(0.45, 0.20, 0.85);
            colOuter = vec3(0.35, 0.10, 0.75);
            colHalo = vec3(0.25, 0.05, 0.65);
          }

          // Layer Masks
          float coreMask = smoothstep(0.55, 0.92, rawIntensity);
          float innerMask = smoothstep(0.25, 0.65, rawIntensity);
          float shearMask = smoothstep(0.04, 0.38, rawIntensity);
          float haloMask = exp(-length(vec2(plumeP.x * 0.75, plumeP.y * 1.8)) * 2.2) * 0.35;

          vec3 plumeEmission = vec3(0.0);

          if (u_view_mode == 0) {
            // Photorealistic Controlled Plume
            plumeEmission += colHalo * haloMask;
            plumeEmission += mix(colShear, colOuter, turb * 0.6) * shearMask * 1.3;
            plumeEmission += colInner * innerMask * 1.6;
            plumeEmission += colCore * coreMask * 1.8;
            plumeEmission += vec3(0.85, 0.95, 1.0) * shockDiamond;

            // Optional Layer Color Filters
            if (u_layer_temperature == 1) {
              plumeEmission = mix(plumeEmission, mix(vec3(0.1, 0.4, 0.9), vec3(0.95, 0.4, 0.1), rawIntensity), 0.3);
            }
            if (u_layer_velocity == 1) {
              float streamLine = abs(fract(plumeP.y * 18.0 - u_time * speed * 2.0) - 0.5);
              plumeEmission += vec3(0.2, 0.9, 0.4) * smoothstep(0.12, 0.0, streamLine) * 0.4 * lateralCutoff;
            }
            if (u_layer_pressure == 1) {
              float isobars = abs(fract(plumeP.x * 12.0) - 0.5);
              plumeEmission += vec3(0.6, 0.2, 0.9) * smoothstep(0.1, 0.0, isobars) * 0.35 * lateralCutoff;
            }
            if (u_layer_density == 1) {
              plumeEmission += vec3(0.1, 0.8, 0.8) * exp(-plumeP.x * 2.0) * 0.35;
            }
          } else {
            // Scientific Shock & Iso-Surface Profile Mode
            float isocontour = fract(rawIntensity * 10.0);
            float line = smoothstep(0.08, 0.0, abs(isocontour - 0.5));
            vec3 scientificCol = mix(vec3(0.12, 0.55, 0.98), vec3(0.91, 0.40, 0.11), rawIntensity);
            scientificCol += vec3(1.0) * line * 0.6;
            scientificCol += vec3(0.3, 1.0, 0.5) * shockDiamond;
            plumeEmission = scientificCol * rawIntensity;
          }

          finalColor += plumeEmission;
        }

        // Tone-map entire output with ACES filmic curve to guarantee NO white overexposure
        finalColor = tonemapACES(finalColor);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function compileShader(source: string, type: number) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uGravityLoc = gl.getUniformLocation(program, 'u_gravity');
    const uTempLoc = gl.getUniformLocation(program, 'u_temperature');
    const uPressureLoc = gl.getUniformLocation(program, 'u_chamber_pressure');
    const uExhaustVelLoc = gl.getUniformLocation(program, 'u_exhaust_velocity');
    const uThrustLoc = gl.getUniformLocation(program, 'u_thrust_force');
    const uPlumeLenLoc = gl.getUniformLocation(program, 'u_plume_length');
    const uPlumeWidthLoc = gl.getUniformLocation(program, 'u_plume_width');
    const uMachLoc = gl.getUniformLocation(program, 'u_mach_number');
    const uThrottleLoc = gl.getUniformLocation(program, 'u_throttle');
    const uPropellantLoc = gl.getUniformLocation(program, 'u_propellant_type');
    const uQuenchedLoc = gl.getUniformLocation(program, 'u_quenched');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uViewModeLoc = gl.getUniformLocation(program, 'u_view_mode');
    const uHeatDistLoc = gl.getUniformLocation(program, 'u_heat_distortion');

    // Layer Uniforms
    const uLayerTempLoc = gl.getUniformLocation(program, 'u_layer_temperature');
    const uLayerVelLoc = gl.getUniformLocation(program, 'u_layer_velocity');
    const uLayerPressLoc = gl.getUniformLocation(program, 'u_layer_pressure');
    const uLayerDensLoc = gl.getUniformLocation(program, 'u_layer_density');
    const uLayerShockLoc = gl.getUniformLocation(program, 'u_layer_shock_structures');
    const uLayerNozzleLoc = gl.getUniformLocation(program, 'u_layer_nozzle_geometry');

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      if (!canvas || !gl) return;

      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.useProgram(program);

      const elapsed = (performance.now() - startTime) * 0.001;
      const currentSimTime = currentTime + elapsed * 0.12;

      const isQuenched = currentResult.summaryMetrics.quenched && (currentTime >= (currentResult.summaryMetrics.quenchingTime || 999));
      const maxTemp = currentPoint?.maxTemp || 2850.0;
      const exhaustVel = currentPoint?.exhaustVelocity || 3100.0;
      const thrust = currentPoint?.thrustForce || 43900.0;
      const plumeL = currentPoint?.plumeLength || 95.0;
      const plumeW = currentPoint?.plumeWidth || 42.0;

      // Determine propellant index for shader color mapping
      const pName = (conditions.fuelType || '').toLowerCase();
      let propIndex = 0; // Methane
      if (pName.includes('hydrogen') || pName.includes('lh2')) propIndex = 1;
      else if (pName.includes('rp-1') || pName.includes('kerosene')) propIndex = 2;
      else if (pName.includes('aerozine') || pName.includes('mmh')) propIndex = 3;
      else if (pName.includes('hydrazine')) propIndex = 4;
      else if (pName.includes('xenon')) propIndex = 5;

      gl.uniform1f(uTimeLoc, currentSimTime);
      gl.uniform1f(uGravityLoc, conditions.gravity);
      gl.uniform1f(uTempLoc, maxTemp);
      gl.uniform1f(uPressureLoc, conditions.chamberPressure);
      gl.uniform1f(uExhaustVelLoc, exhaustVel);
      gl.uniform1f(uThrustLoc, thrust);
      gl.uniform1f(uPlumeLenLoc, plumeL);
      gl.uniform1f(uPlumeWidthLoc, plumeW);
      gl.uniform1f(uMachLoc, currentResult.summaryMetrics.machNumber || 3.2);
      gl.uniform1f(uThrottleLoc, (conditions.thrusterThrottle || 100) / 100.0);
      gl.uniform1i(uPropellantLoc, propIndex);
      gl.uniform1f(uQuenchedLoc, isQuenched ? 1.0 : 0.0);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1i(uViewModeLoc, viewMode === 'photorealistic' ? 0 : 1);
      gl.uniform1f(uHeatDistLoc, enableHeatDistortion ? 1.0 : 0.0);

      // Layer uniform bindings
      gl.uniform1i(uLayerTempLoc, layers.temperatureField ? 1 : 0);
      gl.uniform1i(uLayerVelLoc, layers.velocityStreamlines ? 1 : 0);
      gl.uniform1i(uLayerPressLoc, layers.pressureField ? 1 : 0);
      gl.uniform1i(uLayerDensLoc, layers.densityField ? 1 : 0);
      gl.uniform1i(uLayerShockLoc, layers.shockStructures ? 1 : 0);
      gl.uniform1i(uLayerNozzleLoc, layers.nozzleGeometry ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [currentResult, currentTime, currentPoint, conditions, viewMode, enableHeatDistortion, layers, selectedEngine]);

  return (
    <div className="flex-1 flex flex-col gap-2.5 min-w-0">
      {/* Top Engine Selector Bar */}
      <EngineSelectorBar />

      {/* Main 2D Visualization Container */}
      <div 
        ref={containerRef}
        className={`relative flex-1 flex flex-col glass-panel border border-[#1B64DD]/40 bg-[#0D2554]/75 rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[calc(100vh-210px)] min-h-[460px]'
        }`}
      >
        {/* Top Status & Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          {/* Left Telemetry HUD */}
          <SmartHoverGuide id="exhaustPlume" className="pointer-events-auto">
            <div className="flex items-center gap-2 bg-[#070F21]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1B64DD]/40 shadow-lg cursor-help">
              <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-[#D9E0EE] flex items-center gap-1.5">
                  <span>{selectedEngine.name}</span>
                  <span className="text-[#2694EE]">• 2D SUPERSONIC EXHAUST</span>
                </span>
                <div className="flex items-center gap-2 text-[10px] text-[#2694EE] font-mono">
                  <span>MACH {(currentResult.summaryMetrics.machNumber || 3.2).toFixed(1)}</span>
                  <span>•</span>
                  <span>v_e: {(currentPoint?.exhaustVelocity || 3100).toFixed(0)} m/s</span>
                  <span>•</span>
                  <span>
                    F: {(currentPoint?.thrustForce || 43900) > 1000 
                      ? ((currentPoint?.thrustForce || 43900) / 1000).toFixed(1) + ' kN' 
                      : (currentPoint?.thrustForce || 43900).toFixed(0) + ' N'}
                  </span>
                </div>
              </div>
            </div>
          </SmartHoverGuide>

          {/* Right Action Tools */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-[#070F21]/85 backdrop-blur-md p-1.5 rounded-lg border border-[#1B64DD]/40">
            <button
              onClick={() => setViewMode(viewMode === 'photorealistic' ? 'scientific' : 'photorealistic')}
              title="Toggle between Photorealistic Plume VFX and Scientific Shock Isocontours"
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'photorealistic'
                  ? 'bg-[#E8671C] text-white shadow-[0_0_12px_rgba(232,103,28,0.5)]'
                  : 'bg-[#2694EE] text-white shadow-[0_0_12px_rgba(38,148,238,0.5)]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{viewMode === 'photorealistic' ? 'VFX Plume' : 'Shock Disks'}</span>
            </button>

            <button
              onClick={() => setEnableHeatDistortion(!enableHeatDistortion)}
              title="Toggle Schlieren Optical Heat Refraction"
              className={`p-1.5 rounded text-xs transition ${
                enableHeatDistortion ? 'bg-[#2694EE]/30 text-[#2694EE] border border-[#2694EE]/50' : 'text-[#A7B1D2] hover:text-white'
              }`}
            >
              <Wind className="w-4 h-4" />
            </button>

            <SmartHoverGuide id="layer_plumeMeasurements">
              <button
                onClick={() => toggleLayer('plumeMeasurements')}
                title="Toggle Caliper Dimension Overlays"
                className={`p-1.5 rounded transition ${
                  layers.plumeMeasurements ? 'bg-[#2694EE]/30 text-[#2694EE] border border-[#2694EE]/50' : 'text-[#A7B1D2] hover:text-white'
                }`}
              >
                <Ruler className="w-4 h-4" />
              </button>
            </SmartHoverGuide>

            <div className="w-[1px] h-4 bg-[#1B64DD]/40 mx-0.5" />

            <SmartHoverGuide id="resetConditions">
              <button
                onClick={resetConditions}
                title="Reset parameters to documented NASA specifications"
                className="p-1.5 rounded text-[#A7B1D2] hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </SmartHoverGuide>

            <button
              onClick={handleCaptureSnapshot}
              title="Capture PNG Snapshot"
              className="p-1.5 rounded text-[#F79628] hover:text-white transition relative"
            >
              <Camera className="w-4 h-4" />
              {snapshotTaken && (
                <span className="absolute -bottom-6 -left-6 bg-[#16A34A] text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  Saved!
                </span>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-1.5 rounded text-[#A7B1D2] hover:text-white transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main 2D Canvas Area */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />

          {/* 2D Caliper Overlays */}
          {layers.plumeMeasurements && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Plume Length Dimension Line */}
              <div 
                className="absolute top-1/2 -translate-y-16 border-t border-dashed border-[#2694EE]/70 flex items-center justify-between"
                style={{
                  left: '22%',
                  width: `${Math.min(65, (currentPoint?.plumeLength || 95) * 0.42)}%`,
                }}
              >
                <div className="w-[1px] h-3 bg-[#2694EE]" />
                <span className="bg-[#070F21]/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#2694EE] border border-[#2694EE]/40 -mt-6">
                  L_plume: {(currentPoint?.plumeLength || 95).toFixed(0)} mm
                </span>
                <div className="w-[1px] h-3 bg-[#2694EE]" />
              </div>

              {/* Plume Width Dimension Line */}
              <div 
                className="absolute left-[38%] top-1/2 -translate-y-1/2 border-r border-dashed border-[#F79628]/70 flex flex-col justify-between items-center"
                style={{
                  height: `${Math.min(75, (currentPoint?.plumeWidth || 42) * 1.5)}%`,
                }}
              >
                <div className="h-[1px] w-3 bg-[#F79628]" />
                <span className="bg-[#070F21]/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#F79628] border border-[#F79628]/40 ml-12">
                  Ø {(currentPoint?.plumeWidth || 42).toFixed(0)} mm
                </span>
                <div className="h-[1px] w-3 bg-[#F79628]" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Simulation Controls & Time Playback Scrubber */}
        <div className="p-3 border-t border-[#1B64DD]/30 bg-[#0A1D44]/90 flex items-center justify-between gap-4 z-20">
          {/* Play/Pause & Run Simulation Manual Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-[#1B64DD] text-white hover:bg-[#2694EE] shadow-[0_0_12px_rgba(38,148,238,0.4)] transition"
              title={isPlaying ? 'Pause Simulation Playback' : 'Play Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <SmartHoverGuide id="runSimulation">
              <button
                onClick={() => runSimulation()}
                disabled={isRunning}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#E8671C] text-white font-bold text-xs uppercase hover:brightness-110 active:scale-95 transition shadow-[0_0_15px_rgba(38,148,238,0.4)] flex items-center gap-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Calculating...' : 'Run Simulation'}</span>
              </button>
            </SmartHoverGuide>
          </div>

          {/* Scrubber Timeline */}
          <SmartHoverGuide id="graph_playbackScrubber" className="flex-1 max-w-xl">
            <div className="w-full flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-mono text-[#A7B1D2]">
                <span className="text-[#2694EE] font-bold">t = {currentTime.toFixed(2)} s</span>
                <span>{maxTime.toFixed(1)} s duration</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxTime}
                step="0.05"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-[#2694EE]"
              />
            </div>
          </SmartHoverGuide>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#070F21] p-1 rounded border border-[#1B64DD]/30 text-[10px] font-mono text-[#A7B1D2]">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded transition ${
                  playbackSpeed === s ? 'bg-[#2694EE] text-white font-bold' : 'hover:text-[#D9E0EE]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
