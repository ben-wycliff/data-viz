<template>
  <div ref="chartContainer" class="p-0"></div>
</template>

<script>
/* eslint-disable */
import * as d3 from "d3";
import dataset from "../data/data.json";

export default {
  data() {
    return {
      data: {
        name: "Uganda",
        children: [],
      },
    };
  },
  mounted() {
    for (let dst of dataset) {
      this.data.children.push({
        name: dst.districtName,
        children: this.convertToListOfObjects(dst.sources),
      });
    }
    this.createChart();
    console.log(this.data);
  },
  methods: {
    createChart() {
      const width = 800; // Define your desired width
      const height = 600; // Define your desired height

      const pack = (data) =>
        d3.pack().size([width, height]).padding(3)(
          d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
        );

      const color = d3
        .scaleOrdinal()
        .range(["#bdecb6", "#96df9d", "#6fd483", "#48c56a", "#1fad51"]);

      const root = pack(this.data);
      let focus = root;
      let view;

      const svg = d3
        .select(this.$refs.chartContainer)
        .append("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .style("display", "block")
        .style("margin", "0")
        .style("background", color(0))
        .style("cursor", "pointer")
        .on("click", (event) => this.zoom(event, root));

      const node = svg
        .append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
        .attr("pointer-events", (d) => (!d.children ? "none" : null))
        .on("mouseover", function () {
          d3.select(this).attr("stroke", "#000");
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke", null);
        })
        .on(
          "click",
          (event, d) =>
            focus !== d && (this.zoom(event, d), event.stopPropagation())
        );

      const label = svg
        .append("g")
        .style("font", "10px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
        .style("display", (d) => (d.parent === root ? "inline" : "none"))
        .text((d) => d.data.name);

      this.zoomTo = (v) => {
        const k = width / v[2];

        view = v;

        label.attr(
          "transform",
          (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr(
          "transform",
          (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr("r", (d) => d.r * k);
      };

      this.zoom = function (event, d) {
        const focus0 = focus;

        focus = d;

        const transition = svg
          .transition()
          .duration(event.altKey ? 7500 : 750)
          .tween("zoom", (d) => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return (t) => this.zoomTo(i(t));
          });

        label
          .filter(function (d) {
            return d.parent === focus || this.style.display === "inline";
          })
          .transition(transition)
          .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
          .on("start", function (d) {
            if (d.parent === focus) this.style.display = "inline";
          })
          .on("end", function (d) {
            if (d.parent !== focus) this.style.display = "none";
          });
      };

      this.zoomTo([root.x, root.y, root.r * 2]);
    },
    convertToListOfObjects(data) {
      let result = [];
      let filterKeys = [
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
      try {
        // Calculate the total of all values
        for (let obj of data) {
          let name = obj.village;
          let objList = [];

          for (let [key, value] of Object.entries(obj)) {
            if (value && filterKeys.includes(key)) {
              let percentage = parseFloat(value.replace(/[^0-9.]/g, ""));
              objList.push({ name: key, value: percentage || 0 });
            }
          }

          result.push({ name, children: objList });
        }
      } catch (err) {
        console.log(err);
      }
      return result;
    },
  },
};
</script>

<style>
svg {
  max-width: 100%;
  height: auto;
}
</style>
