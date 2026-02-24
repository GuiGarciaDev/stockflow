import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  HiOutlineBars3,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="btn-icon"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 />
        </button>
      </div>

      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button
          className="btn-icon btn-logout"
          onClick={logout}
          aria-label="Logout"
        >
          <HiOutlineArrowRightOnRectangle />
        </button>
      </div>
    </header>
  );
}
