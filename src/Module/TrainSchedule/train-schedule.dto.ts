import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
  IsBoolean,
  Matches,
} from "class-validator";

export class CreateTrainScheduleDto {
  @IsNotEmpty()
  @IsString()
  trainId: string;

  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsNotEmpty()
  @IsString()
  station_name: string;

  @IsNotEmpty()
  @IsNumber()
  stopNumber: number;

  @IsNotEmpty()
  @IsNumber()
  platformNumber: number;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "arrivalTime must be a valid time format (HH:MM or HH:MM:SS)",
  })
  arrivalTime: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "departureTime must be a valid time format (HH:MM or HH:MM:SS)",
  })
  departureTime: string;

  @IsNotEmpty()
  @IsNumber()
  dayOffset: number;

  @IsNotEmpty()
  @IsBoolean()
  isStart: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isEnd: boolean;
}

export class UpdateTrainScheduleDto {
  @IsOptional()
  @IsNumber()
  train_id?: string;

  @IsOptional()
  @IsNumber()
  station_id?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  station_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  stop_number?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  platform_number?: number;

  @IsOptional()
  @IsString()
  arrival_time?: string;

  @IsOptional()
  @IsString()
  departure_time?: string;

  @IsOptional()
  @IsNumber()
  day_offset?: number;

  @IsOptional()
  @IsBoolean()
  is_start?: boolean;

  @IsOptional()
  @IsBoolean()
  is_end?: boolean;
}
