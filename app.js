require("dotenv").config();
const tj = require("togeojson");
const fs = require("fs");
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require("xmldom").DOMParser;
const mbxClient = require("@mapbox/mapbox-sdk");
const mbxUploads = require("@mapbox/mapbox-sdk/services/uploads");
const mbxDatasets = require("@mapbox/mapbox-sdk/services/datasets");

const baseClient = mbxClient({ accessToken: process.env.ACCESS_TOKEN });
const uploadsService = mbxUploads(baseClient);
const datasetsService = mbxDatasets(baseClient);

const gpx = new DOMParser().parseFromString(
  fs.readFileSync("{PATH_TO_GPX}.gpx", "utf8")
);

const converted = tj.gpx(gpx);

datasetsService
  .putFeature({
    datasetId: "{DATESET ID}",
    featureId: converted.features[0].properties.name,
    feature: converted.features[0],
  })
  .send()
  .then(response => {
    const feature = response.body;

    const getCredentials = () => {
      return uploadsService
        .createUploadCredentials()
        .send()
        .then(response => response.body);
    };

    const updateTileset = credentials => {
      uploadsService
        .createUpload({
          mapId: "{ACCOUNT}.{TILESET NAME OR ID}",
          url: "mapbox://datasets/ACCOUNT/{DATASET ID}",
          tilesetName: "{TILESET NAME}",
        })
        .send()
        .then(response => {
          const upload = response.body;
        });
    };

    getCredentials()
      .then(updateTileset)
      .catch(err => {
        console.error(`getCredentials error: ${err.message}`);
      });
  })
  .catch(err => {
    console.error(err);
  });
