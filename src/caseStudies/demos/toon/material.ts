import * as THREE from 'three'

/** Ported from the DIY repo's shared/toon.ts, trimmed to the layers the demo can switch. */

export const INK = 0x16111f

export interface Finish {
  shine?: number
  metal?: number
  halftone?: number
}

export interface Layers {
  cel: boolean
  specular: boolean
  halftone: boolean
  metal: boolean
  ink: boolean
}

export const ALL_LAYERS: Layers = { cel: true, specular: true, halftone: true, metal: true, ink: true }

/** Shared by every comic material in one scene; the scene writes them each frame. */
export interface SharedUniforms {
  uKeyDir: { value: THREE.Vector3 }
  uUpView: { value: THREE.Vector3 }
  uDotSize: { value: number }
}

const DECL = /* glsl */ `
uniform vec3 uKeyDir;
uniform vec3 uUpView;
uniform float uDotSize;
uniform float uShine;
uniform float uMetal;
uniform float uHalftone;
`

const COMIC = /* glsl */ `
{
  vec3 N = normalize(normal);
  vec3 V = normalize(vViewPosition);
  float fres = 1.0 - clamp(dot(N, V), 0.0, 1.0);

  // Cartoon horizon reflection: bright sky above a hard line, dark ground below.
  vec3 R = reflect(-V, N);
  float sky = smoothstep(-0.03, 0.03, dot(R, normalize(uUpView)));
  vec3 refl = mix(vec3(0.08, 0.06, 0.14), vec3(0.86, 0.92, 1.0), sky);
  vec3 tinted = refl * mix(vec3(1.0), diffuseColor.rgb * 1.5 + 0.2, 0.55);
  outgoingLight = mix(outgoingLight, tinted, uMetal * (0.3 + 0.6 * fres) * 0.7);

  // Hard-edged specular; size and strength follow the finish.
  vec3 H = normalize(normalize(uKeyDir) + V);
  float nh = max(dot(N, H), 0.0);
  float edge = mix(0.90, 0.968, uShine);
  float soft = mix(0.05, 0.004, uShine);
  outgoingLight += vec3(1.0, 0.98, 0.95) * smoothstep(edge - soft, edge + soft, nh) * mix(0.2, 0.95, uShine) * step(0.001, uShine);

  outgoingLight += diffuseColor.rgb * step(0.78, fres) * 0.16 * (0.4 + uShine);

  // Halftone dots in the shade, relative to the surface's own color so dark paint isn't dotted all over.
  float lum = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
  float rel = lum / max(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)), 0.03);
  float a = 0.7854;
  vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * (gl_FragCoord.xy / uDotSize);
  float d = length(fract(q) - 0.5);
  float rad = clamp((0.9 - rel) * 0.6, 0.0, 0.46);
  outgoingLight *= 1.0 - (1.0 - smoothstep(rad - 0.05, rad + 0.05, d)) * 0.38 * uHalftone;
}
`

interface ComicUniforms {
  uShine: { value: number }
  uMetal: { value: number }
  uHalftone: { value: number }
}

export interface Comic {
  material: THREE.MeshToonMaterial
  apply(layers: Layers): void
}

/** Four hard light bands instead of a smooth falloff. */
export function createGradient(): THREE.DataTexture {
  const data = new Uint8Array([60, 140, 205, 255])
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat)
  tex.minFilter = tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

export function comic(color: THREE.ColorRepresentation, finish: Finish, shared: SharedUniforms, gradient: THREE.DataTexture): Comic {
  const material = new THREE.MeshToonMaterial({ color, gradientMap: gradient })
  const u: ComicUniforms = { uShine: { value: 0 }, uMetal: { value: 0 }, uHalftone: { value: 0 } }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, u)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${DECL}`)
      .replace('#include <opaque_fragment>', `${COMIC}\n#include <opaque_fragment>`)
  }
  material.customProgramCacheKey = () => 'comic-toon'
  return {
    material,
    apply(layers) {
      u.uShine.value = layers.specular ? (finish.shine ?? 0) : 0
      u.uMetal.value = layers.metal ? (finish.metal ?? 0) : 0
      u.uHalftone.value = layers.halftone ? (finish.halftone ?? 1) : 0
      const map = layers.cel ? gradient : null
      if (material.gradientMap !== map) {
        material.gradientMap = map
        material.needsUpdate = true
      }
    },
  }
}

/** Inverted hull: a back-faced copy pushed out along its normals reads as an ink line around the silhouette. */
export function inkMaterial(width: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uWidth: { value: width }, uColor: { value: new THREE.Color(INK) } },
    vertexShader: /* glsl */ `
      uniform float uWidth;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * uWidth, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() { gl_FragColor = vec4(uColor, 1.0); }`,
  })
}
