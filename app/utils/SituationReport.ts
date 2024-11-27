// Convert backend format to front-end format
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


// Convert front-end format to backend format
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
    }
    
    if (layout.length <= groupIndex || layout[groupIndex][1].length <= itemIndex || nextStatus === 0){
        return layout;
    }
    nextLayout[groupIndex][1][itemIndex][1] = nextStatus;

    return nextLayout
}
