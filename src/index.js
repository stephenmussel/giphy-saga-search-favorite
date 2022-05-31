import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { Provider } from 'react-redux';
import { createStore, combineReduxers, applyMiddleware, combineReducers } from 'redux';
import { logger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';
import axios from 'axios';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
    yield takeEvery('ADD_FAVORITE', addFavorite)
    yield takeEvery('FETCH_FAVORITES', fetchFavorites)
}

function* addFavorite(action) {
    try {
        console.log('addFavorite saga wired!');

        const newFav = action.payload;
        yield console.log('newFav: ', newFav);
        yield axios.post('/api/favorite', {url: newFav});
        

    } catch(err) {
        console.log('err in adding addFavorite', err);
    }
}

function* fetchFavorites() {
    try {
        console.log('fetchFavorite saga wired!');
        
        const response = yield axios.get('/api/favorite');
        yield console.log('favorite list: ', response.data);
        const action = {type: 'SET_FAVORITES', payload: response.data};
        yield put(action);

    } catch(err) {
        console.log('err in fetchFavorites', err);
    }
}

// category reducer
const category = (state =[], action) => {
    switch (action.type) {
    
        default:
            return state;
    }
}

// favorite reducer
const favorite = (state =[], action) => {
    switch (action.type) {
        case 'ADD_FAVORITE':
            return [...state, action.payload];
        case 'SET_FAVORITES':
            return action.payload;
        default:
            return state;
    }
}

const store = createStore(
    combineReducers({
        category,
        favorite
    }),
    applyMiddleware(logger, sagaMiddleware),
);

sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>, 
    document.getElementById('root')
);
