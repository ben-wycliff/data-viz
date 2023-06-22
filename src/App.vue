<template>
  <!-- <SamplesCount /> -->
  <div>
    <!-- <div class="row" style="position: relative">
      <div class="col-sm-6"><SamplesChart /></div>
    </div> -->
    <div class="container-fluid">
      <div class="row">
        <!-- Side Nav -->
        <div class="col-md-2 custom-side-nav text-white pt-5">
          <h3 class="p-3 text-center">
            Uganda <span style="color: yellow">Water Quality</span> Dashboard
          </h3>
          <p class="p-3 text-center">Made with D3.js</p>
          <div class="credentials">
            <div class="text-center">
              <h5 class="pb-2">Ben Wyclif Mugalu</h5>
              <h5>2022/HD05/1315U</h5>
              <p>MSc. Computer Science</p>
              <p>Makerere University</p>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="col-md-10 p-5 content-area">
          <!-- Add your content here -->
          <div class="row">
            <!-- <StackedCircleChart /> -->
            <PackedCircle />
          </div>
          <div class="row mt-5">
            <div class="col-sm-7">
              <SampleCountBarChart />
            </div>
            <div class="col-sm-5 p-0">
              <SourceTyeCounts />
            </div>
          </div>
          <div class="row mt-5">
            <div class="col-sm-6">
              <RadarChart />
            </div>
            <div class="col-sm-6 p-0">
              <SourceTypesMap />
              <!-- <SamplesChart /> -->
            </div>
          </div>
        </div>
      </div>
    </div>
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

  data() {
    return {
      isNavOpen: true, // Nav is initially open
    };
  },
  methods: {
    toggleNav() {
      this.isNavOpen = !this.isNavOpen;
    },
  },
};
</script>

<style>
.custom-side-nav {
  height: 100vh;
  background-color: #0b65a1;
}
.content-area {
  height: 100vh;
  overflow-y: scroll;
}
.credentials {
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
