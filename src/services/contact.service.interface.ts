export interface IContactService {
  identify(email?: string, phonenumber?: string): Promise<any>;
}
