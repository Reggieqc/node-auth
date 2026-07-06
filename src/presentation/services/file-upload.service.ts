import { UploadedFile } from "express-fileupload";
import path from "node:path";
import fs from "fs";
import { Uuid } from "../../config";
import { CustomError } from "../../domain";

export class FileUploadService {
  constructor(private readonly uuid = Uuid.v4) {}

  private checkFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  async uploadSingle(
    file: UploadedFile,
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif", "pdf"],
  ) {
    try {
      const fileExtension = file.mimetype.split("/")[1] ?? "";
      if (!validExtensions.includes(fileExtension)) {
        throw CustomError.badRequest(
          `Invalid file extension, ${fileExtension}`,
        );
      }
      const destination = path.resolve(__dirname, "../../../", folder);
      this.checkFolder(destination);

      const fileName = `${this.uuid()}.${fileExtension}`;
      file.mv(destination + `/${fileName}`);

      return { fileName };
    } catch (error) {
      throw error;
    }
  }

  async uploadMultiple(
    files: UploadedFile[],
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif", "pdf"],
  ) {
    const uploadPromises = files.map((file) =>
      this.uploadSingle(file, folder, validExtensions),
    );
    const fileNames = await Promise.all(uploadPromises);
    return fileNames;
  }
}
