import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { forgetReveals } from './components/Reveal';
import { Toaster } from './ui';
import { useStore } from './store/store';
import { Login } from './screens/Login';
import { Analytics, AnalyticsPerf } from './screens/Analytics';
import { Assignees, AssigneePage, MyWork } from './screens/WorkBoards';
import { BuildingGlance, BuildingAnalytics, BuildingPerf, BuildingWorkOrders, BuildingAssets } from './screens/Building';
import { WorkOrderPage } from './screens/WorkOrderPage';
import { AssetPage } from './screens/AssetPage';
import { CalendarPage } from './screens/Calendar';
import { Contacts } from './screens/Contacts';
import { NewWorkOrder } from './screens/NewWorkOrder';
import { NewAsset } from './screens/NewAsset';
import { Profile } from './screens/Profile';

function Shell() {
  const { pathname } = useLocation();
  const theme = useStore((s) => s.theme);
  useEffect(() => { forgetReveals(); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { if (theme) document.documentElement.dataset.theme = theme; else delete document.documentElement.dataset.theme; }, [theme]);
  const login = pathname === '/login';
  return (
    <>
      {!login && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/analytics" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics/performance" element={<AnalyticsPerf />} />
        <Route path="/assignees" element={<Assignees />} />
        <Route path="/assignees/:personId" element={<AssigneePage />} />
        <Route path="/my-work" element={<MyWork />} />
        <Route path="/building" element={<BuildingGlance />} />
        <Route path="/building/analytics" element={<BuildingAnalytics />} />
        <Route path="/building/performance" element={<BuildingPerf />} />
        <Route path="/building/work-orders" element={<BuildingWorkOrders />} />
        <Route path="/building/assets" element={<BuildingAssets />} />
        <Route path="/work-orders/:id" element={<WorkOrderPage />} />
        <Route path="/assets/:id" element={<AssetPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/new-work-order" element={<NewWorkOrder />} />
        <Route path="/new-asset" element={<NewAsset />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/analytics" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export const App = () => <HashRouter><Shell /></HashRouter>;
