import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { FileUploadService } from "../services/file-upload.service";
import { UploadedFile } from "express-fileupload"; //TODO : Patron adaptador

export class FileUploadController {
  //DI
  constructor(private fileUploadService: FileUploadService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res
      .status(500)
      .json({ error: "Internal server error - check logs" });
  };

  uploadFile = (req: Request, res: Response) => {
    const type = req.params.type;
    const validTypes = ["users", "products", "categories"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type, valid types are: ${validTypes.join(", ")}`,
      });
    }

    const file = req.body.files[0] as UploadedFile;

    this.fileUploadService
      .uploadSingle(file, `uploads/${type}`)
      .then((uploaded) => {
        return res.json(uploaded);
      })
      .catch((error) => this.handleError(error, res));
  };

  uploadMultipleFile = (req: Request, res: Response) => {
    res.json("Upload multiple file");
  };
}
