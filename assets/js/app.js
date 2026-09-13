// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle Logic
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeSidebarBtn = document.getElementById('close-sidebar');

  function toggleMobileSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  }

  if (menuToggle) menuToggle.addEventListener('click', toggleMobileSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleMobileSidebar);
  if (overlay) overlay.addEventListener('click', toggleMobileSidebar);

  // Desktop Sidebar Collapse Logic
  const collapseToggle = document.getElementById('sidebar-collapse-toggle');
  const navLabels = document.querySelectorAll('.nav-label');
  const brandLabel = document.getElementById('brand-label');
  const userDetails = document.getElementById('user-details');
  const mainContent = document.getElementById('main-content');

  if (collapseToggle && sidebar) {
    collapseToggle.addEventListener('click', () => {
      // Toggle width classes on sidebar
      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-20');

      // Adjust main content margin
      if (mainContent) {
        mainContent.classList.toggle('lg:ml-64');
        mainContent.classList.toggle('lg:ml-20');
      }

      // Hide/Show text elements
      if (brandLabel) brandLabel.classList.toggle('hidden');
      if (userDetails) userDetails.classList.toggle('hidden');
      
      navLabels.forEach(label => {
        label.classList.toggle('hidden');
      });

      // Rotate toggle icon
      collapseToggle.querySelector('svg').classList.toggle('rotate-180');
    });
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('#sidebar nav a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('bg-blue-50', 'text-blue-600', 'font-medium');
      link.classList.remove('text-slate-500', 'hover:bg-slate-100');
    }
  });

  // Recent Jobs Toggle Logic
  const toggleRecentBtn = document.getElementById('toggle-recent-jobs');
  const recentCard = document.getElementById('recent-jobs-card');
  const recentContent = document.getElementById('recent-jobs-content');
  const recentTitle = document.getElementById('recent-jobs-title');
  const recentLink = document.getElementById('recent-jobs-link');
  const recentIcon = document.getElementById('recent-jobs-icon');
  const recentHeader = document.getElementById('recent-jobs-header');

  if (toggleRecentBtn && recentCard) {
    toggleRecentBtn.addEventListener('click', () => {
      const isMinimized = recentCard.classList.contains('w-14');
      
      if (isMinimized) {
        // Maximize
        recentCard.classList.remove('w-14', 'h-14');
        recentCard.classList.add('lg:w-2/3', 'xl:w-1/2');
        recentContent.style.display = 'block';
        recentTitle.style.display = 'block';
        recentLink.style.display = 'block';
        recentHeader.classList.add('border-b', 'px-6', 'justify-between');
        recentHeader.classList.remove('justify-center', 'p-4');
        recentIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';
      } else {
        // Minimize
        recentCard.classList.remove('lg:w-2/3', 'xl:w-1/2');
        recentCard.classList.add('w-14', 'h-14');
        recentContent.style.display = 'none';
        recentTitle.style.display = 'none';
        recentLink.style.display = 'none';
        recentHeader.classList.remove('border-b', 'px-6', 'justify-between');
        recentHeader.classList.add('justify-center', 'p-4');
        recentIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
      }
    });
  }
});
