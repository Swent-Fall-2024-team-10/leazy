import { getApartment, getResidence } from "../../firebase/firestore/firestore";
import { Landlord, SituationReportLayout, SituationReportSingleton } from "../../types/types";
import { getFirestore, writeBatch, doc, collection, getDoc, addDoc, where, query, getDocs } from "firebase/firestore";

enum SituationReportStatus {
    OC = 1,
    NW = 2,
    AW = 3,
    NONE = 0,
}

export async function fetchFromDatabase(
  situationReportId: string
): Promise<[string, [string, [string, number][]][]]> {
  const db = getFirestore();

  const reportRef = doc(db, "situationReports", situationReportId);
  const reportSnapshot = await getDoc(reportRef);

  if (!reportSnapshot.exists()) {
    throw new Error(`SituationReport with ID "${situationReportId}" does not exist.`);
  }

  const reportData = reportSnapshot.data();
  const reportName = reportData.layout.label;

  const name: string = reportData.layout.label; 
  const groups: string[] = reportData.layout.value;

  const groupDocsQuery = query(
    collection(db, "situationReports", situationReportId, "situationReportGroups"),
    where("__name__", "in", groups)  
  );

  const groupDocsSnapshot = await getDocs(groupDocsQuery);

  const groupData = groupDocsSnapshot.docs
    .map((doc) => ({ id: doc.id, data: doc.data() }))  
    .sort((a, b) => groups.indexOf(a.id) - groups.indexOf(b.id))  
    .map((doc) => doc.data);  

  let layoutDatas: [string, [string, number][]][] = [];

  for (const group of groupData) {
    let groupName = group.label;
    const singletonRefs = group.value; 

    const singletonDocsQuery = query(
      collection(db, "situationReports", situationReportId, "situationReportSingletons"),
      where("__name__", "in", singletonRefs)  
    );

    const singletonDocsSnapshot = await getDocs(singletonDocsQuery);

    let datas: [string, number][] = [];
    singletonDocsSnapshot.docs
      .map((doc) => ({ id: doc.id, data: doc.data() }))  
      .sort((a, b) => singletonRefs.indexOf(a.id) - singletonRefs.indexOf(b.id))  
      .map((doc) => {
        const singleton_data = doc.data;
        const label: string = singleton_data.label;
        const value: number = singleton_data.value;
        datas.push([label, value]);
        return [label, value];
      });

    layoutDatas.push([groupName, datas]);
  }

  return [reportName, layoutDatas];
}
  

export async function toDatabase(
  frontendFormat: [string, [string, number][]][],
  reportName: string
): Promise<string> {
  const db = getFirestore();
  const BATCH_LIMIT = 500; 
  const groupReferences: { groupID: string; singletonRefs: string[] }[] = [];

  let batch = writeBatch(db);
  let batchCount = 0;

  const reportRef = await addDoc(collection(db, "situationReports"), {
    layout: {},
  });

  const groupCollectionRef = collection(reportRef, "situationReportGroups");
  const singletonCollectionRef = collection(reportRef, "situationReportSingletons");

  for (const group of frontendFormat) {
    const groupName = group[0];
    const items = group[1];

    const singletonRefs: string[] = [];

    for (const item of items) {
      const singleton: SituationReportSingleton = {
        label: item[0],
        value: item[1],
      };

      const singletonRef = doc(singletonCollectionRef); 
      batch.set(singletonRef, singleton); 
      singletonRefs.push(singletonRef.id);

      batchCount++;

      if (batchCount === BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    const groupData = { label: groupName, value: singletonRefs }; 
    const groupRef = doc(groupCollectionRef);
    batch.set(groupRef, groupData); 

    groupReferences.push({ groupID: groupRef.id, singletonRefs }); 

    batchCount++;

    if (batchCount === BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  const reportLayout: SituationReportLayout = {
    label: reportName,
    value: groupReferences.map((group) => group.groupID),
  };

  batch.update(reportRef, { layout: reportLayout });

  batchCount++;

  if (batchCount > 0) {
    await batch.commit();
  }

  return reportRef.id;
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
    const mappedResidences: PickerData[] = (await Promise.all(
        landlord.residenceIds.map(async (id: string) => {
            const residence = await getResidence(id);
            if (residence) {
                return {
                    label: residence?.residenceName ?? 'Unknown',
                    value: id,
                };
            }
            return undefined;
        }),
    )).filter((item): item is PickerData => item !== undefined);
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
        if (layout) {
            const [label, value] = await fetchFromDatabase(layout)
            return { 
                label: label, 
                value: value
            };
        }
    }
    );

    if (mappedLayout) {
        const resolvedLayout = await Promise.all(mappedLayout);
        setLayout(resolvedLayout.filter((layout): layout is LayoutPickerData => layout !== undefined));
    }
}