/**
 * 
 * @param group a group of siutation report items in the format [Item, Status]
 * @returns the parsed group in the format [Item, Status, Item, Status, ...] where Item is a string and Status is a number
 */
export function parseGroup(group: string){
    const parsed = group.split(',').reduce<(string | number)[]>((acc, item) => {
        const [key, value] = item.split(':')
        key === 'Item' ? acc.push(value) : acc.push(Number(value))
        return acc;
    }, [])
    return parsed
}

/**
 * Convert the database layout of a Situation Report to the frontend layout
 * 
 * @param situationReportLayout layout of the situation report (available in the database)
 * @returns a list of groups of items in the format [Item, Status] for the frontend to display
 */
export function toFrontendFormat(situationReportLayout: string[]){
    const frontend = situationReportLayout.reduce<(string | number)[][]>((acc, item) => {
        const group = parseGroup(item)
        acc.push(group)
        return acc;
    }, []);
    
    return frontend
}

/**
 * Convert the frontend layout of a Situation Report to the database layout
 * in order to save it in the database
 * 
 * @param filledSituationReport
 * @returns 
 */
export function toDatabaseFormat(filledSituationReport: (string | number)[][]){
    
    return
}