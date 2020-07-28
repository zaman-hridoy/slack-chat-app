import * as actionsTypes from '../actions/types.js';
import { combineReducers } from 'redux';

const initialUserState = {
    currentUser: null,
    isLoading: true
}

const user_reducer = (state = initialUserState, action) => {
    switch(action.type) {
        case actionsTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            }
        case actionsTypes.CLEAR_USER:
            return {
                ...state,
                currentUser: null,
                isLoading: false
            }
        default:
            return state;
    }
}

const initialChannelState = {
    currentChannel: null,
    isPrivate: false,
    userPosts: null
}

const channel_reducer = (state=initialChannelState, action) => {
    switch(action.type) {
        case actionsTypes.SET_CURRENT_CHANNEL:
            return {
                ...state, 
                currentChannel: action.payload.currentChannel
            }
        case actionsTypes.SET_PRIVATE_CHANNEL:
            return {
                ...state,
                isPrivate: action.payload.isPrivate
            }
        case actionsTypes.SET_USER_POSTS:
            return {
                ...state,
                userPosts: action.payload.userPosts
            }
        default:
            return state;
    }
}

const initialColors = {
    primaryColor: '#4c3c4c',
    secondaryColor: '#eee'
}

const colorsReducer = (state=initialColors, action) => {
    switch(action.type) {
        case actionsTypes.SET_COLOR:
            return {
                ...state, 
                primaryColor: action.payload.primaryColor,
                secondaryColor: action.payload.secondaryColor
            }
        default:
            return state;
    }
}


const rootReducer = combineReducers({
    user: user_reducer,
    channel: channel_reducer,
    colors: colorsReducer
});

export default rootReducer;