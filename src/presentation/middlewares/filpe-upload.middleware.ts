import { Request, Response, NextFunction } from "express";

export class FileUploadMiddleware {
  static containFiles(req: Request, res: Response, next: NextFunction) {
    const files = req.files;
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }
    if (!Array.isArray(files.file)) {
      req.body.files = [files.file];
    } else {
      req.body.files = files.file;
    }
    next();
  }
}
