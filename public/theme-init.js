try {
  var t = localStorage.getItem('theme') || 'system';
  var d = document.documentElement;
  if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    d.classList.add('dark');
  } else {
    d.classList.remove('dark');
  }
} catch(e) {}
