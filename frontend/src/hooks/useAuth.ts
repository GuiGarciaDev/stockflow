import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setUser, clearUser, setLoading } from "../store/slices/authSlice";
import { authService } from "../services/authService";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading } = useSelector(
    (s: RootState) => s.auth,
  );

  const checkAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await authService.getMe();
      dispatch(setUser(res.data));
    } catch {
      dispatch(clearUser());
    }
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authService.login({ email, password });
      dispatch(setUser(res.data));
      return res.data;
    },
    [dispatch],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authService.register({ name, email, password });
      dispatch(setUser(res.data));
      return res.data;
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch(clearUser());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };
}
