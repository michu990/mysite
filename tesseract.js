// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define the vertices of a tesseract (4D cube)
const vertices = [
    [-1, -1, -1, -1], [1, -1, -1, -1], [1, 1, -1, -1], [-1, 1, -1, -1],
    [-1, -1, 1, -1], [1, -1, 1, -1], [1, 1, 1, -1], [-1, 1, 1, -1],
    [-1, -1, -1, 1], [1, -1, -1, 1], [1, 1, -1, 1], [-1, 1, -1, 1],
    [-1, -1, 1, 1], [1, -1, 1, 1], [1, 1, 1, 1], [-1, 1, 1, 1]
];

// Function to rotate a 4D point in a given plane
function rotate4D(vertex, angleXY, angleXZ, angleXW, angleYZ, angleYW, angleZW) {
    const [x, y, z, w] = vertex;

    // Rotate in XY plane
    const radXY = (angleXY * Math.PI) / 180;
    const cosXY = Math.cos(radXY);
    const sinXY = Math.sin(radXY);
    const xyX = x * cosXY - y * sinXY;
    const xyY = x * sinXY + y * cosXY;

    // Rotate in XZ plane
    const radXZ = (angleXZ * Math.PI) / 180;
    const cosXZ = Math.cos(radXZ);
    const sinXZ = Math.sin(radXZ);
    const xzX = xyX * cosXZ - z * sinXZ;
    const xzZ = xyX * sinXZ + z * cosXZ;

    // Rotate in XW plane
    const radXW = (angleXW * Math.PI) / 180;
    const cosXW = Math.cos(radXW);
    const sinXW = Math.sin(radXW);
    const xwX = xzX * cosXW - w * sinXW;
    const xwW = xzX * sinXW + w * cosXW;

    // Rotate in YZ plane
    const radYZ = (angleYZ * Math.PI) / 180;
    const cosYZ = Math.cos(radYZ);
    const sinYZ = Math.sin(radYZ);
    const yzY = xyY * cosYZ - xzZ * sinYZ;
    const yzZ = xyY * sinYZ + xzZ * cosYZ;

    // Rotate in YW plane
    const radYW = (angleYW * Math.PI) / 180;
    const cosYW = Math.cos(radYW);
    const sinYW = Math.sin(radYW);
    const ywY = yzY * cosYW - xwW * sinYW;
    const ywW = yzY * sinYW + xwW * cosYW;

    // Rotate in ZW plane
    const radZW = (angleZW * Math.PI) / 180;
    const cosZW = Math.cos(radZW);
    const sinZW = Math.sin(radZW);
    const zwZ = yzZ * cosZW - xwW * sinZW;
    const zwW = yzZ * sinZW + xwW * cosZW;

    return [xwX, ywY, zwZ, zwW];
}

// Project 4D vertices into 3D space
function project4DTo3D(vertex) {
    const [x, y, z, w] = vertex;
    const scale = 2 / (4 + w); // Perspective projection
    return new THREE.Vector3(
        x * scale,
        y * scale,
        z * scale
    );
}

// Create lines connecting the vertices
const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
    [4, 5], [5, 6], [6, 7], [7, 4], // Top face
    [0, 4], [1, 5], [2, 6], [3, 7], // Vertical edges
    [8, 9], [9, 10], [10, 11], [11, 8], // Inner bottom face
    [12, 13], [13, 14], [14, 15], [15, 12], // Inner top face
    [8, 12], [9, 13], [10, 14], [11, 15], // Inner vertical edges
    [0, 8], [1, 9], [2, 10], [3, 11], // Connecting outer to inner
    [4, 12], [5, 13], [6, 14], [7, 15]  // Connecting outer to inner
];

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const lines = [];

edges.forEach(edge => {
    const points = [];
    points.push(project4DTo3D(vertices[edge[0]]));
    points.push(project4DTo3D(vertices[edge[1]]));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    lines.push(line);
    scene.add(line);
});

// Camera position
camera.position.z = 5;

// Variables for rotation and movement
let angleXY = 0, angleXZ = 0, angleXW = 0, angleYZ = 0, angleYW = 0, angleZW = 0;
let movementX = 0, movementY = 0, movementZ = 0, movementW = 0;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update rotation angles
    angleXY += Math.random() * 0.5;
    angleXZ += Math.random() * 0.5;
    angleXW += Math.random() * 0.5;
    angleYZ += Math.random() * 0.5;
    angleYW += Math.random() * 0.5;
    angleZW += Math.random() * 0.5;

    // Update movement
    movementX += (Math.random() - 0.5) * 0.02;
    movementY += (Math.random() - 0.5) * 0.02;
    movementZ += (Math.random() - 0.5) * 0.02;
    movementW += (Math.random() - 0.5) * 0.02;

    // Rotate and move the tesseract
    lines.forEach((line, index) => {
        const edge = edges[index];
        const points = [];
        const rotatedVertex1 = rotate4D(vertices[edge[0]], angleXY, angleXZ, angleXW, angleYZ, angleYW, angleZW);
        const rotatedVertex2 = rotate4D(vertices[edge[1]], angleXY, angleXZ, angleXW, angleYZ, angleYW, angleZW);
        const movedVertex1 = [
            rotatedVertex1[0] + movementX,
            rotatedVertex1[1] + movementY,
            rotatedVertex1[2] + movementZ,
            rotatedVertex1[3] + movementW
        ];
        const movedVertex2 = [
            rotatedVertex2[0] + movementX,
            rotatedVertex2[1] + movementY,
            rotatedVertex2[2] + movementZ,
            rotatedVertex2[3] + movementW
        ];
        points.push(project4DTo3D(movedVertex1));
        points.push(project4DTo3D(movedVertex2));
        line.geometry.setFromPoints(points);
        line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

animate();