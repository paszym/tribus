import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const ZTM_BASE_URL = 'https://ckan2.multimediagdansk.pl';
const ZTM_STOPS_URL =
  'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json';

const DeparturesQuerySchema = z.object({
  stopId: z.string({ error: 'Missing required parameter: stopId' }),
});

export class ZtmController {
  async getVehiclePositions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await axios.get(`${ZTM_BASE_URL}/gpsPositions?v=2`);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async getDeparturesFromStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stopId } = DeparturesQuerySchema.parse(req.query);
      const response = await axios.get(`${ZTM_BASE_URL}/departures?stopId=${stopId}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async getStops(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response =
        await axios.get<Record<string, { stops: { stopName: string | null }[] }>>(ZTM_STOPS_URL);

      const latestKey = Object.keys(response.data).sort()[0];
      if (!latestKey) {
        res.status(502).json({ code: 'UPSTREAM_ERROR', message: 'No stops data available' });
        return;
      }

      const stops = response.data[latestKey]?.stops.filter((stop) => stop.stopName !== null) ?? [];
      res.status(200).json(stops);
    } catch (error) {
      next(error);
    }
  }
}
