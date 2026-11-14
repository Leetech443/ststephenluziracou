document.addEventListener("DOMContentLoaded", () => {
  fetch('data/menu.json') // Adjust path if nested in a folder (e.g., '../menu.json')
    .then(response => response.json())
    .then(menuItems => {
      const navContainer = document.getElementById('navbar-container');
      if (!navContainer) return;

      let navList = '<ul class="nav-links">';
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      menuItems.forEach(item => {
        const isActive = currentPage === item.url ? 'active' : '';
        navList += `<li><a href="${item.url}" class="${isActive}">${item.title}</a></li>`;
      });
      navList += '</ul>';

      navContainer.innerHTML = navList;
    })
    .catch(error => console.error('Error loading navigation menu:', error));
});