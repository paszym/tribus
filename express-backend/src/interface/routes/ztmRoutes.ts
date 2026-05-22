import { Router } from 'express';
import { ZtmController } from '@/interface/controllers/ZtmController';

const router = Router();
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
 *     summary: Pobierz pozycje pojazdów
 *     description: Aktualne pozycje GPS wszystkich pojazdów.
 *     tags: [ZTM]
 *     responses:
 *       200:
 *         description: Sukces
 *       502:
 *         description: Błąd zewnętrznego API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/positions', (req, res, next) => {
  void ztmController.getVehiclePositions(req, res, next);
});

/**
 * @swagger
 * /ztm/departures:
 *   get:
 *     summary: Pobierz odjazdy z przystanku
 *     description: Odjazdy dla podanego ID przystanku.
 *     tags: [ZTM]
 *     parameters:
 *       - name: stopId
 *         in: query
 *         required: true
 *         description: ID przystanku
 *         schema:
 *           type: string
 *           example: "1234"
 *     responses:
 *       200:
 *         description: Sukces
 *       422:
 *         description: Brak wymaganego parametru stopId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Błąd zewnętrznego API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/departures', (req, res, next) => {
  void ztmController.getDeparturesFromStop(req, res, next);
});

/**
 * @swagger
 * /ztm/stops:
 *   get:
 *     summary: Pobierz wszystkie przystanki
 *     description: Lista wszystkich przystanków z nazwami.
 *     tags: [ZTM]
 *     responses:
 *       200:
 *         description: Sukces
 *       502:
 *         description: Błąd zewnętrznego API lub brak danych
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stops', (req, res, next) => {
  void ztmController.getStops(req, res, next);
});

export default router;
