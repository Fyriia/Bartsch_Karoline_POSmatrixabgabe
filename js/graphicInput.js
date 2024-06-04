import Random from "ajv-keywords/src/keywords";

const canvas$ = document.getElementById('graph-canvas');
const context = canvas$.getContext('2d');

canvas$.addEventListener('click', function(event) {
  const rect = canvas$.getBoundingClientRect(); // Get the canvas bounding rectangle
  const mouseX = event.clientX - rect.left; // Get the mouse X coordinate relative to the canvas
  const mouseY = event.clientY - rect.top; // Get the mouse Y coordinate relative to the canvas

  // Set circle properties
  const radius = 20; // Set the radius of the circle

  // Draw the circle at the clicked coordinates
  context.beginPath();
  context.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
  context.fillStyle = 'blue'; // Fill color
  context.fill(); // Fill the circle
});


function translateMatrix(m){
  const nodes = [];
  for (let i = 1; i <= m.values.length; i++) {
    let node = {label: i, x: Random.range(canvas$.width), y: Random.range(canvas$.height)}
    nodes.push(node);
  }

  nodes.forEach(node => {
    context.beginPath();
    context.arc(node.x, node.y, 20, 0, Math.PI * 2, true);
    context.fillStyle = 'gray';
    context.fill();
    context.stroke();
    context.fillStyle = 'black';
    context.font = '12px Arial';
    context.fillText(node.label, node.x - 5, node.y + 5);
  });


}


