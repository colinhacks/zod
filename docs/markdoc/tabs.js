document.addEventListener('DOMContentLoaded', () => {
  // Find all tab groups
  const tabGroups = document.querySelectorAll('.tab-group');
  console.log(`Found ${tabGroups.length} tab groups`);

  tabGroups.forEach((group, groupIndex) => {
    const tabs = group.querySelectorAll('.tab');
    const tabContents = group.querySelectorAll('.tab-content');
    console.log(`Group ${groupIndex} has ${tabs.length} tabs and ${tabContents.length} contents`);

    // Add click handlers to tabs
    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener('click', () => {
        const groupId = tab.getAttribute('data-group');
        const tabId = tab.getAttribute('data-tab');
        console.log(`Clicked tab ${tabId} in group ${groupId}`);

        // Remove active class from all tabs and contents in this group
        group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        group.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and its content
        tab.classList.add('active');
        const content = group.querySelector(`.tab-content[data-tab="${tabId}"]`);
        if (content) {
          content.classList.add('active');

          // Trigger Prism highlight on the specific code block
          const codeBlock = content.querySelector('code[data-prism="true"]');
          if (window.Prism && codeBlock) {
            window.Prism.highlightElement(codeBlock);
          }
        }
      });
    });

    // Initialize first tab in each group
    if (tabs.length > 0) {
      const firstTab = tabs[0];
      const firstContent = group.querySelector('.tab-content[data-tab="0"]');
      if (firstTab && firstContent) {
        firstTab.classList.add('active');
        firstContent.classList.add('active');

        // Initialize syntax highlighting for the first tab
        const codeBlock = firstContent.querySelector('code[data-prism="true"]');
        if (window.Prism && codeBlock) {
          window.Prism.highlightElement(codeBlock);
        }
      }
    }
  });

  // Initialize Prism.js for all visible code blocks
  if (window.Prism) {
    document.querySelectorAll('code[data-prism="true"]').forEach(block => {
      window.Prism.highlightElement(block);
    });
  }
});
