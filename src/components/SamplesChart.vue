<template>
  <div class="map-container text-center">
    <h6>Source types map</h6>

    <div id="map" class="map-chart">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #00ff00"></div>
          <div class="legend-label">Good Water Quality</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #dc143c"></div>
          <div class="legend-label">Bad Water Quality</div>
        </div>
      </div>
    </div>
    <div id="tooltip"></div>
  </div>
</template>

<script>
/* eslint-disable */

import { onMounted } from "vue";
import * as d3 from "d3";
import { select } from "d3-selection";
import data from "../data/data.json";

export default {
  name: "source-types-map2",
  setup() {
    onMounted(() => {
      createMap();
    });

    const colors = {
      waterBlue: "#7aabf0",
      gray1: "gray",
      lightYellow: "#fcfce8",
      green: "#50C878",
      red: "#DC143C",
    };
    function checkWaterQuality(src) {
      let benchMarkValues = [
        { name: "turbidity", value: 25 },
        {
          name: "color",
          value: 50,
        },
        { name: "ph", value: 9.5 },
        { name: "electricalConductivity", value: 2500 },
        { name: "totalDisolvedSolids", value: 1500 },
        { name: "totalHardness", value: 600 },
        // { name: "calcium", value: 150 },
        { name: "calciumHardness", value: 600 },
        { name: "sodium", value: 200 },
        { name: "magnesium", value: 100 },
        { name: "magnesiumHardness", value: 600 },
        { name: "manganese", value: 0.1 },
        { name: "sodium", value: 200 },
        { name: "potassium", value: 50 },
        { name: "totalAlkalinity", value: 200 },
        { name: "bicarbonates", value: 400 },
        { name: "flouride", value: 1.5 },
        { name: "sulphate", value: 400 },
        { name: "chloride", value: 250 },
        { name: "nitrate", value: 10 },
        { name: "nitrite", value: 0.9 },
        { name: "ammonium", value: 0.5 },
        { name: "phosphate", value: 0.7 },
        { name: "silica", value: 30 },
        { name: "mercury", value: 0.001 },
        { name: "lead", value: 0.01 },
        { name: "iron", value: 0.5 },
        { name: "ecoli", value: 1 },
      ];
      const responseObj = {
        quality: true,
        district: src.district,
        village: src.village,
        issues: [],
      };
      for (let k of Object.keys(src)) {
        if (src[k]) {
          let val = src[k].replace(/[^0-9.]/g, ""); // remove any non numeric character
          val = parseFloat(val);
          // console.log(k);
          let benchmark = benchMarkValues.filter((x) => x.name == k)[0];
          // console.log("Benchmark: ", benchmark);
          if (!benchmark) {
            continue;
          }

          if (val > benchmark.value) {
            responseObj.issues.push(
              `<p>${k} value is ${val} which exceeds the recommended ${benchmark.value}</p>`
            );
            responseObj.quality = false;
          }
        }
      }
      console.log(responseObj);
      return responseObj;
    }
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
    const createMap = () => {
      // Create a projection for Uganda using D3.js
      const projection = d3
        .geoMercator()
        .center([32.0, 1.0]) // Center coordinates of Uganda
        .scale(5000) // Zoom level
        .translate([260, 300]);

      // Generate random pins within Uganda
      const pins = [];

      // process data object
      for (let dst of data) {
        // loop through every district's sources
        for (let src of dst.sources) {
          // console.log(src);
          // get src cordinates
          if (src.latitude && src.longitude) {
            if (parseFloat(src.latitude) < 5) {
              pins.push({
                lat: parseFloat(src.latitude),
                lon: parseFloat(src.longitude),
                quality: checkWaterQuality(src).quality,
                district: checkWaterQuality(src).district,
                village: checkWaterQuality(src).village,
                issues: checkWaterQuality(src).issues.join(""),
              });
              continue;
            } else {
              let [lat, lon] = convNE2LatLon(
                parseFloat(src.longitude),
                parseFloat(src.latitude)
              );
              pins.push({
                lat,
                lon,
                quality: checkWaterQuality(src).quality,
                district: checkWaterQuality(src).district,
                village: checkWaterQuality(src).village,
                issues: checkWaterQuality(src).issues.join(""),
              });
              continue;
            }
          }
          if (src.gps) {
            let NE = src.gps.split(" ");
            let northing = Number(NE[1].slice(1));
            let easting = Number(NE[0].slice(1));
            let [lat, lon] = convNE2LatLon(northing, easting);
            pins.push({
              lat,
              lon,
              quality: checkWaterQuality(src).quality,
              district: checkWaterQuality(src).district,
              village: checkWaterQuality(src).village,
              issues: checkWaterQuality(src).issues.join(""),
            });
            continue;
          }
          if (src.northing && src.easting) {
            let northing = parseFloat(src.northing);
            let easting = parseFloat(src.easting);
            let [lat, lon] = convNE2LatLon(northing, easting);
            pins.push({
              lat,
              lon,
              quality: checkWaterQuality(src).quality,
              district: checkWaterQuality(src).district,
              village: checkWaterQuality(src).village,
              issues: checkWaterQuality(src).issues.join(""),
            });
          }
        }
      }

      // Create an SVG element
      const svg = d3
        .select("#map")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 550 510")
        .call(d3.zoom().on("zoom", zoomed));

      // Create a group to contain the map elements
      const mapGroup = svg.append("g");
      let pinsGroup;
      // Load Uganda's geoJSON data
      d3.json("uganda-lakes-rivers.geojson").then((uganda) => {
        // Create a path generator for the geoJSON data
        const path = d3.geoPath().projection(projection);

        // Draw Uganda's map boundaries
        mapGroup
          .selectAll("path")
          .data(uganda.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", (d) =>
            d.properties.layer == "x-rivers-lakes-ug"
              ? colors.waterBlue
              : colors.gray1
          )
          .style("fill", (d) =>
            d.properties.layer == "x-rivers-lakes-ug"
              ? colors.waterBlue
              : colors.lightYellow
          );

        // Draw pins on the map using custom icons
        pinsGroup = mapGroup.append("g");

        // Update pins on zoom event
        svg.call(d3.zoom().on("zoom", zoomed));

        updatePins();
      });

      const updatePins = () => {
        const zoomTransform = d3.zoomTransform(svg.node());
        const zoomScale = zoomTransform.k;
        const scalingFactor = 0.5; // Adjust this value to control the shrinking rate
        const iconSize = 20 / (zoomScale * scalingFactor);

        const pinsSelection = pinsGroup
          .selectAll(".custom-pin")
          .data(pins, (d) => d.id);

        pinsSelection.exit().remove();

        const pinsEnter = pinsSelection
          .enter()
          .append("foreignObject")
          .attr("class", "custom-pin");

        pinsEnter
          .merge(pinsSelection)
          .attr("x", (d) => projection([d.lon, d.lat])[0] - iconSize / 2)
          .attr("y", (d) => projection([d.lon, d.lat])[1] - iconSize / 2)
          .attr("width", iconSize)
          .attr("height", iconSize)
          .style("cursor", "pointer")
          .html((d) => {
            const fillColor = d.quality ? colors.green : colors.red;
            return `<div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 50 50">
            <path fill="${fillColor}" d="M12 2c-4.419 0-8 3.582-8 8 0 4.418 8 14 8 14s8-9.582 8-14c0-4.418-3.582-8-8-8zm0 11.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
          </svg>
        </div>`;
          })
          .on("mouseover", function (event, d) {
            showTooltip(event.currentTarget, d.district, d.village, d.issues);
          })
          .on("mouseout", function () {
            hideTooltip();
          });
      };

      // Zoom function
      function zoomed(event) {
        mapGroup.attr("transform", event.transform);
        updatePins();
      }
      // Function to show tooltip
      function showTooltip(element, district, village, issues) {
        const tooltip = d3.select("#tooltip");

        tooltip
          .style("display", "block")
          .style("left", `${element.x.baseVal.value + 60}px`)
          .style("top", `${element.y.baseVal.value + 75}px`)
          .html(
            (d) =>
              `<p>District: ${district} </p> <p> Village: ${village}</p>` +
              issues
          );
      }

      // Function to hide tooltip
      function hideTooltip() {
        d3.select("#tooltip").style("display", "none");
      }
      return {
        createMap,
      };
    };
  },
};
</script>
<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.map-chart {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
}
#map {
  width: 100%;
  height: 100%;
}

#tooltip {
  position: absolute;
  width: auto;
  display: none;
  font-size: 12px;
  padding: 6px 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  /* left: 0;
  top: 0; */
  transform: translate(-50%, -50%);
}
#tooltip::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent transparent #00000000 transparent;
}
.legend {
  display: flex;
  justify-content: center;
  position: absolute;
  left: 50%;
  top: 5%;
  transform: translate(-50%, -50%);
  margin-top: 10px;
  position: absolute;
  margin: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.legend-label {
  font-size: 14px;
}
.icon-container {
  width: 100%; /* Adjust as needed */
}

.icon-container svg {
  width: 100%;
  height: auto;
}
</style>
