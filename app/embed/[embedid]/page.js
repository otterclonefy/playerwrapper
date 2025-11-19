async function getConfig(embedid) {
  const res = await fetch(`https://playerwrapper.vercel.app/api/embed/${embedid}`, {
    cache: "no-store"
  });
  return res.json();
}

export default async function Page({ params }) {
  const { embedid } = params;
  const config = await getConfig(embedid);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Embed werkt!</h1>

      <div style={{
        border: "1px solid #ddd",
        padding: "20px",
        borderRadius: "8px",
        background: "#f7f7ff",
        maxWidth: "700px"
      }}>
        <p><strong>Embed-ID:</strong> {config.embedId}</p>
        <p><strong>Video URL:</strong> {config.videoUrl}</p>
        <p><strong>Talen:</strong> {config.languages.map(l => l.label).join(", ")}</p>

        <h3 style={{ marginTop: "20px" }}>Player placeholder</h3>

        <video
          controls
          width="400"
          src={config.videoUrl}
          style={{ borderRadius: "6px", background: "black" }}
        />
      </div>
    </div>
  );
}
