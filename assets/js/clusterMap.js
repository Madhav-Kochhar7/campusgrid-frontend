// assets/js/clusterMap.js

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('cluster-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Set canvas size to window inner dimensions to cover viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Handle Resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initNodes();
  });

  const nodes = [];
  const packets = [];
  const numNodes = 8;

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        radius: 6,
        pulseRadius: 6,
        pulseOpacity: 1
      });
    }
  }

  function spawnPacket() {
    if (nodes.length < 2) return;
    const startIdx = Math.floor(Math.random() * nodes.length);
    let endIdx = Math.floor(Math.random() * nodes.length);
    while (startIdx === endIdx) {
      endIdx = Math.floor(Math.random() * nodes.length);
    }
    
    packets.push({
      startX: nodes[startIdx].x,
      startY: nodes[startIdx].y,
      endX: nodes[endIdx].x,
      endY: nodes[endIdx].y,
      progress: 0,
      speed: 0.005 + Math.random() * 0.01
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between nodes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)'; // slate-400 with higher opacity
    ctx.lineWidth = 1.5;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Draw connection if close enough
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 400) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw Packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += p.speed;
      
      if (p.progress >= 1) {
        packets.splice(i, 1);
        continue;
      }

      // Bezier curve packet
      const curX = p.startX + (p.endX - p.startX) * p.progress;
      const curY = p.startY + (p.endY - p.startY) * p.progress;

      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // blue-500
      ctx.fill();
      
      // Packet trail glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(59, 130, 246, 1)';
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    // Draw Nodes
    nodes.forEach(node => {
      // Pulse animation
      node.pulseRadius += 0.2;
      node.pulseOpacity -= 0.01;
      
      if (node.pulseOpacity <= 0) {
        node.pulseRadius = node.radius;
        node.pulseOpacity = 0.8;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0, node.pulseOpacity)})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb'; // blue-600 for better pop
      ctx.fill();
    });

    // Randomly spawn packets
    if (Math.random() < 0.05) {
      spawnPacket();
    }

    requestAnimationFrame(draw);
  }

  initNodes();
  draw();
});
