import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineBeaker,
  HiOutlineBolt,
} from "react-icons/hi2";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { path: "/products", label: "Products", icon: HiOutlineCube },
  { path: "/raw-materials", label: "Raw Materials", icon: HiOutlineBeaker },
  { path: "/production", label: "Production", icon: HiOutlineBolt },
];

const adminItems = [
  { path: "/admin", label: "Admin", icon: HiOutlineCog6Tooth },
];

export default function Sidebar() {
  const { sidebarOpen } = useSelector((s: RootState) => s.ui);
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">🦆</span>
        {sidebarOpen && <span className="brand-text">DuckStock</span>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon className="nav-icon" />
            {sidebarOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}

        {user?.role === "ADMIN" &&
          adminItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <item.icon className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
