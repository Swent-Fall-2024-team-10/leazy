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
 * @returns returns a list of groups of items in the format [Item, Status] for the database to save
 */
export function toDatabaseFormat(filledSituationReport: (string | number)[][]){
    const database = filledSituationReport.reduce<string[]>((acc, group) => {
        const groupString = group.reduce<string>((acc, item, index) => {
            if (index % 2 === 0){
                acc += `Item:${item},`
            } else {
                acc += index === group.length - 1 ? `Status:${item}` : `Status:${item},`
            }
            return acc;
        }, '')
        acc.push(groupString)
        return acc;
    }, [])
    return database
}

export function addGroupToLayout(layout: (string | number)[][], group: (string | number)[]){
    const newLayout = [...layout, group]
    return newLayout
}

/**
 * Remove a group from the layout of a situation report
 * 
 * @param layout Layout of the situation report (format frontend)
 * @param index index of the group to remove
 * @returns Layout without the group at the given index
 */
export function removeGroupFromLayout(layout: (string | number)[][], index: number){
    const newLayout = index < layout.length ? layout.filter((_, i) => i !== index) : layout
    return newLayout
}


/**
 * Change the status of an item in the layout of a situation report
 * 
 * @param layout Layout of the situation report (format frontend)
 * @param groupIndex Index of the group in which the item is located
 * @param itemIndex Index of the item in the group
 * @param newStatus Next status of the item (format : "OC" = original condition , "NW" = natural wear, "AW" = abnormal wear)
 * @returns The layout with the new status of the item
 */
export function changeStatus(layout: (string | number)[][], groupIndex: number, itemIndex: number, newStatus: string){
    let nextStatus = 0;
    let nextLayout = layout;

    switch(newStatus){
        case "OC": 
            nextStatus = 1;
            break;
        case "NW": 
            nextStatus = 2;
            break;
        case "AW":
            nextStatus = 3;
            break;
        default: -1;
    }

    if (layout.length <= groupIndex || layout[groupIndex].length <= itemIndex * 2 + 1 || nextStatus === -1){
        return layout;
    }
    nextLayout[groupIndex][itemIndex * 2 + 1] = nextStatus

    return nextLayout
}
