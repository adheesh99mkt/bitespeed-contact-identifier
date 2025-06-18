import express from 'express';
import { identifyContact } from '../resources/contact.controller';

const router = express.Router();
router.post('/', identifyContact);
export default router;
