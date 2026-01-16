export type ImageUploadJob = {
  id: number;
  listingId: number;
  path: string;
  storageKey: string;
  mimetype: string;
  retries: number;
};
