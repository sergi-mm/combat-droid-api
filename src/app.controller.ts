import { BadRequestException, Body, Controller, Get, HttpCode, Logger, NotFoundException, Post } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Coordinates, EnemyType, ProtocolType, RadarRequest, Scan } from './model/radar-request';

const MAX_DISTANCE = 100;

@Controller()
export class AppController {

  @ApiOperation({
    summary: "Root path",
  })
  @Get()
  public getWelcome(): string {
    return 'Combat Droid YVH. Use /radar endpoint to calculate targets';
  }

  @ApiOperation({
    summary: "Get best target according on the received scans and protocols to apply"
  })
  @ApiOkResponse({ description: "success", type: Coordinates })
  @HttpCode(200)
  @Post('/radar')
  public calculateTargetFromRadar(@Body() request: RadarRequest): Coordinates {
    if (this.checkIncompatibleProtocols(request.protocols)){
      throw new BadRequestException("Incompatible protocols in payload, please check");
    }

    // Check order in which enemies should be tracked and exclude from protocol list
    const inverseOrder = request.protocols.includes(ProtocolType.FurthestEnemies) 
                      && !request.protocols.includes(ProtocolType.ClosestEnemies);
    const protocols = request.protocols.filter(p => p != ProtocolType.FurthestEnemies && p != ProtocolType.ClosestEnemies)
    
    // Filter and sort scans
    const sortedScans = request.scan
      .filter(scan => { 
        scan.distance = this.calculateDistance(scan.coordinates);
        return scan.distance <= MAX_DISTANCE
      })
      .sort((a,b) => this.scansSorter(a, b, inverseOrder));    

    const target = this.findTargetByProtocols(sortedScans, protocols);
    if (!target) {
      throw new NotFoundException("No valid target found");
      
    }

    return {
      x: target.coordinates.x,
      y: target.coordinates.y
    };
  }

  /**
   * Find scan (coordinates) which match the required protocol criteria
   * @param scans Scans in FIFO (stack) format
   * @param protocols Protocols to apply
   */
  private findTargetByProtocols(scans: Scan[], protocols: ProtocolType[]): Scan {
    const currentScan = scans.pop();

    if (protocols.every(p => this.checkScanByProtocol(currentScan, p))) {
      return currentScan;
    }
    
    if (scans.length > 0) {
      return this.findTargetByProtocols(scans, protocols);
    } else {
      return null;
    }
  }

  /**
   * Apply protocol criteria on current scan
   * @param currentScan 
   * @param protocol 
   * @returns 
   */
  private checkScanByProtocol(currentScan: Scan, protocol: ProtocolType): boolean {    
    switch (protocol) {
      case ProtocolType.AssistAllies :
        return currentScan.allies > 0;
      case ProtocolType.AvoidCrossfire :
        return !currentScan.allies || currentScan.allies == 0;
      case ProtocolType.PrioritizeMech :
        return currentScan.enemies.type == EnemyType.mech;
      case ProtocolType.AvoidMech :
        return currentScan.enemies.type != EnemyType.mech;
      default:
        return false;
    }
  }

  /**
   * Sorts scans by its distance from center using coordinates, but inversely as FIFO
   * @param s1 First scan
   * @param s2 Second scan
   * @param inverse If sort reversing
   * @returns difference
   */
  private scansSorter(s1: Scan, s2: Scan, inverse = false): number {
    return inverse ? s1.distance - s2.distance : s2.distance - s1.distance;
  }

  /**
   * Calculates distance of the coordinates to center (0,0) using Euclidean geometry
   * @param coordinate Coorinates representing X and Y
   * @returns distance (or hypotenuse)
   */
  private calculateDistance(coordinate: Coordinates): number {
    return Math.sqrt(Math.pow(coordinate.x, 2) + Math.pow(coordinate.y, 2));
  }

  /**
   * Check if protocols are compatible
   * @param protocols List of protocols
   * @returns if not compatible
   */
  private checkIncompatibleProtocols(protocols: ProtocolType[]): boolean {
    return (protocols.includes(ProtocolType.FurthestEnemies) && protocols.includes(ProtocolType.ClosestEnemies))
        || (protocols.includes(ProtocolType.AssistAllies) && protocols.includes(ProtocolType.AvoidCrossfire))
        || (protocols.includes(ProtocolType.PrioritizeMech) && protocols.includes(ProtocolType.AvoidMech));
  }
}
