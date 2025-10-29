import { Breadcrumbs as MUIBreadcrumbs, Typography, Link } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
    ArrowForwardIos,
    BusinessOutlined,
    DashboardOutlined,
    Home,
} from "@mui/icons-material";

type NavItem = {
    name: string;
    icon?: React.ElementType;
    path: string;
    subItems?: Array<{
        name: string;
        icon?: React.ElementType;
        path: string;
    }>;
};

// === NAVIGATION STRUCTURE ===
const navigation: NavItem[] = [
    { name: "Dashboard", icon: DashboardOutlined, path: "/dashboard" },
    { name: "Profile", icon: BusinessOutlined, path: "/profile" },
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const findNavItemByPath = (path: string) => {
    for (const item of navigation) {
        if (item.path === path) return item;
        if (item.subItems) {
            for (const sub of item.subItems) {
                if (item.path + sub.path === path) return sub;
            }
        }
    }
    return null;
};

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    const iconSX = {
        width: "1rem",
        height: "1rem",
    };

    return (
        pathnames.length == 1 &&
        pathnames[0] !== "dashboard" && (
            <div>
                <MUIBreadcrumbs
                    aria-label="breadcrumb"
                    separator={
                        <ArrowForwardIos
                            style={{ width: ".85rem", height: ".85rem", marginTop: "0.125rem" }}
                            color="secondary"
                            fontSize="small"
                        />
                    }
                >
                    <Link component={RouterLink} underline="hover" color="inherit" to="/">
                        <Home color="secondary" fontSize="small" />
                    </Link>

                    {pathnames.map((value, index) => {
                        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        const navItem = findNavItemByPath(to);
                        const Icon = navItem?.icon;

                        return isLast ? (
                            <div className="flex items-center gap-2 mt-0.5" key={to}>
                                {Icon && <Icon fontSize="small" color="secondary" />}
                                <div className="mt-0.5">
                                    <Typography key={to} fontWeight={600}>
                                        {capitalize(decodeURIComponent(value.replace(/-/g, " ")))}
                                    </Typography>
                                </div>
                            </div>
                        ) : (
                            <Link
                                component={RouterLink}
                                className="flex items-center gap-2 mt-1"
                                underline="hover"
                                color="inherit"
                                to={to}
                                key={to}
                            >
                                {Icon && <Icon style={iconSX} color="secondary" />}
                                <div className="mt-0.5">
                                    <Typography
                                        color="text.primary"
                                        key={to}
                                        className="flex items-center"
                                    >
                                        {capitalize(decodeURIComponent(value.replace(/-/g, " ")))}
                                    </Typography>
                                </div>
                            </Link>
                        );
                    })}
                </MUIBreadcrumbs>
            </div>
        )
    );
}
