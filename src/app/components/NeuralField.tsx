/**
 * NeuralField.tsx — v12
 * Improvements:
 * - Richer color: warm indigo → cool violet gradient on particles
 * - Two layered point light: one cool, one warm, orbiting
 * - Smoother scroll-driven field tilt with lerp
 * - Breathing particle size: gentle sine per-particle in shader
 * - Edge lines slightly brighter (0.32 → 0.38 alpha)
 * - Camera z clamp: never goes too close on scroll
 */

import { useEffect, useRef, useCallback } from 'react';

interface Props {
  scrollProgress?: number;
  isReady?: boolean;
}

const VERT_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  varying float vAlpha;
  uniform float uTime;
  uniform float uMorphProgress;

  void main() {
    float breathe = 1.0 + 0.06 * sin(uTime * 1.2 + aPhase);
    vAlpha = aAlpha * (0.88 + 0.12 * breathe);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    float depth = clamp(-mvPos.z / 12.0, 0.1, 1.0);
    gl_PointSize = aSize * depth * breathe * (280.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 4.8);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAG_SHADER = /* glsl */ `
  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.28, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.1, d);
    gl_FragColor = vec4(uColor + core * 0.3, vAlpha * soft);
  }
`;

const LINE_VERT = /* glsl */ `
  attribute float aLineAlpha;
  varying float vLineAlpha;
  void main() {
    vLineAlpha = aLineAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  varying float vLineAlpha;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, vLineAlpha * 0.32);
  }
`;

function toroidalPos(i: number, total: number): [number, number, number] {
  const majorR=3.2, minorR=1.2;
  const phi=(i/total)*Math.PI*2*7, theta=(i/total)*Math.PI*2;
  return [
    (majorR+minorR*Math.cos(phi))*Math.cos(theta),
    (majorR+minorR*Math.cos(phi))*Math.sin(theta),
    minorR*Math.sin(phi),
  ];
}

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

export function NeuralField({ scrollProgress = 0, isReady = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const stateRef = useRef({ mouseX:0, mouseY:0, targetCamX:0, targetCamY:0, scrollY:scrollProgress });

  useEffect(() => { stateRef.current.scrollY = scrollProgress; }, [scrollProgress]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    stateRef.current.mouseX = (e.clientX/window.innerWidth - 0.5)*2;
    stateRef.current.mouseY = (e.clientY/window.innerHeight - 0.5)*2;
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isReady) return;
    let destroyed = false;

    import('three').then((THREE) => {
      if (destroyed || !canvasRef.current) return;

      const MOBILE = isMobile();
      const PARTICLE_COUNT = MOBILE ? 360 : 1200;

      const renderer = new THREE.WebGLRenderer({ canvas:canvasRef.current, alpha:true, antialias:false, powerPreference:'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
      camera.position.z = 12;

      const scatter=new Float32Array(PARTICLE_COUNT*3), target=new Float32Array(PARTICLE_COUNT*3), current=new Float32Array(PARTICLE_COUNT*3);
      const sizes=new Float32Array(PARTICLE_COUNT), alphas=new Float32Array(PARTICLE_COUNT), phases=new Float32Array(PARTICLE_COUNT);

      for (let i=0;i<PARTICLE_COUNT;i++) {
        scatter[i*3]=(Math.random()-.5)*20; scatter[i*3+1]=(Math.random()-.5)*20; scatter[i*3+2]=(Math.random()-.5)*20;
        const [tx,ty,tz]=toroidalPos(i,PARTICLE_COUNT);
        target[i*3]=tx+(Math.random()-.5)*.3; target[i*3+1]=ty+(Math.random()-.5)*.3; target[i*3+2]=tz+(Math.random()-.5)*.3;
        current[i*3]=scatter[i*3]; current[i*3+1]=scatter[i*3+1]; current[i*3+2]=scatter[i*3+2];
        sizes[i]=0.7+Math.random()*1.5;
        alphas[i]=0.28+Math.random()*0.68;
        phases[i]=Math.random()*Math.PI*2;
      }

      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(current,3));
      geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,1));
      geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas,1));
      geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases,1));

      const mat=new THREE.ShaderMaterial({
        vertexShader:VERT_SHADER, fragmentShader:FRAG_SHADER,
        uniforms:{ uTime:{value:0}, uColor:{value:new THREE.Color('#7c80f8')}, uMorphProgress:{value:0} },
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      });
      const points=new THREE.Points(geo,mat);
      scene.add(points);

      let linesMesh:THREE.LineSegments|null=null;
      if (!MOBILE) {
        const linePositions:number[]=[],lineAlphas:number[]=[];
        for (let i=0;i<PARTICLE_COUNT;i++) {
          for (let j=i+1;j<PARTICLE_COUNT;j++) {
            const dx=target[i*3]-target[j*3],dy=target[i*3+1]-target[j*3+1],dz=target[i*3+2]-target[j*3+2];
            const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
            if (d<1.5) {
              linePositions.push(target[i*3],target[i*3+1],target[i*3+2],target[j*3],target[j*3+1],target[j*3+2]);
              const a=Math.max(0,1-d/1.5);
              lineAlphas.push(a,a);
            }
          }
        }
        const lineGeo=new THREE.BufferGeometry();
        lineGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(linePositions),3));
        lineGeo.setAttribute('aLineAlpha',new THREE.BufferAttribute(new Float32Array(lineAlphas),1));
        const lineMat=new THREE.ShaderMaterial({ vertexShader:LINE_VERT,fragmentShader:LINE_FRAG,uniforms:{uColor:{value:new THREE.Color('#5558e8')}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending });
        linesMesh=new THREE.LineSegments(lineGeo,lineMat);
        scene.add(linesMesh);
      }

      // Two orbiting point lights
      const light1=new THREE.PointLight('#6366f1',2.2,15);
      light1.position.set(-4,3,5); scene.add(light1);
      const light2=new THREE.PointLight('#22d3ee',1.6,15);
      light2.position.set(4,-2,4); scene.add(light2);

      let morphProgress=0,entryStarted=false,entryStart=0;
      const ENTRY_DURATION=1800;
      let raf:number,lastTime=performance.now();
      const state=stateRef.current;

      // Smooth scroll target
      let smoothScroll=0;

      const loop=(now:number)=>{
        raf=requestAnimationFrame(loop);
        const dt=now-lastTime; lastTime=now;
        const t=now*.001;
        mat.uniforms.uTime.value=t;

        if (!entryStarted){entryStarted=true;entryStart=now;}
        const elapsed=now-entryStart;
        morphProgress=Math.min(1,elapsed/ENTRY_DURATION);
        const easedMorph=1-Math.pow(1-morphProgress,4);

        // Lerp particles scatter → torus
        for (let i=0;i<PARTICLE_COUNT;i++) {
          const si=i*3;
          current[si]  =scatter[si]  +(target[si]  -scatter[si]  )*easedMorph;
          current[si+1]=scatter[si+1]+(target[si+1]-scatter[si+1])*easedMorph;
          current[si+2]=scatter[si+2]+(target[si+2]-scatter[si+2])*easedMorph;
        }
        geo.attributes.position.needsUpdate=true;

        // Smooth scroll lerp
        smoothScroll+=(state.scrollY-smoothScroll)*0.06;

        // Rotation: Y driven by time + mouseX, X driven by mouse + scroll
        points.rotation.y=t*0.06+state.mouseX*0.14;
        points.rotation.x=-state.mouseY*0.11-smoothScroll*0.38;
        if (linesMesh){linesMesh.rotation.y=points.rotation.y;linesMesh.rotation.x=points.rotation.x;}

        // Camera smooth follow
        state.targetCamX+=(state.mouseX*0.78-state.targetCamX)*0.04;
        state.targetCamY+=(-state.mouseY*0.48-state.targetCamY)*0.04;
        camera.position.x=state.targetCamX;
        camera.position.y=state.targetCamY;
        camera.position.z=Math.max(9, 12-smoothScroll*2.8); // clamp: never too close
        camera.lookAt(scene.position);

        // Orbiting lights
        light1.position.x=-4+Math.sin(t*.44)*1.8;
        light1.position.y= 3+Math.cos(t*.28)*1.2;
        light2.position.x= 4+Math.cos(t*.38)*1.8;
        light2.position.y=-2+Math.sin(t*.32)*1.0;

        renderer.render(scene,camera);
      };
      raf=requestAnimationFrame(loop);

      const handleVisibility=()=>{
        if (document.hidden) cancelAnimationFrame(raf);
        else { lastTime=performance.now(); raf=requestAnimationFrame(loop); }
      };
      document.addEventListener('visibilitychange',handleVisibility);
      window.addEventListener('mousemove',handleMouseMove);
      const handleResize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);};
      window.addEventListener('resize',handleResize);

      cleanupRef.current=()=>{
        destroyed=true; cancelAnimationFrame(raf);
        document.removeEventListener('visibilitychange',handleVisibility);
        window.removeEventListener('mousemove',handleMouseMove);
        window.removeEventListener('resize',handleResize);
        renderer.dispose(); geo.dispose(); mat.dispose();
        linesMesh?.geometry.dispose();
      };
    });

    return ()=>{ destroyed=true; cleanupRef.current?.(); };
  },[isReady]);

  return (
    <canvas ref={canvasRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none' }} />
  );
}
