(async function () {
  const container = document.querySelector('[data-embed-id]');
  const embedId = container?.getAttribute('data-embed-id');

  if (!embedId) {
    container.innerHTML = "Geen embed-ID gevonden.";
    return;
  }

  const res = await fetch(`/api/embed/${embedId}`);
  const config = await res.json();

  container.innerHTML = `
    <h3>Player placeholder</h3>
    <video src="${config.videoUrl}" controls></video>
  `;
})();
