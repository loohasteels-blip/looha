// Server-side geocoding via OpenStreetMap Nominatim
// Returns { lat, lon, display } for an Indian pincode

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pincode = searchParams.get('pincode');

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return Response.json({ error: 'Invalid pincode' }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Looha-Steel-Platform/1.0 (support@looha.in)' },
    });
    const data = await res.json();

    if (!data?.length) {
      return Response.json({ error: 'Pincode not found' }, { status: 404 });
    }

    return Response.json({
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display: data[0].display_name,
    });
  } catch (err) {
    console.error('Geocode error:', err);
    return Response.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
