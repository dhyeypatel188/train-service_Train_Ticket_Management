import bcrypt from "bcrypt";
import { CustomException } from "../../exception/custom.exception";
import { StationRepository } from "./station.repository";
import { CreateStationDto, UpdateStationDto } from "./station.dto";
import { stat } from "fs";
import { TrainScheduleRepository } from "../TrainSchedule/train-schedule.repository";

const SALT_ROUNDS = 10;

export class StationService {
  private stationRepository: StationRepository;
  private trainScheduleRepository: TrainScheduleRepository;
  constructor() {
    this.stationRepository = new StationRepository();
    this.trainScheduleRepository = new TrainScheduleRepository()
  }

  async createStation(dto: CreateStationDto) {
    await this.stationRepository.createTable();

    const station_location =
      await this.stationRepository.findStationByStationLocation(
        dto.station_location
      );
    if (station_location) {
      throw new CustomException(400, "Station locations already exists");
    }

    const station_name = await this.stationRepository.findStationByStationName(
      dto.station_name
    );
    if (station_name) {
      throw new CustomException(400, "Station Name already exists");
    }

    const station = await this.stationRepository.createStation(dto);
    return station;
  }

  async getAllStation(page: number, limit: number, search: string) {
    await this.stationRepository.createTable();

    const result = await this.stationRepository.getStation(page, limit, search);
    const totalStation = await this.stationRepository.getTotalStation(search);
    return {
      result: result.data,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(totalStation.data / limit),
        totalItems: totalStation.data,
      },
    };
  }

  async getAllStationWithoutPagination(search: string) {
    await this.stationRepository.createTable();

    const result =
      await this.stationRepository.getStationWithoutPagination(search);
    return {
      result,
    };
  }

  async getOneStation(station_id: string) {
    const result = await this.stationRepository.findStationById(station_id);
    console.log(result);
    if (!result) {
      throw new CustomException(400, "Station not found");
    }
    return result;
  }

  async deleteStation(station_id: string) {
    const station = await this.stationRepository.findStationById(station_id);
    if (!station) {
      throw new CustomException(400, "Station not found");
    }
    console.log(station_id);
    const schedules =
      await this.trainScheduleRepository.findByStationId(station_id);
    console.log(schedules);
    for (const schedule of schedules) {
      await this.trainScheduleRepository.delete(schedule.schedule_id);
    }
    await this.stationRepository.deleteStation(station_id);
  }

  async updateStation(station_id: string, data: UpdateStationDto) {
    const station = await this.stationRepository.findStationById(station_id);
    if (!station) {
      throw new CustomException(400, "Station not found");
    }
    const result = await this.stationRepository.updateStation(station_id, data);
    return result;
  }
}
