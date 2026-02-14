import { Request, Response, NextFunction } from "express";

export const respondTo =
  (...acceptedFormats: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const formatHandlers = Object.fromEntries(
      acceptedFormats.map((format) => [
        format,
        () => {
          next();
        },
      ])
    );

    res.format({
      ...formatHandlers,
      default: () => {
        res.status(406).json({ error: "Not Acceptable" });
      },
    });
  };

