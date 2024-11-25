import * as SituationReport from '../SituationReport';


describe('parsing situation report', () => {
    it('Parsing a small list should return the correct format 01', () => {
        const toParse = "Item:groupe11,Status:0";
        const parsed = SituationReport.parseGroup(toParse);
        expect(parsed).toEqual(Array<(string | number)>("groupe11", 0));
    });

    it('Parsing a small list should return the correct format 02', () => {
        const toParse = "Item:groupe11,Status:0,Item:groupe12,Status:0,Item:groupe13,Status:0";
        const parsed = SituationReport.parseGroup(toParse);
        expect(parsed).toEqual(Array<(string | number)>("groupe11", 0, "groupe12", 0, "groupe13", 0));
    });

    it('Parsing a small list should return the correct format 03', () => {
        const toParse = "Item:groupe11,Status:0,Item:groupe12,Status:0,Item:groupe13,Status:0,Item:groupe14,Status:0";
        const parsed = SituationReport.parseGroup(toParse);
        expect(parsed).toEqual(Array<(string | number)>("groupe11", 0, "groupe12", 0, "groupe13", 0, "groupe14", 0));
    });

    it('Converting to front end format should return the correct format with a layout of 2 groups of 1 item each', () => {
        const toConvert = [
            "Item:groupe11,Status:0", "Item:groupe12,Status:0"
        ];

        const expeted = [
            ["groupe11", 0],
            ["groupe12", 0]];
        const converted = SituationReport.toFrontendFormat(toConvert);

        expect(converted).toEqual(expeted);
    });

    it('Converting to front end format should return the correct format with a layout of 10 groups of 2 items each', () => {
        const toConvert = [
            "Item:group11,Status:0,Item:group12,Status:0",
            "Item:group21,Status:0,Item:group22,Status:0",
            "Item:group31,Status:0,Item:group32,Status:0",
            "Item:group41,Status:0,Item:group42,Status:0",
            "Item:group51,Status:0,Item:group52,Status:0",
            "Item:group61,Status:0,Item:group62,Status:0",
            "Item:group71,Status:0,Item:group72,Status:0",
            "Item:group81,Status:0,Item:group82,Status:0",
            "Item:group91,Status:0,Item:group92,Status:0",
            "Item:group101,Status:0,Item:group102,Status:0"
        ];
        const expected = [
            ["group11", 0, "group12", 0],
            ["group21", 0, "group22", 0], 
            ["group31", 0, "group32", 0], 
            ["group41", 0, "group42", 0], 
            ["group51", 0, "group52", 0], 
            ["group61", 0, "group62", 0], 
            ["group71", 0, "group72", 0], 
            ["group81", 0, "group82", 0], 
            ["group91", 0, "group92", 0], 
            ["group101", 0, "group102", 0]
        ];
        const converted = SituationReport.toFrontendFormat(toConvert);

        expect(converted).toEqual(expected);
    });

    it('Converting to front end format should return the correct format with a layout of 10 groups whose number of item vary from 1 to 10', () => {
        const toConvert = [
            "Item:group11,Status:0,Item:group12,Status:0",
            "Item:group21,Status:0,Item:group22,Status:0",
            "Item:group31,Status:0,Item:group32,Status:0,Item:group33,Status:0", 
            "Item:group41,Status:0,Item:group42,Status:0,Item:group43,Status:0,Item:group44,Status:0",
            "Item:group51,Status:0,Item:group52,Status:0,Item:group53,Status:0,Item:group54,Status:0,Item:group55,Status:0", 
            "Item:group61,Status:0,Item:group62,Status:0,Item:group63,Status:0,Item:group64,Status:0,Item:group65,Status:0,Item:group66,Status:0", 
            "Item:group71,Status:0,Item:group72,Status:0,Item:group73,Status:0,Item:group74,Status:0,Item:group75,Status:0,Item:group76,Status:0,Item:group77,Status:0",
            "Item:group81,Status:0,Item:group82,Status:0,Item:group83,Status:0,Item:group84,Status:0,Item:group85,Status:0,Item:group86,Status:0,Item:group87,Status:0,Item:group88,Status:0", 
            "Item:group91,Status:0,Item:group92,Status:0,Item:group93,Status:0,Item:group94,Status:0,Item:group95,Status:0,Item:group96,Status:0,Item:group97,Status:0,Item:group98,Status:0,Item:group99,Status:0" 
        ];
        const expected = [
            ["group11", 0, "group12", 0],
            ["group21", 0, "group22", 0],
            ["group31", 0, "group32", 0, "group33", 0],
            ["group41", 0, "group42", 0, "group43", 0, "group44", 0],
            ["group51", 0, "group52", 0, "group53", 0, "group54", 0, "group55", 0],
            ["group61", 0, "group62", 0, "group63", 0, "group64", 0, "group65", 0, "group66", 0],
            ["group71", 0, "group72", 0, "group73", 0, "group74", 0, "group75", 0, "group76", 0, "group77", 0],
            ["group81", 0, "group82", 0, "group83", 0, "group84", 0, "group85", 0, "group86", 0, "group87", 0, "group88", 0],
            ["group91", 0, "group92", 0, "group93", 0, "group94", 0, "group95", 0, "group96", 0, "group97", 0, "group98", 0, "group99", 0]
        ];
        const converted = SituationReport.toFrontendFormat(toConvert);
    
        expect(converted).toEqual(expected);
    });
});