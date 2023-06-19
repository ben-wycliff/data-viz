<!-- <template>
  <div class="text-center">
    <h6>Number of samples per district</h6>
    <div ref="chartContainer" class="bar-chart"></div>
  </div>
</template>

<script>
import * as d3 from "d3";
import data from "../data/data.json";

export default {
  mounted() {
    let graphData = data.map((x) => {
      return { district: x.districtName, srcCount: x.sources.length };
    });
    console.log(graphData);
    const width = 850;
    const height = 500;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 100;
    const marginLeft = 40;

    // Your data for the graphData goes here (graphData variable).

    // Declare the x (horizontal position) scale.
    const x = d3
      .scaleBand()
      .domain(
        d3.groupSort(
          graphData,
          ([d]) => -d.srcCount,
          (d) => d.district
        )
      ) // descending srcCount
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    // Declare the y (vertical position) scale.
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(graphData, (d) => d.srcCount)])
      .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3
      .select(this.$refs.chartContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add a rect for each bar.
    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll()
      .data(graphData)
      .join("rect")
      .attr("x", (d) => x(d.district))
      .attr("y", (d) => y(d.srcCount))
      .attr("height", (d) => y(0) - y(d.srcCount))
      .attr("width", x.bandwidth())
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "steelblue")
          .style("filter", "blur(4px)")
          .style("filter", "contrast(1.3)");

        // Display the value on hover
        svg
          .append("text")
          .attr("class", "value-text")
          .attr("x", x(d.district) + x.bandwidth() / 2)
          .attr("y", y(d.srcCount) + 20)
          .text(d.srcCount)
          .style("text-anchor", "middle")
          .style("fill", "white")
          .style("font-weight", "bold");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "steelblue")
          .style("filter", "none");

        // Remove the value on mouseout
        svg.select(".value-text").remove();
      });

    // Add the x-axis and label.
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0).tickPadding(10))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    // Add the y-axis and label, and remove the domain line.
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickFormat((y) => y.toFixed()))
      .style("font-size", "14px")
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .style("font-size", "14px")
          .text("No. of water sources")
      );
  },
};
</script>
<style>
.bar-chart {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
}
</style> -->

<template>
  <div class="text-center">
    <h6>Number of samples per district</h6>
    <div ref="chartContainer" class="bar-chart"></div>
  </div>
</template>

<script>
/* eslint-disable */
import * as d3 from "d3";
import data from "../data/data.json";

export default {
  mounted() {
    let graphData = data.map((x) => {
      return { district: x.districtName, srcCount: x.sources.length };
    });
    // console.log(graphData);
    const width = 850;
    const height = 500;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 100;
    const marginLeft = 40;

    // Your data for the graphData goes here (graphData variable).

    // Declare the x (horizontal position) scale.
    const x = d3
      .scaleBand()
      .domain(
        d3.groupSort(
          graphData,
          ([d]) => -d.srcCount,
          (d) => d.district
        )
      ) // descending srcCount
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    // Declare the y (vertical position) scale.
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(graphData, (d) => d.srcCount)])
      .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3
      .select(this.$refs.chartContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add a rect for each bar with animation.
    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll()
      .data(graphData)
      .join("rect")
      .attr("x", (d) => x(d.district))
      .attr("y", (d) => y(0)) // Start with height 0
      .attr("height", 0) // Start with height 0
      .attr("width", x.bandwidth())
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "steelblue")
          .style("filter", "blur(4px)")
          .style("filter", "contrast(1.3)");

        // Display the value on hover
        svg
          .append("text")
          .attr("class", "value-text")
          .attr("x", x(d.district) + x.bandwidth() / 2)
          .attr("y", y(d.srcCount) + 20)
          .text(d.srcCount)
          .style("text-anchor", "middle")
          .style("fill", "white")
          .style("font-weight", "bold");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "steelblue")
          .style("filter", "none");

        // Remove the value on mouseout
        svg.select(".value-text").remove();
      })
      .transition() // Apply transition after initial bar creation
      .duration(1000) // Duration of the animation in milliseconds
      .attr("y", (d) => y(d.srcCount)) // Transition to the final height
      .attr("height", (d) => y(0) - y(d.srcCount));

    // Add the x-axis and label.
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0).tickPadding(10))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add the y-axis and label, and remove the domain line.
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickFormat((y) => y.toFixed()))
      .style("font-size", "14px")
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .style("font-size", "14px")
          .text("No. of water sources")
      );
  },
};
</script>

<style scoped>
.bar-chart {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
}
</style>
