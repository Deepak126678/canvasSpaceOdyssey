const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("createCircle");
const fileInput = document.getElementById('fileInput');

// File input handling
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0]; // Get the selected file
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file); // Create a temporary URL for the selected file

  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    const aspectRatio = img.width / img.height;
    let newWidth = canvas.width;
    let newHeight = canvas.width / aspectRatio;

    if (newHeight > canvas.height) {
      newHeight = canvas.height;
      newWidth = canvas.height * aspectRatio;
    }

    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    // Draw image centered on canvas
    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  };

  img.onerror = () => {
    console.error("Error loading the image.");
  };
});

let cursorX = 0, cursorY = 0; // Cursor position

// Circle class
class Circle {
  constructor(x, y, radius, color) {
    this.x = x;           // X position
    this.y = y;           // Y position
    this.radius = radius; // Radius of the circle
    this.color = color;   // Base color of the planet
    this.isSelected = false; // Flag to indicate selection

    // Moon properties
    this.moonRadius = 5; // Fixed size of the moon
    this.orbitRadius = this.radius + 10; // Orbit distance for the moon
    this.angle = Math.random() * Math.PI * 2; // Initial angle for moon
    this.orbitSpeed = 0.02; // Speed at which the moon revolves
  }

  // Draw the circle with gradient
  draw() {
    // Create a radial gradient to simulate a 3D planet effect
    const gradient = ctx.createRadialGradient(
      this.x - this.radius / 3, this.y - this.radius / 3, 0, // Inner light position
      this.x, this.y, this.radius // Outer edge
    );

    gradient.addColorStop(0, "white");          // Center light
    gradient.addColorStop(0.3, this.color);     // Base color
    gradient.addColorStop(1, "black");          // Edge shadow

    // Draw the main circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    // Draw the moon
    this.updateMoonPosition();
  }

  // Update moon's position based on orbit
  updateMoonPosition() {
    this.angle += this.orbitSpeed; // Increment the angle for smooth movement
    const moonX = this.x + Math.cos(this.angle) * this.orbitRadius;
    const moonY = this.y + Math.sin(this.angle) * this.orbitRadius;

    // Draw the moon
    ctx.beginPath();
    ctx.arc(moonX, moonY, this.moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white"; // Moon color
    ctx.fill();
    ctx.closePath();
  }

  // Move the circle step-by-step towards the target position (cursorX, cursorY)
  moveTowards(targetX, targetY, speed = 2) {
    const dx = targetX - this.x; // Difference in X
    const dy = targetY - this.y; // Difference in Y
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance > 1) { // Stop moving if very close to the target
      this.x += (dx / distance) * speed; // Move a fraction of the distance
      this.y += (dy / distance) * speed;
    }
  }

  // Calculate distance to a given point (cursorX, cursorY)
  distanceTo(x, y) {
    return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
  }
}

// CircleManager class to manage all circles
class CircleManager {
  constructor() {
    this.circles = new Set(); // Store circles in a Set
    this.selectedCircle = null; // Currently selected circle
  }

  // Add a new circle
  addCircle(circle) {
    this.circles.add(circle);
  }

  // Find and select the closest circle to the cursor
  isClosest(cursorX, cursorY) {
    let closestCircle = null;
    let minDistance = Infinity;

    // Iterate through all circles to find the closest one
    this.circles.forEach(circle => {
      const distance = circle.distanceTo(cursorX, cursorY);
      if (distance < minDistance) {
        minDistance = distance;
        closestCircle = circle;
      }
    });

    // Reset all circles' selection state
    this.circles.forEach(circle => circle.isSelected = false);

    // Mark the closest circle as selected
    if (closestCircle) {
      closestCircle.isSelected = true;
      this.selectedCircle = closestCircle; // Update the selected circle
    }
  }

  // Update the position of the selected circle to move towards the cursor
  updateSelectedCircle(targetX, targetY) {
    if (this.selectedCircle) {
      this.selectedCircle.moveTowards(targetX, targetY);
    }
  }

  // Draw all circles
  drawCircles() {
    this.circles.forEach(circle => circle.draw());
  }
}

// Initialize CircleManager
const circleManager = new CircleManager();

// Event Listener: Mouse Move
canvas.addEventListener("mousemove", (e) => {
  cursorX = e.offsetX; // Update cursor X position
  cursorY = e.offsetY; // Update cursor Y position

  // Find the closest circle to the cursor
  circleManager.isClosest(cursorX, cursorY);
});

// Event Listener: Button Click - Create Random Circle
button.addEventListener("click", () => {
  // Generate random properties for the circle
  const randomX = Math.random() * canvas.width; // Random X
  const randomY = Math.random() * canvas.height; // Random Y
  const randomRadius = Math.random() * 20 + 10; // Radius between 10 and 30
  const randomColor = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random base color

  // Create a new circle and add it to the manager
  const newCircle = new Circle(randomX, randomY, randomRadius, randomColor);
  circleManager.addCircle(newCircle);
});

// Animation Loop: Update and Draw Circles
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Update the selected circle's position
  circleManager.updateSelectedCircle(cursorX, cursorY);

  // Draw all circles
  circleManager.drawCircles();

  requestAnimationFrame(animate); // Request next frame
}

// Start the animation
animate();


