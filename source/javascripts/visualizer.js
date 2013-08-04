#= require "mass"

console.log('visualizer');

var massviz = {};

massviz.init = function() {
  console.log('massviz.init');
  
  this.domEl = $('#canvas-holder');

  this.height = 500;
  this.width = 500;
  this.resolution = 64;

  this.lon = 90;
  this.lat = 0;
  this.phi = 0;
  this.cubeLength= 1;
  this.cubeWidth = 1;
  this.cameraDistance = 150;
  
  this.stats = new Stats();
  this.stats.setMode(1); // 0: fps, 1: ms
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.left = '0px';
  this.stats.domElement.style.top = '0px';
  document.body.appendChild(this.stats.domElement);
  
  this.create3DEnv();
};

massviz.create3DEnv = function() {
  console.log('massviz.create3DEnv');
  
  // camera
	this.camera = new THREE.PerspectiveCamera( 60, this.width / this.height, 1, 100000 );
	this.camera.position.z = this.cameraDistance ;
  
  // scene
  this.scene = new THREE.Scene();
  
  // renderer
  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setSize(this.width, this.height);
  this.domEl.append(this.renderer.domElement);
  
  
  // skybox
	var textureCube = THREE.ImageUtils.loadTextureCube([
    '/images/skybox/posx.jpg',
    '/images/skybox/negx.jpg',
    '/images/skybox/posy.jpg',
    '/images/skybox/negy.jpg',
    '/images/skybox/posz.jpg',
    '/images/skybox/negz.jpg'
  ]);
  
	var shader = THREE.ShaderLib['cube'];
	shader.uniforms['tCube'].value = textureCube;

	var skyBoxMaterial = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});
  
  this.cube = new THREE.Mesh(new THREE.CubeGeometry(500, 500, 500), skyBoxMaterial);
	this.scene.add(this.cube);
  
  // mirror camera
	this.cubeCamera = new THREE.CubeCamera(1, 1000, 256);
	this.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
	this.scene.add(this.cubeCamera);
  
  // sphere and material
  this.mirroredMeshes = [];
  var mirrorMaterial = new THREE.MeshBasicMaterial({ envMap: this.cubeCamera.renderTarget });

  this.sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(15, 30, 20), mirrorMaterial);
	this.scene.add(this.sphereMesh);
	
	this.group = new THREE.Object3D();
	this.scene.add(this.group);
	
  // window resize
  var that = this;
  window.addEventListener('resize', function(e){
	  that.onWindowResized(e);
  }, false );
	this.onWindowResized(null);
  
  // redner
  this.renderLoop();
  
  // listen
  mass.events.add('MESSAGE', function(msg) {
    if(msg.type == 'ATTEND'){
      console.log('add an object');
      massviz.createSphere();
    }
  });
  
  massviz.addParticles();
};

massviz.addParticles = function() {
  this.particles = new THREE.Geometry();
  var pMaterial = new THREE.ParticleBasicMaterial({
    color: 0xFFFFFF,
    size: 1,
    map: THREE.ImageUtils.loadTexture('images/particle.png'),
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  
  for(var i = 0; i < 300 * 2; i++){
    var pX = Math.random() * 200 - 100;
    var pY = Math.random() * 200 - 100;
    var pZ = Math.random() * 200 - 100;
    
    var particle = new THREE.Vector3(pX, pY, pZ);
    particle.velocity = new THREE.Vector3(0, -0.2, 0);  
    particle.setLength(particle.length());
    this.particles.vertices.push(particle);
  }
  
  // create the particle system
  this.particleSystem = new THREE.ParticleSystem(this.particles,  pMaterial);
  this.particleSystem.sortParticles = true;
  this.scene.add(this.particleSystem);
}

massviz.createSphere = function() {
  var mirrorMaterial = new THREE.MeshBasicMaterial({ envMap: this.cubeCamera.renderTarget });
  
  var mesh = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random()*5, 15, 10), mirrorMaterial);
  mesh.position.x = Math.random() * 70 - 35;
	mesh.position.y = Math.random() * 70 - 35;
	mesh.position.z = Math.random() * 70 - 35;
	this.group.add(mesh);
  this.mirroredMeshes.push(mesh);
  
  var geometry = new THREE.Geometry();
  geometry.vertices.push(this.sphereMesh.position);
  geometry.vertices.push(mesh.position);
  
  var line = new THREE.Line( geometry, new THREE.LineBasicMaterial({ color: 0xCCCCCC, opacity: 1 }));
  this.group.add(line);
};

massviz.render = function() {
  
  // move camera
  this.lon += 0.1;
  this.lat = Math.max(-85, Math.min(85, this.lat));
	this.phi = THREE.Math.degToRad(90 - this.lat);
	this.theta = THREE.Math.degToRad(this.lon);
  
	this.camera.position.x = this.cameraDistance * Math.sin(this.phi) * Math.cos(this.theta);
	this.camera.position.y = this.cameraDistance * Math.cos(this.phi);
	this.camera.position.z = this.cameraDistance * Math.sin(this.phi) * Math.sin(this.theta);
  this.camera.lookAt(this.scene.position);
  
  // move group
  this.group.rotation.y = this.group.rotation.y - 0.007;
  this.group.rotation.x = this.group.rotation.x - 0.007;
  
  // move particles
  if(this.particles){
    $.each(this.particles.vertices, function(i, particle){
      if(particle.y < -100) { particle.y = 100; }
      particle.add(particle.velocity);
    });
    this.particleSystem.geometry.__dirtyVertices = true;
  
    // update reflection
    this.sphereMesh.visible = false; // off
  	this.cubeCamera.updateCubeMap( this.renderer, this.scene );
    this.sphereMesh.visible = true; // on
  }
  // render
  this.renderer.render(this.scene, this.camera);
};

massviz.renderLoop = function() {
  
  this.render();
  
  var that = this;
  window.requestAnimationFrame(function(){
    that.renderLoop();
  });
};

massviz.onWindowResized = function( event ) {
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.camera.projectionMatrix.makePerspective( 50, window.innerWidth / window.innerHeight, 1, 1100 );
};

mass.events.add('CONNECT', function() {
  massviz.init();
});