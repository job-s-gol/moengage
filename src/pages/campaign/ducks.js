import { createAction, createReducer } from "@reduxjs/toolkit";
import { put, all, takeLatest, call } from "redux-saga/effects";

import { sleep } from "../../common/utils/utils";

import { data } from "./static/data";

const CAMPAIGN_LOADING = "[campaign] campaign loading";
const CAMPAIGN_LOADING_DONE = "[campaign] campaign loading done";
const GET_CAMPAIGN_LIST = "[campaign] get campaign list";
const GET_CAMPAIGN_LIST_RECEIVED = "[campaign] get campaign list received";
const SEARCH_CAMPAIGN_ACTION = "[campaign] search campaign action";
const SEARCH_CAMPAIGN = "[campaign] search campaign";

export const PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 30;

const initialState = {
  loading: false,
  campaignList: [],
  searchedList: [],
  displayList: [],
  searchString: "",
  page: 0,
  end: false,
};

export const stateSelector = (state) => state.campaignReducer;
export const getLoading = (state) => stateSelector(state).loading;
export const getDisplayList = (state) => stateSelector(state).displayList;
export const getPage = (state) => stateSelector(state).page;
export const getEnd = (state) => stateSelector(state).end;

export const campaignLoadingAction = createAction(CAMPAIGN_LOADING);
export const campaignLoadingDoneAction = createAction(CAMPAIGN_LOADING_DONE);
export const getCampaignListAction = createAction(GET_CAMPAIGN_LIST);
export const searchCampaignAction = createAction(SEARCH_CAMPAIGN_ACTION);

export const campaignReducer = createReducer(initialState, {
  [CAMPAIGN_LOADING]: (state, { payload }) => {
    state.loading = true;
  },
  [CAMPAIGN_LOADING_DONE]: (state, { payload }) => {
    state.loading = false;
  },
  [GET_CAMPAIGN_LIST_RECEIVED]: (state, { payload }) => {
    state.campaignList = payload;
    state.searchedList = payload;
    state.displayList = payload.slice(0, PAGE_SIZE);
    state.page = 1;
    state.end = false;
  },
  [SEARCH_CAMPAIGN]: (state, { payload }) => {
    debugger;
    let list;

    if (payload.searchString === state.searchString) {
      list = state.searchedList;
    } else if (payload.searchString === "") {
      list = state.campaignList;
      state.searchedList = state.campaignList;
    } else {
      list = state.campaignList.filter((o) =>
        o.name.toLowerCase().match(payload.searchString.toLowerCase())
      );
      state.searchedList = list;
    }

    const begin = (payload.page - 1) * PAGE_SIZE;
    const end = payload.page * PAGE_SIZE;
    if (payload.searchString === state.searchString) {
      if (payload.page > state.page) {
        const newPage = list.slice(begin, end);
        let displayListSlice = state.displayList;
        if (state.displayList.length === MAX_PAGE_SIZE) {
          displayListSlice = state.displayList.slice(PAGE_SIZE);
        }
        state.displayList = [...displayListSlice, ...newPage];
        state.page = payload.page;
        if (!list[end]) {
          state.end = true;
        }
      } else {
        // condition: payload.page < state.page
        const morePages = Math.floor((MAX_PAGE_SIZE - PAGE_SIZE) / PAGE_SIZE);
        state.displayList = [
          ...list.slice(begin, end),
          ...list.slice(end, end + morePages * PAGE_SIZE),
        ];
        state.page = payload.page + morePages;
        state.end = false;
      }
    } else {
      state.displayList = list.slice(begin, end);
      state.page = 1;
      if (list[end]) {
        state.end = false;
      } else {
        state.end = true;
      }
    }

    state.searchString = payload.searchString;
  },
});

function* getCampaignList({ payload }) {
  yield put({ type: CAMPAIGN_LOADING });
  yield put({ type: GET_CAMPAIGN_LIST_RECEIVED, payload: data });
  yield put({ type: CAMPAIGN_LOADING_DONE });
}

function* searchCampaign({ payload }) {
  yield put(campaignLoadingAction());
  yield call(sleep, 500);
  yield put({ type: SEARCH_CAMPAIGN, payload });
  yield put(campaignLoadingDoneAction());
}

export function* campaignSaga() {
  yield all([
    yield takeLatest(GET_CAMPAIGN_LIST, getCampaignList),
    yield takeLatest(SEARCH_CAMPAIGN_ACTION, searchCampaign),
  ]);
}
