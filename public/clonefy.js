console.log("Clonefy Player Script Loaded");

// Zoek embed containers
const embeds = document.querySelectorAll("[data-embed-id]");

embeds.forEach(async (el) => {
  const embedId = el.getAttribute("data-embed-id");

  try {
    const res = await fetch(`/api/embed/${embedId}`);
    const config = await res.json();

    el.innerHTML = `
      <div style="padding:20px;border:2px solid #777;background:#eef;">
        <h3>Embed werkt!</h3>
        <p><strong>Embed-ID:</strong> ${config.embedId}</p>
        <p><strong>Video URL:</strong> ${config.videoUrl}</p>
        <p><strong>Talen:</strong> ${config.languages.map(l => l.label).join(", ")}</p>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div style="color:red;">Error: ${err}</div>`;
  }
});
