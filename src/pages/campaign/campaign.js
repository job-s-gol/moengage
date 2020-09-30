import React, { useEffect, useRef, useCallback } from "react";
import { connect } from "react-redux";
// import { push } from "connected-react-router";

import Header from "../../common/components/header/header";
import SearchInput from "../../common/components/searchInput/searchInput";
import Loader from "../../common/components/loader/loader";
import EndOfList from "../../common/components/endOfList/endOfList";

import {
  PAGE_SIZE,
  MAX_PAGE_SIZE,
  getLoading,
  getDisplayList,
  getPage,
  getEnd,
  getCampaignListAction,
  searchCampaignAction,
} from "./ducks";

import "./campaign.scss";

const Campaign = ({
  loading,
  displayList,
  page,
  end,
  getCampaignList,
  searchCampaign,
}) => {
  const io = useRef(null);
  const campaignFirst = useRef(null);
  const campaignLast = useRef(null);
  const searchText = useRef("");
  const cpage = useRef(page);
  const cend = useRef(end);
  const loadingWhere = useRef("bottom");
  const html = useRef(null);
  const ignoreScroll = useRef(false);

  const ioCallback = useCallback(
    (entries, observer) => {
      if (ignoreScroll.current === true) {
        ignoreScroll.current = false;
        return;
      }

      if (entries.length === 2 && entries[1].isIntersecting && !cend.current) {
        // process only the bottom one
        // this happens only when screen is too big
        observer.disconnect();
        searchCampaign({
          searchString: searchText.current,
          page: cpage.current + 1,
        });
      } else if (entries.length === 1 && entries[0].isIntersecting) {
        // process intersected one
        const subtractor = MAX_PAGE_SIZE / PAGE_SIZE;
        if (
          entries[0].target === campaignFirst.current &&
          cpage.current - subtractor > 0
        ) {
          searchCampaign({
            searchString: searchText.current,
            page: cpage.current - subtractor,
          });
          observer.disconnect();
          loadingWhere.current = "top";
        } else if (
          entries[0].target === campaignLast.current &&
          !cend.current
        ) {
          searchCampaign({
            searchString: searchText.current,
            page: cpage.current + 1,
          });
          observer.disconnect();
          loadingWhere.current = "bottom";
        }
      }
    },
    [searchCampaign]
  );

  useEffect(() => {
    html.current = document.getElementsByTagName("html")[0];
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };
    io.current = new IntersectionObserver(ioCallback, options);

    getCampaignList();
  }, [getCampaignList, ioCallback]);

  useEffect(() => {
    if (campaignFirst.current && campaignLast.current) {
      io.current.observe(campaignFirst.current);
      io.current.observe(campaignLast.current);
    }
    if (loadingWhere.current === "top") {
      html.current.scrollTop = 750;
      ignoreScroll.current = true;
    }
  }, [displayList]);

  useEffect(() => {
    cpage.current = page;
    cend.current = end;
  }, [page, end]);

  const onSearch = (text) => {
    if (text !== searchText.current) {
      searchText.current = text;
      loadingWhere.current = "search";
      searchCampaign({ searchString: text, page: 1 });
    }
  };

  const len = displayList.length;

  return (
    <div className="campaign-page">
      <Header>
        <SearchInput
          placeholder="Search Campaign"
          onSearch={onSearch}
          minSearchLength={1}
        />
      </Header>
      <div className="campaign-list-header">
        <p>Campaign Name</p>
        <p>Type</p>
        <p>Company</p>
      </div>
      {loading && loadingWhere.current === "search" ? <Loader /> : null}
      {loading && loadingWhere.current === "top" ? <Loader /> : null}
      <div className="campaign-list">
        {displayList.map((o, i) => {
          return (
            <div
              key={o._id}
              ref={
                i === 0 ? campaignFirst : i === len - 1 ? campaignLast : null
              }
              className="campaign-list-item"
            >
              <p>{o.name}</p>
              <p>{o.type}</p>
              <p>{o.company}</p>
            </div>
          );
        })}
      </div>
      {loading && loadingWhere.current === "bottom" ? <Loader /> : null}
      {end ? <EndOfList message="That's all folks!" /> : null}
    </div>
  );
};

export default connect(
  (state) => ({
    loading: getLoading(state),
    displayList: getDisplayList(state),
    page: getPage(state),
    end: getEnd(state),
  }),
  {
    getCampaignList: getCampaignListAction,
    searchCampaign: searchCampaignAction,
  }
)(Campaign);
