
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

var scene;
var renderer;
var camera;
var cameraControl;

var container = document.getElementById('container');

var physicsScene = {
    gravity: new THREE.Vector3(0.0, -10.0, 0.0),
    dt: 1.0 / 60.0,
    worldsize : {x:3.5, z:5.5},
    paused: true,
    objects: [],
}

class Ball{

    constructor(pos, radius, vel, scene){
        this.pos = pos;
        this.radius = radius;
        this.vel = vel;
        
        var geometry = new THREE.SphereGeometry(0.2, 32, 32);
        var material = new THREE.MeshPhongMaterial({color:0x70e040});
        this.visMesh = new THREE.Mesh(geometry, material);
        this.visMesh.position.copy(pos);
        scene.add(this.visMesh);
    }

    simulate(){
        this.vel.addScaledVector(physicsScene.gravity, physicsScene.dt);
        this.pos.addScaledVector(this.vel, physicsScene.dt);

        if (this.pos.x < -physicsScene.worldsize.x){
            this.pos.x = -physicsScene.worldsize.x ; this.vel.x = -this.vel.x;
        }
        if (this.pos.x > physicsScene.worldsize.x){
            this.pos.x = physicsScene.worldsize.x ; this.vel.x = -this.vel.x;
        }

        if (this.pos.z < -physicsScene.worldsize.z){
            this.pos.z = -physicsScene.worldsize.z; this.vel.z = -this.vel.z;
        }

        if (this.pos.z > physicsScene.worldsize.z){
            this.pos.z = physicsScene.worldsize.z; this.vel.z = -this.vel.z;
        }

        if (this.pos.y < this.radius) {
            this.pos.y = this.radius; this.vel.y = -this.vel.y;
        }

        this.visMesh.position.copy(this.pos);
    }
}

function initPhysics(scene){
    var radius = 0.2
    var pos = new THREE.Vector3(radius, radius, radius);
    var vel = new THREE.Vector3(2.0, 5.0, 3.0);

    physicsScene.objects.push(new Ball(pos, radius, vel, scene));
}

function simulate(){

    if (physicsScene.paused)
        return;
    else
        for (var i=0 ; i < physicsScene.objects.length; i++)
            physicsScene.objects[i].simulate()

}

function initThreeScene(){
    scene = new THREE.Scene();

    scene.add(new THREE.AmbientLight(0x505050));
    scene.fog = new THREE.Fog( 0x000000, 0, 15);

    var SpotLight = new THREE.SpotLight(0xffffff, 100);
    SpotLight.angle = Math.PI/5;

    SpotLight.penumbra = 0.2;
    SpotLight.position.set(2,3,3);
    SpotLight.castShadow = true;
    SpotLight.shadow.camera.near = 3;
    SpotLight.shadow.camera.far = 10;
    SpotLight.shadow.mapSize.width = 1024;
    SpotLight.shadow.mapSize.height = 1024;
    scene.add(SpotLight);


    var dirLight = new THREE.DirectionalLight( 0x55505a, 5);
    dirLight.position.set(0,3,0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 10;

    
    dirLight.shadow.camera.right = 1;
    dirLight.shadow.camera.left = -1;
    dirLight.shadow.camera.top = 1;
    dirLight.shadow.camera.bottom = -1;

    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;

    scene.add(dirLight);

    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20,1,1),
        new THREE.MeshPhongMaterial({color:0x9fc5e8, shininess:150})
    );

    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    scene.add(ground);

    var helper =new THREE.GridHelper(20,20);
    helper.material.opacity =1.0;
    helper.material.transparent = true;
    helper.position.set(0, 0.02, 0);
    scene.add(helper);

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( 0.8 * window.innerWidth, 0.8 * window.innerHeight );
    window.addEventListener('resize', onWindowResize, false);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.01, 100);
    camera.position.set(0,1,4);
    camera.updateMatrixWorld();
    scene.add(camera);

    cameraControl = new OrbitControls(camera, renderer.domElement)
    cameraControl.zoomSpeed = 2.0;
    cameraControl.panSpeed = 0.4;

    
    var SphereGeometry = new THREE.SphereGeometry(0.2, 32,32);
    var sphereMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    var sphere = new THREE.Mesh(SphereGeometry, sphereMaterial);
    sphere.position.set(0,1,0); 
    scene.add(sphere);
}

function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var runbutton = document.getElementById("runbtn");
runbutton.addEventListener("click", function(){
    if (physicsScene.paused){
        physicsScene.paused = false
        runbutton.innerHTML = "Stop";
    }
    else
        physicsScene.paused = true;
})

var restartbutton = document.getElementById("restartbtn");
restartbutton.addEventListener("click", function(){
    location.reload()
})



function update(){
    simulate()
    renderer.render(scene, camera);
    cameraControl.update()

    requestAnimationFrame(update)
}

initThreeScene();
initPhysics(scene);
update();