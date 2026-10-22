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

  const soilType = document.getElementById("soilType");
  const cropType = document.getElementById("cropType");
  const configurationMessage = document.getElementById("configurationMessage");

  function findThreshold() {
  const selectedSoil = soilType.value;
  const selectedCrop = cropType.value;

   if (selectedSoil === "" || selectedCrop === "") {
    configurationMessage.textContent =
      "Please select both a soil type and a crop.";
    return;
  }

  const matchingRecord = thresholds.find(function (record) {
    return (
      record.soilType === selectedSoil &&
      record.crop === selectedCrop
    );
  });

   if (matchingRecord) {
    configurationMessage.textContent =
      "Threshold found: " +
      matchingRecord.threshold +
      "%. Field capacity: " +
      matchingRecord.fieldCapacity +
      "%. Wilting point: " +
      matchingRecord.wiltingPoint +
      "%.";
  } else {
    configurationMessage.textContent =
      "No threshold record was found for this soil and crop combination.";
  }
}



soilType.addEventListener("change", findThreshold);
cropType.addEventListener("change", findThreshold);



  
  
  




