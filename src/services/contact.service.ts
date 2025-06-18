import { PrismaClient } from '@prisma/client';
import { IContactService } from './contact.service.interface';

const prisma = new PrismaClient();

export class ContactService implements IContactService {
  async identify(email?: string, phoneNumber?: string) {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email || undefined },
          { phonenumber: phoneNumber || undefined },
        ],
      },
    });

    if (contacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email,
          phonenumber: phoneNumber,
          linkprecedence: 'primary',
          createdat: new Date(),
          updatedat: new Date(),
        },
      });

      return {
        primaryContatctId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phonenumber],
        secondaryContactIds: [],
      };
    }

    // Flatten all linked contacts
    const allContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { linkedid: contacts[0].linkedid || contacts[0].id },
          { id: contacts[0].linkedid || contacts[0].id },
        ],
      },
      orderBy: { createdat: 'asc' },
    });

    const primary = allContacts.find(c => c.linkprecedence === 'primary')!;
    const existing = allContacts.map(c => ({
      email: c.email,
      phoneNumber: c.phonenumber,
    }));

    const newInfo = !existing.some(
      c => c.email === email && c.phoneNumber === phoneNumber
    );

    if (newInfo) {
      await prisma.contact.create({
        data: {
          email,
          phonenumber: phoneNumber,
          linkedid: primary.id,
          linkprecedence: 'secondary',
            createdat: new Date(),
            updatedat: new Date(),
        },
      });
    }

    const updated = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primary.id },
          { linkedid: primary.id },
        ],
      },
      orderBy: { createdat: 'asc' },
    });

    const emails = Array.from(new Set(updated.map(c => c.email).filter(Boolean)));
    const phoneNumbers = Array.from(new Set(updated.map(c => c.phonenumber).filter(Boolean)));
    const secondaryIds = updated.filter(c => c.linkprecedence === 'secondary').map(c => c.id);

    return {
      primaryContatctId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaryIds,
    };
  }
}
