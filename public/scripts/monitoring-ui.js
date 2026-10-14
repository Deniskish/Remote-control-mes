'use strict';

// These numeric values are local prototype constants only. The owner of the
// external protocol has not assigned final ENUM values yet, so they must not be
// treated as the future REST/gRPC/wire representation.
const DEVICE_STATUS = {
    WORKING: 0,
    PREPARING: 1,
    WAITING: 2
};

const MONITORING_TELEMETRY_GROUPS = [
    {
        name: 'pyrometer',
        title: 'Пирометры',
        fields: [
            { name: 'TempIRFeederLeft', label: 'Левый фидер' },
            { name: 'TempIRBuildPlatform', label: 'Платформа построения' },
            { name: 'TempIRFeederRight', label: 'Правый фидер' },
            { name: 'TempCabinet', label: 'Шкаф' }
        ]
    },
    {
        name: 'heaters',
        title: 'Нагреватели',
        fields: [
            { name: 'TempHeaterPlatformCenter', label: 'Центр платформы' },
            { name: 'TempHeaterPlatformLeft', label: 'Левая часть платформы' },
            { name: 'TempHeaterPlatformRight', label: 'Правая часть платформы' },
            { name: 'TempHeaterBack', label: 'Задняя часть' },
            { name: 'TempHeaterFront', label: 'Передняя часть' },
            { name: 'TempHeaterFeederLeft', label: 'Левый фидер' },
            { name: 'TempHeaterFeederRight', label: 'Правый фидер' },
            { name: 'TempHeaterFeederBack', label: 'Задняя часть фидера' },
            { name: 'TempHeaterFeederFront', label: 'Передняя часть фидера' }
        ]
    },
    {
        name: 'inputGas',
        title: 'Газ',
        fields: [
            { name: 'InputGasOK', label: 'Давление газа / состояние газа' },
            { name: 'OxygenPrc', label: 'Кислород' }
        ]
    },
    {
        name: 'motion',
        title: 'Оси',
        fields: [
            { name: 'RecoaterPosition', label: 'Позиция рекоутера' },
            { name: 'BuildPlatformPosition', label: 'Позиция платформы построения' },
            { name: 'FeederLeftPosition', label: 'Позиция левого фидера' },
            { name: 'FeederRightPosition', label: 'Позиция правого фидера' },
            { name: 'RecoaterHomed', label: 'Homed рекоутера' },
            { name: 'BuildPlatformHomed', label: 'Homed платформы построения' },
            { name: 'FeederLeftHomed', label: 'Homed левого фидера' },
            { name: 'FeederRightHomed', label: 'Homed правого фидера' }
        ]
    },
    {
        name: 'laserScanhead',
        title: 'Лазер и сканатор',
        fields: [
            { name: 'LaserState', label: 'Состояние лазера' },
            { name: 'ScanheadState', label: 'Состояние сканатора' },
            { name: 'ChillerState', label: 'Состояние чиллера' }
        ]
    }
];

// Development data shaped exactly like the current technological contract.
// Production never selects it automatically; enable it explicitly through
// monitoringSetMockMode(true) when a developer needs to exercise the UI.
const monitoringMachines = [
    {
        serialNumber: '2026-00000',
        status: DEVICE_STATUS.WORKING,
        detailedStatus: 'Выполняется построение слоя',
        currentLayer: 1832,
        totalLayers: 2510,
        parametersCount: 4,
        parameters: [
            { name: 'Температура камеры', value: 146.2 },
            { name: 'Содержание кислорода', value: 0.73 },
            { name: 'Давление', value: 1.14 },
            { name: 'Мощность лазера', value: 320.0 }
        ],
        pyrometer: {
            TempIRFeederLeft: '145.2',
            TempIRBuildPlatform: '148.7',
            TempIRFeederRight: '144.9',
            TempCabinet: '32.1'
        },
        heaters: {
            TempHeaterPlatformCenter: '140.0',
            TempHeaterPlatformLeft: '139.8',
            TempHeaterPlatformRight: '140.2',
            TempHeaterBack: '138.5',
            TempHeaterFront: '139.1',
            TempHeaterFeederLeft: '141.0',
            TempHeaterFeederRight: '140.8',
            TempHeaterFeederBack: '139.7',
            TempHeaterFeederFront: '139.9'
        },
        inputGas: {
            InputGasOK: 'OK',
            OxygenPrc: '0.7'
        },
        motion: {
            RecoaterPosition: '12.40',
            BuildPlatformPosition: '35.10',
            FeederLeftPosition: '8.20',
            FeederRightPosition: '8.25',
            RecoaterHomed: '',
            BuildPlatformHomed: '',
            FeederLeftHomed: '',
            FeederRightHomed: ''
        },
        laserScanhead: {
            LaserState: 'Ready',
            ScanheadState: 'Ready',
            ChillerState: 'OK'
        }
    },
    {
        serialNumber: '2026-00001',
        status: DEVICE_STATUS.PREPARING,
        detailedStatus: 'Выполняется подготовка рабочей камеры',
        currentLayer: 0,
        totalLayers: 1840,
        parametersCount: 3,
        parameters: [
            { name: 'Температура платформы', value: 85.3 },
            { name: 'Расход газа', value: 12.4 },
            { name: 'Влажность порошка', value: 0.18 }
        ]
    },
    {
        serialNumber: '2026-00002',
        status: DEVICE_STATUS.WAITING,
        detailedStatus: 'Ожидание производственного задания',
        currentLayer: 0,
        totalLayers: 0,
        parametersCount: 2,
        parameters: [
            { name: 'Температура электроники', value: 31.7 },
            { name: 'Напряжение сети', value: 229.4 }
        ]
    },
    {
        serialNumber: '2026-00003',
        status: DEVICE_STATUS.WORKING,
        detailedStatus: 'Выполняется контурное сканирование',
        currentLayer: 417,
        totalLayers: 980,
        parametersCount: 5,
        parameters: [
            { name: 'Скорость сканирования', value: 860.0 },
            { name: 'Положение платформы', value: 18.6 },
            { name: 'Ток привода оси Z', value: 2.41 },
            { name: 'Вибрация корпуса', value: 0.09 },
            { name: 'Расход защитного газа', value: 9.7 }
        ]
    }
];

const MONITORING_POLL_INTERVAL = 2000;
const MONITORING_REQUEST_TIMEOUT = 5000;
const MONITORING_ONLINE_THRESHOLD = 30000;
const MONITORING_DATA_STATE = {
    LOADING: 'loading',
    API: 'api',
    EMPTY: 'empty',
    ERROR: 'error',
    MOCK: 'mock'
};
const MONITORING_DETAIL_TABS = [
    { name: 'overview', label: 'Обзор' },
    { name: 'parameters', label: 'Параметры' },
    { name: 'history', label: 'История' }
];
var monitoringCurrentMachines = [];
var monitoringDataState = MONITORING_DATA_STATE.LOADING;
var monitoringMockModeEnabled = (typeof window !== 'undefined') && (window.MONITORING_MOCK_MODE === true);
var monitoringSelectedSerialNumber = null;
var monitoringActiveDetailTab = 'overview';
var monitoringPollingActive = false;
var monitoringPollTimer = null;
var monitoringPollRequest = null;
var monitoringPollGeneration = 0;

function monitoringEscapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function monitoringClamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function monitoringIsUint(value) {
    return (typeof value === 'number') && isFinite(value) && (value >= 0) && (value <= 4294967295) && (Math.floor(value) === value);
}

function monitoringNormalizeSerialNumber(value) {
    if (typeof value !== 'string') return null;
    var normalizedValue = value.replace(/^\s+|\s+$/g, '');
    return normalizedValue === '' ? null : normalizedValue;
}

function monitoringStatusPresentation(status) {
    if (status === DEVICE_STATUS.WORKING) return { label: 'В работе', className: 'working' };
    if (status === DEVICE_STATUS.PREPARING) return { label: 'Подготовка', className: 'preparing' };
    if (status === DEVICE_STATUS.WAITING) return { label: 'Ожидание', className: 'waiting' };
    return { label: 'Неизвестно', className: 'unknown' };
}

function monitoringCreateDevelopmentMachines() {
    var machines = JSON.parse(JSON.stringify(monitoringMachines));
    var now = Date.now();
    // The debug data intentionally covers both connectivity states. lastSeen is
    // a server response field and is never added to the technological POST body.
    machines[0].lastSeen = new Date(now).toISOString();
    machines[1].lastSeen = new Date(now - 12000).toISOString();
    machines[2].lastSeen = new Date(now - 45000).toISOString();
    return machines;
}

function monitoringLastSeenTimestamp(lastSeen) {
    if ((typeof lastSeen !== 'string') || (lastSeen.replace(/^\s+|\s+$/g, '') === '')) return null;
    var timestamp = Date.parse(lastSeen);
    return isFinite(timestamp) ? timestamp : null;
}

function monitoringRelativeAge(elapsedMilliseconds) {
    var seconds = Math.floor(Math.max(0, elapsedMilliseconds) / 1000);
    if (seconds < 60) return seconds + ' сек. назад';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + ' мин. назад';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + ' ч. назад';
    return Math.floor(hours / 24) + ' дн. назад';
}

function monitoringConnectivityPresentation(machine, now) {
    var timestamp = monitoringLastSeenTimestamp(machine.lastSeen);
    if (timestamp == null) {
        return {
            online: false,
            className: 'offline',
            label: 'Нет связи',
            lastSeenLabel: 'Последние данные: не поступали'
        };
    }

    var elapsed = Math.max(0, now - timestamp);
    var online = elapsed <= MONITORING_ONLINE_THRESHOLD;
    return {
        online: online,
        className: online ? 'online' : 'offline',
        label: online ? 'В сети' : 'Нет связи',
        lastSeenLabel: 'Последние данные: ' + monitoringRelativeAge(elapsed)
    };
}

function monitoringConnectivityBadge(connectivity) {
    return '<span class="monitoring-connectivity-badge monitoring-connectivity--' + connectivity.className + '">' +
        monitoringEscapeHtml(connectivity.label) + '</span>';
}

function monitoringLastSeenLine(connectivity) {
    return '<div class="monitoring-last-seen">' + monitoringEscapeHtml(connectivity.lastSeenLabel) + '</div>';
}

function monitoringSerialLabel(machine) {
    var serialNumber = monitoringNormalizeSerialNumber(machine.serialNumber);
    return serialNumber == null ? '—' : serialNumber;
}

function monitoringDetailedStatus(machine) {
    if (typeof machine.detailedStatus !== 'string') return '—';
    var value = machine.detailedStatus.replace(/^\s+|\s+$/g, '');
    return value === '' ? '—' : value;
}

function monitoringGetMachine(serialNumber) {
    var normalizedSerialNumber = monitoringNormalizeSerialNumber(serialNumber);
    if (normalizedSerialNumber == null) return null;
    for (var i = 0; i < monitoringCurrentMachines.length; i++) {
        if (monitoringNormalizeSerialNumber(monitoringCurrentMachines[i].serialNumber) === normalizedSerialNumber) return monitoringCurrentMachines[i];
    }
    return null;
}

function monitoringGetParameters(machine) {
    var parameters = Array.isArray(machine.parameters) ? machine.parameters : [];
    var declaredCountIsValid = monitoringIsUint(machine.parametersCount);
    if (!declaredCountIsValid || (machine.parametersCount !== parameters.length)) {
        if ((typeof console !== 'undefined') && (typeof console.warn === 'function')) {
            console.warn('[Monitoring] parametersCount mismatch for serial number ' + monitoringSerialLabel(machine) +
                ': declared ' + (declaredCountIsValid ? machine.parametersCount : 'invalid') + ', received ' + parameters.length + '.');
        }
    }
    return parameters;
}

function monitoringParameterName(parameter, index) {
    if ((parameter != null) && (typeof parameter.name === 'string')) {
        var name = parameter.name.replace(/^\s+|\s+$/g, '');
        if (name !== '') return name;
    }
    return 'Параметр ' + (index + 1);
}

function monitoringParameterValue(parameter) {
    if ((parameter == null) || (typeof parameter.value !== 'number') || !isFinite(parameter.value)) return '—';
    return String(parameter.value);
}

function monitoringTelemetryValue(machine, groupName, fieldName) {
    if ((machine == null) || (typeof machine !== 'object')) return '—';
    var group = machine[groupName];
    if ((group == null) || (typeof group !== 'object') || Array.isArray(group)) return '—';
    var value = group[fieldName];
    if ((typeof value !== 'string') || (value.replace(/^\s+|\s+$/g, '') === '')) return '—';
    return value;
}

function monitoringLayerValue(value) {
    return monitoringIsUint(value) ? String(value) : '—';
}

function monitoringLayerLabel(machine) {
    return monitoringLayerValue(machine.currentLayer) + ' / ' + monitoringLayerValue(machine.totalLayers);
}

function monitoringCalculateProgress(machine) {
    if (!monitoringIsUint(machine.currentLayer) || !monitoringIsUint(machine.totalLayers) || (machine.totalLayers === 0)) {
        return { available: false, percentage: null, currentLayer: machine.currentLayer, totalLayers: machine.totalLayers };
    }

    var calculatedPercentage = (machine.currentLayer / machine.totalLayers) * 100;
    var visualPercentage = monitoringClamp(calculatedPercentage, 0, 100);
    return {
        available: true,
        percentage: Math.round(visualPercentage * 10) / 10,
        currentLayer: machine.currentLayer,
        totalLayers: machine.totalLayers
    };
}

function monitoringProgressLabel(progress) {
    return progress.available ? String(progress.percentage) + ' %' : '—';
}

function monitoringProgress(machine, progress) {
    var serialNumber = monitoringSerialLabel(machine);
    var ariaLabel = 'Прогресс по слоям для устройства с серийным номером ' + serialNumber;
    if (!progress.available) {
        return '<div class="monitoring-progress-row monitoring-progress-row--unavailable">' +
            '<div class="monitoring-progress monitoring-progress--unavailable" role="progressbar" aria-label="' + monitoringEscapeHtml(ariaLabel) + '" ' +
            'aria-valuemin="0" aria-valuemax="100" aria-valuetext="Прогресс недоступен"></div>' +
            '<strong>—</strong></div>';
    }

    var ariaValueText = 'Слой ' + progress.currentLayer + ' из ' + progress.totalLayers + ', прогресс ' + progress.percentage + ' %';
    return '<div class="monitoring-progress-row">' +
        '<div class="monitoring-progress" role="progressbar" aria-label="' + monitoringEscapeHtml(ariaLabel) + '" aria-valuemin="0" aria-valuemax="100" ' +
        'aria-valuenow="' + progress.percentage + '" aria-valuetext="' + monitoringEscapeHtml(ariaValueText) + '">' +
        '<span style="width:' + progress.percentage + '%"></span></div>' +
        '<strong>' + monitoringEscapeHtml(monitoringProgressLabel(progress)) + '</strong></div>';
}

function monitoringStateBadge(machine) {
    var presentation = monitoringStatusPresentation(machine.status);
    return '<span class="monitoring-state-badge monitoring-state--' + presentation.className + '">' +
        monitoringEscapeHtml(presentation.label) + '</span>';
}

function monitoringMockDataBadge() {
    if (monitoringDataState !== MONITORING_DATA_STATE.MOCK) return '';
    return '<span class="monitoring-prototype-label monitoring-data-source-label--visible" title="Явный режим тестовых данных включён разработчиком.">ТЕСТОВЫЕ ДАННЫЕ</span>';
}

function monitoringMetric(label, value) {
    return '<div><dt>' + monitoringEscapeHtml(label) + '</dt><dd>' + monitoringEscapeHtml(value) + '</dd></div>';
}

function monitoringParameterMetrics(parameters) {
    var html = '';
    parameters.forEach(function (parameter, index) {
        html += monitoringMetric(monitoringParameterName(parameter, index), monitoringParameterValue(parameter));
    });
    return html;
}

function monitoringTelemetryGroups(machine) {
    var html = '<div class="monitoring-telemetry-groups">';
    MONITORING_TELEMETRY_GROUPS.forEach(function (groupDefinition) {
        var values = '';
        groupDefinition.fields.forEach(function (fieldDefinition) {
            values += monitoringMetric(fieldDefinition.label, monitoringTelemetryValue(machine, groupDefinition.name, fieldDefinition.name));
        });
        html += '<section class="monitoring-telemetry-group"><h3>' + monitoringEscapeHtml(groupDefinition.title) + '</h3>' +
            '<dl class="monitoring-metrics monitoring-telemetry-metrics">' + values + '</dl></section>';
    });
    return html + '</div>';
}

function monitoringMachineCard(machine) {
    var presentation = monitoringStatusPresentation(machine.status);
    var connectivity = monitoringConnectivityPresentation(machine, Date.now());
    var serialNumber = monitoringSerialLabel(machine);
    var progress = monitoringCalculateProgress(machine);
    var parameters = monitoringGetParameters(machine);
    var parametersHtml = parameters.length > 0 ?
        '<dl class="monitoring-metrics monitoring-parameter-metrics">' + monitoringParameterMetrics(parameters) + '</dl>' :
        '<div class="monitoring-parameters-empty">Параметры не получены</div>';

    return '<article class="monitoring-machine-card monitoring-state--' + presentation.className +
        (connectivity.online ? '' : ' monitoring-machine-card--offline') + '" ' +
        'data-monitoring-serial="' + monitoringEscapeHtml(serialNumber) + '">' +
        '<div class="monitoring-card-header"><div class="monitoring-card-title"><span>Серийный номер</span><h2>' + monitoringEscapeHtml(serialNumber) + '</h2></div>' +
        '<div class="monitoring-card-badges">' + monitoringStateBadge(machine) + monitoringConnectivityBadge(connectivity) + '</div></div>' +
        '<div class="monitoring-card-body">' +
        '<div class="monitoring-card-primary">' + monitoringEscapeHtml(monitoringDetailedStatus(machine)) + '</div>' +
        monitoringLastSeenLine(connectivity) +
        '<dl class="monitoring-metrics monitoring-layer-metrics">' + monitoringMetric('Слой', monitoringLayerLabel(machine)) + '</dl>' +
        monitoringProgress(machine, progress) +
        '<div class="monitoring-parameters-heading"><span>Параметры</span><strong>' + parameters.length + '</strong></div>' +
        parametersHtml + '</div>' +
        '<button class="monitoring-open-button" type="button" data-monitoring-open="' + monitoringEscapeHtml(serialNumber) + '" ' +
        'aria-label="Открыть установку с серийным номером ' + monitoringEscapeHtml(serialNumber) + '">ОТКРЫТЬ УСТАНОВКУ</button>' +
        '</article>';
}

function monitoringRenderSummary() {
    var summary = document.getElementById('monitoringSummary');
    if (summary == null) return;

    if ((monitoringDataState !== MONITORING_DATA_STATE.API) && (monitoringDataState !== MONITORING_DATA_STATE.MOCK)) {
        summary.style.display = 'none';
        summary.innerHTML = '';
        return;
    }
    summary.style.display = '';

    var working = 0;
    var preparing = 0;
    var waiting = 0;
    for (var i = 0; i < monitoringCurrentMachines.length; i++) {
        if (monitoringCurrentMachines[i].status === DEVICE_STATUS.WORKING) working++;
        if (monitoringCurrentMachines[i].status === DEVICE_STATUS.PREPARING) preparing++;
        if (monitoringCurrentMachines[i].status === DEVICE_STATUS.WAITING) waiting++;
    }

    var values = [
        { label: 'Установки', value: monitoringCurrentMachines.length, style: 'machines' },
        { label: 'В работе', value: working, style: 'working' },
        { label: 'Подготовка', value: preparing, style: 'preparing' },
        { label: 'Ожидание', value: waiting, style: 'waiting' }
    ];
    var html = '';
    for (var j = 0; j < values.length; j++) {
        html += '<div class="monitoring-summary-item monitoring-summary--' + values[j].style + '">' +
            '<span>' + monitoringEscapeHtml(values[j].label) + '</span><strong>' + values[j].value + '</strong></div>';
    }
    summary.innerHTML = html;
}

function monitoringDataStatePanel(state) {
    var title;
    var description;
    var role = 'status';
    if (state === MONITORING_DATA_STATE.EMPTY) {
        title = 'Установки не обнаружены';
        description = 'Данные от оборудования ещё не получены.';
    } else if (state === MONITORING_DATA_STATE.ERROR) {
        title = 'Не удалось получить данные мониторинга';
        description = 'Проверьте соединение с сервером.';
        role = 'alert';
    } else {
        title = 'Получение данных мониторинга';
        description = 'Подождите, идёт запрос текущего состояния установок.';
    }
    return '<div class="monitoring-data-state monitoring-data-state--' + monitoringEscapeHtml(state) + '" role="' + role + '">' +
        '<strong>' + monitoringEscapeHtml(title) + '</strong><span>' + monitoringEscapeHtml(description) + '</span></div>';
}

function monitoringAllMachinesOffline() {
    if (monitoringCurrentMachines.length === 0) return false;
    var now = Date.now();
    for (var i = 0; i < monitoringCurrentMachines.length; i++) {
        if (monitoringConnectivityPresentation(monitoringCurrentMachines[i], now).online) return false;
    }
    return true;
}

function monitoringAllOfflineWarning() {
    return '<div class="monitoring-data-state monitoring-data-state--offline" role="status">' +
        '<strong>Нет связи ни с одной установкой</strong>' +
        '<span>Последние полученные данные отображаются ниже.</span></div>';
}

function monitoringRenderDashboard() {
    monitoringRenderSummary();
    var grid = document.getElementById('monitoringMachineGrid');
    if (grid == null) return;

    if ((monitoringDataState === MONITORING_DATA_STATE.LOADING) ||
        (monitoringDataState === MONITORING_DATA_STATE.EMPTY) ||
        (monitoringDataState === MONITORING_DATA_STATE.ERROR)) {
        grid.innerHTML = monitoringDataStatePanel(monitoringDataState);
        return;
    }

    var activeElement = document.activeElement;
    var focusedSerialNumber = null;
    if ((activeElement != null) && (typeof activeElement.getAttribute === 'function')) {
        focusedSerialNumber = activeElement.getAttribute('data-monitoring-open');
    }

    var html = monitoringAllMachinesOffline() ? monitoringAllOfflineWarning() : '';
    for (var i = 0; i < monitoringCurrentMachines.length; i++) html += monitoringMachineCard(monitoringCurrentMachines[i]);
    grid.innerHTML = html;

    var cards = grid.querySelectorAll('[data-monitoring-serial]');
    for (var j = 0; j < cards.length; j++) {
        cards[j].addEventListener('click', function (event) {
            monitoringOpenMachine(this.getAttribute('data-monitoring-serial'), event);
        });
    }
    if (focusedSerialNumber != null) monitoringFocusMachine(focusedSerialNumber);
}

function monitoringOverviewLine(label, value) {
    return '<div class="monitoring-overview-line"><span>' + monitoringEscapeHtml(label) + '</span><strong>' + monitoringEscapeHtml(value) + '</strong></div>';
}

function monitoringParametersTable(machine) {
    var parameters = monitoringGetParameters(machine);
    var rows = '';
    parameters.forEach(function (parameter, index) {
        rows += '<tr><th scope="row">' + monitoringEscapeHtml(monitoringParameterName(parameter, index)) + '</th>' +
            '<td>' + monitoringEscapeHtml(monitoringParameterValue(parameter)) + '</td></tr>';
    });
    if (rows === '') rows = '<tr><td class="monitoring-parameters-empty" colspan="2">Параметры не получены</td></tr>';

    return '<div class="monitoring-parameters-table-wrap"><table class="monitoring-parameters-table">' +
        '<caption>Получено параметров: ' + parameters.length + '</caption>' +
        '<thead><tr><th scope="col">Название параметра</th><th scope="col">Значение</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
}

function monitoringIsDetailTab(tabName) {
    for (var i = 0; i < MONITORING_DETAIL_TABS.length; i++) {
        if (MONITORING_DETAIL_TABS[i].name === tabName) return true;
    }
    return false;
}

function monitoringDetailTabs() {
    var html = '<div class="monitoring-section-index" role="tablist" aria-label="Разделы сведений об установке">';
    for (var i = 0; i < MONITORING_DETAIL_TABS.length; i++) {
        var tab = MONITORING_DETAIL_TABS[i];
        var isActive = tab.name === monitoringActiveDetailTab;
        html += '<button class="monitoring-detail-tab' + (isActive ? ' monitoring-section-index-active' : '') + '" type="button" role="tab" ' +
            'id="monitoring-detail-tab-' + tab.name + '" data-monitoring-detail-tab="' + tab.name + '" ' +
            'aria-controls="monitoring-detail-panel-' + tab.name + '" aria-selected="' + (isActive ? 'true' : 'false') + '" ' +
            'tabindex="' + (isActive ? '0' : '-1') + '">' + monitoringEscapeHtml(tab.label) + '</button>';
    }
    return html + '</div>';
}

function monitoringDetailPanel(tabName, content) {
    var isActive = tabName === monitoringActiveDetailTab;
    return '<section class="monitoring-detail-section monitoring-detail-section--wide monitoring-detail-tab-panel" role="tabpanel" ' +
        'id="monitoring-detail-panel-' + tabName + '" data-monitoring-detail-panel="' + tabName + '" ' +
        'aria-labelledby="monitoring-detail-tab-' + tabName + '"' + (isActive ? '' : ' hidden') + '>' + content + '</section>';
}

function monitoringSelectDetailTab(tabName, moveFocus) {
    if (!monitoringIsDetailTab(tabName)) return false;
    monitoringActiveDetailTab = tabName;

    var target = document.getElementById('monitoringDetailContent');
    if (target == null) return false;
    var tabs = target.querySelectorAll('[data-monitoring-detail-tab]');
    var activeTab = null;
    for (var i = 0; i < tabs.length; i++) {
        var isActiveTab = tabs[i].getAttribute('data-monitoring-detail-tab') === tabName;
        tabs[i].className = 'monitoring-detail-tab' + (isActiveTab ? ' monitoring-section-index-active' : '');
        tabs[i].setAttribute('aria-selected', isActiveTab ? 'true' : 'false');
        tabs[i].setAttribute('tabindex', isActiveTab ? '0' : '-1');
        if (isActiveTab) activeTab = tabs[i];
    }

    var panels = target.querySelectorAll('[data-monitoring-detail-panel]');
    for (var j = 0; j < panels.length; j++) {
        var isActivePanel = panels[j].getAttribute('data-monitoring-detail-panel') === tabName;
        panels[j].hidden = !isActivePanel;
        if (isActivePanel) {
            panels[j].removeAttribute('hidden');
        } else {
            panels[j].setAttribute('hidden', 'hidden');
        }
    }
    if ((moveFocus === true) && (activeTab != null)) activeTab.focus();
    return true;
}

function monitoringHandleDetailTabKeydown(event) {
    var key = event.key;
    var currentTab = this.getAttribute('data-monitoring-detail-tab');
    var currentIndex = -1;
    for (var i = 0; i < MONITORING_DETAIL_TABS.length; i++) {
        if (MONITORING_DETAIL_TABS[i].name === currentTab) currentIndex = i;
    }
    if (currentIndex < 0) return;

    var nextIndex = currentIndex;
    if ((key === 'ArrowRight') || (event.keyCode === 39)) nextIndex = (currentIndex + 1) % MONITORING_DETAIL_TABS.length;
    else if ((key === 'ArrowLeft') || (event.keyCode === 37)) nextIndex = (currentIndex + MONITORING_DETAIL_TABS.length - 1) % MONITORING_DETAIL_TABS.length;
    else if ((key === 'Home') || (event.keyCode === 36)) nextIndex = 0;
    else if ((key === 'End') || (event.keyCode === 35)) nextIndex = MONITORING_DETAIL_TABS.length - 1;
    else return;

    event.preventDefault();
    monitoringSelectDetailTab(MONITORING_DETAIL_TABS[nextIndex].name, true);
}

function monitoringBindDetailTabs(target, focusedTabName) {
    var tabs = target.querySelectorAll('[data-monitoring-detail-tab]');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function (event) {
            event.preventDefault();
            monitoringSelectDetailTab(this.getAttribute('data-monitoring-detail-tab'), true);
        });
        tabs[i].addEventListener('keydown', monitoringHandleDetailTabKeydown);
    }
    if (monitoringIsDetailTab(focusedTabName)) monitoringSelectDetailTab(focusedTabName, true);
}

function monitoringRenderDetail(machine, preserveTabFocus) {
    var target = document.getElementById('monitoringDetailContent');
    if (target == null) return;

    var focusedTabName = null;
    var activeElement = document.activeElement;
    if ((preserveTabFocus !== false) && (activeElement != null) && (typeof activeElement.getAttribute === 'function')) {
        focusedTabName = activeElement.getAttribute('data-monitoring-detail-tab');
    }
    if (!monitoringIsDetailTab(monitoringActiveDetailTab)) monitoringActiveDetailTab = 'overview';

    var serialNumber = monitoringSerialLabel(machine);
    var presentation = monitoringStatusPresentation(machine.status);
    var connectivity = monitoringConnectivityPresentation(machine, Date.now());
    var detailedStatus = monitoringDetailedStatus(machine);
    var progress = monitoringCalculateProgress(machine);
    var overview = '<h2>Обзор</h2>' +
        monitoringOverviewLine('Серийный номер', serialNumber) +
        monitoringOverviewLine('Статус', presentation.label) +
        monitoringOverviewLine('Связь', connectivity.label) +
        monitoringOverviewLine('Последние данные', connectivity.lastSeenLabel.replace(/^Последние данные:\s*/, '')) +
        monitoringOverviewLine('Детальный статус', detailedStatus) +
        monitoringOverviewLine('Текущий слой', monitoringLayerValue(machine.currentLayer)) +
        monitoringOverviewLine('Всего слоёв', monitoringLayerValue(machine.totalLayers)) +
        monitoringOverviewLine('Прогресс', monitoringProgressLabel(progress)) +
        '<div class="monitoring-overview-progress">' + monitoringProgress(machine, progress) + '</div>';
    var parameters = '<h2>Параметры</h2>' + monitoringParametersTable(machine) + monitoringTelemetryGroups(machine) +
        '<p class="monitoring-placeholder-copy">Основные параметры отображаются из массива parameters, дополнительные — из групп телеметрии.</p>';
    var history = '<h2>История</h2><div class="monitoring-history-placeholder">История телеметрии пока не реализована.</div>';

    target.innerHTML = '<div class="monitoring-detail-header">' +
        '<div><span class="monitoring-eyebrow">Серийный номер</span><h1>' + monitoringEscapeHtml(serialNumber) + '</h1>' +
        '<p>Текущее состояние промышленной установки</p></div>' +
        '<div class="monitoring-card-badges">' + monitoringMockDataBadge() + monitoringStateBadge(machine) + monitoringConnectivityBadge(connectivity) + '</div>' +
        '</div>' +
        monitoringDetailTabs() +
        '<div class="monitoring-detail-grid">' +
        monitoringDetailPanel('overview', overview) +
        monitoringDetailPanel('parameters', parameters) +
        monitoringDetailPanel('history', history) +
        '</div>';
    monitoringBindDetailTabs(target, focusedTabName);
}

function monitoringResetScroll() {
    var panel = document.getElementById('p7');
    if (panel != null) panel.scrollTop = 0;
}

function monitoringFocusMachine(serialNumber) {
    var grid = document.getElementById('monitoringMachineGrid');
    if (grid == null) return;
    var normalizedSerialNumber = monitoringNormalizeSerialNumber(serialNumber);
    if (normalizedSerialNumber == null) return;
    var buttons = grid.querySelectorAll('[data-monitoring-open]');
    for (var i = 0; i < buttons.length; i++) {
        if (monitoringNormalizeSerialNumber(buttons[i].getAttribute('data-monitoring-open')) === normalizedSerialNumber) {
            buttons[i].focus();
            return;
        }
    }
}

function monitoringOpenMachine(serialNumber, event) {
    if (event != null) {
        event.preventDefault();
        event.stopPropagation();
    }
    var machine = monitoringGetMachine(serialNumber);
    if (machine == null) return false;

    monitoringSelectedSerialNumber = monitoringNormalizeSerialNumber(machine.serialNumber);
    monitoringActiveDetailTab = 'overview';
    monitoringRenderDetail(machine, false);
    var dashboard = document.getElementById('monitoringDashboard');
    var detail = document.getElementById('monitoringDetail');
    if (dashboard != null) dashboard.style.display = 'none';
    if (detail != null) detail.style.display = 'block';
    monitoringResetScroll();
    if (detail != null) {
        var backButton = detail.querySelector('.monitoring-back-button');
        if (backButton != null) backButton.focus();
    }
    return false;
}

function monitoringShowDashboard(event) {
    if (event != null) {
        event.preventDefault();
        event.stopPropagation();
    }
    var previouslySelectedSerialNumber = monitoringSelectedSerialNumber;
    monitoringRenderDashboard();
    var dashboard = document.getElementById('monitoringDashboard');
    var detail = document.getElementById('monitoringDetail');
    if (dashboard != null) dashboard.style.display = 'block';
    if (detail != null) detail.style.display = 'none';
    monitoringSelectedSerialNumber = null;
    monitoringActiveDetailTab = 'overview';
    monitoringResetScroll();
    if ((event != null) && (previouslySelectedSerialNumber != null)) monitoringFocusMachine(previouslySelectedSerialNumber);
    return false;
}

function monitoringUpdateDataSourceIndicator() {
    var indicator = document.querySelector('#p7 .monitoring-prototype-label');
    if (indicator == null) return;
    if (monitoringDataState === MONITORING_DATA_STATE.MOCK) {
        indicator.style.display = 'inline-flex';
        indicator.textContent = 'ТЕСТОВЫЕ ДАННЫЕ';
        indicator.setAttribute('title', 'Явный режим тестовых данных включён разработчиком.');
    } else if (monitoringDataState === MONITORING_DATA_STATE.API) {
        indicator.style.display = 'inline-flex';
        indicator.textContent = 'ДАННЫЕ API';
        indicator.setAttribute('title', 'Состояния установок загружены через REST API мониторинга.');
    } else {
        indicator.style.display = 'none';
        indicator.removeAttribute('title');
    }
}

function monitoringRenderCurrentData() {
    var detail = document.getElementById('monitoringDetail');
    if ((monitoringSelectedSerialNumber != null) && (detail != null) && (detail.style.display !== 'none')) {
        var selectedMachine = monitoringGetMachine(monitoringSelectedSerialNumber);
        if (selectedMachine != null) {
            monitoringRenderDetail(selectedMachine);
            return;
        }
        monitoringSelectedSerialNumber = null;
        monitoringActiveDetailTab = 'overview';
        detail.style.display = 'none';
        var dashboard = document.getElementById('monitoringDashboard');
        if (dashboard != null) dashboard.style.display = 'block';
    }
    monitoringRenderDashboard();
}

function monitoringApplyDataState(state, machines) {
    monitoringDataState = state;
    monitoringCurrentMachines = Array.isArray(machines) ? machines : [];
    monitoringUpdateDataSourceIndicator();
    // Render every poll even when the payload is byte-for-byte identical. The
    // derived connectivity and relative lastSeen text change as time advances.
    monitoringRenderCurrentData();
}

function monitoringApiUrl() {
    var baseUrl = (typeof domainUrl === 'string') ? domainUrl : '/';
    if (baseUrl.length === 0) baseUrl = '/';
    if (baseUrl.charAt(baseUrl.length - 1) !== '/') baseUrl += '/';
    return baseUrl + 'api/v1/machines';
}

function monitoringSchedulePoll(generation) {
    if (!monitoringPollingActive || (generation !== monitoringPollGeneration)) return;
    if (monitoringPollTimer != null) clearTimeout(monitoringPollTimer);
    monitoringPollTimer = setTimeout(function () {
        monitoringPollTimer = null;
        monitoringRequestMachines(generation);
    }, MONITORING_POLL_INTERVAL);
}

function monitoringRequestMachines(generation) {
    if (!monitoringPollingActive || (generation !== monitoringPollGeneration)) return;
    if (monitoringPollRequest != null) return;
    if (monitoringMockModeEnabled) {
        monitoringApplyDataState(MONITORING_DATA_STATE.MOCK, monitoringCreateDevelopmentMachines());
        monitoringSchedulePoll(generation);
        return;
    }
    if (typeof fetch !== 'function') {
        monitoringApplyDataState(MONITORING_DATA_STATE.ERROR, []);
        monitoringSchedulePoll(generation);
        return;
    }

    var requestOptions = {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' }
    };
    var abortController = (typeof AbortController === 'function') ? new AbortController() : null;
    if (abortController != null) requestOptions.signal = abortController.signal;
    var requestState = { generation: generation, abortController: abortController, timeoutTimer: null };
    monitoringPollRequest = requestState;
    requestState.timeoutTimer = setTimeout(function () {
        if (!monitoringPollingActive || (generation !== monitoringPollGeneration) || (monitoringPollRequest !== requestState)) return;
        monitoringPollRequest = null;
        if (requestState.abortController != null) requestState.abortController.abort();
        monitoringApplyDataState(MONITORING_DATA_STATE.ERROR, []);
        monitoringSchedulePoll(generation);
    }, MONITORING_REQUEST_TIMEOUT);

    fetch(monitoringApiUrl(), requestOptions)
        .then(function (response) {
            if (monitoringPollRequest !== requestState) return null;
            if (!response.ok) throw new Error('Monitoring API returned HTTP ' + response.status + '.');
            return response.json();
        })
        .then(function (machines) {
            if (!monitoringPollingActive || (generation !== monitoringPollGeneration) || (monitoringPollRequest !== requestState)) return;
            if (Array.isArray(machines) && (machines.length > 0)) {
                monitoringApplyDataState(MONITORING_DATA_STATE.API, machines);
            } else if (Array.isArray(machines)) {
                monitoringApplyDataState(MONITORING_DATA_STATE.EMPTY, []);
            } else {
                throw new Error('Monitoring API returned an invalid response.');
            }
        })
        .catch(function (error) {
            if (!monitoringPollingActive || (generation !== monitoringPollGeneration) || (monitoringPollRequest !== requestState)) return;
            if ((error != null) && (error.name === 'AbortError')) return;
            monitoringApplyDataState(MONITORING_DATA_STATE.ERROR, []);
        })
        .then(function () {
            if (monitoringPollRequest !== requestState) return;
            clearTimeout(requestState.timeoutTimer);
            monitoringPollRequest = null;
            monitoringSchedulePoll(generation);
        });
}

function monitoringCancelPollingWork() {
    if (monitoringPollTimer != null) {
        clearTimeout(monitoringPollTimer);
        monitoringPollTimer = null;
    }
    if (monitoringPollRequest != null) {
        clearTimeout(monitoringPollRequest.timeoutTimer);
        if (monitoringPollRequest.abortController != null) monitoringPollRequest.abortController.abort();
    }
    monitoringPollRequest = null;
}

function monitoringSetMockMode(enabled) {
    var nextMode = (enabled === true);
    if (monitoringMockModeEnabled === nextMode) return monitoringMockModeEnabled;
    monitoringMockModeEnabled = nextMode;
    window.MONITORING_MOCK_MODE = nextMode;

    if (monitoringPollingActive) {
        monitoringPollGeneration++;
        monitoringCancelPollingWork();
        monitoringSelectedSerialNumber = null;
        monitoringApplyDataState(MONITORING_DATA_STATE.LOADING, []);
        monitoringShowDashboard();
        monitoringRequestMachines(monitoringPollGeneration);
    }
    return monitoringMockModeEnabled;
}

function monitoringSetActive(active) {
    if (active === true) {
        if (monitoringPollingActive) return;
        monitoringPollingActive = true;
        monitoringPollGeneration++;
        monitoringSelectedSerialNumber = null;
        monitoringApplyDataState(MONITORING_DATA_STATE.LOADING, []);
        monitoringShowDashboard();
        monitoringRequestMachines(monitoringPollGeneration);
        return;
    }

    if (!monitoringPollingActive) return;
    monitoringPollingActive = false;
    monitoringPollGeneration++;
    monitoringCancelPollingWork();
}

// Keep the contract data and entry points easy to replace or exercise later.
window.DEVICE_STATUS = DEVICE_STATUS;
window.monitoringMachines = monitoringMachines;
window.monitoringOpenMachine = monitoringOpenMachine;
window.monitoringShowDashboard = monitoringShowDashboard;
window.monitoringSetMockMode = monitoringSetMockMode;
window.monitoringSetActive = monitoringSetActive;
