import { combineReducers } from 'redux'
//import {initialState} from "../initialState";
import { SET_LOADING, PORTFOLIO_DATA, FOOTNOTES_DATA, CHANGE_WALLET, SELECT_MENU, CHANGE_PROTOCOL, CHANGE_CHAIN } from "../actionTypes";

export function portfolioData(state = [], action) {
    //console.log(action)
    switch (action.type) {
        case PORTFOLIO_DATA:
            return action.payload
        default:
            return state
    }

    // return state;
}

export function footnoteData(state = [], action) {
    switch (action.type) {
        case FOOTNOTES_DATA:
            return action.payload
        default:
            return state
    }

    // return state;
}

export function walletAddress(state = { address: '' }, action) {
    switch (action.type) {
        case CHANGE_WALLET:
            return {
                address: action.payload
            }
        default:
            return state
    }

    // return state;
}

export function walletChain(state = { chain: '' }, action) {
    switch (action.type) {
        case CHANGE_CHAIN:
            return {
                chain: action.payload
            }
        default:
            return state
    }

    // return state;
}

export function walletProtocol(state = { protocol: '' }, action) {
    console.log(action)
    switch (action.type) {
        case CHANGE_PROTOCOL:
            return {
                protocol: action.payload
            }
        default:
            return state
    }

    // return state;
}
export function menuSelectItem(state = { item: 0 }, action) {
    switch (action.type) {
        case SELECT_MENU:
            return {
                item: action.payload
            }
        default:
            return state
    }

    // return state;
}
export function isLoading(state = false, action) {
    switch (action.type) {
        case SET_LOADING:
            return {
                action
            }
        default:
            return state
    }

    // return state;
}

const rootReducer = combineReducers({ portfolioData, footnoteData, walletAddress, walletChain, walletProtocol, menuSelectItem, isLoading })

export default rootReducer;