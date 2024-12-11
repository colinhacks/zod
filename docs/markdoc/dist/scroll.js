document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure all content is loaded and rendered
  setTimeout(() => {
    const headings = document.querySelectorAll('[data-heading="true"]');
    const sidebarLinks = document.querySelectorAll('[data-heading-link]');
    const sidebar = document.querySelector('.sidebar');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = document.querySelector(`[data-heading-link="${id}"]`);

          if (link) {
            if (entry.isIntersecting) {
              // Remove active classes from all links
              sidebarLinks.forEach(l => {
                l.classList.remove('active');
                l.classList.remove('text-blue-400');
                l.classList.remove('bg-slate-800');
                l.classList.remove('font-medium');
              });

              // Add active classes to current link
              link.classList.add('active');
              link.classList.add('text-blue-400');
              link.classList.add('bg-slate-800');
              link.classList.add('font-medium');

              // Ensure the active link is visible in the sidebar
              const linkRect = link.getBoundingClientRect();
              const sidebarRect = sidebar.getBoundingClientRect();

              if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
                link.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.5, 1]
      }
    );

    // Observe all headings
    headings.forEach(heading => {
      observer.observe(heading);
    });

    // Handle smooth scrolling for sidebar links
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('data-heading-link');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }, 500);
});
