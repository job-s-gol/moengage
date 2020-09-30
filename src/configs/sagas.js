import { all } from "redux-saga/effects";

import { campaignSaga } from "../pages/campaign/ducks";

export default function* () {
  yield all([campaignSaga()]);
}
