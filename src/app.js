import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ShaderMaterial } from 'three'

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
      0.01,
      10
    )
    this.camera.position.z = 1

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.width, this.height)
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.addObjects()
    this.render()
    this.setupResize()
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
    this.geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    this.material = new THREE.MeshNormalMaterial()

    // fragmentShader: responsible of the colors on screen
    // vertexShader: responsible of the positions on screen
    this.material = new THREE.ShaderMaterial({
      fragmentShader: `
          void main()	{
            gl_FragColor = vec4(1.,0.,0.0,1.);
          }
      `,
      vertexShader: `
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
      `,
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  render() {
    this.time += 0.05

    this.mesh.rotation.x = this.time / 2000
    this.mesh.rotation.y = this.time / 1000

    this.renderer.render(this.scene, this.camera)

    window.requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  dom: document.getElementById('container'),
})

// function init() {
//   camera = new THREE.PerspectiveCamera(
//     70,
//     window.innerWidth / window.innerHeight,
//     0.01,
//     10
//   )
//   camera.position.z = 1

//   scene = new THREE.Scene()

//   geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
//   material = new THREE.MeshNormalMaterial()

//   mesh = new THREE.Mesh(geometry, material)
//   scene.add(mesh)

//   renderer = new THREE.WebGLRenderer({ antialias: true })
//   renderer.setSize(window.innerWidth, window.innerHeight)
//   renderer.setAnimationLoop(animation)
//   document.body.appendChild(renderer.domElement)
// }

// function animation(time) {
//   mesh.rotation.x = time / 2000
//   mesh.rotation.y = time / 1000

//   renderer.render(scene, camera)
// }
