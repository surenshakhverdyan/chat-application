import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class PublicService {
  getImage(path: string): string {
    const imagePat = join(__dirname, '../..', 'uploads', path);
    return imagePat;
  }
}
