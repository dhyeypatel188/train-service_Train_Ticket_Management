import { NextFunction, Request, Response, Router } from "express";
import { adminOnly } from "../../middleware/admin.middleware";
import { StationController } from "./station.controller";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateStationDto, UpdateStationDto } from "./station.dto";

function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body, {
      enableImplicitConversion: true,
    });
    const errors = await validate(dto);
    if (errors.length) {
      res.status(400).json({
        message: "Validation failed",
        details: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }
    req.body = dto; // forward the validated & transformed object
    next();
  };
}

const router = Router();
const stationController = new StationController();

// Admin-only routes
router.post(
  "/station",
  adminOnly,
  validateDto(CreateStationDto),
  stationController.create.bind(stationController)
);
router.delete(
  "/station/:station_id",
  adminOnly,
  stationController.deleteStation.bind(stationController)
);

router.post(
  "/station/list",
  adminOnly,
  stationController.getAllStation.bind(stationController)
);

router.get(
  "/station/:station_id",
  adminOnly,
  stationController.getOneStation.bind(stationController)
);

router.put(
  "/station/:station_id",
  adminOnly,
  validateDto(UpdateStationDto),
  stationController.updateStation.bind(stationController)
);

router.post(
  "/station/list/needAllData",
  stationController.getAllStationWithoutPagination.bind(stationController)
);
export default router;
