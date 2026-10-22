const API_URL = "https://api.open-meteo.com/v1/forecast";
const FIELD = {
  latitude: -2.9500,
  longitude: 39.5000
};
const soilType = document.querySelector("#soilType");
const cropType = document.querySelector("#cropType");
const configurationForm = document.querySelector("#configurationForm");
const configurationMessage = document.querySelector("#configurationMessage");
const moistureValue = document.querySelector("#moistureValue");
const readingSource = document.querySelector("#readingSource");
const irrigationStatus = document.querySelector("#irrigationStatus");
const recommendation = document.querySelector("#recommendation");
const readingTime = document.querySelector("#readingTime");
const refreshBtn = document.querySelector("#refreshBtn");
const readingForm = document.querySelector("#readingForm");
const fieldLocation = document.querySelector("#fieldLocation");
const message = document.querySelector("#message");
const saveBtn = document.querySelector("#saveBtn");
const historyBtn = document.querySelector("#historyBtn");
const readingsTable = document.querySelector("#readingsTable");

