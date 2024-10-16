"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLaundryMachine = exports.updateLaundryMachine = exports.getLaundryMachine = exports.createLaundryMachine = exports.deleteMaintenanceRequest = exports.updateMaintenanceRequest = exports.getMaintenanceRequest = exports.createMaintenanceRequest = exports.deleteApartment = exports.updateApartment = exports.getApartment = exports.createApartment = exports.deleteResidence = exports.updateResidence = exports.getResidence = exports.createResidence = exports.deleteTenant = exports.updateTenant = exports.getTenant = exports.createTenant = exports.deleteLandlord = exports.updateLandlord = exports.getLandlord = exports.createLandlord = exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = void 0;
// Import Firestore database instance and necessary Firestore functions.
var firebase_1 = require("../firebase");
var firestore_1 = require("firebase/firestore");
/**
 * Creates a new user document in Firestore.
 * @param user - The user object to be added to the 'users' collection.
 */
function createUser(user) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "users", user.uid);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, user)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createUser = createUser;
/**
 * Retrieves a user document from Firestore by UID.
 * @param uid - The unique identifier of the user.
 * @returns The user data or null if no user is found.
 */
function getUser(uid) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "users", uid);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getUser = getUser;
/**
 * Updates an existing user document in Firestore by UID.
 * @param uid - The unique identifier of the user to update.
 * @param user - The partial user data to update.
 */
function updateUser(uid, user) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "users", uid);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, user)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateUser = updateUser;
/**
 * Deletes a user document from Firestore by UID.
 * @param uid - The unique identifier of the user to delete.
 */
function deleteUser(uid) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "users", uid);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteUser = deleteUser;
/**
 * Creates a new landlord document in Firestore.
 * @param landlord - The landlord object to be added to the 'landlords' collection.
 */
function createLandlord(landlord) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "landlords", landlord.userId);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, landlord)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createLandlord = createLandlord;
/**
 * Retrieves a landlord document from Firestore by user ID.
 * @param userId - The unique identifier of the landlord.
 * @returns The landlord data or null if no landlord is found.
 */
function getLandlord(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "landlords", userId);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getLandlord = getLandlord;
/**
 * Updates an existing landlord document in Firestore by user ID.
 * @param userId - The unique identifier of the landlord to update.
 * @param landlord - The partial landlord data to update.
 */
function updateLandlord(userId, landlord) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "landlords", userId);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, landlord)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateLandlord = updateLandlord;
/**
 * Deletes a landlord document from Firestore by user ID.
 * @param userId - The unique identifier of the landlord to delete.
 */
function deleteLandlord(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "landlords", userId);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteLandlord = deleteLandlord;
/**
 * Creates a new tenant document in Firestore.
 * @param tenant - The tenant object to be added to the 'tenants' collection.
 */
function createTenant(tenant) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "tenants", tenant.userId);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, tenant)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createTenant = createTenant;
/**
 * Retrieves a tenant document from Firestore by user ID.
 * @param userId - The unique identifier of the tenant.
 * @returns The tenant data or null if no tenant is found.
 */
function getTenant(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "tenants", userId);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getTenant = getTenant;
/**
 * Updates an existing tenant document in Firestore by user ID.
 * @param userId - The unique identifier of the tenant to update.
 * @param tenant - The partial tenant data to update.
 */
function updateTenant(userId, tenant) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "tenants", userId);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, tenant)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateTenant = updateTenant;
/**
 * Deletes a tenant document from Firestore by user ID.
 * @param userId - The unique identifier of the tenant to delete.
 */
function deleteTenant(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "tenants", userId);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteTenant = deleteTenant;
/**
 * Creates a new residence document in Firestore.
 * @param residence - The residence object to be added to the 'residences' collection.
 */
function createResidence(residence) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences", residence.residenceId);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, residence)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createResidence = createResidence;
/**
 * Retrieves a residence document from Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence.
 * @returns The residence data or null if no residence is found.
 */
function getResidence(residenceId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences", residenceId);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getResidence = getResidence;
/**
 * Updates an existing residence document in Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence to update.
 * @param residence - The partial residence data to update.
 */
function updateResidence(residenceId, residence) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences", residenceId);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, residence)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateResidence = updateResidence;
/**
 * Deletes a residence document from Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence to delete.
 */
function deleteResidence(residenceId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences", residenceId);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteResidence = deleteResidence;
/**
 * Creates a new apartment document in Firestore.
 * @param apartment - The apartment object to be added to the 'apartments' collection.
 */
function createApartment(apartment) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "apartments", apartment.apartmentId);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, apartment)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createApartment = createApartment;
/**
 * Retrieves an apartment document from Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment.
 * @returns The apartment data or null if no apartment is found.
 */
function getApartment(apartmentId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "apartments", apartmentId);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getApartment = getApartment;
/**
 * Updates an existing apartment document in Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment to update.
 * @param apartment - The partial apartment data to update.
 */
function updateApartment(apartmentId, apartment) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "apartments", apartmentId);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, apartment)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateApartment = updateApartment;
/**
 * Deletes an apartment document from Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment to delete.
 */
function deleteApartment(apartmentId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "apartments", apartmentId);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteApartment = deleteApartment;
/**
 * Creates a new maintenance request document in Firestore.
 * @param request - The maintenance request object to be added to the 'maintenanceRequests' collection.
 */
function createMaintenanceRequest(request) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "maintenanceRequests", request.requestID);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, request)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createMaintenanceRequest = createMaintenanceRequest;
/**
 * Retrieves a maintenance request document from Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request.
 * @returns The maintenance request data or null if no request is found.
 */
function getMaintenanceRequest(requestID) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "maintenanceRequests", requestID);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getMaintenanceRequest = getMaintenanceRequest;
/**
 * Updates an existing maintenance request document in Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request to update.
 * @param request - The partial maintenance request data to update.
 */
function updateMaintenanceRequest(requestID, request) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "maintenanceRequests", requestID);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, request)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateMaintenanceRequest = updateMaintenanceRequest;
/**
 * Deletes a maintenance request document from Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request to delete.
 */
function deleteMaintenanceRequest(requestID) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "maintenanceRequests", requestID);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteMaintenanceRequest = deleteMaintenanceRequest;
/**
 * Creates a new laundry machine document within a specific residence in Firestore.
 * @param residenceId - The unique identifier of the residence where the machine is located.
 * @param machine - The laundry machine object to be added.
 */
function createLaundryMachine(residenceId, machine) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences/".concat(residenceId, "/laundryMachines"), machine.id);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, machine)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createLaundryMachine = createLaundryMachine;
/**
 * Retrieves a laundry machine document from Firestore by residence ID and machine ID.
 * @param residenceId - The unique identifier of the residence.
 * @param machineId - The unique identifier of the laundry machine.
 * @returns The laundry machine data or null if no machine is found.
 */
function getLaundryMachine(residenceId, machineId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, docSnap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences/".concat(residenceId, "/laundryMachines"), machineId);
                    return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                case 1:
                    docSnap = _a.sent();
                    return [2 /*return*/, docSnap.exists() ? docSnap.data() : null];
            }
        });
    });
}
exports.getLaundryMachine = getLaundryMachine;
/**
 * Updates an existing laundry machine document in Firestore by residence ID and machine ID.
 * @param residenceId - The unique identifier of the residence.
 * @param machineId - The unique identifier of the laundry machine to update.
 * @param machine - The partial laundry machine data to update.
 */
function updateLaundryMachine(residenceId, machineId, machine) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences/".concat(residenceId, "/laundryMachines"), machineId);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, machine)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateLaundryMachine = updateLaundryMachine;
/**
 * Deletes a laundry machine document from Firestore by residence ID and machine ID.
 * @param residenceId - The unique identifier of the residence.
 * @param machineId - The unique identifier of the laundry machine to delete.
 */
function deleteLaundryMachine(residenceId, machineId) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (0, firestore_1.doc)(firebase_1.db, "residences/".concat(residenceId, "/laundryMachines"), machineId);
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)(docRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteLaundryMachine = deleteLaundryMachine;
