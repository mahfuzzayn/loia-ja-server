import { Request, Response } from 'express';
import { clickService } from './click.service';

export const clickController = {
  async getAll(req: Request, res: Response) {
    const data = await clickService.getAll();
    res.json(data);
  },
};
