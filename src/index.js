import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { Provider } from 'react-redux';
import { createStore, combineReduxers, applyMiddleware, combineReducers } from 'redux';
import { logger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { takeEvery, put, take } from 'redux-saga/effects';
import axios from 'axios';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
    yield takeEvery('CREATE_FAVORITE', createFavorite)
    yield takeEvery('FETCH_FAVORITES', fetchFavorites)
    yield takeEvery('ADD_CATEGORY', addCategory)
    yield takeEvery('DELETE_FAV', deleteFav)
    yield takeEvery('UN_FAV', unFav)
    // yield takeEvery('SORT_BY', sortBy)
}

// function* sortBy(action) {
//     try {
//         console.log('sortBy saga wired!');
//         const sortByCatId = action.payload
//         console.log('category_id to sortby:', sortByCatId);
//         yield put({ type: 'FETCH_FAVORITES'})
    
//     } catch(err) {
//         console.log('err in sorting by category', err);
//     }
// }

function* unFav(action) {
    try {
        console.log('unFav saga wired!');
        const unFavUrl = action.payload;
        console.log('unFavUrl', unFavUrl);
        yield axios.delete(`/api/favorite/${unFavUrl}`);

        yield put ({ type: 'FETCH_FAVORITES' });
        
        
    } catch(err) {
        console.log('err in unfavoriting gif', err);
        
    }
}

function* deleteFav(action) {
    try {
        console.log('deleteFav saga wired!');

        const removeId = action.payload;
        console.log('id to remove:', removeId);
        yield axios.delete(`/api/favorite/${removeId}`);
        
        // GETs updated list
        yield put({type: 'FETCH_FAVORITES'})
    } catch(err) {
        console.log('err in removing favorite', err);  
    }
}

function* addCategory(action) {
    try {
        console.log('addCategory saga wired!');

        const favId = action.payload;
        console.log('favId: ', favId);

        //UPDATEs category_id column of favId in favorite table
        yield axios.put(`/api/favorite/${favId}`, {category_id: action.category_id});
        
        // GETs updated list
        yield put({type: 'FETCH_FAVORITES'})
    } catch(err) {
        console.log('err in adding category', err);  
    }
}

function* createFavorite(action) {
    try {
        console.log('createFavorite saga wired!');

        // payload is url of favorited `gif`
        const newFav = action.payload;
        console.log('newFav: ', newFav);

        // POSTs url to favorite table
        yield axios.post('/api/favorite', {url: newFav});

        // GETs updated list
        yield put({type: 'FETCH_FAVORITES'})
    } catch(err) {
        console.log('err in adding createFavorite', err);
    }
}

function* fetchFavorites() {
    try {
        console.log('fetchFavorite saga wired!');
        
        // GETs favorites from favorites table 
        const response = yield axios.get('/api/favorite');
        console.log('favorite list:', response.data);

        // Sends favorites to favorite reducer
        const action = {type: 'SET_FAVORITES', payload: response.data};
        yield put(action);
    } catch(err) {
        console.log('err in fetchFavorites', err);
    }
}

// category reducer
const category = (state =[], action) => {
    console.log('in category reducer!');
    
    switch (action.type) {

        // case 'ADD_CATEGORY':
        //     return [...state, action.payload];
        // case 'SET_CATEGORY':
        //     return action.payload;
        default:
            return state;
    }
}

// favorite reducer
const favorite = (state =[], action) => {
    console.log('in favorite reducer!');
    
    switch (action.type) {
        // case 'ADD_FAVORITES':
        //     return [...state, action.payload];
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
