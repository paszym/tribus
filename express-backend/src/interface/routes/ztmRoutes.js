const express = require("express");
const ZtmController = require("../controllers/ZtmController");

const router = express.Router();

const ztmController = new ZtmController();

/**
 * @swagger
 * tags:
 *   - name: ZTM
 *     description: API do obsługi otwartych danych ZTM Gdańsk
 */

/**
 * @swagger
 * /ztm/positions:
 *   get:
 *     summary: Get vehicle positions
 *     description: Fetches the current GPS positions of all vehicles.
 *     tags: [ZTM]
 *     responses:
 *       200:
 *         description: Successfully fetched vehicle positions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 positions: []
 *       500:
 *         description: Internal server error.
 */
router.get("/positions", (req, res) => {
  ztmController.getVehiclePositions(req, res);
});

/**
 * @swagger
 * /ztm/departures?stopId={id}:
 *   get:
 *     summary: Get departures from a specific stop
 *     description: Fetches the departures for a given stop ID.
 *     tags: [ZTM]
 *     parameters:
 *         name: stopId
 *         in: query
 *         required: true
 *         description: The ID of the stop.
 *         schema:
 *           type: string
 *           example: "1234"
 *     responses:
 *       200:
 *         description: Successfully fetched departures.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 departures: []
 *       400:
 *         Missing required parameter: stopId.
 *       500:
 *         description: Internal server error.
 */
router.get("/departures", (req, res) => {
  ztmController.getDeparturesFromStop(req, res);
});

/**
 * @swagger
 * /ztm/stops:
 *   get:
 *     summary: Get all stops
 *     description: Fetches a list of all stops.
 *     tags: [ZTM]
 *     responses:
 *       200:
 *         description: Successfully fetched stops.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 stops: []
 *       500:
 *         description: Internal server error.
 */
router.get("/stops", (req, res) => {
  ztmController.getStops(req, res);
});

module.exports = router;
