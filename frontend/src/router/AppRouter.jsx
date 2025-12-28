import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "@/pages/Auth/Login";
// import Dashboard from "@/pages/dashboard/Dashboard";
import CampusList from "@/pages/Admin/campus/CampusList";
import TeacherList from "@/pages/Admin/teacher/TeacherList";
import ProgrammerList from "@/pages/Admin/programmer/ProgrammerList";

import DashboardLayouts from "@/layouts/DashboadLayouts";
import Dashboard from "@/pages/dashbaord/Dashboard";
import ProgrammationList from "@/pages/Admin/programmation/ProgrammationList";
import YearList from "@/pages/Admin/year/YearList";
import LevelList from "@/pages/Admin/level/LevelList";
import SectorList from "@/pages/Admin/sector/SectorList";
import SpecialtyList from "@/pages/Admin/specialty/SpecialtyList";
import SubjectList from "@/pages/Admin/Subject/SubjectList";
import RoomList from "@/pages/Admin/room/RoomList";
import SchoolList from "@/pages/Admin/school/SchoolList";
import DisponibilityList from "@/pages/Admin/disponibility/DisponibilityList";
import Settings from "@/pages/Admin/Settings/Settings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayouts />}>

          {/* page dashboard */}
          <Route index element={<Dashboard />} />

          {/* admin pages */}
          <Route path="campuses" element={<CampusList />} />
          <Route path="teachers" element={<TeacherList />} />
          <Route path="programmers" element={<ProgrammerList />} />
          <Route path="programmations" element={<ProgrammationList />} />
          <Route path="years" element={<YearList />} />
          <Route path="levels" element={<LevelList />} />
          <Route path="sectors" element={<SectorList />} />
          <Route path="specialties" element={<SpecialtyList />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="schools" element={<SchoolList />} />
          <Route path="disponibilities" element={<DisponibilityList />}/>
          <Route path="settings" element={<Settings/>} />

        </Route>

        {/* fallback */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}
