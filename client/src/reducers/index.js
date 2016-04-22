import { combineReducers } from 'redux';
import app from './app';
import counter from './counter';
import user from './user';

const rootReducer = combineReducers({
    app,
    counter,
    user
});

export default rootReducer;
