const axios = require("axios");

class ZtmController {
  async getVehiclePositions(req, res) {
    try {
      const response = await axios.get("https://ckan2.multimediagdansk.pl/gpsPositions?v=2");
      res.status(response.status).json(response.data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getDeparturesFromStop(req, res) {
    const stopId = req.query.stopId;
    if (!stopId) {
      return res.status(400).json({ error: "Missing required parameter: stopId" });
    }

    try {
      const response = await axios.get(`https://ckan2.multimediagdansk.pl/departures?stopId=${stopId}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getStops(req, res) {
    try {
      const response = await axios.get("https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json");

      const data = response.data;
      const latestKey = Object.keys(data).sort()[0];
      const latestData = data[latestKey].stops;
      const filteredStops = latestData.filter(
        stop => stop.stopName !== null
      );
      res.status(200).send(filteredStops);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  handleError(error, res) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data || "An error occurred while contacting the API.",
      });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
}

module.exports = ZtmController;
