enum SituationReportStatus {
    OC = 1,
    NW = 2,
    AW = 3,
    NONE = 0,
}

/**
 * Convert a situation report from the backend format to the frontend format 
 * converting from JSON to a tuple containing in a tuple : 1 ) the name of the report
 * 2) a list of groups representing the layout of the report
 *  
 * @param backendJsonString the situation report in JSON format (backend format)
 * @returns A tuple containing the name of the report and the layout of the report
 */
export function toFrontendFormat(backendJsonString: string): [string, [string, [string, number][]][]] {
    const backendData = JSON.parse(backendJsonString);
    const name = backendData.name;
    const groups = backendData.groups.map((group: { groupName: string; items: (string | number)[] }) => {
        const formattedItems: [string, number][] = [];
        for (let i = 0; i < group.items.length; i += 2) {
            formattedItems.push([group.items[i] as string, group.items[i + 1] as number]);
        }
        return [group.groupName, formattedItems];
    });
    return [name, groups];
}


/**
 * Convert a situation report from the frontend format to a JSON string (backend format)
 * 
 * @param frontendFormat list of groups representing the layout of the report (frontend format)
 * @param reportName name of the report (because there might be multiple layouts)
 * @returns a JSON string representing the situation report to be stored in the database
 */
export function toDatabaseFormat(frontendFormat: [string, [string, number][]][], reportName: string): string {
    const groups = frontendFormat.map(([groupName, items]) => {
        const itemsString = items.map(([item, status]) => `Item:${item},Status:${status}`).join(',');
        return { groupName, items: itemsString };
    });
    return JSON.stringify({ name : reportName,  groups });
}

export function addGroupToLayout(
    currentLayout: [string, [string, number][]][], 
    group: [string, number][], 
    groupName: string
): [string, [string, number][]][] {
    const newGroup: [string, [string, number][]] = [groupName, group];

    return [...currentLayout, newGroup];
}

export function addSingleItemToGroup(
    currentLayout: [string, [string, number][]][], 
    item: [string, number], 
    groupIndex: number
): [string, [string, number][]][] {
    const newGroup = [...currentLayout[groupIndex][1], item];
    const newLayout = [...currentLayout];
    newLayout[groupIndex] = [currentLayout[groupIndex][0], newGroup];
    return newLayout;
}    

/**
 * Remove a group from the layout of a situation report
 * 
 * @param layout Layout of the situation report (format frontend)
 * @param index index of the group to remove
 * @returns Layout without the group at the given index
 */
export function removeGroupFromLayout(
    currentLayout: [string, [string, number][]][],
    index: number
): [string, [string, number][]][] {
    return currentLayout.filter((_, i) => i !== index);
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
export function changeStatus(layout: [string, [string, number][]][], groupIndex: number, itemIndex: number, newStatus: string){
    let nextStatus = SituationReportStatus.NONE;
    let nextLayout = layout;

    switch(newStatus){
        case "OC": 
            nextStatus = SituationReportStatus.OC;
            break;
        case "NW": 
            nextStatus = SituationReportStatus.NW;
            break;
        case "AW":
            nextStatus = SituationReportStatus.AW;
            break;
        case "NONE":
            nextStatus = SituationReportStatus.NONE;
            break;
    }
    
    if (layout.length <= groupIndex || layout[groupIndex][1].length <= itemIndex){
        throw new Error("Invalid groupIndex, itemIndex or newStatus");
    }
    nextLayout[groupIndex][1][itemIndex][1] = nextStatus;

    return nextLayout
}
