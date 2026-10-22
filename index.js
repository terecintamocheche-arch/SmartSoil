console.log("Welcome to Smart Soil");
const projectName="SmartSoil";
console.log(projectName);

const cropSelect = document.getElementById("crop");
const soilSelect = document.getElementById("soil");
const checkButton = document.getElementById("check-threshold");
const result = document.getElementById("threshold-result");

const thresholds = {
  Maize: {
    Sand: 8,
    "Loamy sand": 10,
    "Sandy loam": 14,
    Loam: 19.5
  },
  Beans: {
    Sand: 8.4
  }
};

for (const crop in thresholds) {
  const option = document.createElement("option");

  option.value = crop;
  option.textContent = crop;

  cropSelect.appendChild(option);
}




