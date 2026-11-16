// 回到頂部
const goTop = document.getElementById('go-top');
if (goTop) {
  window.addEventListener('scroll', () => {
    goTop.classList.toggle('hidden', window.scrollY < 600);
  }, { passive: true });
  goTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
