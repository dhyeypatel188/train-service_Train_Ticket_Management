import bcrypt from "bcrypt";
import { CustomException } from "../../exception/custom.exception";
import { stat } from "fs";
import { TrainRepository } from "./train.repository";
import { CreateTrainDto, UpdateTrainDto } from "./train.dto";

const SALT_ROUNDS = 10;

export class TrainService {
  private trainRepository: TrainRepository;

  constructor() {
    this.trainRepository = new TrainRepository();
  }

  async createTrain(dto: CreateTrainDto) {
    await this.trainRepository.createTable();

    const train_name = await this.trainRepository.findTrainByTrainName(
      dto.train_name
    );
    if (train_name) {
      throw new CustomException(400, "Train Name already exists");
    }

    const result = await this.trainRepository.createStation(dto);
    return result;
  }

  async getAllTrain(page: number, limit: number, search: string) {
    await this.trainRepository.createTable();
    const result = await this.trainRepository.getTrain(page, limit, search);
    const totalTrain = await this.trainRepository.getTotalTrain(search);
    return {
      result: result.data,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(totalTrain.data / limit),
        totalItems: totalTrain.data,
      },
    };
  }

  async getOneTrain(train_id: string) {
    if (!train_id) {
      throw new CustomException(400, "Train id is required");
    }
    await this.trainRepository.createTable();
    const result = await this.trainRepository.findTrainById(train_id);
    if (!result) {
      throw new CustomException(400, "Train not found");
    }
    return result;
  }

  async deleteTrain(train_id: string) {
    if (!train_id) {
      throw new CustomException(400, "Train id is required");
    }

    const result = await this.trainRepository.findTrainById(train_id);
    if (!result) {
      throw new CustomException(400, "Train not found");
    }
    await this.trainRepository.deleteTrain(train_id);
  }

  async updateTrain(train_id: string, data: UpdateTrainDto) {
    if (!train_id) {
      throw new CustomException(400, "Train id is required");
    }

    const train = await this.trainRepository.findTrainById(train_id);
    if (!train) {
      throw new CustomException(400, "Train not found");
    }

    if (data.train_name) {
      const trainbyName = await this.trainRepository.findTrainByTrainName(
        data.train_name
      );
      if (train_id != trainbyName.train_id) {
        throw new CustomException(400, "Train name is already exist");
      }
    }
    const result = await this.trainRepository.updateTrain(train_id, data);
    return result;
  }
}
