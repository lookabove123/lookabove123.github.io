import * as THREE from 'three';

let camera, scene, renderer;
let starmapGeom, starmapTexture, starmapMater, starmapMesh;
let backgroundGeom, backgroundText, backgroundMaterial, backgroundMesh, previousCol = 0xfff;
let autoplay = false, intervalAutoplay;

let starmap;
let date = new Date();

let onPointerDownMouseX = 0, onPointerDownMouseY = 0,
  lon = 0, onPointerDownLon = 0,
  lat = 0, onPointerDownLat = 0,
  phi = 0, theta = 0;

init();

function init() {

  const container = document.getElementById('container');

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 510);
  scene = new THREE.Scene();

  backgroundGeom = new THREE.SphereGeometry(500, 10, 10);
  backgroundGeom.scale(-1, 1, 1);
  backgroundText = new THREE.TextureLoader().load('./final.png');


  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // container.style.touchAction = 'none';
  container.addEventListener('pointerdown', onPointerDown);

  document.addEventListener('wheel', onDocumentMouseWheel);

  //

  document.addEventListener('dragover', function (event) {

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

  });
  window.addEventListener('resize', onWindowResize);


  starmap = new Image();
  starmap.src = "./starmap.png";
  starmap.onload = () => {
    animate();
    updateDateLabel();
  }
}

function updateDateLabel() {
  document.getElementById("date").innerHTML = date.toDateString();
  document.getElementById("time").innerHTML = date.toTimeString().slice(0, 5);
  newStarMap();
  newBackground();
}

document.getElementById("incYear").addEventListener("click", () => {
  date.setFullYear(date.getFullYear() + 1);
  updateDateLabel();
});

document.getElementById("incMonth").addEventListener("click", () => {
  date.setUTCMonth(date.getUTCMonth() + 1);
  updateDateLabel();
});

document.getElementById("incDay").addEventListener("click", () => {
  date.setDate(date.getDate() + 1);
  updateDateLabel();
});

document.getElementById("incHour").addEventListener("click", () => {
  date.setHours(date.getHours() + 1);
  updateDateLabel();
});

document.getElementById("incMinute").addEventListener("click", () => {
  date.setMinutes(date.getMinutes() + 1);
  updateDateLabel();
});

document.getElementById("decYear").addEventListener("click", () => {
  date.setFullYear(date.getFullYear() - 1);
  updateDateLabel();
});

document.getElementById("decMonth").addEventListener("click", () => {
  date.setUTCMonth(date.getUTCMonth() - 1);
  updateDateLabel();
});

document.getElementById("decDay").addEventListener("click", () => {
  date.setDate(date.getDate() - 1);
  updateDateLabel();
});

document.getElementById("decHour").addEventListener("click", () => {
  date.setHours(date.getHours() - 1);
  updateDateLabel();
});

document.getElementById("decMinute").addEventListener("click", () => {
  date.setMinutes(date.getMinutes() - 1);
  updateDateLabel();
});

document.getElementById("AutoPlay").addEventListener("click", () => {
  autoplay = !autoplay;
  const elem = document.getElementById("AutoPlay");
  elem.innerHTML = (elem.innerHTML == "Play" ? "Stop" : "Play");
  if (!autoplay)
    clearInterval(intervalAutoplay);
  else {
    intervalAutoplay = setInterval(() => {
      date.setMinutes(date.getMinutes() + 2);
      updateDateLabel();
    }, 100);
  }
})

function convertTimeToPoint() {
  const IMAGESIZE = 3000;
  const WINDOW = 1024;
  const PERIOD = 24 * 60 - 3;
  const RADIUS = (IMAGESIZE - WINDOW) / 2;
  const CENTER = IMAGESIZE / 2;

  let minutes = Math.floor(date.getTime() / 60000);
  minutes %= PERIOD;
  minutes = (minutes / PERIOD) * 2 * Math.PI;
  return [
    RADIUS * Math.cos(minutes) + CENTER,
    RADIUS * Math.sin(minutes) + CENTER,
  ];
}

function newBackground() {
  const hrs = date.getHours();
  let newColor;
  const MIN_COLOR = 35;
  if (hrs >= 7 && hrs <= 9) {
    const mins = date.getMinutes();
    const hrs = date.getHours() - 7;
    newColor = MIN_COLOR + Math.floor((((hrs * 60) + mins) / 180) * (255 - MIN_COLOR));
  }
  else if (hrs > 9 && hrs < 19) {
    newColor = 255;
  }
  else if (hrs >= 19 && hrs <= 21) {
    const mins = date.getMinutes();
    const hrs = date.getHours() - 19;
    const sc = ((hrs * 60) + mins) / 180;
    const subtr = (255 - MIN_COLOR) * sc;
    newColor = Math.floor(255 - subtr);
  }
  else {
    newColor = MIN_COLOR;
  }
  if (newColor == previousCol) return;
  previousCol = newColor;
  scene?.remove(backgroundMesh);
  backgroundMaterial?.dispose();

  backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundText, color: `rgb(${newColor},${newColor},${newColor})` });
  backgroundMesh = new THREE.Mesh(backgroundGeom, backgroundMaterial);
  scene.add(backgroundMesh);
}

function newStarMap() {

  scene?.remove(starmapMesh);
  starmapGeom?.dispose();
  starmapMater?.dispose();
  starmapTexture?.dispose();

  starmapGeom = new THREE.SphereGeometry(459, 60, 40, 0, 2 * Math.PI, Math.PI / 2, Math.PI);
  starmapGeom.scale(-1, 1, 1);
  let cvs = document.getElementById("canv");
  let context = cvs.getContext("2d");
  context.clearRect(0, 0, cvs.width, cvs.height);

  const mids = convertTimeToPoint();
  const WIDTH = 1024;
  // alert(mids);

  context.drawImage(starmap, mids[0] - WIDTH / 2, mids[1] - WIDTH / 2, WIDTH, WIDTH, 0, 0, 512, 512);
  let url = cvs.toDataURL();
  starmapTexture = new THREE.TextureLoader().load(url);
  starmapMater = new THREE.MeshBasicMaterial({ map: starmapTexture, transparent: true, });

  let vFov = 190;
  var maxY = Math.cos(Math.PI * (360 - vFov) / 180 / 2);
  var faceVertexUvs = starmapGeom.faceVertexUvs[0];
  // The sphere consists of many FACES
  for (var i = 0; i < faceVertexUvs.length; i++) {
    // For each face...
    var uvs = faceVertexUvs[i];
    var face = starmapGeom.faces[i];
    // A face is a triangle (three vertices)
    for (var j = 0; j < 3; j++) {
      // For each vertex...
      // x, y, and z refer to the point on the sphere in 3d space where this vertex resides
      var x = face.vertexNormals[j].x;
      var y = face.vertexNormals[j].y;
      var z = face.vertexNormals[j].z;

      // Because our stereograph goes from 0 to 1 but our vertical field of view cuts off our Y early
      var scaledY = (((y + 1) / (maxY + 1)) * 2) - 1;

      // uvs[j].x, uvs[j].y refer to a point on the 2d texture
      if (y < maxY) {
        var radius = Math.acos(1 - ((scaledY / 2) + 0.5)) / Math.PI;
        var angle = Math.atan2(x, z);

        uvs[j].x = (radius * Math.cos(angle)) + 0.5;
        uvs[j].y = (radius * Math.sin(angle)) + 0.5;
      } else {
        uvs[j].x = 0;
        uvs[j].y = 0;
      }
    }
  }
  // For whatever reason my UV mapping turned everything upside down
  // Rather than fix my math, I just replaced "minY" with "maxY" and
  // rotated the sphere 180 degrees
  starmapGeom.rotateZ(Math.PI);
  starmapGeom.uvsNeedUpdate = true;


  starmapMesh = new THREE.Mesh(starmapGeom, starmapMater);
  scene.add(starmapMesh);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerDown(event) {

  if (event.isPrimary === false) return;

  onPointerDownMouseX = event.clientX;
  onPointerDownMouseY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

  if (event.isPrimary === false) return;

  lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
  lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;

}

function onPointerUp() {

  if (event.isPrimary === false) return;

  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);

}

function onDocumentMouseWheel(event) {

  const fov = camera.fov + event.deltaY * 0.05;

  camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

  camera.updateProjectionMatrix();

}

function animate() {

  requestAnimationFrame(animate);
  update();

}

function update() {
  const degToRad = (num) => {
    return (Math.PI / 180) * num;
  }
  lat = Math.max(- 85, Math.min(85, lat));
  phi = degToRad(90 - lat);
  theta = degToRad(lon);

  const x = 500 * Math.sin(phi) * Math.cos(theta);
  const y = 500 * Math.cos(phi);
  const z = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(x, y, z);

  renderer.render(scene, camera);
}