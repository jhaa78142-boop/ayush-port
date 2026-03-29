/**
 * CinematicIntro.tsx — v12 "CONVERGENCE" (refined)
 * Fixes: double projection bug, CPU/GPU position conflict, tighter pacing,
 * 12-panel iris, CSS scan line (no Three.js geometry), cleaner HUD.
 */

import { useEffect, useRef, useState } from 'react';
export interface CinematicIntroProps { onComplete: () => void; }

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VERT = /* glsl */`
  attribute float aSize;
  attribute float aAlpha;
  attribute float aSpeed;
  attribute float aPhase;
  attribute vec3  aColor;
  attribute vec3  aLattice;
  varying float vAlpha;
  varying vec3  vColor;
  uniform float uTime;
  uniform float uPulse;
  uniform float uLattice;
  uniform float uCollapse;
  uniform float uBrightness;
  uniform float uGlitch;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    float breathe = 1.0 + 0.08 * sin(uTime * aSpeed + aPhase);
    float beat    = 1.0 + uPulse * 0.55;
    vec3 afterLattice = mix(position, aLattice, uLattice);
    vec3 finalPos     = mix(afterLattice, vec3(0.0), uCollapse);
    vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
    float depth = clamp(-mvPos.z, 0.5, 60.0);
    float ds    = clamp(240.0 / depth, 0.1, 5.0);
    float sz    = aSize * breathe * beat * ds * (1.0 + uBrightness * 1.4);
    gl_PointSize = clamp(sz, 0.5, 11.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const FRAG = /* glsl */`
  varying float vAlpha;
  varying vec3  vColor;
  uniform float uPulse;
  uniform float uFog;
  uniform float uBrightness;
  uniform float uGlitch;

  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float d    = length(uv);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.18, 0.5, d);
    float core = 1.0 - smoothstep(0.0,  0.10, d);
    float ring = smoothstep(0.36, 0.44, d) * (1.0 - smoothstep(0.44, 0.5, d)) * 0.35;
    vec3 col = vColor;
    col = mix(col, vec3(1.0), uPulse * core * 0.9);
    col = mix(col, vec3(1.0), uBrightness * (core + ring * 0.25));
    col.r += uGlitch * core * 0.28;
    col.b -= uGlitch * core * 0.18;
    float alpha = (vAlpha * soft + ring);
    gl_FragColor = vec4(col + core * 0.45, alpha);
  }
`;

const LINE_V = /* glsl */`
  attribute float aLA; varying float vLA;
  void main(){ vLA=aLA; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
`;
const LINE_F = /* glsl */`
  varying float vLA; uniform float uOp; uniform vec3 uCol;
  void main(){ gl_FragColor=vec4(uCol,vLA*uOp); }
`;
const RING_V = /* glsl */`
  uniform float uR;
  void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position*uR,1.0); }
`;
const RING_F = /* glsl */`
  uniform float uOp; uniform vec3 uCol;
  void main(){ gl_FragColor=vec4(uCol,uOp); }
`;

function torusPos(i: number, total: number): [number,number,number] {
  const R=2.8, r=1.05;
  const phi=(i/total)*Math.PI*2*7, theta=(i/total)*Math.PI*2;
  return [(R+r*Math.cos(phi))*Math.cos(theta),(R+r*Math.cos(phi))*Math.sin(theta),r*Math.sin(phi)];
}

function latticePos(i: number, total: number): [number,number,number] {
  const side = Math.ceil(Math.cbrt(total));
  const ix=i%side, iy=Math.floor(i/side)%side, iz=Math.floor(i/(side*side));
  const s=5.6/(side-1);
  return [(ix-(side-1)/2)*s,(iy-(side-1)/2)*s,(iz-(side-1)/2)*s];
}

interface SRefs {
  camZRef: React.MutableRefObject<number>;
  pulseRef: React.MutableRefObject<number>;
  fogRef: React.MutableRefObject<number>;
  glitchRef: React.MutableRefObject<number>;
  brightnessRef: React.MutableRefObject<number>;
  latticeRef: React.MutableRefObject<number>;
  collapseRef: React.MutableRefObject<number>;
  morphRef: React.MutableRefObject<number>;
  lineOpRef: React.MutableRefObject<number>;
  ringRRef: React.MutableRefObject<number>;
  ringORef: React.MutableRefObject<number>;
}

function SceneCanvas(refs: SRefs) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let dead = false;

    import('three').then((THREE) => {
      if (dead || !canvasRef.current) return;
      const MOBILE = isMobile();
      const N = MOBILE ? 512 : 1728;

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, alpha: true, antialias: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 200);
      camera.position.z = 50;

      const scatter=new Float32Array(N*3), torusTgt=new Float32Array(N*3), cur=new Float32Array(N*3);
      const latticeAttr=new Float32Array(N*3), sizes=new Float32Array(N), alphas=new Float32Array(N);
      const speeds=new Float32Array(N), phases=new Float32Array(N), colors=new Float32Array(N*3);

      const pal = [[0.50,0.52,1.00],[0.68,0.33,0.96],[0.08,0.80,0.94],[0.86,0.88,1.00],[0.56,0.46,1.00]];

      for (let i=0;i<N;i++) {
        const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), rad=18+Math.random()*16;
        scatter[i*3]=rad*Math.sin(ph)*Math.cos(th); scatter[i*3+1]=rad*Math.sin(ph)*Math.sin(th); scatter[i*3+2]=rad*Math.cos(ph);
        const [tx,ty,tz]=torusPos(i,N);
        torusTgt[i*3]=tx+(Math.random()-.5)*.08; torusTgt[i*3+1]=ty+(Math.random()-.5)*.08; torusTgt[i*3+2]=tz+(Math.random()-.5)*.08;
        const [lx,ly,lz]=latticePos(i,N);
        latticeAttr[i*3]=lx; latticeAttr[i*3+1]=ly; latticeAttr[i*3+2]=lz;
        cur[i*3]=scatter[i*3]; cur[i*3+1]=scatter[i*3+1]; cur[i*3+2]=scatter[i*3+2];
        sizes[i]=0.35+Math.random()*1.8; alphas[i]=0.06+Math.random()*0.78;
        speeds[i]=0.4+Math.random()*2.8; phases[i]=Math.random()*Math.PI*2;
        const col=pal[Math.floor(Math.random()*pal.length)];
        colors[i*3]=Math.max(0,Math.min(1,col[0]+(Math.random()-.5)*.12));
        colors[i*3+1]=Math.max(0,Math.min(1,col[1]+(Math.random()-.5)*.12));
        colors[i*3+2]=Math.max(0,Math.min(1,col[2]+(Math.random()-.5)*.08));
      }

      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(cur,3));
      geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,1));
      geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas,1));
      geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds,1));
      geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases,1));
      geo.setAttribute('aColor',   new THREE.BufferAttribute(colors,3));
      geo.setAttribute('aLattice', new THREE.BufferAttribute(latticeAttr,3));

      const mat=new THREE.ShaderMaterial({
        vertexShader:VERT, fragmentShader:FRAG,
        uniforms:{ uTime:{value:0},uLattice:{value:0},uCollapse:{value:0},uPulse:{value:0},uFog:{value:1},uBrightness:{value:0},uGlitch:{value:0} },
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      });
      const points=new THREE.Points(geo,mat);
      scene.add(points);

      let lines:THREE.LineSegments|null=null;
      if (!MOBILE) {
        const lP:number[]=[],lA:number[]=[];
        for (let i=0;i<N;i++) for (let j=i+1;j<N;j++) {
          const dx=torusTgt[i*3]-torusTgt[j*3],dy=torusTgt[i*3+1]-torusTgt[j*3+1],dz=torusTgt[i*3+2]-torusTgt[j*3+2];
          const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
          if (d<1.06) {
            lP.push(torusTgt[i*3],torusTgt[i*3+1],torusTgt[i*3+2],torusTgt[j*3],torusTgt[j*3+1],torusTgt[j*3+2]);
            const a=Math.pow(1-d/1.06,2.4); lA.push(a,a);
          }
        }
        const lGeo=new THREE.BufferGeometry();
        lGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(lP),3));
        lGeo.setAttribute('aLA',new THREE.BufferAttribute(new Float32Array(lA),1));
        const lMat=new THREE.ShaderMaterial({ vertexShader:LINE_V,fragmentShader:LINE_F,uniforms:{uOp:{value:0},uCol:{value:new THREE.Color('#8b93ff')}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending });
        lines=new THREE.LineSegments(lGeo,lMat);
        scene.add(lines);
      }

      const ringPts=256,ringBuf=new Float32Array((ringPts+1)*3);
      for (let i=0;i<=ringPts;i++){const a=(i/ringPts)*Math.PI*2;ringBuf[i*3]=Math.cos(a);ringBuf[i*3+1]=Math.sin(a);ringBuf[i*3+2]=0;}
      const ringGeo=new THREE.BufferGeometry();
      ringGeo.setAttribute('position',new THREE.BufferAttribute(ringBuf,3));
      const mkR=(col:string)=>new THREE.ShaderMaterial({vertexShader:RING_V,fragmentShader:RING_F,uniforms:{uR:{value:0},uOp:{value:0},uCol:{value:new THREE.Color(col)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
      const ring1=new THREE.Line(ringGeo,mkR('#a5b4fc')),ring2=new THREE.Line(ringGeo,mkR('#22d3ee'));
      scene.add(ring1,ring2);

      const mouse={x:0,y:0,tx:0,ty:0};
      const onMouse=(e:MouseEvent)=>{mouse.x=(e.clientX/window.innerWidth-.5)*2;mouse.y=-(e.clientY/window.innerHeight-.5)*2;};
      window.addEventListener('mousemove',onMouse);

      let raf:number;
      const loop=(now:number)=>{
        raf=requestAnimationFrame(loop);
        const t=now*.001;
        mat.uniforms.uTime.value=t;
        mat.uniforms.uPulse.value=refs.pulseRef.current;
        mat.uniforms.uFog.value=refs.fogRef.current;
        mat.uniforms.uBrightness.value=refs.brightnessRef.current;
        mat.uniforms.uGlitch.value=refs.glitchRef.current;
        mat.uniforms.uLattice.value=Math.min(refs.latticeRef.current,1);
        mat.uniforms.uCollapse.value=Math.min(refs.collapseRef.current,1);

        const morph=Math.min(refs.morphRef.current,1);
        if (morph>0) {
          const erupt=1-Math.pow(1-morph,3.5);
          for (let i=0;i<N;i++){const s=i*3;cur[s]=torusTgt[s]*erupt;cur[s+1]=torusTgt[s+1]*erupt;cur[s+2]=torusTgt[s+2]*erupt;}
          geo.attributes.position.needsUpdate=true;
        }

        if (lines){(lines.material as THREE.ShaderMaterial).uniforms.uOp.value=refs.lineOpRef.current;lines.rotation.y=points.rotation.y;lines.rotation.x=points.rotation.x;}
        (ring1.material as THREE.ShaderMaterial).uniforms.uR.value=refs.ringRRef.current;
        (ring1.material as THREE.ShaderMaterial).uniforms.uOp.value=refs.ringORef.current;
        (ring2.material as THREE.ShaderMaterial).uniforms.uR.value=refs.ringRRef.current*1.14;
        (ring2.material as THREE.ShaderMaterial).uniforms.uOp.value=refs.ringORef.current*0.45;

        const rotSpeed=0.019+morph*0.02;
        points.rotation.y=t*rotSpeed; points.rotation.x=t*0.006;
        mouse.tx+=(mouse.x*.45-mouse.tx)*.022; mouse.ty+=(mouse.y*.30-mouse.ty)*.022;
        camera.position.z=refs.camZRef.current; camera.position.x=mouse.tx*.45; camera.position.y=mouse.ty*.3;
        camera.lookAt(0,0,0);
        renderer.render(scene,camera);
      };
      raf=requestAnimationFrame(loop);

      const onVis=()=>{if(document.hidden)cancelAnimationFrame(raf);else raf=requestAnimationFrame(loop);};
      document.addEventListener('visibilitychange',onVis);
      const onResize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);};
      window.addEventListener('resize',onResize);

      return ()=>{
        dead=true; cancelAnimationFrame(raf);
        document.removeEventListener('visibilitychange',onVis);
        window.removeEventListener('mousemove',onMouse); window.removeEventListener('resize',onResize);
        renderer.dispose(); geo.dispose(); mat.dispose();
        (lines?.material as THREE.ShaderMaterial|undefined)?.dispose(); lines?.geometry.dispose();
        ringGeo.dispose(); (ring1.material as THREE.ShaderMaterial).dispose(); (ring2.material as THREE.ShaderMaterial).dispose();
      };
    });
    return ()=>{dead=true;};
  },[]);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} />;
}

const NOISE_CHARS='▓▒░█▄▀■◆';
function GlitchName({trigger}:{trigger:boolean}){
  const NAME='AYUSH JHA';
  const [letters,setLetters]=useState<string[]>(Array(NAME.length).fill(''));
  useEffect(()=>{
    if(!trigger)return;
    NAME.split('').forEach((char,idx)=>{
      if(char===' '){setTimeout(()=>setLetters(p=>{const n=[...p];n[idx]=' ';return n;}),idx*60);return;}
      setTimeout(()=>{
        let f=0;
        const iv=setInterval(()=>{
          f++;
          if(f>=5){clearInterval(iv);setLetters(p=>{const n=[...p];n[idx]=char;return n;});}
          else setLetters(p=>{const n=[...p];n[idx]=NOISE_CHARS[Math.floor(Math.random()*NOISE_CHARS.length)];return n;});
        },42);
      },idx*72);
    });
  },[trigger]);
  return (
    <span style={{display:'inline-flex',gap:'0.02em'}}>
      {NAME.split('').map((char,i)=>{
        const resolved=letters[i]===char&&char!==' ';
        const noisy=letters[i]&&letters[i]!==char&&letters[i]!==' ';
        return (
          <span key={i} style={{
            display:'inline-block',minWidth:char===' '?'0.38em':'0.54em',
            background:resolved?'linear-gradient(135deg, #a5b4fc 0%, #c084fc 42%, #67e8f9 100%)':'none',
            WebkitBackgroundClip:resolved?'text':'unset',backgroundClip:resolved?'text':'unset',
            WebkitTextFillColor:resolved?'transparent':(noisy?'#c8ccff':'transparent'),
            color:noisy?'#c8ccff':'transparent',
            fontFamily:noisy?'JetBrains Mono, monospace':'Syne, sans-serif',
            fontSize:noisy?'0.58em':'1em',verticalAlign:'middle',transition:'font-size 0.06s',
          }}>{letters[i]||(char===' '?'\u00A0':'')}</span>
        );
      })}
    </span>
  );
}

function IrisPanel({index,total,open}:{index:number;total:number;open:boolean}){
  const angle=(index/total)*360,segAngle=360/total;
  return (
    <div style={{position:'absolute',inset:0,transformOrigin:'50% 50%',transform:`rotate(${angle}deg)`,zIndex:11,pointerEvents:'none',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'50%',left:'50%',width:0,height:0,borderLeft:'88vmax solid transparent',borderRight:'88vmax solid transparent',borderBottom:`${88*1.52}vmax solid #01010a`,transform:open?`translate(-50%,-50%) rotate(${segAngle*.5}deg) translateY(-76vmax) scale(2.5)`:`translate(-50%,-50%) rotate(${segAngle*.5}deg) translateY(0) scale(1)`,transformOrigin:'50% 100%',transition:open?`transform 0.56s cubic-bezier(0.22,1,0.36,1) ${index*.032}s`:'none',willChange:'transform'}} />
      <div style={{position:'absolute',top:'50%',left:'50%',width:'2px',height:'88vmax',transformOrigin:'50% 0%',transform:`translate(-50%,0) rotate(${segAngle*.5+90}deg)`,background:'linear-gradient(to bottom, rgba(99,102,241,0.7), transparent)',filter:'blur(1px)',opacity:open?0:0.45,transition:open?'opacity 0.28s ease':'none',pointerEvents:'none'}} />
    </div>
  );
}

function IdentifiedText({show}:{show:boolean}){
  return (
    <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:20,fontFamily:'JetBrains Mono, monospace',fontSize:'clamp(9px,0.95vw,12px)',letterSpacing:'0.55em',color:'rgba(165,180,252,0.92)',textTransform:'uppercase',opacity:show?1:0,transition:'opacity 0.12s ease',pointerEvents:'none',whiteSpace:'nowrap',textShadow:'0 0 24px rgba(99,102,241,0.85)',marginLeft:'0.55em'}}>
      IDENTIFIED
    </div>
  );
}

export function CinematicIntro({onComplete}:CinematicIntroProps){
  const [visible,setVisible]=useState(true);
  const [irisOpen,setIrisOpen]=useState(false);
  const [glitchOn,setGlitchOn]=useState(false);
  const [identified,setIdentified]=useState(false);
  const [scanStyle,setScanStyle]=useState({top:'-5%',opacity:0});

  const camZRef=useRef(50),pulseRef=useRef(0),fogRef=useRef(1),glitchRef=useRef(0);
  const brightnessRef=useRef(0),latticeRef=useRef(0),collapseRef=useRef(0),morphRef=useRef(0);
  const lineOpRef=useRef(0),ringRRef=useRef(0),ringORef=useRef(0);

  const snapFlashRef=useRef<HTMLDivElement>(null),novaRef=useRef<HTMLDivElement>(null);
  const hudRef=useRef<HTMLDivElement>(null),bTLRef=useRef<HTMLDivElement>(null);
  const bTRRef=useRef<HTMLDivElement>(null),bBLRef=useRef<HTMLDivElement>(null),bBRRef=useRef<HTMLDivElement>(null);
  const arcRef=useRef<SVGCircleElement>(null),nameRef=useRef<HTMLDivElement>(null);
  const roleRef=useRef<HTMLDivElement>(null),leakRef=useRef<HTMLDivElement>(null);
  const coordRef=useRef<HTMLDivElement>(null),statusRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(prefersReduced()){setVisible(false);setTimeout(onComplete,50);return;}
    let killed=false;

    import('gsap').then(({gsap})=>{
      if(killed)return;
      const R=2*Math.PI*22;

      const tl=gsap.timeline({defaults:{ease:'power2.out'},onComplete:()=>{if(!killed){setVisible(false);setTimeout(onComplete,80);}}});

      // Scan helper: animates a proxy object then calls setState
      const animateScan=(startY:string,endY:string,duration:number,at:string,finalOp=0)=>{
        const proxy={y:parseFloat(startY)};
        tl.set({},{onComplete:()=>{if(!killed)setScanStyle({top:startY,opacity:0.65});}},at);
        tl.to(proxy,{y:parseFloat(endY),duration,ease:'none',
          onUpdate:()=>{if(!killed)setScanStyle(s=>({...s,top:`${proxy.y}%`}));},
          onComplete:()=>{if(!killed)setScanStyle(s=>({...s,opacity:finalOp}));},
        },at);
      };

      /* 0.40 scan1 top→bottom */
      tl.addLabel('scan1',0.4);
      animateScan('-5%','105%',1.5,'scan1');
      tl.call(()=>{if(!killed)setScanStyle(s=>({...s,opacity:0}));},[],'>-0.2');

      /* 1.20 particles appear */
      tl.addLabel('appear',1.2);
      tl.to(brightnessRef,{current:0.35,duration:0.15},'appear');
      tl.to(brightnessRef,{current:0,duration:0.55},'appear+=0.15');
      tl.to(fogRef,{current:0.65,duration:1.1},'appear');
      tl.to(camZRef,{current:42,duration:2.4,ease:'power1.inOut'},'appear');

      /* 1.80 drift + scan2 bottom→top */
      tl.addLabel('drift',1.8);
      animateScan('108%','-8%',1.3,'drift+=0.1');
      tl.call(()=>{if(!killed)setScanStyle(s=>({...s,opacity:0}));},[],'>-0.15');

      /* 2.60 detection */
      tl.addLabel('detect',2.6);
      if(hudRef.current)tl.fromTo(hudRef.current,{opacity:0},{opacity:1,duration:0.35},'detect');
      if(bTLRef.current)tl.fromTo(bTLRef.current,{clipPath:'inset(50% 50% 50% 50%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:0.4,ease:'power3.out'},'detect');
      if(bTRRef.current)tl.fromTo(bTRRef.current,{clipPath:'inset(50% 50% 50% 50%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:0.4,ease:'power3.out'},'detect+=0.06');
      if(bBLRef.current)tl.fromTo(bBLRef.current,{clipPath:'inset(50% 50% 50% 50%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:0.4,ease:'power3.out'},'detect+=0.12');
      if(bBRRef.current)tl.fromTo(bBRRef.current,{clipPath:'inset(50% 50% 50% 50%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:0.4,ease:'power3.out'},'detect+=0.18');
      if(arcRef.current)tl.fromTo(arcRef.current,{strokeDashoffset:R},{strokeDashoffset:0,duration:0.46,ease:'power3.out'},'detect+=0.1');

      /* 3.00 GRID SNAP */
      tl.addLabel('snap',3.0);
      tl.to(camZRef,{current:14,duration:0.36,ease:'power4.inOut'},'snap');
      if(snapFlashRef.current){
        tl.fromTo(snapFlashRef.current,{opacity:0},{opacity:0.6,duration:0.04},'snap');
        tl.to(snapFlashRef.current,{opacity:0,duration:0.38,ease:'power3.out'},'snap+=0.04');
      }
      tl.to(latticeRef,{current:1,duration:0.04,ease:'none'},'snap');
      tl.to(brightnessRef,{current:1,duration:0.04,ease:'none'},'snap');
      tl.to(brightnessRef,{current:0,duration:0.42,ease:'power3.out'},'snap+=0.04');
      if(arcRef.current){tl.to(arcRef.current,{strokeWidth:2.8,duration:0.05},'snap');tl.to(arcRef.current,{strokeWidth:1.5,opacity:0,duration:0.38},'snap+=0.05');}

      /* 3.40 collapse */
      tl.addLabel('collapse',3.4);
      tl.to(collapseRef,{current:1,duration:0.4,ease:'power4.in'},'collapse');
      tl.to(pulseRef,{current:0.65,duration:0.08},'collapse+=0.14');
      tl.to(pulseRef,{current:0,duration:0.22},'collapse+=0.22');

      /* 3.80 eruption */
      tl.addLabel('erupt',3.8);
      if(novaRef.current)tl.fromTo(novaRef.current,{scale:0,opacity:0.9},{scale:3.5,opacity:0,duration:0.52,ease:'power2.out'},'erupt');
      tl.to(pulseRef,{current:1.0,duration:0.07},'erupt');
      tl.to(pulseRef,{current:0,duration:0.35,ease:'power3.out'},'erupt+=0.07');
      tl.to(morphRef,{current:1,duration:0.52,ease:'power3.out'},'erupt+=0.04');
      tl.to(fogRef,{current:0,duration:0.75,ease:'power2.out'},'erupt');
      tl.to(lineOpRef,{current:1,duration:0.5,ease:'power2.out'},'erupt+=0.1');
      tl.fromTo(ringRRef,{current:0},{current:10,duration:0.82,ease:'power2.out'},'erupt+=0.06');
      tl.fromTo(ringORef,{current:0.88},{current:0,duration:0.82,ease:'power2.out'},'erupt+=0.06');
      if(coordRef.current)tl.fromTo(coordRef.current,{opacity:0,y:-5},{opacity:1,y:0,duration:0.3},'erupt+=0.42');
      if(statusRef.current)tl.fromTo(statusRef.current,{opacity:0,y:5},{opacity:1,y:0,duration:0.3},'erupt+=0.48');
      tl.to(camZRef,{current:11.5,duration:0.85,ease:'power2.out'},'erupt+=0.1');

      /* 4.20 IDENTIFIED */
      tl.addLabel('id',4.2);
      tl.call(()=>{if(!killed)setIdentified(true);},[],  'id');
      tl.call(()=>{if(!killed)setIdentified(false);},[],  'id+=0.62');

      /* 4.80 NAME */
      tl.addLabel('reveal',4.8);
      if(nameRef.current)tl.fromTo(nameRef.current,{opacity:0},{opacity:1,duration:0.06},'reveal');
      tl.call(()=>{if(!killed)setGlitchOn(true);},[],  'reveal');
      tl.to(glitchRef,{current:0.55,duration:0.12,ease:'none'},'reveal');
      tl.to(glitchRef,{current:0,duration:0.48,ease:'power2.out'},'reveal+=0.12');
      if(roleRef.current)tl.fromTo(roleRef.current,{opacity:0},{opacity:1,duration:0.3},'reveal+=0.28');
      tl.to({},{duration:0.6},'reveal+=1.0');

      /* 6.40 farewell scan */
      tl.addLabel('farewell',6.4);
      animateScan('-5%','105%',0.65,'farewell+=0.05');
      tl.call(()=>{if(!killed)setScanStyle(s=>({...s,opacity:0}));},[],'>-0.12');
      if(hudRef.current)tl.to(hudRef.current,{opacity:0,duration:0.32},'farewell+=0.12');
      tl.to([nameRef.current,roleRef.current,coordRef.current,statusRef.current].filter(Boolean),{opacity:0,duration:0.22,ease:'power2.in'},'farewell+=0.06');
      if(leakRef.current)tl.fromTo(leakRef.current,{opacity:0},{opacity:0.42,duration:0.08,yoyo:true,repeat:1,ease:'none'},'farewell+=0.52');

      /* 7.00 IRIS */
      tl.addLabel('iris',7.0);
      tl.call(()=>{if(!killed)setIrisOpen(true);},[],  'iris');
      tl.to(camZRef,{current:10,duration:0.62,ease:'power2.out'},'iris+=0.08');
      tl.to({},{duration:0.12},'iris+=0.8');
    });

    return ()=>{killed=true;};
  },[onComplete]);

  if(!visible)return null;
  const R=2*Math.PI*22;

  return (
    <div style={{position:'fixed',inset:0,zIndex:300,overflow:'hidden',pointerEvents:'none',background:'#01010a'}}>
      <div style={{position:'absolute',inset:0,zIndex:0}}>
        <SceneCanvas camZRef={camZRef} pulseRef={pulseRef} fogRef={fogRef} glitchRef={glitchRef}
          brightnessRef={brightnessRef} latticeRef={latticeRef} collapseRef={collapseRef} morphRef={morphRef}
          lineOpRef={lineOpRef} ringRRef={ringRRef} ringORef={ringORef} />
      </div>

      {/* Vignette */}
      <div style={{position:'absolute',inset:0,zIndex:1,background:'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 12%, rgba(1,1,10,0.80) 100%)',pointerEvents:'none'}} />

      {/* CSS Scan Line */}
      <div style={{position:'absolute',left:0,right:0,zIndex:6,...scanStyle,height:'2px',background:'linear-gradient(90deg, transparent 4%, rgba(129,140,248,0.55) 18%, rgba(165,180,252,0.72) 50%, rgba(129,140,248,0.55) 82%, transparent 96%)',boxShadow:'0 0 14px rgba(99,102,241,0.45)',pointerEvents:'none',transition:'opacity 0.15s'}} />

      {/* Snap flash */}
      <div ref={snapFlashRef} style={{position:'absolute',inset:0,zIndex:5,background:'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(165,180,252,0.35) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)',opacity:0,pointerEvents:'none'}} />

      {/* Light leak */}
      <div ref={leakRef} style={{position:'absolute',inset:0,zIndex:3,background:'radial-gradient(ellipse 42% 26% at 50% 50%, rgba(255,255,255,0.12), rgba(99,102,241,0.07) 38%, transparent 65%)',opacity:0,pointerEvents:'none'}} />

      {/* Nova bloom */}
      <div ref={novaRef} style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%) scale(0)',width:'100vmax',height:'100vmax',borderRadius:'50%',background:'radial-gradient(circle, rgba(165,180,252,0.92) 0%, rgba(99,102,241,0.32) 18%, rgba(6,182,212,0.1) 42%, transparent 62%)',zIndex:4,opacity:0,pointerEvents:'none'}} />

      {/* Arc */}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:8,width:56,height:56,pointerEvents:'none'}}>
        <svg width="56" height="56" style={{transform:'rotate(-90deg)',overflow:'visible'}}>
          <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.022)" strokeWidth="1" />
          <circle ref={arcRef} cx="28" cy="28" r="22" fill="none" stroke="url(#arcGV12)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={R} strokeDashoffset={R} />
          <defs><linearGradient id="arcGV12" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient></defs>
        </svg>
      </div>

      {/* HUD */}
      <div ref={hudRef} style={{position:'absolute',inset:0,zIndex:9,opacity:0,pointerEvents:'none'}}>
        <div ref={bTLRef} style={{position:'absolute',top:22,left:22,width:48,height:48,borderTop:'1px solid rgba(99,102,241,0.48)',borderLeft:'1px solid rgba(99,102,241,0.48)',clipPath:'inset(50% 50% 50% 50%)'}} />
        <div ref={bTRRef} style={{position:'absolute',top:22,right:22,width:48,height:48,borderTop:'1px solid rgba(99,102,241,0.48)',borderRight:'1px solid rgba(99,102,241,0.48)',clipPath:'inset(50% 50% 50% 50%)'}} />
        <div ref={bBLRef} style={{position:'absolute',bottom:22,left:22,width:48,height:48,borderBottom:'1px solid rgba(99,102,241,0.48)',borderLeft:'1px solid rgba(99,102,241,0.48)',clipPath:'inset(50% 50% 50% 50%)'}} />
        <div ref={bBRRef} style={{position:'absolute',bottom:22,right:22,width:48,height:48,borderBottom:'1px solid rgba(99,102,241,0.48)',borderRight:'1px solid rgba(99,102,241,0.48)',clipPath:'inset(50% 50% 50% 50%)'}} />
        <div ref={coordRef} style={{position:'absolute',top:34,right:80,fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'rgba(99,102,241,0.40)',letterSpacing:'0.16em',textAlign:'right',lineHeight:1.9,opacity:0}}>
          <div>MUMBAI · INDIA</div><div style={{color:'rgba(255,255,255,0.14)'}}>19.0760° N  72.8777° E</div>
        </div>
        <div ref={statusRef} style={{position:'absolute',bottom:34,left:80,fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'rgba(6,182,212,0.40)',letterSpacing:'0.16em',lineHeight:1.9,opacity:0}}>
          <div>CONVERGENCE v12.0</div><div style={{color:'rgba(255,255,255,0.14)'}}>SIGNAL LOCKED</div>
        </div>
      </div>

      <IdentifiedText show={identified} />

      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:16,pointerEvents:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:18,width:'max-content'}}>
        <div ref={nameRef} style={{fontFamily:'Syne, sans-serif',fontWeight:800,fontSize:'clamp(2.5rem,5.2vw,5rem)',lineHeight:1,whiteSpace:'nowrap',userSelect:'none',opacity:0}}>
          <GlitchName trigger={glitchOn} />
        </div>
        <div ref={roleRef} style={{fontFamily:'JetBrains Mono, monospace',fontSize:'clamp(7px,0.78vw,10px)',letterSpacing:'0.32em',color:'rgba(255,255,255,0.22)',textTransform:'uppercase',opacity:0,userSelect:'none',whiteSpace:'nowrap'}}>
          ML ENGINEER · AI DEVELOPER · FULL STACK
        </div>
      </div>

      {Array.from({length:12},(_,i)=>(
        <IrisPanel key={i} index={i} total={12} open={irisOpen} />
      ))}
    </div>
  );
}
