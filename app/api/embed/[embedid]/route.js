export async function GET(request, { params }) {
  const { embedid } = params;

  // Tijdelijke demo-config. Later koppel je dit aan een database.
  // Hier zet jij per embedId de echte Bunny-video's.
  let config;

  if (embedid === "test123") {
    config = {
      embedId: embedid,
      defaultLanguage: "NL",
      videos: [
        {
          code: "NL",
          label: "Nederlands",
          url: "https://clonefy-video.b-cdn.net/VIDEO%203/VID%203%20-%20NL_2.mp4",
        },
        {
          code: "EN",
          label: "English",
          url: "https://clonefy-video.b-cdn.net/VIDEO%203/VID%203%20-%20EN_1.mp4",
        },
        {
          code: "AR",
          label: "العربية",
          url: "https://clonefy-video.b-cdn.net/VIDEO%203/VID%203%20-%20AR_1.mp4",
        },
      ],
    };
  } else {
    // Fallback: 404 als embedId onbekend is
    return new Response(
      JSON.stringify({ error: "Embed config not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(config), {
    headers: { "Content-Type": "application/json" },
  });
}
