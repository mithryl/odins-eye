export async function POST() {
  return Response.json(
    {
      event: "error",
      error:
        "This public demo does not include a hosted API key. Clone the repo and add your own ANTHROPIC_API_KEY to run readings locally. See the README for setup instructions.",
    },
    { status: 403 },
  );
}
