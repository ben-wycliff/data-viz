<template>
  <div class="circle-pack-container">
    <h6>Entire dataset circle pack</h6>
    <div class="circle-pack-chart" ref="chartContainer"></div>
  </div>
</template>

<script>
/* eslint-disable */
import { ref, onMounted } from "vue";
import * as d3 from "d3";
import dataset from "../data/data.json";

export default {
  name: "PackedCircleChart",
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const width = 975;
      const height = width;
      const color = d3.scaleSequential([8, 0], d3.interpolateMagma);
      const pack = (data) =>
        d3
          .pack()
          .size([width - 2, height - 2])
          .padding(3)(d3.hierarchy(data).sum((d) => d.value));

      const zoomTo = (v) => {
        const k = width / v[2];

        this.view = v;

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

      const zoom = (event, d) => {
        const focus0 = this.focus;

        this.focus = d;

        const transition = this.svg
          .transition()
          .duration(event.altKey ? 7500 : 750)
          .tween("zoom", function (d) {
            const self = this; // Save reference to the current element
            const i = d3.interpolateZoom(self.view, [
              self.focus.x,
              self.focus.y,
              self.focus.r * 2,
            ]);
            return function (t) {
              zoomTo(i(t));
            };
          });

        label
          .filter(
            (d) =>
              d.parent === this.focus ||
              d3.select(this).style("display") === "inline"
          )
          .transition(transition)
          .style("fill-opacity", (d) => (d.parent === this.focus ? 1 : 0))
          .attr("transform", function (d) {
            if (d.parent === this.focus) {
              const k = width / (this.view[2] || 1);
              const dx = (d.x - this.view[0]) * k;
              const dy = (d.y - this.view[1]) * k;
              return `translate(${dx},${dy})`;
            }
            return null;
          })
          .on("start", function (d) {
            if (d.parent === this.focus)
              d3.select(this).style("display", "inline");
          })
          .on("end", function (d) {
            if (d.parent !== this.focus)
              d3.select(this).style("display", "none");
          });
      };

      const root = {
        name: "Ugandan Water Sources",
        children: this.convertToListOfObjects(dataset),
      };
      const focus = root;
      this.focus = focus;
      this.view = [focus.x, focus.y, focus.r * 2];

      this.svg = d3
        .select(this.$refs.chartContainer)
        .append("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .style("display", "block")
        .style("margin", "0 -14px")
        .style("background", color(0))
        .style("cursor", "pointer")
        .on("click", (event) => zoom(event, root));

      const node = this.svg
        .append("g")
        .selectAll("circle")
        .data(pack(root).descendants().slice(1))
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
            this.focus !== d && (zoom(event, d), event.stopPropagation())
        );

      const label = this.svg
        .append("g")
        .style("font", "10px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(pack(root).descendants())
        .join("text")
        .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
        .style("display", (d) => (d.parent === root ? "inline" : "none"))
        .text((d) => d.data.name);

      zoomTo(this.view);
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

          result.push({ name, children: objList, value: objList.length });
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
/* Add any required styles for the component */
.circle-pack-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.circle-pack-chart {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
}
</style>
