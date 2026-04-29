import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const CAR_MODEL_URL = "https://threejs.org/examples/models/gltf/ferrari.glb";
const HDR_URL =
  "https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr";

export default function Login() {
  const mountRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sceneReady, setSceneReady] = useState(false);

  // Inject Libre Baskerville font only for this page
  useEffect(() => {
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    preconnect1.id = "libre-preconnect-1";
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    preconnect2.id = "libre-preconnect-2";
    document.head.appendChild(preconnect2);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap";
    link.id = "libre-baskerville-font";
    document.head.appendChild(link);

    return () => {
      [
        "libre-preconnect-1",
        "libre-preconnect-2",
        "libre-baskerville-font",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    //Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    //Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    camera.position.set(4.25, 1.4, -4.5);
    camera.lookAt(2.5, 0.5, 0);

    //Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe8185d, 2.5);
    dirLight.position.set(-5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x6688cc, 0.8);
    fillLight.position.set(5, 2, -5);
    scene.add(fillLight);

    //Floor / shadow catcher
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle grid
    const grid = new THREE.GridHelper(20, 40, 0xe8185d, 0x1a1b1e);
    grid.material.opacity = 0.18;
    grid.material.transparent = true;
    scene.add(grid);

    //HDR Environment
    let car = null;
    let mixer = null;
    let wheels = [];

    new RGBELoader().load(HDR_URL, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      // No background stays transparent so CSS bg shows

      //Load car model
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(
        "https://threejs.org/examples/jsm/libs/draco/gltf/",
      );

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      gltfLoader.load(CAR_MODEL_URL, (gltf) => {
        car = gltf.scene;

        // Collect wheels by name convention from the Ferrari model
        wheels = [];
        car.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          // Ferrari model uses these names for wheels
          if (
            child.name === "wheel_fl" ||
            child.name === "wheel_fr" ||
            child.name === "wheel_rl" ||
            child.name === "wheel_rr"
          ) {
            wheels.push(child);
          }
        });

        car.position.set(2.5, 0, 0); // shift car right in world space
        scene.add(car);
        setSceneReady(true);
      });
    });

    // Animate
    let animId;
    const clock = new THREE.Clock();
    let time = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Gentle camera orbit
      if (car) {
        camera.position.x = Math.sin(time * 0.18) * 5.5 + 2.5;
        camera.position.z = Math.cos(time * 0.18) * 5.5;
        camera.position.y = 1.4 + Math.sin(time * 0.08) * 0.2;
        camera.lookAt(2.5, 0.5, 0);

        // Spin wheels
        wheels.forEach((w) => {
          w.rotation.x -= delta * 2;
        });
      }

      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    }
    animate();

    //Resize
    function onResize() {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Three.js canvas fills the whole right half */}
      <div ref={mountRef} style={styles.canvas} />

      {/* Logo floated over the canvas, top-center */}
      <div style={styles.logoOverlay}>
        <span style={styles.logoText}>FleetFactory</span>
      </div>

      {/* Gradient overlay bridging left panel into canvas */}
      <div style={styles.fadeOverlay} />

      {/* Left panel — login form */}
      <div style={styles.panel}>
        <div style={styles.headingGroup}>
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.sub}>Sign in to your account</p>
        </div>

        {!sceneReady && <p style={styles.loadingCar}>Loading 3D scene...</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.btn, opacity: 0.6 } : styles.btn}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          FleetFactory &mdash; &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

//Inline styles
const styles = {
  page: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    background: "var(--bg-base)",
    display: "flex",
    overflow: "hidden",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  fadeOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "55%",
    height: "100%",
    background:
      "linear-gradient(to left, var(--bg-base) 55%, transparent 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  panel: {
    position: "relative",
    zIndex: 2,
    width: "420px",
    minWidth: "340px",
    height: "100%",
    padding: "56px 48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "28px",
    marginLeft: "auto",
    paddingTop: "30vh" /* sits at roughly vertical center */,
  },
  logoOverlay: {
    position: "absolute",
    top: "36px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 3,
    pointerEvents: "none",
  },
  logoText: {
    fontFamily: "'Libre Baskerville', serif",
    fontWeight: 400,
    fontSize: "22px",
    color: "var(--text-primary)",
    textShadow: "0 0 30px rgba(232,24,93,0.5), 0 2px 12px rgba(0,0,0,0.8)",
  },
  headingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  heading: {
    fontFamily: "'Libre Baskerville', serif",
    fontWeight: 400,
    fontSize: "32px",
    color: "var(--text-primary)",
    lineHeight: 1.2,
  },
  sub: {
    fontSize: "14px",
    fontFamily: "'Libre Baskerville', serif",
    fontWeight: 100,
    color: "var(--text-secondary)",
  },
  loadingCar: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontStyle: "italic",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 400,
    fontFamily: "'Libre Baskerville', serif",
    color: "var(--text-secondary)",
  },
  input: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-body)",
    width: "100%",
  },
  inputFocus: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--accent)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    boxShadow: "0 0 0 3px var(--accent-muted)",
    fontFamily: "var(--font-body)",
    width: "100%",
  },
  error: {
    background: "rgba(232,24,93,0.1)",
    border: "1px solid var(--accent-border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#ff6b9d",
  },
  btn: {
    background: "var(--accent)",
    color: "#fff",
    fontFamily: "'Libre Baskerville', serif",
    fontWeight: 400,
    fontSize: "15px",
    padding: "13px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s, box-shadow 0.2s",
    boxShadow: "0 0 18px rgba(232,24,93,0.35)",
    marginTop: "4px",
  },
  footer: {
    fontFamily: "'Libre Baskerville', serif",
    fontWeight: 100,
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "auto",
  },
};
