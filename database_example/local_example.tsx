type Address = {
    streetAndNo: string;
    city: string;
    country: string;
    zipCode: string;
}

type User = {
    name: string;
    userType: string;
}

type Person = {
    name: string;
    surname: string;
    gender: string;
    birthdate: string;
    address: Address;
}

type Tenant = {
    roomID: number // roomID 
    userID: number;
    contract: string; // link to the pdf of the contract in the database
    garantor: Person;
}

type Room = {
    roomID : number;
    tenantUID : number;
    residenceID : number;
    issues : Array<Issue>;
}

type Issue = {
    userId : number;
    issueId : number;
    description : string;
    status : string;
    picture : string; // link to the picture in the database
}

type Residence = {
    address: Address;
    type: string;
    landlordID: number;
    tenants: Array<Tenant>;
    rooms: Array<Room>;
    laundryMachines : Array<LaundryMachine>;
}

type LaundryMachine = {
    machineID : number;
    residenceID : number;
    isFree : boolean;
    timeRemaining : number;
}

type Landlord = {
    userID : number;
    residences : Array<Residence>;
}


// Functions related to landlords
function deleteLandlord(landlord : Landlord) : void { //remove from the database 
}

function createNewLandlord(name : string, userID : number) : Landlord {
    return {
        userID: userID,
        residences: []
    }
}

function getLandlordID(residence : Residence) : number {
    return residence.landlordID;
}


// Functions related to tenants
function addTenant(residence : Residence, tenant : Tenant) : void {
    residence.tenants.push(tenant);
}

function removeTenant(residence : Residence, tenant : Tenant) : void {
    residence.tenants = residence.tenants.filter((t) => t.userID !== tenant.userID);
}

function getAllTenants(residence : Residence) : Array<Tenant> {
    return residence.tenants;
}

function getTenantUID(room : Room) : number {
    return room.tenantUID;
}

// Functions related to residences
function createResidence(address : Address, type : string, landlordID : number) : Residence {
    return {
        address: address,
        type: type,
        landlordID: landlordID,
        tenants: [],
        rooms: [],
        laundryMachines: []
    }
}

function addResidence(landlord : Landlord, residence : Residence) : void {
    landlord.residences.push(residence);
}

function addLaundryMachine(residence : Residence, machine : LaundryMachine) : void {
    residence.laundryMachines.push(machine);
}

function createLaundryMachine(machineID : number, residenceID : number, isFree : boolean, timeRemaining : number) : LaundryMachine {
    return {
        machineID: machineID,
        residenceID: residenceID,
        isFree: isFree,
        timeRemaining: timeRemaining
    }
}

// Functions related to rooms
function getRoomID(room : Room) : number {
    return room.roomID;
}

function createRoom(roomID : number, tenantUID : number, residenceID : number) : Room {
    return {
        roomID: roomID,
        tenantUID: tenantUID,
        residenceID: residenceID,
        issues: []
    }
} 

function addRoom(residence : Residence, room : Room) : void {
    residence.rooms.push(room);
}

function removeRoom(residence : Residence, room : Room) : void {
    residence.rooms = residence.rooms.filter((r) => r.roomID !== room.roomID);
}

// Function related to issues
function createIssue(userId : number, issueId : number, description : string, status : string, picture : string) : Issue {
    return {
        userId: userId,
        issueId: issueId,
        description: description,
        status: status,
        picture: picture
    }
}

function updateIssueStatus(issue : Issue, status : string) : void {
    issue.status = status;
}

function removeIssueFromRoom(room : Room, issue : Issue) : void {
    room.issues = room.issues.filter((i) => i.issueId !== issue.issueId);
}

function getIssues(room : Room) : Array<Issue> {
    return room.issues;
}



