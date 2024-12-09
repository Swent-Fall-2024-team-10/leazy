import { getApartment, getResidence } from "../../firebase/firestore/firestore";
import { Landlord, SituationReport, SituationReportGroup, situationReportLayout, SituationReportSingleton } from "../../types/types";
import { getFirestore, writeBatch, doc, collection, getDoc } from "firebase/firestore";

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

    const groups = backendData.groups.map((group: { groupName: string; items: string }) => {
        const formattedItems: [string, number][] = group.items.split(',').map((itemStr: string) => {
            const [itemKey, statusKey] = itemStr.split(',');
            const item = itemKey.split(':')[1]; // Extract the item name
            const status = Number(statusKey.split(':')[1]); // Extract the numeric value
            return [item, status];
        });
        return [group.groupName, formattedItems];
    });

    return [name, groups];
}

export async function fetchLayoutFromDatabase(
    situationReportId: string
  ): Promise<[string, [string, [string, number][]][]]> {
    console.log("fetching situation report with id: ", situationReportId);
    const db = getFirestore();
  
    const situationReportRef = doc(db, "situationReportLayout", situationReportId);
    const situationReportSnapshot = await getDoc(situationReportRef);
  
    if (!situationReportSnapshot.exists()) {
      throw new Error(`SituationReportLayout with ID "${situationReportId}" does not exist.`);
    }
  
    const situationReportLayout = situationReportSnapshot.data();
    const reportName = situationReportLayout.label;
    const groupIds: string[] = situationReportLayout.value;
  
    const groupRefs = groupIds.map((id) => doc(db, "situationReportGroup", id));
    const groupSnapshots = await Promise.all(groupRefs.map((ref) => getDoc(ref)));
  
    const groups: { name: string; singletonIds: string[] }[] = [];
    for (const groupSnapshot of groupSnapshots) {
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.data();
        groups.push({
          name: groupData.label,
          singletonIds: groupData.value,
        });
      }
    }
  
    const allSingletonIds = groups.flatMap((group) => group.singletonIds);
    const uniqueSingletonIds = Array.from(new Set(allSingletonIds)); // Avoid duplicates
    const singletonRefs = uniqueSingletonIds.map((id) => doc(db, "situationReportSingleton", id));
    const singletonSnapshots = await Promise.all(singletonRefs.map((ref) => getDoc(ref)));
  
    const singletons: Record<string, { label: string; value: number }> = {};
    for (const singletonSnapshot of singletonSnapshots) {
      if (singletonSnapshot.exists()) {
        const singletonData = singletonSnapshot.data();
        singletons[singletonSnapshot.id] = {
          label: singletonData.label,
          value: singletonData.value,
        };
      }
    }
  
    const result: [string, [string, [string, number][]][]] = [
      reportName,
      groups.map((group) => [
        group.name,
        group.singletonIds.map((singletonId) => [
          singletons[singletonId].label,
          singletons[singletonId].value,
        ]),
      ]),
    ];
    
    return result;
  }

export async function toDatabase(
    frontendFormat: [string, [string, number][]][],
    reportName: string
  ) {
    const db = getFirestore();
    const BATCH_LIMIT = 500; // Firestore batch limit, cannot exceed 500 writes
  
    const groupReferences: { groupID: string; singletonRefs: string[] }[] = [];
  
    let batch = writeBatch(db);
    let batchCount = 0;
  
    // Handle the creation of the singletons using batches to avoid sending lot of requests
    for (const group of frontendFormat) {
    const groupName = group[0];
    const items = group[1];

    const singletonRefs: string[] = [];
    
    // Create a singleton for each item in the group
    for (const item of items) {
        const singleton: SituationReportSingleton = {
        label: item[0],
        value: item[1],
        };

        const singletonRef = doc(collection(db, "situationReportSingleton"));
        singletonRefs.push(singletonRef.id); 
        batch.set(singletonRef, singleton);
        batchCount++;

        if (batchCount === BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        }
    }

    const groupRef = doc(collection(db, "situationReportGroup"));
    groupReferences.push({ groupID: groupRef.id, singletonRefs }); 
    batch.set(groupRef, { label: groupName, value: singletonRefs }); 
    batchCount++;

    if (batchCount === BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
    }
    }

    if (batchCount > 0) {
    await batch.commit();
    }

    const reportLayout: situationReportLayout = {
    label: reportName,
    value: groupReferences.map((group) => group.groupID), 
    };

    const situationReportRef = doc(collection(db, "situationReportLayout"));
    batch = writeBatch(db);
    batch.set(situationReportRef, reportLayout);

    await batch.commit();
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

export function removeItemFrom(
    currentLayout: [string, [string, number][]][],
    itemId: number,
    groupId: number,
): [string, [string, number][]][]{
    const updatedGroup = currentLayout[groupId][1].filter((_, i) => i !== itemId);
    const newLayout = [...currentLayout];
    newLayout[groupId] = [currentLayout[groupId][0], updatedGroup];
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


interface PickerData {
    label: string;
    value: string;
}

export async function fetchResidences(
    landlord: Landlord, 
    setResidencesMappedToName: (residences: PickerData[]) => void
): Promise<void> {
    // Map residence IDs to their corresponding names
    const mappedResidences: PickerData[] = await Promise.all(
        landlord.residenceIds.map(async (id: string) => {
            const residence = await getResidence(id);
            return {
                label: residence?.residenceName ?? 'Unknown',
                value: id,
            };
        }),
    );
    setResidencesMappedToName(mappedResidences);
}

export async function fetchApartmentNames(
    landlordID: string,
    setApartmentMappedToName: (apartments: PickerData[]) => void
): Promise<void> {
    const residence = await getResidence(landlordID);

    if (residence) {
        const mappedApartments: PickerData[] = (await Promise.all(residence.apartments.map(async (id: string) => {
            const apartment = await getApartment(id);
            if (apartment) {
                return {
                    label: apartment.apartmentName,
                    value: id,
                };
            }
            return undefined;
        }))).filter((item): item is PickerData => item !== undefined);
        setApartmentMappedToName(mappedApartments);
    }
}

interface LayoutPickerData {
    label: string;
    value: [string, [string, number][]][];
}

export async function fetchSituationReportLayout(
    residenceID: string,
    setLayout: (layout: LayoutPickerData[]) => void
): Promise<void> {
    const residence = await getResidence(residenceID);
    const mappedLayout = residence?.situationReportLayout.map(async (layout) => {
        const [label, value] = await fetchLayoutFromDatabase(layout)
        console.log(value)
        value.map((group) => {
            console.log(group)
        });
        return { 
            label: label, 
            value: value
        };
    }
    );

    if (mappedLayout) {
        const resolvedLayout = await Promise.all(mappedLayout);
        setLayout(resolvedLayout);
    }
}