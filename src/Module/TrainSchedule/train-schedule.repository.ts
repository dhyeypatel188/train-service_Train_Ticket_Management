import { stat } from "fs";
import { query } from "../../config/database";
import {
  CreateTrainScheduleDto,
  UpdateTrainScheduleDto,
} from "./train-schedule.dto";

export class TrainScheduleRepository {
  private tableName = "train_schedule";

  async createTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          train_id UUID NOT NULL REFERENCES "trains"(train_id),
          station_id UUID NOT NULL REFERENCES "stations"(station_id),
          stop_number INTEGER NOT NULL,
          arrival_time TIME NOT NULL,
          station_name VARCHAR(50) NOT NULL,
          departure_time TIME NOT NULL,
          day_offset INTEGER NOT NULL DEFAULT 0,  
          platformNumber INTEGER NOT NULL,
          is_start BOOLEAN NOT NULL DEFAULT false,
          is_end BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log(`Table ${this.tableName} created or already exists`);
    } catch (error) {
      console.error(`Error creating table ${this.tableName}:`, error);
    }
  }

  async create(data: CreateTrainScheduleDto) {
    const result = await query(
      `INSERT INTO ${this.tableName} 
        (train_id, station_id, stop_number, arrival_time, departure_time, day_offset, is_start, is_end, platformNumber,station_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 ,$10)
        RETURNING *`,
      [
        data.trainId,
        data.stationId,
        data.stopNumber,
        data.arrivalTime,
        data.departureTime,
        data.dayOffset,
        data.isStart,
        data.isEnd,
        data.platformNumber,
        data.station_name,
      ]
    );
    return result.rows[0];
  }

  async findById(id: string) {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE schedule_id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateTrainScheduleDto) {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.train_id !== undefined) {
      fields.push(`train_id = $${index++}`);
      values.push(data.train_id);
    }

    if (data.station_id !== undefined) {
      fields.push(`station_id = $${index++}`);
      values.push(data.station_id);
    }

    if (data.stop_number !== undefined) {
      fields.push(`stop_number = $${index++}`);
      values.push(data.stop_number);
    }

    if (data.arrival_time !== undefined) {
      fields.push(`arrival_time = $${index++}`);
      values.push(data.arrival_time);
    }

    if (data.departure_time !== undefined) {
      fields.push(`departure_time = $${index++}`);
      values.push(data.departure_time);
    }

    if (data.day_offset !== undefined) {
      fields.push(`day_offset = $${index++}`);
      values.push(data.day_offset);
    }

    if (data.is_start !== undefined) {
      fields.push(`is_start = $${index++}`);
      values.push(data.is_start);
    }

    if (data.is_end !== undefined) {
      fields.push(`is_end = $${index++}`);
      values.push(data.is_end);
    }

    if (data.station_name !== undefined) {
      fields.push(`station_name = $${index++}`);
      values.push(data.station_name);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const queryText = `
      UPDATE ${this.tableName}
      SET ${fields.join(", ")}
      WHERE schedule_id = $${index}
      RETURNING *;
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async delete(id: string) {
    const result = await query(
      `DELETE FROM ${this.tableName} WHERE schedule_id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  async findByTrainId(trainId: string) {
    const result = await query(
      `SELECT * FROM ${this.tableName} 
       WHERE train_id = $1
       ORDER BY stop_number ASC`,
      [trainId]
    );
    return result.rows;
  }

  async findByTrainandStation(train_id: string, station_id: string) {
    const result = await query(
      `SELECT * FROM ${this.tableName}
    WHERE train_id = $1
    AND station_id = $2`,
      [train_id, station_id]
    );
    return result.rows;
  }

  async getSchedule(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;
    const searchQuery = `%${search.toLowerCase()}%`;
    const result = await query(
      `SELECT * FROM ${this.tableName}  
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const total = result.rows.length;

    return { data: result.rows, total, page, limit };
  }

  async findByStationId(stationId: string) {
    console.log(stationId);
    const result = await query(
      `SELECT * FROM ${this.tableName} 
        WHERE station_id = $1
        ORDER BY departure_time ASC`,
      [stationId]
    );
    return result.rows;
  }
}
