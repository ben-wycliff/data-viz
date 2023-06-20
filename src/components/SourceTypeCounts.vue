<template>
  <div class="chart-container">
    <h6>Number of source types</h6>
    <div class="doughnut-chart">
      <div ref="chartContainer" class="chart"></div>
      <div
        class="customTooltip"
        v-if="customTooltipVisible"
        :style="{
          top: customTooltipTop + 'px',
          left: customTooltipLeft + 'px',
        }"
      >
        <span class="customTooltip-label">{{ customTooltipLabel }}</span>
        <span class="customTooltip-value">{{ customTooltipValue }}</span>
      </div>
    </div>
    <div class="legend">
      <div
        v-for="(item, index) in legendItems"
        :key="index"
        class="legend-item"
      >
        <span class="legend-color" :style="{ background: item.color }"></span>
        <span class="legend-label">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import dataset from "../data/data.json";

export default {
  name: "PieChart",
  data() {
    return {
      data: [
        { name: "borehole", value: 0 },
        { name: "unprotected spring", value: 0 },
        { name: "protected spring", value: 0 },
        { name: "tap", value: 0 },
        { name: "well", value: 0 },
        { name: "others", value: 0 },
      ],
      customTooltipVisible: false,
      customTooltipTop: 0,
      customTooltipLeft: 0,
      customTooltipLabel: "",
      customTooltipValue: "",
      legendItems: [],
    };
  },
  props: {
    width: {
      type: Number,
      default: 500,
    },
  },
  mounted() {
    // create data
    for (let dst of dataset) {
      for (let src of dst.sources) {
        // if sourceName or sourceType
        let name = src.sourceName ? src.sourceName.toLowerCase() : "";
        let type = src.sourceType ? src.sourceType.toLowerCase() : "";
        //1. include borehole or b/h -- update borehole
        if (name.includes("borehole") || type.includes("borehole")) {
          this.data[0].value += 1;
        } else if (name.includes("b/h") || type.includes("b/h")) {
          this.data[0].value += 1;
        }
        //2. include spring
        else if (name.includes("spring") || type.includes("spring")) {
          // include protected -- update protected spring
          if (name.includes("protected") || type.includes("protected")) {
            this.data[2].value += 1;
          } else {
            //update unprotected spring
            this.data[1].value += 1;
          }
        }
        //3. include tap -- update tap
        else if (name.includes("tap") || type.includes("tap")) {
          this.data[3].value += 1;
        }
        //4. include well update well
        else if (name.includes("well") || type.includes("well")) {
          this.data[4].value += 1;
        }
        // else update others
        else {
          this.data[5].value += 1;
        }
      }
    }
    this.data.sort((a, b) => b.value - a.value);

    const chartContainer = this.$refs.chartContainer;
    const width = this.width;
    const height = Math.min(width, 300);
    const radius = Math.min(width, height) / 2;

    const arc = d3
      .arc()
      .innerRadius(radius * 0.67)
      .outerRadius(radius - 1);

    const pie = d3
      .pie()
      .padAngle(0.005)
      .sort(null)
      .value((d) => d.value);

    const color = d3
      .scaleOrdinal()
      .domain(this.data.map((d) => d.name))
      .range(
        d3
          .quantize(
            (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
            this.data.length
          )
          .reverse()
      );

    const svg = d3
      .select(chartContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    svg
      .selectAll("path")
      .data(pie(this.data))
      .join("path")
      .attr("fill", (d) => color(d.data.name))
      .attr("d", arc)
      .style("opacity", 0) // Initial opacity set to 0
      .transition() // Add transition effect
      .duration(1000) // Transition duration
      .style("opacity", 1) // Set final opacity to 1
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      })
      .on("end", () => {
        // Animation completed
      });

    svg
      .selectAll("path")
      .on("mouseover", (event, d) => {
        const [x, y] = arc.centroid(d);
        this.customTooltipTop = y + height / 2;
        this.customTooltipLeft = x + width / 2;
        this.customTooltipLabel = d.data.name;
        this.customTooltipValue = d.data.value.toLocaleString("en-US");
        this.customTooltipVisible = true;
      })
      .on("mouseout", () => {
        this.customTooltipVisible = false;
      });

    const legendItems = this.data.map((item) => ({
      name: item.name,
      color: color(item.name),
    }));

    this.legendItems = legendItems;
  },
};
</script>

<style>
.chart-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.doughnut-chart {
  /* display: inline-block; */
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding-bottom: 10%;
}

.customTooltip {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 14px;
  pointer-events: none;
}

.customTooltip-label {
  font-weight: bold;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  position: absolute;
  bottom: 4%;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
}

.legend-label {
  font-size: 14px;
}
</style>
