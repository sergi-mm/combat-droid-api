import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { EnemyType, ProtocolType, RadarRequest } from './model/radar-request';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Radar', () => {
    it('should return same single target"', () => {
      const request: RadarRequest = {"protocols":[ProtocolType.AvoidMech],
          "scan":[
            {"coordinates":{"x":0,"y":22},"enemies":{"type":EnemyType.soldier,"number":10}}
          ]};
      expect(appController.calculateTargetFromRadar(request)).toStrictEqual({x: 0, y: 22});
    });

    it('should avoid mech enemies"', () => {
      const request: RadarRequest = {"protocols":[ProtocolType.AvoidMech],
          "scan":[
            {"coordinates":{"x":0,"y":40},"enemies":{"type":EnemyType.soldier,"number":10}},
            {"coordinates":{"x":0,"y":80},"allies":5,"enemies":{"type":EnemyType.mech,"number":1}}
          ]};
      expect(appController.calculateTargetFromRadar(request)).toStrictEqual({x: 0, y: 40});
    });

    it('should not found any valid target"', () => {
      const request: RadarRequest = {"protocols":[ProtocolType.AvoidMech],
          "scan":[
            {"coordinates":{"x":0,"y":80},"allies":5,"enemies":{"type":EnemyType.mech,"number":1}}
          ]};
      try {
        appController.calculateTargetFromRadar(request);
      } catch(e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should raise error if incompatible protocols"', () => {
      const request: RadarRequest = {"protocols":[ProtocolType.AvoidMech, ProtocolType.PrioritizeMech],
          "scan":[
            {"coordinates":{"x":0,"y":80},"allies":5,"enemies":{"type":EnemyType.mech,"number":1}}
          ]};
      try {
        appController.calculateTargetFromRadar(request);
      } catch(e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('should assist allies and prioritize mech"', () => {
      const request: RadarRequest = {"protocols":[ProtocolType.AssistAllies, ProtocolType.PrioritizeMech],
          "scan":[
            {"coordinates":{"x":0,"y":40},"allies": 10, "enemies":{"type":EnemyType.soldier,"number":10}},
            {"coordinates":{"x":10,"y":20},"enemies":{"type":EnemyType.mech,"number":5}},
            {"coordinates":{"x":30,"y":80},"allies":1,"enemies":{"type":EnemyType.mech,"number":1}},
          ]};
      expect(appController.calculateTargetFromRadar(request)).toStrictEqual({x:30,y:80});      
    });

    it('should avoid crossfire and avoid mech"', () => {
      const request: RadarRequest = {"protocols":[ProtocolType.AvoidCrossfire, ProtocolType.AvoidMech],
          "scan":[
            {"coordinates":{"x":10,"y":30},"allies": 5, "enemies":{"type":EnemyType.mech,"number":10}},
            {"coordinates":{"x":20,"y":20},"allies": 7, "enemies":{"type":EnemyType.soldier,"number":6}},
            {"coordinates":{"x":30,"y":70},"allies": 0,"enemies":{"type":EnemyType.soldier,"number":1}},
          ]};
      expect(appController.calculateTargetFromRadar(request)).toStrictEqual({x:30,y:70});      
    });

    it('should return the farthest enemy found within 100m"', () => {
      const request: RadarRequest = {
        "protocols": [ ProtocolType.FurthestEnemies ],
        "scan": [
          {
            "coordinates": {
              "x": 98,
              "y": 57
            },
            "enemies": {
              "type": EnemyType.soldier,
              "number": 20
            }
          },
          {
            "coordinates": {
              "x": 11,
              "y": 58
            },
            "enemies": {
              "type": EnemyType.mech,
              "number": 80
            }
          },
          {
            "coordinates": {
              "x": 93,
              "y": 35
            },
            "enemies": {
              "type": EnemyType.mech,
              "number": 10
            }
          }        
        ]
      }

      expect(appController.calculateTargetFromRadar(request)).toStrictEqual({x: 93, y: 35});
    });    

  });
});
