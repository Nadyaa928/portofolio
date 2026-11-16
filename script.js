import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// Navigasi untuk tampilan mobile
const menuToggle = document.querySelector("#menuToggle");
const navigation = document.querySelector("#navigation");

const closeMenu = () => {
  navigation.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
    closeMenu();
  }
});

window.matchMedia("(min-width: 781px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

// Membuat objek 3D pastel dengan Three.js
const container = document.querySelector("#three-scene");

if (container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#fffafc");

  const camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Pencahayaan lembut
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  // Bola-bola pastel
  const objects = [];
  const sphereGeometry = new THREE.SphereGeometry(0.72, 48, 48);
  const sphereColors = ["#e9aec2", "#cfc2ed", "#f4c9ad", "#b9d9cc"];

  sphereColors.forEach((color, index) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.32,
      metalness: 0.03
    });
    const sphere = new THREE.Mesh(sphereGeometry, material);
    const positions = [
      [-1.25, 0.35, 0],
      [1.2, 0.55, -0.3],
      [0.75, -1.0, 0.4],
      [-1.15, -1.05, -0.5]
    ];
    sphere.position.set(...positions[index]);
    sphere.scale.setScalar(index === 0 ? 1 : 0.62);
    sphere.userData.floatOffset = index * 1.4;
    objects.push(sphere);
    scene.add(sphere);
  });

  // Bintang kecil berbentuk octahedron
  const starGeometry = new THREE.OctahedronGeometry(0.22, 0);
  const starMaterial = new THREE.MeshStandardMaterial({
    color: "#e7bd83",
    roughness: 0.4,
    metalness: 0.1
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.set(0.05, 1.25, 0.2);
  scene.add(star);

  // Cincin dekoratif
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.018, 8, 100),
    new THREE.MeshBasicMaterial({ color: "#ead7e1" })
  );
  ring.rotation.x = 0.35;
  ring.rotation.y = -0.3;
  scene.add(ring);

  let pointerX = 0;
  let pointerY = 0;

  container.addEventListener("pointermove", (event) => {
    const rect = container.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.35;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.25;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    objects.forEach((object) => {
      object.position.y += Math.sin(time + object.userData.floatOffset) * 0.0018;
      object.rotation.y += 0.003;
      object.rotation.x += 0.0015;
    });

    star.rotation.x += 0.008;
    star.rotation.y += 0.01;
    ring.rotation.z = Math.sin(time * 0.35) * 0.12;

    scene.rotation.y += (pointerX - scene.rotation.y) * 0.025;
    scene.rotation.x += (-pointerY - scene.rotation.x) * 0.025;

    renderer.render(scene, camera);
  }

  animate();

  // Sesuaikan ukuran canvas saat ukuran layar berubah
  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  resizeObserver.observe(container);
}
