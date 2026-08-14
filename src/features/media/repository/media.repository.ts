import { Media, Prisma, StorageProvider } from "../../../generated/prisma/client";

export type MediaModel = {
  filename: string;
  key: string;
  url: string;
  mimetype: string;
  size: number;
  provider: StorageProvider;
}

export class MediaRepository {
    async createMedia(prisma: Prisma.TransactionClient, payload: MediaModel): Promise<Partial<Media>> {
        return prisma.media.create({ data: payload })
    }
}