import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";

import { customHistory } from "../config";

const Campaign = React.lazy(() => import("../../pages/campaign/campaign"));

const Routes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectedRouter history={customHistory}>
        <Switch>
          <Route path="/campaign" component={Campaign} />
          <Redirect to="/campaign" />
        </Switch>
      </ConnectedRouter>
    </Suspense>
  );
};

export default Routes;
