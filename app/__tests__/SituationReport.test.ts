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

        const converted = SituationReport.toFrontendFormat(backendJsonString);

        const frontendFormat = converted[1]
        const situationReportName = converted[0]

        expect(frontendFormat).toEqual(expected);
        expect(situationReportName).toEqual("report1");
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
                { groupName: "group1", items: "Item:group11,Status:0,Item:group12,Status:0" },
                { groupName: "group2", items: "Item:group21,Status:0,Item:group22,Status:0" }
            ]
        });

        const converted = SituationReport.toDatabaseFormat(toConvert, "report1");

        expect(converted).toEqual(expected);
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

    it('Changing the status of an item with an invalid status should return the same layout', () => {
        const layout: [string, [string, number][]][] = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]
        ];

        const expected = [
            ["group1", [["group11", 0], ["group12", 0]]],
            ["group2", [["group21", 0], ["group22", 0]]]

        ];
        const groupIndex = 0;
        const itemIndex = 0;

        const newStatus = "INVALID";

        const newLayout = SituationReport.changeStatus(layout, groupIndex, itemIndex, newStatus);
        expect(newLayout).toEqual(expected);
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


        const newLayout = SituationReport.changeStatus(layout, groupIndex, itemIndex, newStatus);
        expect(newLayout).toEqual(expected);
    });
});
