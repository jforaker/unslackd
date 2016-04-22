import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import devTools from 'remote-redux-devtools';
import reducer from '../reducers';

let middleware = [
    thunk
];

export default function configureStore(initialState) {

    middleware.push(
        require('redux-logger')({level: 'info', collapsed: true})
    );

    const store = createStore(
        reducer,
        initialState,
        compose(
            applyMiddleware(...middleware),
            devTools()
        )
    );

    if (module.hot) {
        // Enable hot module replacement for reducers
        module.hot.accept(() => {
            const nextRootReducer = require('../reducers/index').default;
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};
