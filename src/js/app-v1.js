import '../style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import imagesLoaded from 'imagesloaded'
import FontFaceObserver from 'fontfaceobserver'

import Scroll from './scroll'

// Shaders
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

// Images
import ocean from '../assets/images/ocean.jpg'

export default class Sketch {
  constructor(options) {
    this.time = 0
    this.container = options.dom
    this.scene = new THREE.Scene()

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      100,
      2000
    )
    this.camera.position.z = 600

    this.camera.fov =
      2 * Math.atan((this.height / 2) * (1 / 600)) * (180 / Math.PI)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.width, this.height)
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.images = [...document.querySelectorAll('img')]

    const fontOpen = new Promise((resolve) => {
      new FontFaceObserver('Open Sans').load().then(() => {
        resolve()
      })
    })

    const fontPlayfair = new Promise((resolve) => {
      new FontFaceObserver('Playfair Display').load().then(() => {
        resolve()
      })
    })

    // Preload images
    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(
        document.querySelectorAll('img'),
        { background: true },
        resolve
      )
    })

    const allDone = [fontOpen, fontPlayfair, preloadImages]

    this.currentScroll = 0
    this.previousScroll = 0

    Promise.all(allDone).then(() => {
      this.addImages()
      this.setPosition()

      this.scroll = new Scroll()

      this.resize()
      this.setupResize()
      // this.addObjects()
      this.render()

      // window.addEventListener('scroll', () => {
      //   this.currentScroll = window.scrollY
      //   this.setPosition()
      // })
    })
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer.setSize(this.width, this.height)

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addObjects() {
    this.geometry = new THREE.PlaneBufferGeometry(200, 400, 10, 10)
    // this.geometry = new THREE.SphereGeometry(0.4, 40, 40)
    this.material = new THREE.MeshNormalMaterial()

    /**
     * `fragmentShader`: responsible of the colors on screen
     * `vertexShader`: responsible of the positions on screen
     */
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        oceanTexture: { value: new THREE.TextureLoader().load(ocean) },
      },
      side: THREE.DoubleSide,
      fragmentShader,
      vertexShader,
      wireframe: true,
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  addImages() {
    this.imageStore = this.images.map((img) => {
      const { top, left, width, height } = img.getBoundingClientRect()

      const geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1)

      const texture = new THREE.Texture(img)
      texture.needsUpdate = true
      const material = new THREE.MeshBasicMaterial({
        // color: 0xff0000,
        map: texture,
      })

      const mesh = new THREE.Mesh(geometry, material)

      this.scene.add(mesh)

      return {
        img,
        mesh,
        top,
        left,
        width,
        height,
      }
    })
  }

  setPosition() {
    this.imageStore.forEach(({ mesh, top, left, height, width }) => {
      mesh.position.y = this.currentScroll - top + this.height / 2 - height / 2
      mesh.position.x = left - this.width / 2 + width / 2
    })
  }

  render() {
    this.time += 0.05

    this.scroll.render()
    this.previousScroll = this.currentScroll
    this.currentScroll = this.scroll.scrollToRender

    this.setPosition()

    this.renderer.render(this.scene, this.camera)

    window.requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  dom: document.getElementById('container'),
})
