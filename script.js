/**
 * ALPHA X | FUSION ENERGY
 * 3D Rotating Blue Bottle Hero & Interactive Platform
 */

/* ==========================================================================
   1. THREE.JS 3D ROTATING BLUE BOTTLE ENGINE
   ========================================================================== */
let scene, camera, renderer, canGroup, canBodyMesh, energyRing, particlesMesh;
let rimLight1, rimLight2, keyLight;
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

/**
 * Build full 360° wraparound texture from bottle-hero.jpeg
 * Seamlessly wraps Front Panel (Alpha X Fusion Vitality Burst) & Back Panel (Nutrition Audit, Ingredients & Barcode)
 */
function createHeroBottleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;

    // Match exact midnight dark-violet baseline color of bottle-hero.jpeg (#150a2d)
    ctx.fillStyle = '#150a2d';
    ctx.fillRect(0, 0, w, h);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    if (renderer && renderer.capabilities) {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }

    // Load full bottle artwork from bottle-hero.jpeg
    const img = new Image();
    img.src = 'bottle-hero.jpeg';

    const drawArtwork = () => {
        if (img.naturalWidth > 0) {
            ctx.fillStyle = '#150a2d';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            texture.needsUpdate = true;
        }
    };

    img.onload = drawArtwork;
    if (img.complete) {
        drawArtwork();
    }

    return texture;
}

/**
 * Initialize 3D Rotating Blue Bottle Scene
 */
function initThree() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const stage = document.getElementById('heroCanStage');
    const width = stage ? stage.clientWidth : 440;
    const height = stage ? stage.clientHeight : 440;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    // 2. High-Performance Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 3. Balanced Natural Studio Lighting (No over-exposure)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.60);
    scene.add(ambientLight);

    keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    rimLight1 = new THREE.PointLight(0x00d2ff, 1.2, 10);
    rimLight1.position.set(-3, 2, 2.5);
    scene.add(rimLight1);

    rimLight2 = new THREE.PointLight(0xa855f7, 0.8, 10);
    rimLight2.position.set(3, -2, 2);
    scene.add(rimLight2);

    // 4. Build 3D Can Model
    canGroup = new THREE.Group();

    const aluminumMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.85,
        roughness: 0.35
    });

    const radius = 0.90;
    const canH = 3.20;
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, canH, 64, 1, true);
    // Align Front Panel (Golden 'A' & Alpha X Fusion) directly towards camera at start
    cylinderGeo.rotateY(Math.PI * 0.516);

    const bodyMat = new THREE.MeshStandardMaterial({
        map: createHeroBottleTexture(),
        metalness: 0.18,
        roughness: 0.42
    });
    canBodyMesh = new THREE.Mesh(cylinderGeo, bodyMat);
    canGroup.add(canBodyMesh);

    // Neck & Rims
    const neckGeo = new THREE.CylinderGeometry(0.78, radius, 0.20, 64);
    const neckMesh = new THREE.Mesh(neckGeo, aluminumMaterial);
    neckMesh.position.y = canH / 2 + 0.10;
    canGroup.add(neckMesh);

    const rimGeo = new THREE.TorusGeometry(0.78, 0.04, 20, 64);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, aluminumMaterial);
    rimMesh.position.y = canH / 2 + 0.20;
    canGroup.add(rimMesh);

    const lidGeo = new THREE.CircleGeometry(0.76, 64);
    lidGeo.rotateX(-Math.PI / 2);
    const lidMesh = new THREE.Mesh(lidGeo, new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.95,
        roughness: 0.3
    }));
    lidMesh.position.y = canH / 2 + 0.18;
    canGroup.add(lidMesh);

    // 3D Pull Tab
    const tabGroup = new THREE.Group();
    const tabRingGeo = new THREE.TorusGeometry(0.16, 0.03, 16, 32);
    tabRingGeo.rotateX(Math.PI / 2);
    const tabRing = new THREE.Mesh(tabRingGeo, aluminumMaterial);

    const tabHandleGeo = new THREE.BoxGeometry(0.12, 0.02, 0.26);
    const tabHandle = new THREE.Mesh(tabHandleGeo, aluminumMaterial);
    tabHandle.position.z = 0.10;

    tabGroup.add(tabRing);
    tabGroup.add(tabHandle);
    tabGroup.position.set(0.12, canH / 2 + 0.21, 0);
    tabGroup.rotation.y = 0.25;
    canGroup.add(tabGroup);

    // Bottom Taper & Base
    const bottomTaperGeo = new THREE.CylinderGeometry(radius, 0.76, 0.18, 64);
    const bottomTaper = new THREE.Mesh(bottomTaperGeo, aluminumMaterial);
    bottomTaper.position.y = -canH / 2 - 0.09;
    canGroup.add(bottomTaper);

    const bottomRimGeo = new THREE.TorusGeometry(0.76, 0.035, 20, 64);
    bottomRimGeo.rotateX(Math.PI / 2);
    const bottomRim = new THREE.Mesh(bottomRimGeo, aluminumMaterial);
    bottomRim.position.y = -canH / 2 - 0.18;
    canGroup.add(bottomRim);

    // Glowing Ambient Energy Ring
    const ringGeo = new THREE.TorusGeometry(1.5, 0.018, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.35
    });
    energyRing = new THREE.Mesh(ringGeo, ringMat);
    energyRing.rotation.x = Math.PI / 2.3;
    canGroup.add(energyRing);

    // Initial orientation
    canGroup.position.set(0, 0, 0);
    canGroup.rotation.set(0.08, 0, 0.04);
    scene.add(canGroup);

    // 5. Floating Particles
    const pCount = 70;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
        pPositions[i] = (Math.random() - 0.5) * 8;
        pPositions[i + 1] = (Math.random() - 0.5) * 8;
        pPositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x00d2ff,
        size: 0.045,
        transparent: true,
        opacity: 0.5
    });
    particlesMesh = new THREE.Points(pGeo, pMat);
    scene.add(particlesMesh);

    // 6. Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    // 7. Start Animation Loop
    animate();
}

/**
 * Handle Resize
 */
function onWindowResize() {
    const stage = document.getElementById('heroCanStage');
    if (!stage || !renderer || !camera) return;

    const width = stage.clientWidth;
    const height = stage.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Mouse Parallax
 */
function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
}

/**
 * 3D Animation Loop: Smooth Continuous Blue Bottle Rotation
 */
let clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    if (canGroup) {
        // Continuous smooth 360 rotation of the blue bottle
        canGroup.rotation.y += 0.012;

        // Gentle floating bob
        canGroup.position.y = Math.sin(time * 1.5) * 0.08;

        // Subtle interactive mouse tilt
        canGroup.rotation.x = 0.08 + mouse.y * 0.12;
        canGroup.rotation.z = 0.04 + mouse.x * 0.10;
    }

    if (energyRing) {
        energyRing.rotation.z += 0.015;
    }

    if (particlesMesh) {
        particlesMesh.rotation.y = time * 0.02;
    }

    renderer.render(scene, camera);
}

/* ==========================================================================
   2. BLOG MODAL READER ENGINE
   ========================================================================== */
const BlogData = {
    1: {
        tag: "HEALTH & BIOCHEMISTRY",
        title: "How Alpha X Eliminates the Traditional Energy Drink Sugar Crash",
        readTime: "5 min read • By Alpha X Formulation Lab",
        image: "can-blue.png",
        content: `
            <p class="lead">Conventional energy drinks rely on brute force—flooding your bloodstream with 30g+ of refined sugars and synthetic stimulants that lead to an inevitable crash within 60 minutes.</p>
            
            <h4>1. The Biology of the Sugar Crash</h4>
            <p>High-sugar sodas cause rapid blood glucose spikes. In response, your pancreas surges insulin into the bloodstream, plunging your body into acute hypoglycemia. The result is brain fog, fatigue, and sudden cravings.</p>
            
            <h4>2. The 40% Less Sugar Plateau</h4>
            <p>Alpha X is formulated with only <strong>5.8g of low-glycemic cane sugar</strong> per 250ml can. This allows steady cellular ATP conversion over a 5-hour window without aggressive insulin spikes.</p>

            <h4>3. Vitamin B6 & B12 Co-Enzyme Synergy</h4>
            <p>Instead of overstimulating your nervous system with synthetic compounds, Alpha X provides 100% of your daily Vitamin B-complex needs to naturally accelerate cellular energy extraction from food.</p>
        `
    },
    2: {
        tag: "FLAVOR FORMULATION",
        title: "Inside the Signature Trilogy: Tropical Heat, Zen Botanika & Global Spice",
        readTime: "4 min read • By Flavor Chemistry Dept.",
        image: "WhatsApp Image 2026-09-08 at 8.13.17 PM.jpeg",
        content: `
            <p class="lead">Every flavor of Alpha X is calibrated for a specific functional state. We rejected generic artificial flavorings to create authentic botanical infusions.</p>

            <h4>Tropical Heat — Metabolic Ignition</h4>
            <p>Infused with real mango, pineapple juice, and a subtle trace of habanero lime zest. The micro-capsaicin compounds stimulate gentle thermogenesis, priming your body for physical workouts and stamina.</p>

            <h4>Zen Botanika — Cognitive Focus & Flow</h4>
            <p>Combining antioxidant-rich wild blueberries, calming French lavender extract, and white tea polyphenols. Ideal for study sessions, coding marathons, and creative work without caffeine jitters.</p>

            <h4>Global Spice — Rapid Electrolyte Recovery</h4>
            <p>Formulated with pure isotonic coconut water minerals and fragrant green cardamom to replenish potassium and magnesium post-exercise.</p>
        `
    },
    3: {
        tag: "SUSTAINABILITY",
        title: "100% Recyclable Aluminum: Why Alpha X Says Zero to Single-Use Plastic",
        readTime: "3 min read • By Eco Impact Team",
        image: "",
        content: `
            <p class="lead">Plastic bottles take up to 450 years to decompose in landfills. Alpha X is committed to 100% aluminum packaging from day one.</p>

            <h4>Infinite Recyclability</h4>
            <p>Aluminum is infinitely recyclable without loss of quality. In fact, nearly 75% of all aluminum ever produced is still in productive use today.</p>

            <h4>95% Energy Savings</h4>
            <p>Recycling aluminum cans saves 95% of the energy required to make new cans from raw bauxite. Plus, aluminum chills 40% faster than plastic, reducing refrigeration electricity.</p>
        `
    }
};

function openArticleModal(id) {
    const article = BlogData[id];
    if (!article) return;

    const modal = document.getElementById('articleModal');
    const tagEl = document.getElementById('modalTag');
    const bodyEl = document.getElementById('modalBody');

    tagEl.textContent = article.tag;
    bodyEl.innerHTML = `
        <h2 style="font-size: 1.45rem; margin-bottom: 0.5rem; color: #fff;">${article.title}</h2>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            <i class="fa-regular fa-clock"></i> ${article.readTime}
        </div>
        ${article.image ? `<img src="${article.image}" style="width: 100%; max-height: 220px; object-fit: contain; background: rgba(0,0,0,0.4); border-radius: 10px; margin-bottom: 1.25rem;" alt="Article Graphic">` : ''}
        <div class="article-text-content" style="color: var(--text-primary); line-height: 1.7; font-size: 0.95rem;">
            ${article.content}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/* ==========================================================================
   3. PRE-ORDER CHECKOUT MODAL & PRICING
   ========================================================================== */
function openOrderModal(productName) {
    const modal = document.getElementById('orderModal');
    const titleEl = document.getElementById('orderModalTitle');
    const selectEl = document.getElementById('orderProductSelect');

    if (productName) {
        titleEl.textContent = productName;
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].text.includes(productName) || selectEl.options[i].value.includes(productName)) {
                selectEl.selectedIndex = i;
                break;
            }
        }
    }
    updatePriceDisplay();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updatePriceDisplay() {
    const selectEl = document.getElementById('orderProductSelect');
    const totalEl = document.getElementById('orderTotalDisplay');
    const val = selectEl.value;

    if (val.includes('350')) {
        totalEl.textContent = 'PKR 350';
    } else if (val.includes('990')) {
        totalEl.textContent = 'PKR 990';
    } else if (val.includes('3,780')) {
        totalEl.textContent = 'PKR 3,780';
    }
}

function confirmOrder(event) {
    event.preventDefault();

    const name = document.getElementById('orderCustomerName').value;
    const phone = document.getElementById('orderCustomerPhone').value;
    const product = document.getElementById('orderProductSelect').value;
    const orderId = 'AX-' + Math.floor(100000 + Math.random() * 900000);

    alert(`🎉 Pre-Order Confirmed!\n\nOrder ID: ${orderId}\nCustomer: ${name}\nPhone: ${phone}\nPackage: ${product}\n\nOur team will WhatsApp you tracking details for Cash on Delivery. Thank you for going Alpha!`);

    closeOrderModal();
    event.target.reset();
}

/**
 * Smooth scroll helper
 */
function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile Navigation Menu Controls
function toggleMobileMenu(forceState) {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navBackdrop = document.getElementById('navBackdrop');

    if (!navToggle || !navLinks) return;

    const isActive = forceState !== undefined ? forceState : !navLinks.classList.contains('active');
    
    navToggle.classList.toggle('active', isActive);
    navLinks.classList.toggle('active', isActive);
    navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

    if (navBackdrop) {
        navBackdrop.classList.toggle('active', isActive);
    }
}

function closeMobileMenu() {
    toggleMobileMenu(false);
}

// Close modals & mobile menu on outside click
window.addEventListener('click', (e) => {
    const articleModal = document.getElementById('articleModal');
    const orderModal = document.getElementById('orderModal');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navBackdrop = document.getElementById('navBackdrop');

    if (e.target === articleModal) closeArticleModal();
    if (e.target === orderModal) closeOrderModal();
    if (e.target === navBackdrop) closeMobileMenu();

    // Close mobile menu if clicked outside navbar & menu
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// Close modals & mobile menu on Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeArticleModal();
        closeOrderModal();
        closeMobileMenu();
    }
});

// Close mobile menu on desktop resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 850) {
        closeMobileMenu();
    }
});

// Navbar scroll glass effect & ScrollSpy active links
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ScrollSpy to highlight active link
    const sections = document.querySelectorAll('main section[id]');
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);

        if (link && scrollPosition >= top && scrollPosition < top + height) {
            document.querySelectorAll('.nav-links .nav-item').forEach(el => el.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

/* ==========================================================================
   4. INITIALIZATION ON DOM READY
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initThree();

    // Bind Mobile Nav Toggle Button
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Bind Auto-Close on Nav Link Clicks
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
});
