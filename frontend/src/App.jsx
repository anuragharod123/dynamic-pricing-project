import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import PriceHistory from "./pages/PriceHistory";

function App() {

    const [activePage, setActivePage] = useState("dashboard");

    const pageDetails = {

        dashboard: {
            title: "Dashboard",
            subtitle: "AI-powered dynamic pricing control center"
        },

        products: {
            title: "Products",
            subtitle: "Manage your product catalog"
        },

        history: {
            title: "Price History",
            subtitle: "Track competitor pricing history"
        }

    };

    function renderPage() {

        if (activePage === "products") {
            return <Products />;
        }

        if (activePage === "history") {
            return <PriceHistory />;
        }

        return <Dashboard />;
    }

    return (
        <div className="app">

            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
            />

            <main className="main-content">

                <Header
                    title={pageDetails[activePage].title}
                    subtitle={pageDetails[activePage].subtitle}
                />

                <section className="page-content">
                    {renderPage()}
                </section>

            </main>

        </div>
    );
}

export default App;