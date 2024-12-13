import * as SituationReport from '../utils/SituationReport';
import { addGroupToLayout } from '../utils/SituationReport';

describe('converting backend format to front-end format', () => {
    it('Converting to front-end format should return correct structure for multiple groups', () => {
        const backendJsonString = JSON.stringify({
            name: "report1",
            groups: [
                { groupName: "group1", items: ["group11", 0, "group12", 0] },
                { groupName: "group2", items: ["group21", 0, "group22", 0] }
            ]
        });

        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

    });

    it('Converting to back-end format and then to front-end format should return the original format', () => {
        const original: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

    });

});


describe('converting front-end format to backend format', () => {
    it('Converting to backend format should return a single JSON string', () => {
        // Corrected to match expected structure
        const toConvert: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

        const expected = JSON.stringify({
            name: "report1",
            groups: [
                { groupName: "group1", items: "group11,Status:0,Item:group12,Status:0" },
                { groupName: "group2", items: "Item:group21,Status:0,Item:group22,Status:0" }
            ]
        });
    });
});

describe('adding a group to a layout', () => {
    it('Adding a group to a layout should return the correct layout with a layout of 2 groups of 1 item each', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];
        const newGroup: [string, number][] = [["group13", 0]];
        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]],
            ["group3", [["group13", 0]]]
        ];

        const newLayout = addGroupToLayout(layout, newGroup, "group3");
        expect(newLayout).toEqual(expected);
    });

    it('Adding a group to an empty layout should return the correct layout', () => {
        const layout = [];

        const group: [string, number][] = [["group11", 0]];
        const expected = [
            ["group1", [["group11", 0]]]
        ];

        const newLayout = addGroupToLayout(layout, group, "group1");
        expect(newLayout).toEqual(expected);
    });

    it('Adding a group to a layout with 10 groups should return the correct layout', () => {
        const layout : [string, [string, number][]][]= [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0]]],
            ["group4", [["group41", 0]]],
            ["group5", [["group51", 0]]],
            ["group6", [["group61", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0]]],
            ["group9", [["group91", 0]]],
            ["group10", [["group101", 0]]]
        ]

        const group: [string, number][] = [["group102", 0]];
        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0]]],
            ["group4", [["group41", 0]]],
            ["group5", [["group51", 0]]],
            ["group6", [["group61", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0]]],
            ["group9", [["group91", 0]]],
            ["group10", [["group101", 0]]],
            ["group11", [["group102", 0]]]
        ];

        const newLayout = addGroupToLayout(layout, group, "group11");
        
        expect(newLayout).toEqual(expected);
        
    });
});


describe('removing a group from a layout', () => {
    it('Removing a group from a layout should return the correct layout with a layout of 2 groups of 1 item each', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];
        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
        ];

        const newLayout = SituationReport.removeGroupFromLayout(layout, 1);
        expect(newLayout).toEqual(expected);
    });

    it('Removing 10 times in a group with 10 groups should result in an empty group', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0]]],
            ["group4", [["group41", 0]]],
            ["group5", [["group51", 0]]],
            ["group6", [["group61", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0]]],
            ["group9", [["group91", 0]]],
            ["group10", [["group101", 0]]]
        ];

        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0]]],
            ["group4", [["group41", 0]]],
            ["group5", [["group51", 0]]],
            ["group6", [["group61", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0]]],
            ["group9", [["group91", 0]]],
            ["group10", [["group101", 0]]]
        ];

        const empty = [];
        let newLayout = layout;

        for (let i = 0; i < 10; i++) {
            newLayout = SituationReport.removeGroupFromLayout(newLayout, 0);
        }
        expect(newLayout).toEqual(empty);

    });
});

describe('changing the status of an item', () => {
    it('Changing the status of an item should return the correct layout with a layout of 2 groups of 1 item each', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

        const expected = [
            ["group1", [["group11", 1], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]

        ];
        const groupIndex = 0;
        const itemIndex = 0;

        const newStatus = "OC";


        const newLayout = SituationReport.changeStatus(layout, groupIndex, itemIndex, newStatus);
        expect(newLayout).toEqual(expected);
    });

    it('Changing the status of multiple items in a layout with 10 groups of variable number of items should return the correct layout', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0], ["group34", 0]]],
            ["group4", [["group41", 0] , ["group42", 0], ["group43", 0]]],  
            ["group5", [["group51", 0], ["group52", 0], ["group53", 0], ["group54", 0]]],
            ["group6", [["group61", 0], ["group62", 0], ["group63", 0], ["group64", 0], ["group65", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0], ["group82", 0], ["group83", 0], ["group84", 0], ["group85", 0]]],
            ["group9", [["group91", 0], ["group92", 0], ["group93", 0], ["group94", 0], ["group95", 0]]],
            ["group10", [["group101", 0]]]
        ];


        const groupIndex01 = 5;
        const itemIndex01 = 2;
        const newStatus01 = "OC";

        const groupIndex02 = 8;
        const itemIndex02 = 4;
        const newStatus02 = "NW";

        const groupIndex03 = 3;
        const itemIndex03 = 2;
        const newStatus03 = "AW";

        const expected01 = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0], ["group34", 0]]],
            ["group4", [["group41", 0] , ["group42", 0], ["group43", 0]]],  
            ["group5", [["group51", 0], ["group52", 0], ["group53", 0], ["group54", 0]]],
            ["group6", [["group61", 0], ["group62", 0], ["group63", 1], ["group64", 0], ["group65", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0], ["group82", 0], ["group83", 0], ["group84", 0], ["group85", 0]]],
            ["group9", [["group91", 0], ["group92", 0], ["group93", 0], ["group94", 0], ["group95", 0]]],
            ["group10", [["group101", 0]]]
        ];

        const expected02 = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0], ["group34", 0]]],
            ["group4", [["group41", 0] , ["group42", 0], ["group43", 0]]],  
            ["group5", [["group51", 0], ["group52", 0], ["group53", 0], ["group54", 0]]],
            ["group6", [["group61", 0], ["group62", 0], ["group63", 1], ["group64", 0], ["group65", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0], ["group82", 0], ["group83", 0], ["group84", 0], ["group85", 0]]],
            ["group9", [["group91", 0], ["group92", 0], ["group93", 0], ["group94", 0], ["group95", 2]]],
            ["group10", [["group101", 0]]]
        ];

        const expected03 = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0] , ["group22", 0]]],
            ["group3", [["group31", 0] , ["group32", 0], ["group33", 0], ["group34", 0]]],
            ["group4", [["group41", 0] , ["group42", 0], ["group43", 3]]],  
            ["group5", [["group51", 0], ["group52", 0], ["group53", 0], ["group54", 0]]],
            ["group6", [["group61", 0], ["group62", 0], ["group63", 1], ["group64", 0], ["group65", 0]]],
            ["group7", [["group71", 0]]],
            ["group8", [["group81", 0], ["group82", 0], ["group83", 0], ["group84", 0], ["group85", 0]]],
            ["group9", [["group91", 0], ["group92", 0], ["group93", 0], ["group94", 0], ["group95", 2]]],
            ["group10", [["group101", 0]]]
        ];

        let newLayout = SituationReport.changeStatus(layout, groupIndex01, itemIndex01, newStatus01);
        expect(newLayout).toEqual(expected01);

        newLayout = SituationReport.changeStatus(newLayout, groupIndex02, itemIndex02, newStatus02);
        expect(newLayout).toEqual(expected02);
        
        newLayout = SituationReport.changeStatus(newLayout, groupIndex03, itemIndex03, newStatus03);
        expect(newLayout).toEqual(expected03);
    });

    it('Try to change the status of an item at an invalid group index should result in the same layout', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]

        ];
        const groupIndex = 5;
        const itemIndex = 0;

        const newStatus = "OC";

        expect(() => {
            SituationReport.changeStatus(layout, groupIndex, itemIndex, newStatus);
        }).toThrow("Invalid groupIndex, itemIndex or newStatus");
    });
});


describe('adding a single item to a group', () => {
    it ('Adding a single item to different groups in a row should result in the correct groups being modified', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]],
            ["group3", [["group31", 0], ["group32", 0], ["group33", 0]]]
        ];
        const firstItem: [string, number] = ["group13", 0];
        const secondItem: [string, number] = ["group23", 0];
        const thirdItem: [string, number] = ["group34", 0];
        const fourthItem: [string, number] = ["group35", 0];

        const expected = [
            ["group1", [["group11", 0], ["group12", 0], ["group13", 0]]],
            ["group2", [["group21", 0], ["group22", 0], ["group23", 0]]],
            ["group3", [["group31", 0], ["group32", 0], ["group33", 0], ["group34", 0], ["group35", 0]]
        ]];

        let newLayout = SituationReport.addSingleItemToGroup(layout, firstItem, 0);
        newLayout = SituationReport.addSingleItemToGroup(newLayout, secondItem, 1);
        newLayout = SituationReport.addSingleItemToGroup(newLayout, thirdItem, 2);
        newLayout = SituationReport.addSingleItemToGroup(newLayout, fourthItem, 2);

        expect(newLayout).toEqual(expected);

    });

    it ('Adding a single item to a group should add the item to the correct group', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

        const groupIndex = 0;
        const item: [string, number] = ["group13", 0];

        const expected = [
            ["group1", [["group11", 0], ["group12", 0], ["group13", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

        const newLayout = SituationReport.addSingleItemToGroup(layout, item, groupIndex);
        expect(newLayout).toEqual(expected);
    });

    describe('removing an item from a group', () => {
        it('Removing an item from a group should return the correct layout with the item removed', () => {
            const layout: [string, [string, number][]][] = [
                ["group1", [["group11", 0], ["group12", 0]]],
                ["group2", [["group21", 0], ["group22", 0]]]
            ];

            const expected = [
                ["group1", [["group11", 0]]],
                ["group2", [["group21", 0], ["group22", 0]]]
            ];

            const newLayout = SituationReport.removeItemFrom(layout, 1, 0);
            expect(newLayout).toEqual(expected);
        });

        it('Removing an item from a group with multiple items should return the correct layout', () => {
            const layout: [string, [string, number][]][] = [
                ["group1", [["group11", 0], ["group12", 0], ["group13", 0]]],
                ["group2", [["group21", 0], ["group22", 0]]]
            ];

            const expected = [
                ["group1", [["group11", 0], ["group13", 0]]],
                ["group2", [["group21", 0], ["group22", 0]]]
            ];

            const newLayout = SituationReport.removeItemFrom(layout, 1, 0);
            expect(newLayout).toEqual(expected);
        });


    });
});

// situationReport.test.ts

import { 
    fetchResidences, 
    fetchApartmentNames, 
    fetchFromDatabase,
    toDatabase
} from '../utils/SituationReport';
import { getResidence, getApartment } from '../../firebase/firestore/firestore';
import { 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    writeBatch, 
} from 'firebase/firestore';
import { Apartment, Landlord, Residence } from '../../types/types';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('../../firebase/firestore/firestore');

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    writeBatch: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn((...args) => args),
    where: jest.fn((field, operator, values) => ({ field, operator, values })),
  }));
  
  describe("SituationReport Async Functions", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    describe("fetchResidences", () => {
        it("should fetch and map residences to names", async () => {
          const mockLandlord = {
            userId : "landlord1",
            residenceIds: ["res1", "res2"],
          };
      
          const mockResidences = {
            res1: { residenceName: "Residence 1" },
            res2: { residenceName: "Residence 2" },
          };
      
          // Mock getResidence to resolve residence data based on ID
          (getResidence as jest.Mock).mockImplementation(async (id: string) => mockResidences[id]);
      
          // Mock the set function
          const setResidencesMappedToName = jest.fn();
      
          // Call the function
          await fetchResidences(mockLandlord, setResidencesMappedToName);
      
          // Assert the expected call
          expect(setResidencesMappedToName).toHaveBeenCalledWith([
            { label: "Residence 1", value: "res1" },
            { label: "Residence 2", value: "res2" },
          ]);
        });
      });
      
  
    describe("fetchApartmentNames", () => {
      it("should fetch and map apartment names", async () => {
        const mockResidence: Residence = {
          apartments: ["apt1", "apt2"],
        } as Residence;
  
        const mockApartments: Apartment[] = [
          { apartmentName: "Apartment 1" } as Apartment,
          { apartmentName: "Apartment 2" } as Apartment,
        ];
  
        (getResidence as jest.Mock).mockResolvedValue(mockResidence);
        (getApartment as jest.Mock).mockImplementation((id) =>
          Promise.resolve(mockApartments[parseInt(id.slice(-1)) - 1])
        );
  
        const setApartmentMappedToName = jest.fn();
  
        await fetchApartmentNames("res1", setApartmentMappedToName);
  
        expect(setApartmentMappedToName).toHaveBeenCalledWith([
          { label: "Apartment 1", value: "apt1" },
          { label: "Apartment 2", value: "apt2" },
        ]);
      });
    });
  
    describe("fetchFromDatabase", () => {
      it("should fetch and format situation report data", async () => {
        const mockReportData = {
          layout: { label: "Test Report", value: ["group1", "group2"] },
        };
    
        const mockGroupData = [
          { id: "group1", label: "Group 1", value: ["singleton1", "singleton2"] },
          { id: "group2", label: "Group 2", value: ["singleton3"] },
        ];
    
        const mockSingletonDataGroup1 = [
          { id: "singleton1", label: "Item 1", value: 0 },
          { id: "singleton2", label: "Item 2", value: 1 },
        ];
    
        const mockSingletonDataGroup2 = [
          { id: "singleton3", label: "Item 3", value: 2 },
        ];
    
        // Mock `getDoc` for the main report document
        (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockReportData,
        });
    
        // Mock `getDocs` for group documents
        (getDocs as jest.Mock)
          .mockResolvedValueOnce({
            docs: mockGroupData.map((group) => ({
              id: group.id,
              data: () => ({ label: group.label, value: group.value }),
            })),
          })
          // Mock `getDocs` for singleton documents for Group 1
          .mockResolvedValueOnce({
            docs: mockSingletonDataGroup1.map((singleton) => ({
              id: singleton.id,
              data: () => ({ label: singleton.label, value: singleton.value }),
            })),
          })
          // Mock `getDocs` for singleton documents for Group 2
          .mockResolvedValueOnce({
            docs: mockSingletonDataGroup2.map((singleton) => ({
              id: singleton.id,
              data: () => ({ label: singleton.label, value: singleton.value }),
            })),
          });
    
        const result = await fetchFromDatabase("testId");
    
        expect(result).toEqual([
          "Test Report",
          [
            ["Group 1", [["Item 1", 0], ["Item 2", 1]]],
            ["Group 2", [["Item 3", 2]]],
          ],
        ]);
      });
    });
    });


    describe("toDatabase", () => {
      it("should save situation report data to database", async () => {
        // Mock Firestore methods
        const mockBatch = {
          set: jest.fn(),
          update: jest.fn(),
          commit: jest.fn(),
        };
    
        (writeBatch as jest.Mock).mockReturnValue(mockBatch);
        (addDoc as jest.Mock).mockResolvedValue({ id: "newReportId" });
    
        const mockDoc = jest.fn((collectionRef) => ({
          id: `mocked-id-${Math.random().toString(36).substr(2, 9)}`, // Unique mock ID
          collectionRef,
        }));
    
        (doc as jest.Mock).mockImplementation(mockDoc);
    
        const frontendFormat: [string, [string, number][]][] = [
          ["Group 1", [["Item 1", 0], ["Item 2", 1]]],
          ["Group 2", [["Item 3", 2]]],
        ];
    
        const reportId = await toDatabase(frontendFormat, "Test Report");
    
        // Assertions
        expect(reportId).toBe("newReportId");
        expect(addDoc).toHaveBeenCalledTimes(1);
        expect(mockBatch.set).toHaveBeenCalledTimes(5); // 3 singletons + 1 group
        expect(mockBatch.update).toHaveBeenCalledTimes(1); // 1 report update
        expect(mockBatch.commit).toHaveBeenCalledTimes(1); // Commit after operations
        expect(mockDoc).toHaveBeenCalled();
      });
    });

