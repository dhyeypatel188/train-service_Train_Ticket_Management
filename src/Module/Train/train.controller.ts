import { Request, Response } from "express";
import { ResponseUtil } from "../../utils/response.utils";
import { CustomException } from "../../exception/custom.exception";

import { plainToInstance } from "class-transformer";
import { TrainService } from "./train.services";
import { CreateTrainDto, UpdateTrainDto } from "./train.dto";
import { validate } from "class-validator";

export class TrainController {
  private trainService: TrainService;

  constructor() {
    this.trainService = new TrainService();
  }

  async create(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateTrainDto, req.body, {
        enableImplicitConversion: true,
      });

      const result = await this.trainService.createTrain(dto);
      const response = ResponseUtil.success(
        result,
        "Train created successfully"
      );
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async getAllTrain(req: Request, res: Response) {
    try {
      // Get parameters from query string with defaults
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search ? (req.query.search as string) : "";

      const station = await this.trainService.getAllTrain(page, limit, search);
      const response = ResponseUtil.success(
        station.result,
        "Trains get successfully",
        station.pagination
      );
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async getOneTrain(req: Request, res: Response) {
    try {
      const train_id = req.params.id;
      console.log(train_id);
      console.log("train_id123");
      const station = await this.trainService.getOneTrain(train_id);
      const response = ResponseUtil.success(
        station,
        "Get one Train successfully"
      );
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async updateTrain(req: Request, res: Response) {
    try {
      const dto = plainToInstance(UpdateTrainDto, req.body, {
        enableImplicitConversion: true,
      });
      const train_id = req.params.id;

      const train = await this.trainService.updateTrain(train_id, dto);
      const response = ResponseUtil.success(train, "Train update successfully");
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }

  async deleteTrain(req: Request, res: Response) {
    try {
      const train_id = req.params.id;
      const station = await this.trainService.deleteTrain(train_id);
      const response = ResponseUtil.success(
        station,
        "Train delete successfully"
      );
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomException) {
        res
          .status(error.response.responseStatusList.statusList[0].statusCode)
          .json(error.response);
      } else {
        console.log(error);
        const customError = new CustomException(
          400,
          "Validation failed",
          error
        );
        res.status(400).json(customError.response);
      }
    }
  }
}
