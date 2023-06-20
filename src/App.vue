<template>
  <!-- <SamplesCount /> -->
  <div class="container pt-4">
    <div class="row">
      <div class="col-sm-7">
        <SampleCountBarChart />
      </div>
      <div class="col-sm-5">
        <SourceTyeCounts />
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-sm-6">
        <RadarChart />
      </div>
      <div class="col-sm-6 p-0">
        <SourceTypesMap />
        <!-- <SamplesChart /> -->
      </div>
    </div>
    <div class="row mt-5 pl-5">
      <!-- <StackedCircleChart /> -->
      <PackedCircle />
    </div>
    <!-- <div class="row" style="position: relative">
      <div class="col-sm-6"><SamplesChart /></div>
    </div> -->
  </div>
</template>

<script>
// import SamplesChart from "./components/SamplesChart.vue";
import SampleCountBarChart from "./components/SampleCountBarChart.vue";
import SourceTypesMap from "./components/SourceQualityMap.vue";
import RadarChart from "./components/RadarChart.vue";
import SourceTyeCounts from "./components/SourceTypeCounts.vue";
// import StackedCircleChart from "./components/StackedCircleChart.vue";
import PackedCircle from "./components/PackedCircle.vue";

export default {
  name: "App",
  components: {
    // StackedCircleChart,
    SourceTyeCounts,
    RadarChart,
    SampleCountBarChart,
    SourceTypesMap,
    PackedCircle,
  },
};
</script>

<style></style>
