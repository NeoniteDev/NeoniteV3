import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'metadata';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "metadata",
        version: "remove_edit_permissions_august_2019",
        items: {
            [randomUUID()]: {
              templateId: "Outpost:outpostcore_pve_03",
              attributes: {
                cloud_save_info: {
                  saveCount: 319,
                  savedRecords: [
                    {
                      recordIndex: 0,
                      archiveNumber: 1,
                      recordFilename: "eb192023-7db8-4bc0-b3e4-bf060c7baf87_r0_a1.sav"
                    }
                  ]
                },
                level: 10,
                outpost_core_info: {
                  placedBuildings: [
                    {
                      buildingTag: "Outpost.BuildingActor.Building.00",
                      placedTag: "Outpost.PlacementActor.Placement.01"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.01",
                      placedTag: "Outpost.PlacementActor.Placement.00"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.02",
                      placedTag: "Outpost.PlacementActor.Placement.05"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.03",
                      placedTag: "Outpost.PlacementActor.Placement.02"
                    }
                  ],
                  accountsWithEditPermission: [
                    
                  ],
                  highestEnduranceWaveReached: 30
                }
              },
              quantity: 1
            },
            [randomUUID()]: {
              templateId: "Outpost:outpostcore_pve_02",
              attributes: {
                cloud_save_info: {
                  saveCount: 603,
                  savedRecords: [
                    {
                      recordIndex: 0,
                      archiveNumber: 0,
                      recordFilename: "76fe0295-aee2-463a-9229-d9933b4969b8_r0_a0.sav"
                    }
                  ]
                },
                level: 10,
                outpost_core_info: {
                  placedBuildings: [
                    {
                      buildingTag: "Outpost.BuildingActor.Building.00",
                      placedTag: "Outpost.PlacementActor.Placement.00"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.01",
                      placedTag: "Outpost.PlacementActor.Placement.01"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.02",
                      placedTag: "Outpost.PlacementActor.Placement.04"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.03",
                      placedTag: "Outpost.PlacementActor.Placement.03"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.04",
                      placedTag: "Outpost.PlacementActor.Placement.02"
                    }
                  ],
                  accountsWithEditPermission: [
                    
                  ],
                  highestEnduranceWaveReached: 30
                }
              },
              quantity: 1
            },
            [randomUUID()]: {
              templateId: "Outpost:outpostcore_pve_04",
              attributes: {
                cloud_save_info: {
                  saveCount: 77,
                  savedRecords: [
                    {
                      recordIndex: 0,
                      archiveNumber: 1,
                      recordFilename: "940037e4-87d2-499e-8d00-cdb2dfa326b9_r0_a1.sav"
                    }
                  ]
                },
                level: 10,
                outpost_core_info: {
                  placedBuildings: [
                    {
                      buildingTag: "Outpost.BuildingActor.Building.00",
                      placedTag: "Outpost.PlacementActor.Placement.00"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.01",
                      placedTag: "Outpost.PlacementActor.Placement.01"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.02",
                      placedTag: "Outpost.PlacementActor.Placement.03"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.03",
                      placedTag: "Outpost.PlacementActor.Placement.05"
                    }
                  ],
                  accountsWithEditPermission: [
                    
                  ],
                  highestEnduranceWaveReached: 30
                }
              },
              quantity: 1
            },
            [randomUUID()]: {
              templateId: "Outpost:outpostcore_pve_01",
              attributes: {
                cloud_save_info: {
                  saveCount: 851,
                  savedRecords: [
                    {
                      recordIndex: 0,
                      archiveNumber: 0,
                      recordFilename: "a1d68ce6-63a5-499a-946f-9e0c825572d7_r0_a0.sav"
                    }
                  ]
                },
                level: 10,
                outpost_core_info: {
                  placedBuildings: [
                    {
                      buildingTag: "Outpost.BuildingActor.Building.00",
                      placedTag: "Outpost.PlacementActor.Placement.00"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.01",
                      placedTag: "Outpost.PlacementActor.Placement.02"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.02",
                      placedTag: "Outpost.PlacementActor.Placement.01"
                    },
                    {
                      buildingTag: "Outpost.BuildingActor.Building.03",
                      placedTag: "Outpost.PlacementActor.Placement.05"
                    }
                  ],
                  accountsWithEditPermission: [
                    
                  ],
                  highestEnduranceWaveReached: 30
                }
              },
              quantity: 1
            },
            [randomUUID()]: {
              templateId: "DeployableBaseCloudSave:testdeployablebaseitemdef",
              attributes: {
                tier_progression: {
                  progressionInfo: [
                    {
                      progressionLayoutGuid: "B70B5C69-437E-75C5-CB91-7E913F3B5294",
                      highestDefeatedTier: 0
                    },
                    {
                      progressionLayoutGuid: "04FD086F-4A99-823B-06C3-979A8F408960",
                      highestDefeatedTier: 4
                    },
                    {
                      progressionLayoutGuid: "D3D31F40-45D8-FD77-67E6-5FBAB0550417",
                      highestDefeatedTier: 1
                    },
                    {
                      progressionLayoutGuid: "92A17A43-4EDC-8F69-688F-24BB3A3D8AEF",
                      highestDefeatedTier: 3
                    },
                    {
                      progressionLayoutGuid: "A2D8DB3E-457E-279B-58F5-AA9BA2FDC547",
                      highestDefeatedTier: 4
                    },
                    {
                      progressionLayoutGuid: "5AAB9A15-49F5-0D74-0B22-BB9686396E8F",
                      highestDefeatedTier: 1
                    },
                    {
                      progressionLayoutGuid: "9077163A-4664-1993-5A20-D28170404FD6",
                      highestDefeatedTier: 3
                    },
                    {
                      progressionLayoutGuid: "FB679125-49BC-0025-48F3-22A1B8085189",
                      highestDefeatedTier: 4
                    }
                  ]
                },
                cloud_save_info: {
                  saveCount: 11,
                  savedRecords: [
                    {
                      recordIndex: 0,
                      archiveNumber: 1,
                      recordFilename: "2FA8CFBB-4973-CCF0-EEA8-BEBC37D99F52_r0_a1.sav"
                    }
                  ]
                },
                level: 0
              },
              quantity: 1
            }
          },
        stats: {
            attributes: {
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
