console.log("Welcome to Smart Soil");
const projectName="SmartSoil";
console.log(projectName);

const soilSelect = document.getElementById("soilType");
const cropSelect = document.getElementById("cropType");
const message = document.getElementById("configurationMessage");
const refreshButton = document.getElementById("refreshBtn");
const recommendation = document.getElementById("recommendation");

soilSelect.addEventListener("change", function () {
  message.textContent = "Soil selected: " + soilSelect.value;
});

soilSelect.addEventListener("change", function () {
  message.textContent = "Soil selected: " + soilSelect.value;
});

refreshButton.addEventListener("click", function () {
  recommendation.textContent =
    "The moisture API connection is not set up yet.";
});

