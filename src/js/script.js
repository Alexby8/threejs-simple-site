import '../css/style.css'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollHeight: getScrollHeight()
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.scrollHeight = getScrollHeight()

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update mesh positions
    const sizesVariables = getPositionAndScaleBySizes()
    const position_x = sizesVariables[0]
    const scale = sizesVariables[1]

    mesh1.position.x = position_x
    mesh2.position.x = - position_x
    mesh3.position.x = position_x

    mesh1.scale.set(scale, scale, scale)
    mesh2.scale.set(scale, scale, scale)
    mesh3.scale.set(scale, scale, scale)
})

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
const particlesTexture = textureLoader.load('textures/particles/1.png')
gradientTexture.magFilter = THREE.NearestFilter

// Material
const material = new THREE.MeshToonMaterial({
    color: '#575bcb',
    gradientMap: gradientTexture
})

// Meshes
const objectsDistance = 4
const sectionMeshes = []

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
sectionMeshes.push(mesh1);

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
sectionMeshes.push(mesh2);

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)
sectionMeshes.push(mesh3);

mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

const sizesVariables = getPositionAndScaleBySizes()
const position_x = sizesVariables[0]
const scale = sizesVariables[1]

mesh1.position.x = position_x
mesh2.position.x = - position_x
mesh3.position.x = position_x

mesh1.scale.set(scale, scale, scale)
mesh2.scale.set(scale, scale, scale)
mesh3.scale.set(scale, scale, scale)

scene.add(mesh1, mesh2, mesh3);

/**
 * Particles
 */
const particlesCount = 2000
const particlesPositions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++){
    particlesPositions[i * 3 + 0] = (Math.random() - 0.5) * 10
    particlesPositions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * 3
    particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
    sizeAttenuation: true,
    size: 0.08,
    alphaMap: particlesTexture,
    transparent: true,
    depthWrite: false
})
particlesMaterial.color.setHSL(0.6, 0.5, 0.6)

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY

    // Section change
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection){
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                x: '+=6',
                y: '+=3',
            }
        )

        gsap.to(
            `.section-${currentSection} .content`, 
            {
                opacity: 1, 
                duration: 1, 
                ease: 'power3.in'
            }
        )
    }

    // Color change
    const particlesColorHue = (scrollY / (sizes.scrollHeight - sizes.height)) * 0.4 + 0.6;
    particlesMaterial.color.setHSL(particlesColorHue, 0.5, 0.6)
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = e.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance
    
    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Animate meshes
    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function getScrollHeight(){
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
}

function getPositionAndScaleBySizes(){
    let position_x = 2
    let scale = 1
    
    if(sizes.width < 400){
        position_x = 0.3
        scale = 0.5
    }else if(sizes.width < 500){
        position_x = 0.4
        scale = 0.5
    }else if(sizes.width < 800){
        position_x = 0.8
        scale = 0.6
    }else if(sizes.width < 1000){
        position_x = 1.5
        scale = 0.7
    }

    return [position_x, scale]
}