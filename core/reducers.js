import { combineReducers } from 'redux'
import { QUEUE_STATUS, SET_APIKEY, SET_AUTOUPDATE, STATUS_INVALIDATE, STATUS_RECEIVE, STATUS_REQUEST, RECENT_FILES, JMM_NEWS, IMPORT_FOLDERS, SERIES_COUNT, FILES_COUNT, autoUpdateTick } from './actions'
function activeApiKey(state = '', action) {
    switch (action.type) {
        case SET_APIKEY:
            return action.key;
        default:
            return state
    }
}

function autoUpdate(state = {
    status: false,
    timer: null
}, action) {
    switch (action.type) {
        case SET_AUTOUPDATE:
            let timer = null;
            if (state.status === action.state) { return state; }
            if (state.timer !== null) { clearInterval(state.timer); }
            if (action.state) {
                timer = setInterval(autoUpdateTick, 4000);
            }
            return Object.assign({}, state,{
                status: action.state,
                timer: timer
            });
        default:
            return state
    }
}

function queueStatus(state = {
    isFetching: false,
    didInvalidate: false,
    items: {}
}, action) {
    if (action.type != QUEUE_STATUS) { return state; }
    switch (action.status) {
        case STATUS_INVALIDATE:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case STATUS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case STATUS_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.items,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

function recentFiles(state = {
    isFetching: false,
    didInvalidate: false,
    items: {}
}, action) {
    if (action.type != RECENT_FILES) { return state; }
    switch (action.status) {
        case STATUS_INVALIDATE:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case STATUS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case STATUS_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.items,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

function jmmNews(state = {
    isFetching: false,
    didInvalidate: false,
    items: {}
}, action) {
    if (action.type != JMM_NEWS) { return state; }
    switch (action.status) {
        case STATUS_INVALIDATE:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case STATUS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case STATUS_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.items,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

function importFolders(state = {
    isFetching: false,
    didInvalidate: false,
    items: {}
}, action) {
    if (action.type != IMPORT_FOLDERS) { return state; }
    switch (action.status) {
        case STATUS_INVALIDATE:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case STATUS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case STATUS_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.items,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

function seriesCount(state = {
    isFetching: false,
    didInvalidate: false,
    count: 0
}, action) {
    if (action.type != SERIES_COUNT) { return state; }
    switch (action.status) {
        case STATUS_INVALIDATE:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case STATUS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case STATUS_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                count: action.count || 0,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

function filesCount(state = {
    isFetching: false,
    didInvalidate: false,
    count: 0
}, action) {
    if (action.type != FILES_COUNT) { return state; }
    switch (action.status) {
        case STATUS_INVALIDATE:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case STATUS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case STATUS_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                count: action.count || 0,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

const rootReducer = combineReducers({
    activeApiKey,
    autoUpdate,
    queueStatus,
    recentFiles,
    jmmNews,
    importFolders,
    seriesCount,
    filesCount
});

export default rootReducer