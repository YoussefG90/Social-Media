import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


export const cloud = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECRET as string,
    secure: true,
  });
  return cloudinary;
};


export const uploadFile = async ({
  file,
  path = "general",
}: {
  file: { path: string };
  path?: string;
}): Promise<UploadApiResponse> => {
  return await cloud().uploader.upload(file.path, {
    folder: `${process.env.APP_NAME}/${path}`,
  });
};


export const destroyFile = async ({
  public_id,
}: {
  public_id: string;
}): Promise<{ result: string }> => {
  return await cloud().uploader.destroy(public_id);
};


export const uploadFiles = async ({
  files,
  path = "general",
}: {
  files: { path: string }[];
  path?: string;
}): Promise<{ secure_url: string; public_id: string }[]> => {
  const attachments: { secure_url: string; public_id: string }[] = [];
  for (const file of files) {
    const { secure_url, public_id } = await uploadFile({ file, path });
    attachments.push({ secure_url, public_id });
  }
  return attachments;
};


export const destroyResources = async ({
  public_ids,
  options = { type: "upload", resource_type: "Image" },
}: {
  public_ids: string[];
  options?: { type?: string; resource_type?: "Image" | "video" | "raw" };
}) => {
  return await cloud().api.delete_resources(public_ids, options);
};


export const deleteFolderByPrefix = async ({
  prefix,
}: {
  prefix: string;
}) => {
  return await cloud().api.delete_resources_by_prefix(
    `${process.env.APP_NAME}/${prefix}`
  );
};
