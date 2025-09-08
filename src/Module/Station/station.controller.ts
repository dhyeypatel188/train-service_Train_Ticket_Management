import { Request, Response } from "express";
import { ResponseUtil } from "../../utils/response.utils";
import { CustomException } from "../../exception/custom.exception";

import { plainToInstance } from "class-transformer";
import { StationService } from "./station.services";
import { CreateStationDto, UpdateStationDto } from "./station.dto";
import { stat } from "fs";

export class StationController {
  private stationService: StationService;

  constructor() {
    this.stationService = new StationService();
  }

  async create(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateStationDto, req.body, {
        enableImplicitConversion: true,
      });

      const station = await this.stationService.createStation(dto);
      const response = ResponseUtil.success(
        station,
        "Station created successfully"
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

  async getAllStation(req: Request, res: Response) {
    try {
      // const dto = plainToInstance(CreateStationDto, req.body, {
      //   enableImplicitConversion: true,
      // });

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search ? (req.query.search as string) : "";

      const station = await this.stationService.getAllStation(
        page,
        limit,
        search
      );
      const response = ResponseUtil.success(
        station.result,
        "Station get successfully",
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

  async getOneStation(req: Request, res: Response) {
    try {
      const { station_id } = req.params;
      console.log(station_id);
      const station = await this.stationService.getOneStation(station_id);
      const response = ResponseUtil.success(
        station,
        "One Station get successfully"
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

  async updateStation(req: Request, res: Response) {
    try {
      const dto = plainToInstance(UpdateStationDto, req.body, {
        enableImplicitConversion: true,
      });
      const { station_id } = req.params;

      const station = await this.stationService.updateStation(station_id, dto);
      const response = ResponseUtil.success(
        station,
        "Station update successfully"
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

  async deleteStation(req: Request, res: Response) {
    try {
      const { station_id } = req.params;
      const station = await this.stationService.deleteStation(station_id);
      const response = ResponseUtil.success(
        station,
        "Station delete successfully"
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

  async getAllStationWithoutPagination(req: Request, res: Response) {
    try {
      // const dto = plainToInstance(CreateStationDto, req.body, {
      //   enableImplicitConversion: true,
      // });

      const { search = "" } = req.body || {};

      const station =
        await this.stationService.getAllStationWithoutPagination(search);
      const response = ResponseUtil.success(
        station.result.data,
        "Station get successfully"
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
