import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import { campaignReducer } from "../pages/campaign/ducks";

const createRootReducer = (customHistory) =>
  combineReducers({
    router: connectRouter(customHistory),
    campaignReducer,
  });

export default createRootReducer;
