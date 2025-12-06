import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "sonner";
import {
	DashboardOutlined,
	LogoutOutlined,
} from "@mui/icons-material";
import UploadIcon from '@mui/icons-material/Upload';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import WorkIcon from '@mui/icons-material/Work'
import useAuthStore from "../../Store/authStore";
import type { DashboardData } from "../../Types/types";

type NavItem = {
	name: string;
	icon?: React.ElementType;
	path: string;
	subItems?: Array<{
		name: string;
		icon?: React.ElementType;
		path: string;
	}>;
	disabled?: boolean;
};

interface SidebarProps {
	dashboardData?: DashboardData;
}

export function Sidebar({ }: SidebarProps) {
	const location = useLocation();
	const pathname = location.pathname;
	const navigate = useNavigate();

	// Auth store
	const email = useAuthStore((state: any) => state.email);
	const roles = useAuthStore((state: any) => state.roles);
	const logout = useAuthStore((state: any) => state.logout);

	// Filter navigation based on role
	const navigation = useMemo(() => {
    const items: any[] = [{ name: "Dashboard", icon: DashboardOutlined, path: "/dashboard" }];

    if (roles?.includes("RECRUITER")) {
      items.push({ name: "Manage Jobs", icon: WorkIcon, path: "/jobs" });
      items.push({ name: "Upload", icon: UploadIcon, path: "/upload" });
    } else if (roles?.includes("CANDIDATE")) {
      items.push({ name: "Browse Jobs", icon: WorkIcon, path: "/jobs" });
	  items.push({name: "Applications" , icon: PersonAddAltIcon, path: "/applications"});
	}else if(roles?.includes("ADMIN")){
		items.push({ name: "Users", icon: PersonAddAltIcon, path: "/users" });
	}

    return items;
  }, [roles]);

	const handleNavigation = (path: string) => {
		navigate(path);
	};

	const handleLogout = () => {
		logout();
		toast.success("Logged out successfully");
		navigate("/");
	};

	const getUserName = () => {
		if (email) {
			const name = email.split("@")[0];
			return name
				.split(".")
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(" ");
		}
		return "User";
	};

	const getRoleDisplay = () => {
		if (roles && roles.length > 0) {
			return roles[0].charAt(0).toUpperCase() + roles[0].slice(1);
		}
		return "User";
	};

	return (
		<aside className="fixed left-0 top-0 w-60 min-h-screen bg-gray-900 flex flex-col shadow-lg z-20">
			<div className="h-16 flex items-center px-6 border-b border-gray-800">
				<div className="flex items-center gap-2">
					<span className="text-xl font-bold text-white">RMS</span>
				</div>
			</div>

			<nav className="flex-1 px-3 py-4 overflow-y-auto">
				<div className="space-y-1">
					{navigation.map((item) => {
						const IconComponent = item.icon ?? DashboardOutlined;
						const isActive =
							pathname === item.path || pathname.startsWith(item.path + "/");

						return (
							<div key={item.name}>
								<button
									onClick={() => {
										if (!item.disabled) {
											handleNavigation(item.path);
										}
									}}
									disabled={item.disabled}
									className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${item.disabled
											? "opacity-50 cursor-not-allowed"
											: isActive
												? "bg-yellow-400 text-gray-900"
												: "text-gray-300 hover:bg-gray-800"
										}`}
								>
									<IconComponent
										fontSize="small"
										className={`w-5 h-5 ${item.disabled
												? "text-gray-600"
												: isActive
													? "text-gray-900"
													: "text-gray-400"
											}`}
									/>
									<span className="text-sm font-medium">{item.name}</span>
								</button>
							</div>
						);
					})}
				</div>
			</nav>

			<div className="border-t border-gray-800">
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition-all duration-200"
				>
					<LogoutOutlined fontSize="small" className="w-5 h-5 text-gray-400" />
					<span className="text-sm font-medium">Log Out</span>
				</button>

					<Link to={"/profile"} className="px-4 py-4 flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
							<FaUserCircle className="w-8 h-8" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-white truncate">
								{getUserName()}
							</p>
							<p className="text-xs text-gray-400 truncate">{getRoleDisplay()}</p>
						</div>
					</Link>
			</div>
		</aside>
	);
}

export default Sidebar;