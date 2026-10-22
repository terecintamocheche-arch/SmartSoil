console.log("Welcome to Smart Soil");
const projectName="SmartSoil";
console.log(projectName);

fetch("soil_moisture_thresholds.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    thresholds = data.records;
    console.log("Threshold data loaded:", thresholds);
  })
  .catch(function (error) {
    console.log("Error loading threshold data:", error);
  });

