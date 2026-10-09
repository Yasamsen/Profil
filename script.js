const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');

menuButton?.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(opened));
  menuButton.textContent = opened ? '✕' : '☰';
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = '☰';
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Playlist row selection; the sample audio source remains unchanged.
document.querySelectorAll('.song[data-title]').forEach(song => {
  song.addEventListener('click', () => {
    document.querySelectorAll('.song').forEach(item => item.classList.remove('active'));
    song.classList.add('active');
    document.querySelector('#track-title').textContent = song.dataset.title;
    document.querySelector('#track-artist').textContent = song.dataset.artist;
  });
});
