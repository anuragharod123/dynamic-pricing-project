import {
    LayoutDashboard,
    Package,
    History,
    Zap
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {

    return (
        <aside className="sidebar">

            <div className="logo">
                <div className="logo-icon">
                    <Zap size={20} />
                </div>

                <div>
                    <h2>PricePilot</h2>
                    <span>AI Pricing</span>
                </div>
            </div>

            <nav>

                <button
                    className={activePage === "dashboard" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("dashboard")}
                >
                    <LayoutDashboard size={19} />
                    Dashboard
                </button>

                <button
                    className={activePage === "products" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("products")}
                >
                    <Package size={19} />
                    Products
                </button>

                <button
                    className={activePage === "history" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("history")}
                >
                    <History size={19} />
                    Price History
                </button>

            </nav>

            <div className="sidebar-bottom">
                <div className="status-dot"></div>
                <span>Agent Online</span>
            </div>

        </aside>
    );
}

export default Sidebar;