"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads the reduced-motion preference as an external store instead of
 * mirroring it into state from an effect, so the very first client render
 * already reflects the real preference instead of claiming "motion is fine"
 * for one tick and then correcting itself. Duplicated from
 * src/components/motion/scroll-reveal.tsx (not exported there) rather than
 * imported, since that file is owned by another in-flight change.
 *
 * getServerSnapshot returns false: the server has no media queries, and
 * because the component below never touches window/document during render
 * (only inside useEffect, which never runs on the server), the SSR markup
 * and the first client render before hydration effects fire are identical.
 */
function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * The document rendered inside the sandboxed iframe. Sourced verbatim from
 * the vendor registry (github.com/MengTo/threeui,
 * src/shaders/neuform-isolated/sources/topo-field.html — the file backing
 * the 21st.dev/r/mengto/topo-field registry entry this component installs),
 * with three deliberate edits:
 *
 *   1. The two `vec3(1.0)` line-color multipliers in the fragment shader
 *      (grid + contour lines) are replaced with a hard-coded brand green,
 *      vec3(0.290, 0.871, 0.502) — the 0-1 normalization of --neon-rgb
 *      (74 222 128, dark theme) from src/app/globals.css. This is done in
 *      the GLSL source itself, NOT via a CSS hue-rotate/saturate filter on
 *      the iframe: the vendor shader draws pure achromatic white
 *      (R === G === B), and the standard CSS/SVG hue-rotate matrix is
 *      defined to leave the achromatic axis fixed — R=G=B pixels are a
 *      literal no-op under hue-rotate() and saturate() by construction, not
 *      by browser quirk. Shipping "brand defaults" through those filter
 *      props would have been a dead knob that silently did nothing, so the
 *      tint is baked into the shader instead, which is the same technique
 *      the vendor's own file uses for its light-mode variant.
 *   2. The document background (both the inline body style and the iframe's
 *      own box background set by the component below) is changed from pure
 *      #000 to #080d12 — this project's --bg-main dark-theme token — so the
 *      iframe doesn't paint a visibly blacker rectangle against the app's
 *      near-black (not pure-black) ground. The literal hex is hard-coded
 *      here rather than referencing var(--bg-main): srcDoc creates a
 *      separate document with its own CSSOM, so the parent page's custom
 *      properties do not cross the iframe boundary.
 *   3. A short runtime script hides the <main> demo hero/nav/feature-card
 *      chrome that ships in the same file, leaving only the WebGL
 *      background container (#topo-canvas plus its two vignette overlay
 *      divs) visible — mirroring the vendor's own "isolate at runtime"
 *      technique rather than hand-stripping their markup.
 *
 * The four CDN scripts (Tailwind, Iconify, GSAP, ScrollTrigger) are kept
 * exactly as shipped — client-approved, not ours to remove. Only the last
 * <script> in <body> (plain WebGL, no dependencies) draws the visible
 * effect; Tailwind classes size the background container, and Iconify/GSAP
 * exist solely for the now-hidden demo chrome.
 */
const TOPO_FIELD_SRC_DOC = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexusNode Infrastructure</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <!-- GSAP & ScrollTrigger for Masked Reveal -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
</head>
<body class="bg-black text-white font-sans min-h-screen relative overflow-x-hidden selection:bg-white/20 selection:text-white font-light" style="background-color: #080d12; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

    <!-- WebGL Background Container -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <canvas id="topo-canvas" class="w-full h-full"></canvas>
        <!-- Gradient overlay to fade bottom and top for text readability -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-90 z-10"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-20 flex flex-col min-h-screen">
        
        <!-- Navigation -->
        <header class="container mx-auto px-6 py-6 flex items-center justify-between reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out">
            <div class="flex items-center gap-2 text-white hover:text-neutral-300 transition-colors cursor-pointer">
                <iconify-icon icon="solar:radar-linear" width="24"></iconify-icon>
                <span class="font-light text-sm tracking-tight">NexusNode</span>
            </div>
            <nav class="hidden md:flex items-center gap-8 text-sm text-neutral-400 font-extralight">
                <a href="#" class="hover:text-white transition-colors">Compute Clusters</a>
                <a href="#" class="hover:text-white transition-colors">Observability</a>
                <a href="#" class="hover:text-white transition-colors">Throughput</a>
                <a href="#" class="hover:text-white transition-colors">Consensus</a>
            </nav>
            <div class="flex items-center gap-4">
                <a href="#" class="hidden md:block text-sm text-neutral-400 font-extralight hover:text-white transition-colors">Sign In</a>
                <button class="bg-white text-black px-4 py-2 rounded-full text-sm font-light hover:bg-neutral-200 transition-colors">
                    Get Started
                </button>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="flex-grow flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
            <div class="max-w-4xl mx-auto flex flex-col items-center">
                
                <!-- Pill Badge -->
                <div class="reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                    <span class="flex h-2 w-2 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span class="text-xs font-extralight text-neutral-300 tracking-wide uppercase">Nexus OS v4.2 deployment ready</span>
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="14" class="text-neutral-500"></iconify-icon>
                </div>

                <h1 class="mask-container text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.1]">
                    <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Orchestrate</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">the</span></span>
                    <br class="hidden md:block" />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600 font-extralight inline-block">
                        <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">neural</span></span>
                        <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">compute</span></span>
                        <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">fabric.</span></span>
                    </span>
                </h1>
                
                <p class="mask-container mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed font-extralight">
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Provision</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">ultra-low</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">latency</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">inference</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">nodes</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">with</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">zero</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">configuration.</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Enterprise-grade</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">AI</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">infrastructure</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">built</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">for</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">real-time</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">model</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">serving.</span></span>
                </p>
                
                <div class="reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-300 mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button class="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-light hover:bg-neutral-200 transition-colors group">
                        Launch Workspace
                        <iconify-icon icon="solar:transfer-horizontal-linear" width="18" class="group-hover:translate-x-0.5 transition-transform"></iconify-icon>
                    </button>
                    <button class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-light text-white border border-white/20 hover:bg-white/5 transition-colors">
                        View Documentation
                    </button>
                </div>
            </div>
        </section>

        <!-- Features Matrix with Subtler Gradient Borders -->
        <section class="container mx-auto px-6 py-24 pb-32">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-300">
                
                <!-- Feature Card 1 -->
                <div class="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 overflow-hidden shadow-2xl shadow-white/5">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative h-full bg-[#050505] rounded-[15px] p-8 flex flex-col gap-4 z-10">
                        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2">
                            <iconify-icon icon="solar:scanner-linear" width="20"></iconify-icon>
                        </div>
                        <h3 class="mask-container text-xl font-light tracking-tight text-white">
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Homomorphic</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Encryption</span></span>
                        </h3>
                        <p class="text-sm text-neutral-400 font-extralight leading-relaxed">Cryptographic isolation guaranteeing absolute data privacy during active model inference across edge nodes.</p>
                    </div>
                </div>

                <!-- Feature Card 2 -->
                <div class="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 overflow-hidden shadow-2xl shadow-white/5">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative h-full bg-[#050505] rounded-[15px] p-8 flex flex-col gap-4 z-10">
                        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2">
                            <iconify-icon icon="solar:cpu-bolt-linear" width="20"></iconify-icon>
                        </div>
                        <h3 class="mask-container text-xl font-light tracking-tight text-white">
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Serverless</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">GPUs</span></span>
                        </h3>
                        <p class="text-sm text-neutral-400 font-extralight leading-relaxed">On-demand distributed compute layers. Elastic scaling powered by decentralized tensor processing units.</p>
                    </div>
                </div>

                <!-- Feature Card 3 -->
                <div class="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 overflow-hidden shadow-2xl shadow-white/5">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative h-full bg-[#050505] rounded-[15px] p-8 flex flex-col gap-4 z-10">
                        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2">
                            <iconify-icon icon="solar:server-square-linear" width="20"></iconify-icon>
                        </div>
                        <h3 class="mask-container text-xl font-light tracking-tight text-white">
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Global</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">State</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Sync</span></span>
                        </h3>
                        <p class="text-sm text-neutral-400 font-extralight leading-relaxed">Distributed vector database integration. Access and mutate embedding states with sub-millisecond precision.</p>
                    </div>
                </div>

            </div>
        </section>

    </main>

    <!-- Interactions & WebGL Implementation -->
    <script>
        // Native Reveal Animations Trigger
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.remove('opacity-0', 'translate-y-4');
            });
        }, 100);

        // GSAP Masked Reveal Implementation
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll('.mask-container').forEach(container => {
            const words = container.querySelectorAll('.mask-word');
            gsap.to(words, {
                scrollTrigger: {
                    trigger: container,
                    start: "top 95%",
                },
                y: "0%",
                opacity: 1,
                duration: 1.1,
                stagger: 0.05,
                ease: "power4.out",
                delay: 0.1
            });
        });

        // WebGL Topography
        const canvas = document.getElementById('topo-canvas');
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });

        if (gl) {
            const vsSource = \`
                attribute vec2 a_position;
                void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
            \`;

            const fsSource = \`
                precision highp float;
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform float u_dpr;

                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                    i = mod(i, 289.0);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m; m = m*m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                    vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }

                void main() {
                    vec2 st = gl_FragCoord.xy / u_resolution.xy;
                    st.x *= u_resolution.x / u_resolution.y;

                    // 1px physical grid rendering
                    float gridSize = 48.0 * u_dpr;
                    vec2 gridSt = gl_FragCoord.xy / gridSize;
                    vec2 gridFract = fract(gridSt);
                    float lineThickness = 1.0 / gridSize;
                    float gridLines = step(1.0 - lineThickness, gridFract.x) + step(1.0 - lineThickness, gridFract.y);
                    gridLines = clamp(gridLines, 0.0, 1.0) * 0.12; 

                    // Ultra-thin Topographic Lines
                    float noiseScale = 1.4;
                    vec2 noisePos = st * noiseScale + vec2(u_time * 0.015, u_time * 0.025);
                    float n = snoise(noisePos) * 0.5 + 0.5;
                    float numBands = 10.0;
                    float bandVal = n * numBands;
                    float triangleWave = abs(fract(bandVal) - 0.5) * 2.0; 
                    
                    // Thinner smoothstep constraint for fine industrial aesthetic
                    float topoLines = smoothstep(0.02, 0.00, triangleWave) * 0.45;

                    // HardTech brand green, not vendor white — --neon-rgb (dark theme), src/app/globals.css.
                    vec3 lineColor = vec3(0.290, 0.871, 0.502);
                    vec3 color = vec3(0.0);
                    color += lineColor * gridLines;
                    color += lineColor * topoLines;

                    gl_FragColor = vec4(color, 1.0);
                }
            \`;

            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                return shader;
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            const timeLocation = gl.getUniformLocation(program, "u_time");
            const dprLocation = gl.getUniformLocation(program, "u_dpr");

            function resizeCanvas() {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
                gl.uniform1f(dprLocation, dpr);
            }

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            let startTime = performance.now();
            function render(time) {
                gl.uniform1f(timeLocation, (time - startTime) * 0.001);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        }
    </script>

    <!-- Hides the demo hero/nav/feature-card chrome shipped in this document,
         leaving only the WebGL background container (#topo-canvas + its two
         vignette overlays) visible. Matches the vendor registry (threeui.com)
         technique of hiding at runtime rather than stripping their markup. -->
    <script>
      (function () {
        var demo = document.querySelector("main");
        if (demo) demo.style.display = "none";
      })();
    </script>
</body>
</html>`;

export type TopoFieldProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Animated topographic contour + grid WebGL background, isolated inside a
 * sandboxed iframe (srcDoc) per the vendor's own technique. Full-bleed —
 * size it with className/style the way the vendor demo does
 * (`className="absolute inset-0"`).
 *
 * Two mobile-safety guards sit on top of the supplied component, because
 * this product's traffic is majority phones, many mid-range Android, and a
 * permanently-running fullscreen WebGL requestAnimationFrame loop behind
 * every page is a real battery/thermal cost — doubly so since each instance
 * is a whole extra document (4 CDN scripts, a full GSAP/ScrollTrigger init,
 * a WebGL context), not just a canvas:
 *
 *   - prefers-reduced-motion: reduce never mounts the iframe at all. Per
 *     this project's motion rule (src/app/globals.css), the base state must
 *     be the final visible state and motion is strictly additive — so
 *     reduced motion renders a static, token-colored surface instead of a
 *     slowed-down version of the same loop, and instead of blank space.
 *   - An IntersectionObserver mounts the iframe only while the component is
 *     actually on screen and unmounts it (tearing down the WebGL context
 *     and the rAF loop with it) as soon as it scrolls out of view, not just
 *     on first reveal — a background the user has scrolled past should not
 *     keep costing battery.
 */
export function TopoField({ className, style }: TopoFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion never mounts the iframe (see the component doc above),
    // so there is nothing to observe — skip creating the observer entirely
    // rather than create-then-immediately-ignore it.
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const shouldRenderIframe = !reducedMotion && isOnScreen;

  return (
    <div ref={containerRef} className={className} style={style}>
      {shouldRenderIframe ? (
        <iframe
          title="Animated topographic contour background"
          srcDoc={TOPO_FIELD_SRC_DOC}
          // No allow-same-origin: the shader and its CDN scripts need
          // nothing from the parent document or its cookies/storage.
          sandbox="allow-scripts"
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
            // Same #080d12 (--bg-main, dark) as the patched inline body
            // style inside the iframe document — see the srcDoc doc comment,
            // point 2, for why this can't be var(--bg-main) instead. Covers
            // the box before/if the iframe document paints.
            backgroundColor: "#080d12",
          }}
        />
      ) : (
        // Reduced motion, or simply not on screen yet/anymore: render the
        // same near-black brand surface with no animation at all, so there
        // is never a blank rectangle and never motion for someone who opted
        // out of it.
        <div
          aria-hidden="true"
          style={{ width: "100%", height: "100%", backgroundColor: "#080d12" }}
        />
      )}
    </div>
  );
}
