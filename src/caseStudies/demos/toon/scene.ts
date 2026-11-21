import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { arcLift, createTweens, easeOutBack } from '../../logic/motion'
import { ALL_LAYERS, comic, createGradient, inkMaterial, type Comic, type Layers, type SharedUniforms } from './material'

/** Colors from the DIY palette, so the demo reads as the same world. */
const COLOR = { coral: 0xf2694c, cyan: 0x6ee7ff, yellow: 0xffd23f, steel: 0xc4cad6, ground: 0x1d2133, charcoal: 0x23262e }
const LIGHT = { key: 0xfff0dc, sky: 0xc9d2ff, ground: 0x2a1830, rimPink: 0xff4fd8 }

export type ViewName = 'overview' | 'closeup'
const VIEWS: Record<ViewName, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  overview: { pos: new THREE.Vector3(4.6, 3.1, 5.4), target: new THREE.Vector3(0, 0.55, 0) },
  closeup: { pos: new THREE.Vector3(1.5, 2.7, 3.4), target: new THREE.Vector3(-0.3, 0.75, 0) },
}
const INTRO_FROM = new THREE.Vector3(9, 6.5, 11)
const FLIGHT_MS = 1100
const LID_MS = 750
const LID_OPEN = -1.9
const INK_WIDTH = 0.022
const DOT_SIZE_CSS_PX = 5

export interface ToonScene {
  setLayers(layers: Layers): void
  flyTo(view: ViewName): void
  setLid(open: boolean): void
  dispose(): void
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

/** The scene owns its canvas: a disposed WebGL context can't be reused, so each mount gets a fresh one. */
export function createToonScene(container: HTMLElement, canvasAttrs: Record<string, string>, reducedMotion: () => boolean): ToonScene {
  const canvas = document.createElement('canvas')
  for (const [name, value] of Object.entries(canvasAttrs)) canvas.setAttribute(name, value)
  container.prepend(canvas)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  const dpr = Math.min(window.devicePixelRatio, 2)
  renderer.setPixelRatio(dpr)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  // The shadow map only redraws when something that casts one moves.
  renderer.shadowMap.autoUpdate = false
  renderer.toneMapping = THREE.NoToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.copy(reducedMotion() ? VIEWS.overview.pos : INTRO_FROM)
  const controls = new OrbitControls(camera, canvas)
  controls.target.copy(VIEWS.overview.target)
  controls.enablePan = false
  controls.minDistance = 2.5
  controls.maxDistance = 12
  controls.maxPolarAngle = Math.PI / 2 - 0.08
  controls.update()

  const shared: SharedUniforms = {
    uKeyDir: { value: new THREE.Vector3() },
    uUpView: { value: new THREE.Vector3() },
    uDotSize: { value: DOT_SIZE_CSS_PX * dpr },
  }
  const gradient = createGradient()
  const ink = inkMaterial(INK_WIDTH)
  const comics: Comic[] = []
  const hulls: THREE.Mesh[] = []

  function part(geometry: THREE.BufferGeometry, color: number, finish: Parameters<typeof comic>[1], parent: THREE.Object3D = scene): THREE.Mesh {
    const c = comic(color, finish, shared, gradient)
    comics.push(c)
    const mesh = new THREE.Mesh(geometry, c.material)
    mesh.castShadow = mesh.receiveShadow = true
    const hull = new THREE.Mesh(geometry, ink)
    hulls.push(hull)
    mesh.add(hull)
    parent.add(mesh)
    return mesh
  }

  const groundComic = comic(COLOR.ground, { halftone: 1 }, shared, gradient)
  comics.push(groundComic)
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.12, 64), groundComic.material)
  ground.position.y = -0.06
  ground.receiveShadow = true
  scene.add(ground)

  const box = part(new RoundedBoxGeometry(1.7, 0.8, 0.95, 4, 0.08), COLOR.coral, { shine: 0.45, halftone: 1 })
  box.position.set(-0.3, 0.4, 0)

  // The lid hinges on the box's back top edge, so the group's origin sits on that edge.
  const hinge = new THREE.Group()
  hinge.position.set(-0.3, 0.8, -0.475)
  scene.add(hinge)
  const lid = part(new RoundedBoxGeometry(1.74, 0.16, 0.99, 4, 0.06), COLOR.coral, { shine: 0.45, halftone: 1 }, hinge)
  lid.position.set(0, 0.08, 0.475)
  const handle = part(new THREE.TorusGeometry(0.28, 0.05, 12, 32, Math.PI), COLOR.charcoal, { shine: 0.3 }, lid)
  handle.position.y = 0.08

  const wrench = new THREE.Group()
  wrench.position.set(-0.3, 0.55, 0)
  wrench.rotation.set(0, 0.25, Math.PI / 2)
  scene.add(wrench)
  const chrome = { shine: 0.95, metal: 1, halftone: 0.5 }
  part(new THREE.CapsuleGeometry(0.07, 1.0, 6, 16), COLOR.steel, chrome, wrench)
  const jaw = part(new THREE.TorusGeometry(0.16, 0.07, 12, 32, Math.PI * 1.55), COLOR.steel, chrome, wrench)
  jaw.position.y = 0.66
  jaw.rotation.z = Math.PI * 0.72
  wrench.visible = false

  const ball = part(new THREE.SphereGeometry(0.42, 48, 32), COLOR.steel, chrome)
  ball.position.set(1.45, 0.42, 0.65)

  const gear = part(new THREE.TorusGeometry(0.36, 0.13, 20, 48), COLOR.cyan, { shine: 0.6, halftone: 1 })
  gear.position.set(1.15, 0.13, -0.85)
  gear.rotation.x = -Math.PI / 2

  scene.add(new THREE.HemisphereLight(LIGHT.sky, LIGHT.ground, 1.1))
  const key = new THREE.DirectionalLight(LIGHT.key, 2.4)
  key.position.set(3, 6, 4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 })
  key.shadow.camera.updateProjectionMatrix()
  scene.add(key)
  const rim = new THREE.DirectionalLight(LIGHT.rimPink, 1.2)
  rim.position.set(-4, 2, -5)
  scene.add(rim)

  const tweens = createTweens(reducedMotion)
  let frameId = 0
  let shadowsStale = true

  // Frames are drawn on demand; anything that changes the picture asks for one.
  function invalidate(casters = false): void {
    if (casters) shadowsStale = true
    if (!frameId) frameId = requestAnimationFrame(frame)
  }

  const keyView = new THREE.Vector3()
  function frame(now: number): void {
    frameId = 0
    const moving = tweens.step(now)
    camera.updateMatrixWorld()
    keyView.copy(key.position).sub(key.target.position).normalize().transformDirection(camera.matrixWorldInverse)
    shared.uKeyDir.value.copy(keyView)
    shared.uUpView.value.set(0, 1, 0).transformDirection(camera.matrixWorldInverse)
    if (shadowsStale) {
      renderer.shadowMap.needsUpdate = true
      shadowsStale = false
    }
    renderer.render(scene, camera)
    if (moving) invalidate()
  }

  controls.addEventListener('change', () => invalidate())

  const resize = new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = container
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    invalidate()
  })
  resize.observe(container)

  function flyTo(view: ViewName): void {
    const p0 = camera.position.clone()
    const t0 = controls.target.clone()
    const { pos, target } = VIEWS[view]
    const distance = p0.distanceTo(pos)
    tweens.add(
      {
        duration: FLIGHT_MS,
        tag: 'camera',
        update: (k) => {
          camera.position.lerpVectors(p0, pos, k)
          camera.position.y += arcLift(k, distance, 0.6)
          controls.target.lerpVectors(t0, target, k)
          controls.update()
        },
      },
      performance.now(),
    )
    invalidate()
  }

  function setLid(open: boolean): void {
    const from = hinge.rotation.x
    const to = open ? LID_OPEN : 0
    const rise = wrench.position.y
    if (open) wrench.visible = true
    tweens.add(
      {
        duration: LID_MS,
        ease: easeOutBack,
        tag: 'lid',
        update: (k) => {
          hinge.rotation.x = from + (to - from) * k
          wrench.position.y = rise + ((open ? 1.25 : 0.55) - rise) * Math.min(1, k)
          shadowsStale = true
        },
        done: () => {
          if (!open) wrench.visible = false
          invalidate(true)
        },
      },
      performance.now(),
    )
    invalidate(true)
  }

  function setLayers(layers: Layers): void {
    for (const c of comics) c.apply(layers)
    for (const h of hulls) h.visible = layers.ink
    invalidate()
  }

  setLayers(ALL_LAYERS)
  if (!reducedMotion()) flyTo('overview')

  return {
    setLayers,
    flyTo,
    setLid,
    dispose() {
      cancelAnimationFrame(frameId)
      tweens.clear()
      resize.disconnect()
      controls.dispose()
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geometries.add(o.geometry)
          materials.add(o.material as THREE.Material)
        }
      })
      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      gradient.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
