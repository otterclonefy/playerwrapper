export async function GET(request, { params }) {
  const { embedId } = params;

  // Tijdelijke dummy data
  const config = {
    embedId,
    videoUrl: "https://example.com/dummy-video.mp4",
    languages: [
      { code: "nl", label: "Nederlands" },
      { code: "en", label: "English" }
    ],
    defaultLanguage: "nl"
  };

  return new Response(JSON.stringify(config), {
    headers: { "Content-Type": "application/json" },
  });
}
