export default function Page() {
  return (
    <div>
      <h2>Test embed page</h2>

      <div
        id="clonefy-player"
        data-embed-id="test123"
        style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px" }}
      ></div>

      <script src="/clonefy.js"></script>
    </div>
  );
}
