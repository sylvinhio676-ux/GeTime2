import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "@/pages/Auth/Login";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import Landing from "@/pages/Public/Landing";
// import Dashboard from "@/pages/dashboard/Dashboard";
import CampusList from "@/pages/Admin/campus/CampusList";
import ShowCampus from "@/pages/Admin/campus/ShowCampus";
import TeacherList from "@/pages/Admin/teacher/TeacherList";
import ProgrammerList from "@/pages/Admin/programmer/ProgrammerList";
import UserList from "@/pages/Admin/user/UserList";

import DashboardLayouts from "@/layouts/DashboadLayouts";
import Dashboard from "@/pages/dashbaord/Dashboard";
import TableGris from "@/pages/Admin/programmation/TableGris";
import YearList from "@/pages/Admin/year/YearList";
import LevelList from "@/pages/Admin/level/LevelList";
import SectorList from "@/pages/Admin/sector/SectorList";
import SpecialtyList from "@/pages/Admin/specialty/SpecialtyList";
import SubjectList from "@/pages/Admin/Subject/SubjectList";
import RoomList from "@/pages/Admin/room/RoomList";
import SchoolList from "@/pages/Admin/school/SchoolList";
import EtablishmentList from "@/pages/Admin/etablishment/EtablishmentList";
import LocationList from "@/pages/Admin/location/LocationList";
import DisponibilityList from "@/pages/Admin/disponibility/DisponibilityList";
import Settings from "@/pages/Admin/Settings/Settings";
import EmailSend from "@/pages/Admin/email/EmailSend";
import NotificationList from "@/pages/Admin/notifications/NotificationList";
import AuditLogList from "@/pages/Admin/audit/AuditLogList";
import RequireAuth from "@/router/RequireAuth";
import RequireGuest from "@/router/RequireGuest";
import RequirePermission from "@/router/RequirePermission";
import ProgrammationList from "@/pages/Admin/programmation/ProgrammationList";
import TrackingPage from "@/pages/Admin/tracking/TrackingPage";
import QuotaDashboard from "@/pages/Admin/quota/QuotaDashboard";
import AnalyticsDashboard from "@/pages/Admin/analytics/AnalyticsDashboard";
import AutomationReport from "@/pages/Admin/automation/AutomationReport";
import TeacherRoomList from "@/pages/Admin/room/TeacherRoomList";
import RequireTeacher from "@/router/RequireTeacher";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <RequireGuest>
            <Login />
          </RequireGuest>
        } />
        <Route path="/forgot-password" element={
          <RequireGuest>
            <ForgotPassword />
          </RequireGuest>
        } />

        {/* Dashboard layout */}
        <Route path="/dashboard" element={
          <RequireAuth>
            <DashboardLayouts />
          </RequireAuth>
        }>

          {/* page dashboard */}
          <Route index element={<Dashboard />} />

          {/* admin pages */}
          <Route path="campuses" element={<CampusList />} />
          <Route path="campuses/:id" element={<ShowCampus />} />
          <Route path="teachers" element={<TeacherList />} />
          <Route path="users" element={<UserList />} />
          <Route path="programmers" element={<ProgrammerList />} />
          <Route
            path="programmations"
            element={
              <RequirePermission permission="view-programmation" denyRoles={["teacher"]}>
                <TableGris />
              </RequirePermission>
            }
          />
          <Route path="programmationList" element={
            <RequirePermission permission="view-programmation" denyRoles={["teacher"]}>
              <ProgrammationList />
            </RequirePermission>
          } />
          <Route path="timetable" element={<TableGris readOnly />} />
          <Route path="years" element={<YearList />} />
          <Route path="levels" element={<LevelList />} />
          <Route path="sectors" element={<SectorList />} />
          <Route path="specialties" element={<SpecialtyList />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="rooms" element={<RoomList />} />
          <Route
            path="teacher-rooms"
            element={
              <RequireTeacher>
                <TeacherRoomList />
              </RequireTeacher>
            }
          />
          <Route path="etablishments" element={<EtablishmentList />} />
          <Route path="schools" element={<SchoolList />} />
          <Route path="locations" element={<LocationList />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="disponibilities" element={<DisponibilityList />}/>
          <Route path="email" element={<EmailSend />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="audit-logs" element={<AuditLogList />} />
          <Route path="quota-dashboard" element={<QuotaDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="automation-report" element={
            <RequirePermission permission="view-programmation" denyRoles={["teacher"]}>
              <AutomationReport />
            </RequirePermission>
          } />
          <Route path="settings" element={<Settings/>} />

        </Route>

        {/* fallback */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}
