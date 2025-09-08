import { Router } from "express";
import { adminOnly } from "../../middleware/admin.middleware";
import { TrainController } from "./train.controller";

// train.router.ts
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { Request, Response, NextFunction } from "express";
import { CreateTrainDto, UpdateTrainDto } from "./train.dto";

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
const trainController = new TrainController();

router.post(
  "/train",
  adminOnly,
  validateDto(CreateTrainDto),
  trainController.create.bind(trainController)
);
router.delete(
  "/train/:id",
  adminOnly,
  trainController.deleteTrain.bind(trainController)
);

router.post(
  "/train/list",
  adminOnly,
  trainController.getAllTrain.bind(trainController)
);

router.get(
  "/train/:id",
  adminOnly,
  trainController.getOneTrain.bind(trainController)
);

router.put(
  "/train/:id",
  adminOnly,
  validateDto(UpdateTrainDto),
  trainController.updateTrain.bind(trainController)
);

export default router;
