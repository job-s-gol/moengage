import "regenerator-runtime/runtime";

import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import createSagaMiddleware from "redux-saga";

import createRootReducer from "./reducers";
import sagas from "./sagas";

const customHistory = createBrowserHistory();

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = composeWithDevTools({});

const store = createStore(
  createRootReducer(customHistory),
  composeEnhancers(
    applyMiddleware(sagaMiddleware, routerMiddleware(customHistory))
  )
);

sagaMiddleware.run(sagas);

export { store, customHistory };
