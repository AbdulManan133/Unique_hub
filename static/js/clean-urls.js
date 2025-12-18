// Clean URLs - Remove .html from URLs in address bar
(function() {
  // Function to clean URL in address bar (but keep .html for actual navigation)
  function cleanURL() {
    const path = window.location.pathname;
    // Only clean if it ends with .html and not admin pages
    if (path.endsWith('.html') && !path.includes('/admin/')) {
      const cleanPath = path.replace(/\.html$/, '') || '/';
      const newURL = cleanPath + window.location.search + window.location.hash;
      window.history.replaceState({}, '', newURL);
    }
    // If it's a clean URL but we're on an .html file, clean it
    else if (!path.endsWith('.html') && !path.includes('/admin/') && path !== '/') {
      // Already clean, do nothing
    }
  }

  // Clean URL on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanURL);
  } else {
    cleanURL();
  }

  // Intercept all link clicks to show clean URLs
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && !link.href.includes('mailto:') && !link.href.includes('tel:') && !link.href.includes('javascript:') && !link.target && link.hostname === window.location.hostname) {
      try {
        const url = new URL(link.href, window.location.origin);
        const path = url.pathname;
        
        // If link has .html, navigate normally but clean the URL after
        if (path.endsWith('.html') && !path.includes('/admin/')) {
          // Let the navigation happen, then clean the URL
          setTimeout(function() {
            const cleanPath = path.replace(/\.html$/, '') || '/';
            window.history.replaceState({}, '', cleanPath + url.search + url.hash);
          }, 0);
        }
      } catch (err) {
        // Invalid URL, let browser handle it
      }
    }
  });

  // Also clean URL after navigation (for back/forward buttons)
  window.addEventListener('popstate', cleanURL);
})();

