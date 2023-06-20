<template>
  <div class="radar-container">
    <h6 class="text-center">Water contents comparison</h6>
    <div class="radar-chart" id="radar-chart">
      <select
        v-model="selectedDistrict"
        class="form-select"
        aria-label="Default select example"
      >
        <option disabled>Open this select menu</option>
        <option v-for="dst in districts" :value="dst" :key="dst">
          {{ dst }}
        </option>
      </select>
      <svg :id="chartId" width="500" height="500"></svg>
    </div>
    <div class="customTooltip"></div>
  </div>
</template>

<script>
/* eslint-disable */
import * as d3 from "d3";
import dataset from "../data/data.json";

export default {
  data() {
    return {
      data: [],
      dataset,
      districts: [
        "Jinja",
        "Bugiri",
        "Iganga",
        "Mukono",
        "Luwero",
        "Nakaseke",
        "Nakasongola",
        "Buikwe",
        "Kamuli",
        "Kayunga",
        "Kamwenge",
        "Lamwo",
        "Luuka",
        "Bugweri",
        "Mubende",
        "Wakiso",
      ],
      selectedDistrict: "Mukono",
      selectedDstSources: [],
    };
  },
  props: {
    chartId: {
      type: String,
      default: "radarChart",
    },
    width: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 500,
    },
    margin: {
      type: Object,
      default: () => ({ top: 100, right: 100, bottom: 100, left: 100 }),
    },
    maxValue: {
      type: Number,
      default: 0.5,
    },
    levels: {
      type: Number,
      default: 5,
    },
    roundStrokes: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    getData() {
      let data = [];
      // list of axes to include in the plot
      let keys = [
        // "turbidity",
        // "color",
        // "ph",
        // "electricalConductivity",
        // "totalHardness",
        "calciumHardness",
        // "sodium",
        "potassium",
        // "totalAlkalinity",
        "flouride",
        "sulphate",
        "chloride",
        "nitrate",
        "nitrite",
        "ammonium",
        "phosphate",
        "iron",
        "ecoli",
      ];
      // function that converts the dataset to the data format expected by the chart
      function convertToListOfObjects(data, filterKeys = null) {
        let result = [];

        // Calculate the total of all values
        for (let obj of data) {
          let total = 0;
          let objList = [];

          for (let [key, value] of Object.entries(obj)) {
            // console.log(key, " ", value)
            if (value && filterKeys.includes(key)) {
              total += parseFloat(value.replace(/[^0-9.]/g, ""));
            }
          }
          for (let [key, value] of Object.entries(obj)) {
            if (value && filterKeys.includes(key)) {
              let percentage =
                parseFloat(value.replace(/[^0-9.]/g, "")) / total;
              objList.push({ axis: key, value: percentage || 0 });
              // console.log(
              //   "key: ",
              //   key,
              //   "value: ",
              //   value,
              //   " total: ",
              //   total,
              //   " ptg: ",
              //   percentage
              // );
            }
          }

          result.push(objList);
        }

        return result;
      }

      // create data array
      for (let dst of dataset) {
        let srcData = convertToListOfObjects(dst.sources, keys);
        // data2.push(srcData);
        // districts.push(dst);
        data.push({
          district: dst,
          sources: srcData,
        });
      }
      this.selectedDstSources = dataset
        .filter((x) => x.districtName == this.selectedDistrict)[0]
        .sources.map((x) => x.village);

      return data.filter(
        (x) => x.district.districtName == this.selectedDistrict
      )[0].sources;
    },
  },
  methods: {
    generateChart() {
      const { chartId, margin, maxValue, levels, roundStrokes } = this;
      console.log("DATA: ", this.getData);
      const data = this.getData;
      const containerWidth = 500;
      const containerHeight = 500;
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;
      const radius = Math.min(width / 2, height / 2);

      const total = data[0].length;
      const angleSlice = (2 * Math.PI) / total;
      const textDistance = 1.2;
      const radarAreaOpacity = 0.2;

      const color = d3
        .scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(d3.range(30));
      // Clear the previous chart SVG if it exists
      d3.select(`#${chartId}`).selectAll("*").remove();

      const svg = d3
        .select(`#${chartId}`)
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr(
          "transform",
          `translate(${containerWidth / 2},${containerHeight / 2})`
        );

      const g = svg.append("g").classed("radar", true);

      const axisGrid = g.append("g").classed("axisWrapper", true);

      const axis = axisGrid
        .selectAll(".axis")
        .data(data[0])
        .enter()
        .append("g")
        .classed("axis", true);

      axis
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("class", "line")
        .style("stroke", "gray")
        .style("stroke-width", "1px");

      axis
        .append("text")
        .attr("class", "legend")
        .style("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr(
          "x",
          (d, i) =>
            radius * textDistance * Math.cos(angleSlice * i - Math.PI / 2) + 10
        )
        .attr(
          "y",
          (d, i) =>
            radius * textDistance * Math.sin(angleSlice * i - Math.PI / 2) + 10
        )
        .text((d) => d.axis);

      const radiusScale = d3
        .scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

      const radarLine = d3
        .lineRadial()
        .curve(d3.curveLinearClosed)
        .radius((d) => radiusScale(d.value))
        .angle((d, i) => i * angleSlice);

      const radarWrapper = g.selectAll(".radarWrapper").data(data).enter();

      const blobWrapper = radarWrapper
        .append("g")
        .attr("class", "radarWrapper")
        .attr("fill-opacity", radarAreaOpacity);

      blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", (d) => radarLine(d))
        .style("fill", (d, i) => color(i))
        .style("fill-opacity", radarAreaOpacity)
        .style("stroke", (d, i) => color(i))
        .style("stroke-width", "1px")
        .on("mouseover", function (event, d) {
          d3.select(this).style("fill-opacity", 0.7);

          // Calculate the customTooltip position
          const [x, y] = d3.pointer(event);
          const customTooltipX = x + 40;
          const customTooltipY = y + 100;

          // Show customTooltip
          const customTooltip = d3.select(".radar-container .customTooltip");
          customTooltip
            .style("left", customTooltipX + "px")
            .style("top", customTooltipY + "px")
            .style("visibility", "visible")
            .style("font-size", "14px");

          // Update customTooltip content
          customTooltip.html(
            d
              .map((item) => {
                const formattedValue =
                  typeof item.value === "number"
                    ? item.value.toFixed(4)
                    : item.value;
                return `${item.axis}: ${formattedValue}%`;
              })
              .join("<br/>")
          );
        })
        .on("mouseout", function () {
          d3.select(this).style("fill-opacity", radarAreaOpacity);

          // Hide customTooltip
          const customTooltip = d3.select(".radar-container .customTooltip");
          customTooltip.style("visibility", "hidden");
        });
      // remove existing legends
      d3.select(".radar-container .radar-chart .legend-container").remove();

      const legendContainer = d3
        .select(".radar-container .radar-chart")
        .append("div")
        .classed("legend-container", true)
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("position", "absolute")
        .style("bottom", "4%");
      // clear all existing legend items

      // Create the legend items
      const legend = legendContainer
        .selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .classed("legend-item", true)
        .style("margin-left", "10px")
        .style("display", "flex")
        .style("align-items", "center");

      // Add color circles to the legend items
      legend
        .append("span")
        .classed("legend-color", true)
        .style("background-color", (_, i) => color(i))
        .style("width", "10px")
        .style("height", "10px")
        .style("border-radius", "50%")
        .style("margin-right", "5px");

      // Add text labels to the legend items
      legend
        .append("span")
        .classed("legend-label", true)
        .text((d, i) => `${this.selectedDstSources[i]}`)
        .style("font-size", "14px")
        .style("text-align", "center");
      // Adjust the height of the SVG container to accommodate the legend
      //   svg.attr(
      //     "height",
      //     containerHeight + data.length * 20 + margin.top + margin.bottom
      //   );
    },
  },
  mounted() {
    this.generateChart();
  },
  watch: {
    selectedDistrict(newDistrict) {
      this.generateChart();
    },
  },
};
</script>

<style scoped>
.radar-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.radar-chart {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  min-width: 200px;
  height: 100%;
  min-height: 500px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.customTooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.452);
  padding: 5px;
  border: 1px solid black;
  color: white;
  border-radius: 5px;
  font-size: 12px;
  pointer-events: none;
  visibility: hidden;
}
svg {
  margin: 0 auto;
  display: block;
}
</style>
