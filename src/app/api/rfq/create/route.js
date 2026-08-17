// This route is not used — RFQ creation is handled client-side via Firebase SDK.
// Kept as a stub to avoid 404 on any old references.
export async function POST() {
  return Response.json({ error: 'Use client-side Firebase SDK directly.' }, { status: 501 });
}
