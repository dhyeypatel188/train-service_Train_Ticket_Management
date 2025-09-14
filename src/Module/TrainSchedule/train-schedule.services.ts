import { TrainScheduleRepository } from "./train-schedule.repository";
import {
  CreateTrainScheduleDto,
  UpdateTrainScheduleDto,
} from "./train-schedule.dto";
import { CustomException } from "../../exception/custom.exception";
import { stat } from "fs";

export class TrainScheduleService {
  private trainScheduleRepository: TrainScheduleRepository;

  constructor() {
    this.trainScheduleRepository = new TrainScheduleRepository();
  }

  async create(data: CreateTrainScheduleDto) {
    await this.trainScheduleRepository.createTable();

    // Validate time formats
    this.validateTimeFormat(data.arrivalTime, "arrivalTime");
    this.validateTimeFormat(data.departureTime, "departureTime");

    const trainStation =
      await this.trainScheduleRepository.findByTrainandStation(
        data.trainId,
        data.stationId
      );
    if (trainStation.length > 0) {
      throw new CustomException(
        400,
        "This train is already scheduled with this station"
      );
    }

    // For start stations, validate that arrival time makes sense
    if (data.isStart) {
      // Start station might have a specific arrival time requirement
      // Example: Should be early in the day or specific pattern
      this.validateStartStationTime(data.arrivalTime);
    }

    // For end stations, validate that departure time makes sense
    if (data.isEnd) {
      // End station might have a specific departure time requirement
      this.validateEndStationTime(data.departureTime);
    }

    const existingSchedules = await this.trainScheduleRepository.findByTrainId(
      data.trainId
    );
    const previousStop = existingSchedules.find(
      (s) => s.stop_number === data.stopNumber - 1
    );
    const nextStop = existingSchedules.find(
      (s) => s.stop_number === data.stopNumber + 1
    );

    if (previousStop) {
      // New stop's arrival should be after previous stop's departure
      if (
        this.compareTimes(data.arrivalTime, previousStop.departure_time) <= 0
      ) {
        throw new CustomException(
          400,
          `Arrival time must be after previous station's departure time (${previousStop.departure_time})`
        );
      }
    }

    if (nextStop) {
      // New stop's departure should be before next stop's arrival
      if (this.compareTimes(data.departureTime, nextStop.arrival_time) >= 0) {
        throw new CustomException(
          400,
          `Departure time must be before next station's arrival time (${nextStop.arrival_time})`
        );
      }
    }
    // Check if isStart already exists for this train
    if (data.isStart) {
      const existingStart = existingSchedules.find(
        (schedule) => schedule.is_start
      );
      if (existingStart) {
        throw new CustomException(
          400,
          `This train already has a starting station (${existingStart.station_name}). Only one starting station allowed per train.`
        );
      }
    }

    // Check if isEnd already exists for this train
    if (data.isEnd) {
      const existingEnd = existingSchedules.find((schedule) => schedule.is_end);
      if (existingEnd) {
        throw new CustomException(
          400,
          `This train already has an ending station (${existingEnd.station_name}). Only one ending station allowed per train.`
        );
      }
    }

    if (existingSchedules.length > 0) {
      const existingStopNumbers = existingSchedules.map((s) => s.stop_number);

      if (existingStopNumbers.includes(data.stopNumber)) {
        throw new CustomException(
          400,
          `Stop number ${data.stopNumber} already exists for this train. Please use a unique stop number.`
        );
      }
    }

    return await this.trainScheduleRepository.create(data);
  }

  private validateTimeFormat(time: string, fieldName: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(time)) {
      throw new CustomException(
        400,
        `${fieldName} must be in valid time format (HH:MM or HH:MM:SS)`
      );
    }

    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    if (hoursNum < 0 || hoursNum > 23) {
      throw new CustomException(
        400,
        `${fieldName} hours must be between 00 and 23`
      );
    }
    if (minutesNum < 0 || minutesNum > 59) {
      throw new CustomException(
        400,
        `${fieldName} minutes must be between 00 and 59`
      );
    }
  }
  private compareTimes(time1: string, time2: string): number {
    const [h1, m1, s1] = time1.split(":").map(Number);
    const [h2, m2, s2] = time2.split(":").map(Number);

    if (h1 !== h2) return h1 - h2;
    if (m1 !== m2) return m1 - m2;
    return (s1 || 0) - (s2 || 0);
  }
  private validateStartStationTime(arrivalTime: string): void {
    // Example: Start station arrival time should be reasonable (not too late)
    const [hours] = arrivalTime.split(":");
    const hoursNum = parseInt(hours, 10);

    if (hoursNum > 12) {
      // Example: Start stations typically start in the morning
      throw new CustomException(
        400,
        "Start station arrival time should typically be in the morning"
      );
    }
  }

  private validateEndStationTime(departureTime: string): void {
    // Example: End station departure time should be reasonable (not too early)
    const [hours] = departureTime.split(":");
    const hoursNum = parseInt(hours, 10);

    // if (hoursNum < 12) {
    // Example: End stations typically end in the afternoon/evening
    // throw new CustomException(
    //   400,
    //   "End station departure time should typically be in the afternoon or evening"
    // );
    // }
  }

  async findById(id: string) {
    await this.trainScheduleRepository.createTable();

    const schedule = await this.trainScheduleRepository.findById(id);
    if (!schedule) {
      throw new CustomException(404, "Train schedule not found");
    }
    return schedule;
  }

  async update(id: string, data: UpdateTrainScheduleDto) {
    // First get the existing schedule to know the current train_id
    const existingSchedule = await this.trainScheduleRepository.findById(id);
    if (!existingSchedule) {
      throw new CustomException(404, "Train schedule not found");
    }

    const trainId = existingSchedule.train_id;

    // Check if updating station_id and if it would create a duplicate
    if (
      data.station_id !== undefined &&
      data.station_id !== existingSchedule.station_id
    ) {
      const trainStation =
        await this.trainScheduleRepository.findByTrainandStation(
          trainId,
          data.station_id
        );
      if (trainStation.length > 0) {
        throw new CustomException(
          400,
          "This train is already scheduled with this station"
        );
      }
    }

    // Validate arrival/departure time constraints
    if (
      data.arrival_time === null &&
      !(data.is_start ?? existingSchedule.is_start)
    ) {
      throw new CustomException(
        400,
        "ArrivalTime cannot be null unless isStart is true"
      );
    }

    if (
      data.departure_time === null &&
      !(data.is_end ?? existingSchedule.is_end)
    ) {
      throw new CustomException(
        400,
        "DepartureTime cannot be null unless isEnd is true"
      );
    }

    // Get all schedules for this train to validate against
    const existingSchedules =
      await this.trainScheduleRepository.findByTrainId(trainId);
    const otherSchedules = existingSchedules.filter(
      (s) => s.schedule_id !== id
    );

    // Check for duplicate isStart flag
    if (data.is_start !== undefined) {
      if (data.is_start) {
        const existingStart = otherSchedules.find(
          (schedule) => schedule.is_start
        );
        if (existingStart) {
          throw new CustomException(
            400,
            `This train already has a starting station (${existingStart.station_name}). Only one starting station allowed per train.`
          );
        }
      }
    }

    // Check for duplicate isEnd flag
    if (data.is_end !== undefined) {
      if (data.is_end) {
        const existingEnd = otherSchedules.find((schedule) => schedule.is_end);
        if (existingEnd) {
          throw new CustomException(
            400,
            `This train already has an ending station (${existingEnd.station_name}). Only one ending station allowed per train.`
          );
        }
      }
    }

    // Check for duplicate stop number
    if (
      data.stop_number !== undefined &&
      data.stop_number !== existingSchedule.stop_number
    ) {
      const existingStopNumbers = otherSchedules.map((s) => s.stop_number);

      if (existingStopNumbers.includes(data.stop_number)) {
        const conflictingStation = otherSchedules.find(
          (s) => s.stop_number === data.stop_number
        );
        throw new CustomException(
          400,
          `Stop number ${data.stop_number} is already used by station "${conflictingStation.station_name}". Please choose a different stop number.`
        );
      }
    }

    // Perform the update
    const updated = await this.trainScheduleRepository.update(id, data);
    if (!updated) {
      throw new CustomException(404, "Train schedule not found");
    }

    return updated;
  }
  async delete(id: string) {
    const deleted = await this.trainScheduleRepository.delete(id);
    if (!deleted) {
      throw new CustomException(404, "Train schedule not found");
    }
    return deleted;
  }

  async findByTrainId(trainId: string) {
    await this.trainScheduleRepository.createTable();

    const schedules = await this.trainScheduleRepository.findByTrainId(trainId);
    if (!schedules) {
      throw new CustomException(404, "Train schedules not found");
    }
    return schedules;
  }

  async findByStationId(stationId: string) {
    const schedules =
      await this.trainScheduleRepository.findByStationId(stationId);
    if (!schedules) {
      throw new CustomException(404, "Train schedules not found");
    }
    return schedules;
  }

  async findByTrainStationId(train_id: string, station_id: string) {
    await this.trainScheduleRepository.createTable();

    const result = await this.trainScheduleRepository.findByTrainandStation(
      train_id,
      station_id
    );
    return result;
  }

  async getAllTrain(page: number, limit: number, search: string) {
    await this.trainScheduleRepository.createTable();
    const result = await this.trainScheduleRepository.getSchedule(
      page,
      limit,
      search
    );
    return {
      result: result.data,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
      },
    };
  }
}
