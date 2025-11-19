export default function EmbedPage({ params }) {
  const { embedid } = params;

  return (
    <div style={{ width: "100%", maxWidth: "960px", margin: "40px auto" }}>
      <div
        id="clonefy-player"
        data-embed-id={embedid}
        style={{ width: "100%" }}
      ></div>

      <script src="/clonefy.js"></script>
    </div>
  );
}
