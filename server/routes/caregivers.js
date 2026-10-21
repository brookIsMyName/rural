
import express from "express";

const router = express.Router();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

router.get("/nearby", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const requestedRadius = Number(req.query.radius) || 5000;
  const radius = Math.min(Math.max(requestedRadius, 1000), 10000);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return res.status(400).json({
      message: "Valid latitude and longitude are required.",
    });
  }

  const query = `
    [out:json][timeout:20];
    (
      nwr(around:${radius},${lat},${lng})
        ["amenity"~"^(hospital|clinic|doctors|pharmacy)$"];
      nwr(around:${radius},${lat},${lng})
        ["healthcare"~"^(hospital|clinic|doctor|pharmacy)$"];
    );
    out center tags;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      throw new Error(`OpenStreetMap provider returned ${response.status}`);
    }

    const data = await response.json();

    const facilities = (data.elements ?? [])
      .map((item) => {
        const tags = item.tags ?? {};

        const facilityLat = item.lat ?? item.center?.lat;
        const facilityLng = item.lon ?? item.center?.lon;

        if (
          !tags.name ||
          !Number.isFinite(facilityLat) ||
          !Number.isFinite(facilityLng)
        ) {
          return null;
        }

        let type = "Clinic";

        if (
          tags.amenity === "hospital" ||
          tags.healthcare === "hospital"
        ) {
          type = "Hospital";
        } else if (
          tags.amenity === "pharmacy" ||
          tags.healthcare === "pharmacy"
        ) {
          type = "Pharmacy";
        } else if (
          tags.amenity === "doctors" ||
          tags.healthcare === "doctor"
        ) {
          type = "Doctor";
        }

        const address =
          tags["addr:full"] ||
          [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:suburb"],
            tags["addr:city"],
          ]
            .filter(Boolean)
            .join(", ");

        return {
          id: `${item.type}-${item.id}`,
          name: tags.name,
          type,
          lat: facilityLat,
          lng: facilityLng,
          region: address || "Address not listed",
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          availability: tags.opening_hours || null,
          emergency: tags.emergency === "yes",
          services: [],
          source: "OpenStreetMap",
        };
      })
      .filter(Boolean);

    return res.json({
      facilities,
      count: facilities.length,
      radius,
      source: "OpenStreetMap",
    });
  } catch (error) {
    console.error("Nearby healthcare search failed:", error.message);

    return res.status(502).json({
      message:
        "Healthcare listings are temporarily unavailable. Please try again.",
    });
  }
});

export default router;
