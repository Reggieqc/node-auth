import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export class ImageController {
  constructor() {}
  getImage = (req: Request, res: Response) => {
    const { type = "", img = "" } = req.params;
    const imgPath = path.resolve(__dirname, `../../../uploads/${type}/${img}`);

    if (!fs.existsSync(imgPath)) {
      return res.status(404).send("Image not found");
    }

    res.sendFile(imgPath);
  };
}
