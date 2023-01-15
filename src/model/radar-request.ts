import { ApiProperty } from "@nestjs/swagger";

export class RadarRequest {
  @ApiProperty()
  protocols: ProtocolType[];
  @ApiProperty()
  scan: Scan[];
}

export enum ProtocolType {
  ClosestEnemies = 'closest-enemies',
  FurthestEnemies = 'furthest-enemies',
  AssistAllies = 'assist-allies',
  AvoidCrossfire = 'avoid-crossfire',
  PrioritizeMech = 'prioritize-mech',
  AvoidMech = 'avoid-mech',
}

export class Coordinates {
    @ApiProperty()
    x: number;

    @ApiProperty()
    y: number;
}

export class Enemies {
    @ApiProperty()
    type: EnemyType;
    @ApiProperty()
    number: number;
}
  
export enum EnemyType {
    soldier = 'soldier',
    mech = 'mech',
}

export class Scan {
  @ApiProperty()
  coordinates: Coordinates;
  @ApiProperty()
  enemies: Enemies;
  @ApiProperty()
  allies?: number;
  
  distance?: number;
}
