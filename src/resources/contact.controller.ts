import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;
  const service = new ContactService();
  const result = await service.identify(email, phoneNumber);
  res.status(200).json({ contact: result });
};
