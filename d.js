const fs = require("fs");
const proj4 = require("proj4");

fs.readFile("./src/data/data.json", "utf8", async (err, d) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }

  try {
    const data = await JSON.parse(d);

    let dataset = [];

    for (let dst of data) {
      for (let src of dst.sources) {
        if (src.latitude && src.longitude) {
          if (parseFloat(src.latitude) < 5) {
            let lat = src.latitude;
            let lon = src.longitude;
            dataset.push({
              district: src.district,
              labIdentifierCode: src.labIdentifierCode,
              latitude: Number(lat),
              longitude: Number(lon),
            });
            continue;
          } else {
            let [lat, lon] = convNE2LatLon(
              parseFloat(src.longitude),
              parseFloat(src.latitude)
            );
            dataset.push({
              district: src.district,
              labIdentifierCode: src.labIdentifierCode,
              latitude: Number(lat),
              longitude: Number(lon),
            });
            continue;
          }
        }
        if (src.gps) {
          let NE = src.gps.split(" ");
          let northing = Number(NE[1].slice(1));
          let easting = Number(NE[0].slice(1));
          let [lat, lon] = convNE2LatLon(northing, easting);
          dataset.push({
            district: src.district,
            labIdentifierCode: src.labIdentifierCode,
            latitude: Number(lat),
            longitude: Number(lon),
          });
          continue;
        }
        if (src.northing && src.easting) {
          let northing = parseFloat(src.northing);
          let easting = parseFloat(src.easting);
          let [lat, lon] = convNE2LatLon(northing, easting);
          dataset.push({
            district: src.district,
            labIdentifierCode: src.labIdentifierCode,
            latitude: Number(lat),
            longitude: Number(lon),
          });
        }
      }
    }

    const jsonData = JSON.stringify(dataset, null, 2);

    fs.writeFile("./gps-data.json", jsonData, "utf-8", (err) => {
      if (err) {
        console.log("An error occured: ", err);
      } else {
        console.log("Data exported successfully");
      }
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
});
function convNE2LatLon(northing, easting) {
  // Define the coordinate system parameters
  const utmZone = "+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs";
  const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

  // Convert from UTM to latitude and longitude
  function convertUTMToLatLng(easting, northing) {
    const source = new proj4.Proj(utmZone);
    const target = new proj4.Proj(wgs84);

    const point = new proj4.Point(easting, northing);
    const convertedPoint = proj4.transform(source, target, point);

    return [convertedPoint.y, convertedPoint.x];
  }
  const [latitude, longitude] = convertUTMToLatLng(easting, northing);
  return [latitude, longitude];
}
