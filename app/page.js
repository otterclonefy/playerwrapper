export default function Home() {
  return (
    <div style={{ padding: "40px", fontSize: "20px" }}>
      <h1>Clonefy Player Wrapper</h1>
      <p>De basis staat. We kunnen nu verder bouwen.</p>

      {/* Embed test */}
      <div
        data-embed-id="test123"
        style={{ marginTop: "40px", padding: "20px", border: "2px dashed #999" }}
      >
        Loading embed...
      </div>
    </div>
  );
}
