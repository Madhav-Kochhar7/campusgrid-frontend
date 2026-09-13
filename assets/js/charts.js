// assets/js/charts.js

document.addEventListener('DOMContentLoaded', () => {
  const sparklineCanvas = document.getElementById('totalJobsChart');
  if (sparklineCanvas) {
    new Chart(sparklineCanvas, {
      type: 'line',
      data: {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [{
          data: [12, 19, 15, 25, 22, 30, 16], // Mock data
          borderColor: '#3b82f6', // blue-500
          borderWidth: 2,
          tension: 0.4, // Smooth curves
          pointRadius: 0, // Zero data point markers
          pointHoverRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }
});
