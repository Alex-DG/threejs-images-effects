import '../style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import gsap from 'gsap'
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

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    Promise.all(allDone).then(() => {
      this.scroll = new Scroll()

      this.addImages()
      this.setPosition()
      this.mouseMouvement()
      this.resize()
      this.setupResize()
      this.render()
    })
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer.setSize(this.width, this.height)

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  mouseMouvement() {
    window.addEventListener(
      'mousemove',
      (event) => {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse.x = (event.clientX / this.width) * 2 - 1
        this.mouse.y = -(event.clientY / this.height) * 2 + 1

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.scene.children)
        if (intersects.length > 0) {
          let obj = intersects[0].object
          obj.material.uniforms.hover.value = intersects[0].uv
        }
      },
      false
    )
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addImages() {
    /**
     * `fragmentShader`: responsible of the colors on screen
     * `vertexShader`: responsible of the positions on screen
     */
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uImage: { value: 0 },
        hover: { value: new THREE.Vector2(0.5, 0.5) },
        hoverState: { value: 0 },
        oceanTexture: { value: new THREE.TextureLoader().load(ocean) },
      },
      side: THREE.DoubleSide,
      fragmentShader,
      vertexShader,
      wireframe: false,
    })

    this.materials = []

    this.imageStore = this.images.map((img) => {
      const { top, left, width, height } = img.getBoundingClientRect()

      const geometry = new THREE.PlaneBufferGeometry(width, height, 10, 10)

      const texture = new THREE.Texture(img)
      texture.needsUpdate = true

      let material = this.material.clone()
      material.uniforms.uImage.value = texture

      // Animation on hover in
      img.addEventListener('mouseenter', () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 1,
        })
      })
      // Animation on hover out
      img.addEventListener('mouseout', () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 0,
        })
      })

      this.materials.push(material)

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

    this.materials.forEach((material) => {
      material.uniforms.time.value = this.time
    })

    this.renderer.render(this.scene, this.camera)

    window.requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  dom: document.getElementById('container'),
})
