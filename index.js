console.log("Welcome to Smart Soil");
const projectName="SmartSoil";
console.log(projectName);
let thresholds = [];
let thresholdsLoaded = false;
let currentReading = null;


const FIELD_LATITUDE = -2.75;
const FIELD_LONGITUDE = 39.50;

const HISTORY_KEY = "smartSoilHistory";


const soilType = document.getElementById("soilType");
const cropType = document.getElementById("cropType");
const configurationMessage =
  document.getElementById("configurationMessage");

const refreshBtn = document.getElementById("refreshBtn");
const moistureValue = document.getElementById("moistureValue");
const readingSource = document.getElementById("readingSource");
const irrigationStatus = document.getElementById("irrigationStatus");
const recommendation = document.getElementById("recommendation");
const readingTime = document.getElementById("readingTime");

const readingForm = document.getElementById("readingForm");
const fieldLocation = document.getElementById("fieldLocation");
const message = document.getElementById("message");
const historyBtn = document.getElementById("historyBtn");
const readingsTable = document.getElementById("readingsTable");


async function loadThresholds() {
  try {
    const response = await fetch("soil_moisture_thresholds.json");

    if (!response.ok) {
      throw new Error("Could not load the threshold file.");
    }

    const data = await response.json();

    if (!Array.isArray(data.records)) {
      throw new Error("The JSON file has an unexpected format.");
    }

    thresholds = data.records;
    thresholdsLoaded = true;

    console.log("Threshold data loaded:", thresholds);
  } catch (error) {
    console.error("Error loading threshold data:", error);

    configurationMessage.textContent =
      "Could not load threshold data. Check the JSON file and refresh.";
  }
}


function findThreshold() {
  const selectedSoil = soilType.value;
  const selectedCrop = cropType.value;

  if (!selectedSoil || !selectedCrop) {
    configurationMessage.textContent =
      "Please select both a soil type and a crop.";
    return null;
  }

  if (!thresholdsLoaded) {
    configurationMessage.textContent =
      "Threshold data is still loading. Please try again.";
    return null;
  }

  const matchingRecord = thresholds.find(function (record) {
    return (
      record.soilType === selectedSoil &&
      record.crop === selectedCrop
    );
  });

  if (!matchingRecord) {
    configurationMessage.textContent =
      "No threshold was found for this combination.";
    return null;
  }

  configurationMessage.textContent =
    "Reference threshold: " +
    matchingRecord.threshold +
    "%. Field capacity: " +
    matchingRecord.fieldCapacity +
    "%. Wilting point: " +
    matchingRecord.wiltingPoint +
    "%.";

  return matchingRecord;
}


function assessIrrigation() {
  const record = findThreshold();

  if (!record || !currentReading) {
    irrigationStatus.textContent = "Awaiting data";
    recommendation.textContent =
      "Select a crop and soil, then fetch a moisture reading.";
    return;
  }

  if (currentReading.moisturePercent <= record.threshold) {
    irrigationStatus.textContent = "Below threshold";

    recommendation.textContent =
      "The modelled moisture is at or below the reference threshold. " +
      "Check field conditions and your irrigation plan.";
  } else {
    irrigationStatus.textContent = "Above threshold";

    recommendation.textContent =
      "The modelled moisture is above the reference threshold. " +
      "Continue monitoring and check field conditions before irrigating.";
  }
}


async function fetchMoisture() {
  if (!thresholdsLoaded) {
    readingSource.textContent = "Threshold data is not ready.";
    return;
  }

  if (!soilType.value || !cropType.value) {
    configurationMessage.textContent =
      "Please select both a soil type and a crop first.";
    return;
  }

  refreshBtn.disabled = true;
  refreshBtn.textContent = "Fetching...";

  readingSource.textContent = "Connecting to the soil-moisture API...";

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + FIELD_LATITUDE +
      "&longitude=" + FIELD_LONGITUDE +
      "&hourly=soil_moisture_27_to_81cm" +
      "&past_days=1" +
      "&forecast_days=1" +
      "&timezone=Africa%2FNairobi";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("The soil-moisture API request failed.");
    }

    const data = await response.json();

    const times = data.hourly?.time;
    const moistureValues =
      data.hourly?.soil_moisture_27_to_81cm;

    if (!times || !moistureValues) {
      throw new Error("The API did not return soil-moisture data.");
    }

    
    const now = new Date();
    let readingIndex = -1;

    for (let i = 0; i < times.length; i++) {
      if (
        new Date(times[i]) <= now &&
        moistureValues[i] !== null &&
        Number.isFinite(moistureValues[i])
      ) {
        readingIndex = i;
      }
    }

    if (readingIndex === -1) {
      throw new Error("No suitable hourly reading was returned.");
    }

    
    const moisturePercent = moistureValues[readingIndex] * 100;

    currentReading = {
      moisturePercent: moisturePercent,
      time: times[readingIndex],
      source: "Open-Meteo modelled soil moisture"
    };

    moistureValue.textContent =
      moisturePercent.toFixed(1) + "%";

    readingSource.textContent =
      "Source: Open-Meteo modelled data (27–81 cm layer)";

    readingTime.textContent =
      "Reading time: " + currentReading.time;

    assessIrrigation();

    console.log("Current modelled reading:", currentReading);
  } catch (error) {
    console.error("Moisture fetch error:", error);

    readingSource.textContent =
      "Could not retrieve soil-moisture data. Please try again.";

    irrigationStatus.textContent = "Unavailable";
    recommendation.textContent =
      "No new reading is available. Check your connection and try again.";
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "Fetch moisture";
  }
}


function getHistory() {
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Could not read saved history:", error);
    return [];
  }
}


function renderHistory() {
  const history = getHistory();

  readingsTable.replaceChildren();

  if (history.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.className = "text-center muted";
    cell.textContent = "No saved analyses yet.";

    row.appendChild(cell);
    readingsTable.appendChild(row);
    return;
  }

  history.forEach(function (item) {
    const row = document.createElement("tr");

    const values = [
      item.date,
      item.location,
      item.soil,
      item.crop,
      item.moisture + "%",
      item.recommendation
    ];

    values.forEach(function (value) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    readingsTable.appendChild(row);
  });
}


async function saveAnalysis(event) {
  event.preventDefault();

  if (!currentReading) {
    message.textContent =
      "Fetch a moisture reading before saving an analysis.";
    return;
  }

  const record = findThreshold();

  if (!record) {
    message.textContent =
      "Choose a crop and soil with a matching threshold first.";
    return;
  }

  const analysis = {
    date: new Date().toLocaleString(),
    location: fieldLocation.value.trim(),
    soil: soilType.value,
    crop: cropType.value,
    moisture: currentReading.moisturePercent.toFixed(1),
    threshold: record.threshold,
    recommendation: recommendation.textContent,
    source: currentReading.source
  };

  if (!analysis.location) {
    message.textContent = "Please enter the field location.";
    return;
  }

  try {
    
    const history = getHistory();
    history.unshift(analysis);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();

    message.textContent = "Analysis saved in this browser.";

    
  
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(analysis)
        }
      );

      if (!response.ok) {
        throw new Error("Demo POST request failed.");
      }

      const result = await response.json();
      console.log("Demo POST response:", result);

      message.textContent =
        "Analysis saved locally. Demo POST request succeeded.";
    } catch (error) {
      console.error("Demo POST error:", error);

      message.textContent =
        "Analysis saved locally, but the demo POST request failed.";
    }
  } catch (error) {
    console.error("Could not save analysis:", error);

    message.textContent =
      "Could not save locally. Check your browser storage settings.";
  }
}


soilType.addEventListener("change", assessIrrigation);
cropType.addEventListener("change", assessIrrigation);
refreshBtn.addEventListener("click", fetchMoisture);
readingForm.addEventListener("submit", saveAnalysis);
historyBtn.addEventListener("click", renderHistory);

// 11. Start the app
renderHistory();
loadThresholds();




  
  
  




