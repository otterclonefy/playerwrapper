async function getConfig(embedId) {
  const res = await fetch(`https://playerwrapper.vercel.app/api/embed/${embedId}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function EmbedPage({ params }) {
  const { embedId } = params;
  const config = await getConfig(embedId);

  if (!config) {
    return <div>Ongeldige embed ID.</div>;
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Embed werkt!</h1>
      <p><strong>Embed-ID:</strong> {config.embedId}</p>
      <p><strong>Video URL:</strong> {config.videoUrl}</p>
      <p><strong>Talen:</strong> {config.languages.map(l => l.label).join(", ")}</p>
    </div>
  );
}
