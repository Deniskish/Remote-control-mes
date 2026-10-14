/**
* @description Persistent machine status storage for the Monitoring REST MVP.
* @license Apache-2.0
*/

/*jslint node: true */
/*jshint node: true */
/*jshint strict: false */
/*jshint esversion: 6 */
'use strict';

const MAX_UINT = 0xFFFFFFFF;
// Optional additive telemetry from Qt. Values remain strings until the external
// device contract defines final numeric and boolean types.
const TELEMETRY_GROUP_FIELDS = {
    pyrometer: [
        'TempIRFeederLeft',
        'TempIRBuildPlatform',
        'TempIRFeederRight',
        'TempCabinet'
    ],
    heaters: [
        'TempHeaterPlatformCenter',
        'TempHeaterPlatformLeft',
        'TempHeaterPlatformRight',
        'TempHeaterBack',
        'TempHeaterFront',
        'TempHeaterFeederLeft',
        'TempHeaterFeederRight',
        'TempHeaterFeederBack',
        'TempHeaterFeederFront'
    ],
    inputGas: [
        'InputGasOK',
        'OxygenPrc'
    ],
    motion: [
        'RecoaterPosition',
        'BuildPlatformPosition',
        'FeederLeftPosition',
        'FeederRightPosition',
        'RecoaterHomed',
        'BuildPlatformHomed',
        'FeederLeftHomed',
        'FeederRightHomed'
    ],
    laserScanhead: [
        'LaserState',
        'ScanheadState',
        'ChillerState'
    ]
};

function hasOwn(object, propertyName) {
    return Object.prototype.hasOwnProperty.call(object, propertyName);
}

function isUint(value) {
    return Number.isSafeInteger(value) && (value >= 0) && (value <= MAX_UINT);
}

function validationError(field, message) {
    return { ok: false, error: { code: 'INVALID_MACHINE_STATUS', field: field, message: message } };
}

function validateMachineState(machine) {
    if ((machine == null) || (typeof machine !== 'object') || Array.isArray(machine)) {
        return validationError(null, 'Request body must be a JSON object.');
    }
    if ((typeof machine.serialNumber !== 'string') || (machine.serialNumber.trim().length === 0)) {
        return validationError('serialNumber', 'serialNumber must be a non-empty string.');
    }
    if (!isUint(machine.status)) {
        return validationError('status', 'status must be an unsigned integer.');
    }
    if (typeof machine.detailedStatus !== 'string') {
        return validationError('detailedStatus', 'detailedStatus must be a string.');
    }
    if (!isUint(machine.currentLayer)) {
        return validationError('currentLayer', 'currentLayer must be an unsigned integer.');
    }
    if (!isUint(machine.totalLayers)) {
        return validationError('totalLayers', 'totalLayers must be an unsigned integer.');
    }
    if (!isUint(machine.parametersCount)) {
        return validationError('parametersCount', 'parametersCount must be an unsigned integer.');
    }
    if (!Array.isArray(machine.parameters)) {
        return validationError('parameters', 'parameters must be an array.');
    }
    if (machine.parametersCount !== machine.parameters.length) {
        return validationError('parametersCount', 'parametersCount must match parameters.length.');
    }

    var parameters = [];
    for (var i = 0; i < machine.parameters.length; i++) {
        var parameter = machine.parameters[i];
        if ((parameter == null) || (typeof parameter !== 'object') || Array.isArray(parameter)) {
            return validationError('parameters[' + i + ']', 'parameters[' + i + '] must be an object.');
        }
        if (typeof parameter.name !== 'string') {
            return validationError('parameters[' + i + '].name', 'parameters[' + i + '].name must be a string.');
        }
        if ((typeof parameter.value !== 'number') || !Number.isFinite(parameter.value)) {
            return validationError('parameters[' + i + '].value', 'parameters[' + i + '].value must be a finite number.');
        }
        parameters.push({ name: parameter.name, value: parameter.value });
    }

    var validatedMachine = {
        serialNumber: machine.serialNumber.trim(),
        status: machine.status,
        detailedStatus: machine.detailedStatus,
        currentLayer: machine.currentLayer,
        totalLayers: machine.totalLayers,
        parametersCount: machine.parametersCount,
        parameters: parameters
    };

    for (var groupName in TELEMETRY_GROUP_FIELDS) {
        if (!hasOwn(machine, groupName)) continue;
        var sourceGroup = machine[groupName];
        if ((sourceGroup == null) || (typeof sourceGroup !== 'object') || Array.isArray(sourceGroup)) {
            return validationError(groupName, groupName + ' must be an object.');
        }

        var validatedGroup = {};
        var groupFields = TELEMETRY_GROUP_FIELDS[groupName];
        for (var fieldIndex = 0; fieldIndex < groupFields.length; fieldIndex++) {
            var fieldName = groupFields[fieldIndex];
            if (!hasOwn(sourceGroup, fieldName)) continue;
            if (typeof sourceGroup[fieldName] !== 'string') {
                return validationError(groupName + '.' + fieldName, groupName + '.' + fieldName + ' must be a string.');
            }
            validatedGroup[fieldName] = sourceGroup[fieldName];
        }
        validatedMachine[groupName] = validatedGroup;
    }

    return { ok: true, machine: validatedMachine };
}

function cloneMachineState(machine) {
    var clonedMachine = {
        serialNumber: machine.serialNumber,
        status: machine.status,
        detailedStatus: machine.detailedStatus,
        currentLayer: machine.currentLayer,
        totalLayers: machine.totalLayers,
        parametersCount: machine.parametersCount,
        parameters: machine.parameters.map(function (parameter) { return { name: parameter.name, value: parameter.value }; }),
        lastSeen: machine.lastSeen
    };

    for (var groupName in TELEMETRY_GROUP_FIELDS) {
        if (!hasOwn(machine, groupName)) continue;
        var clonedGroup = {};
        var groupFields = TELEMETRY_GROUP_FIELDS[groupName];
        for (var fieldIndex = 0; fieldIndex < groupFields.length; fieldIndex++) {
            var fieldName = groupFields[fieldIndex];
            if (hasOwn(machine[groupName], fieldName)) clonedGroup[fieldName] = machine[groupName][fieldName];
        }
        clonedMachine[groupName] = clonedGroup;
    }

    return clonedMachine;
}

module.exports.CreateMonitoringService = function (options) {
    options = options || {};
    const configuredToken = ((typeof options.apiToken === 'string') && /^\S+$/.test(options.apiToken)) ? options.apiToken : null;
    const now = (typeof options.now === 'function') ? options.now : Date.now;
    const storageFile = ((typeof options.storageFile === 'string') && (options.storageFile.length > 0)) ? options.storageFile : null;
    const warn = (typeof options.warn === 'function') ? options.warn : function (message) { console.warn('WARNING: ' + message); };
    const machineStates = new Map();
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');

    function warnStorage(message, error) {
        var detail = ((error != null) && (typeof error.message === 'string')) ? ' ' + error.message : '';
        try { warn('Monitoring registry: ' + message + detail); } catch (ex) { }
    }

    function getMachinesFromMap(states) {
        return Array.from(states.values())
            .sort(function (a, b) {
                if (a.serialNumber < b.serialNumber) return -1;
                if (a.serialNumber > b.serialNumber) return 1;
                return 0;
            })
            .map(cloneMachineState);
    }

    function persistMachineStates(states) {
        if (storageFile == null) return { ok: true };

        const storageDirectory = path.dirname(storageFile);
        const temporaryFile = storageFile + '.tmp';
        const registry = { version: 1, machines: getMachinesFromMap(states) };
        var temporaryFileDescriptor = null;

        try {
            fs.mkdirSync(storageDirectory, { recursive: true });
            temporaryFileDescriptor = fs.openSync(temporaryFile, 'w', 0o600);
            fs.writeFileSync(temporaryFileDescriptor, JSON.stringify(registry, null, 2) + '\n', 'utf8');
            fs.fsyncSync(temporaryFileDescriptor);
            fs.closeSync(temporaryFileDescriptor);
            temporaryFileDescriptor = null;
            fs.renameSync(temporaryFile, storageFile);
            return { ok: true };
        } catch (ex) {
            if (temporaryFileDescriptor != null) {
                try { fs.closeSync(temporaryFileDescriptor); } catch (closeError) { }
            }
            try { fs.unlinkSync(temporaryFile); } catch (unlinkError) { }
            warnStorage('Unable to save "' + storageFile + '".', ex);
            return {
                ok: false,
                error: {
                    code: 'MONITORING_STORAGE_ERROR',
                    message: 'Unable to persist Monitoring machine registry.'
                },
                statusCode: 500
            };
        }
    }

    function loadMachineStates() {
        if (storageFile == null) return;

        var registry;
        try {
            registry = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        } catch (ex) {
            if ((ex != null) && (ex.code === 'ENOENT')) {
                persistMachineStates(machineStates);
                return;
            }
            warnStorage('Unable to load "' + storageFile + '"; starting with an empty registry.', ex);
            return;
        }

        if ((registry == null) || (typeof registry !== 'object') || Array.isArray(registry) || (registry.version !== 1) || !Array.isArray(registry.machines)) {
            warnStorage('The file "' + storageFile + '" has an invalid format; starting with an empty registry.');
            return;
        }

        const loadedMachineStates = new Map();
        for (var i = 0; i < registry.machines.length; i++) {
            const storedMachine = registry.machines[i];
            const validation = validateMachineState(storedMachine);
            if (validation.ok !== true) {
                warnStorage('Ignoring invalid machine at index ' + i + ' in "' + storageFile + '": ' + validation.error.message);
                continue;
            }
            if ((typeof storedMachine.lastSeen !== 'string') || !Number.isFinite(Date.parse(storedMachine.lastSeen))) {
                warnStorage('Ignoring machine at index ' + i + ' in "' + storageFile + '" because lastSeen is invalid.');
                continue;
            }
            validation.machine.lastSeen = storedMachine.lastSeen;
            loadedMachineStates.set(validation.machine.serialNumber, validation.machine);
        }

        loadedMachineStates.forEach(function (machine, serialNumber) { machineStates.set(serialNumber, machine); });
    }

    function tokenDigest(token) {
        return crypto.createHash('sha256').update(token, 'utf8').digest();
    }

    const configuredTokenDigest = (configuredToken == null) ? null : tokenDigest(configuredToken);

    function authenticateBearer(authorizationHeader) {
        if ((configuredToken == null) || (typeof authorizationHeader !== 'string')) return false;
        const match = /^Bearer[\t ]+([^\s]+)$/i.exec(authorizationHeader);
        if (match == null) return false;
        return crypto.timingSafeEqual(tokenDigest(match[1]), configuredTokenDigest);
    }

    function updateMachine(machine) {
        const validation = validateMachineState(machine);
        if (validation.ok !== true) return validation;

        const storedMachine = validation.machine;
        storedMachine.lastSeen = new Date(now()).toISOString();
        const updatedMachineStates = new Map(machineStates);
        updatedMachineStates.set(storedMachine.serialNumber, storedMachine);
        const persistenceResult = persistMachineStates(updatedMachineStates);
        if (persistenceResult.ok !== true) return persistenceResult;
        machineStates.set(storedMachine.serialNumber, storedMachine);
        return { ok: true, machine: cloneMachineState(storedMachine) };
    }

    function getMachines() {
        return getMachinesFromMap(machineStates);
    }

    loadMachineStates();

    return {
        hasApiToken: function () { return configuredToken != null; },
        authenticateBearer: authenticateBearer,
        validateMachineState: validateMachineState,
        updateMachine: updateMachine,
        getMachines: getMachines
    };
};
