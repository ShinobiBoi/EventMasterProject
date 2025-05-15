import "./App.css";
import Header from "./shared/Header";
import Footer from "./shared/Footer";
import { Outlet } from "react-router-dom";
import NotificationComponent from "./components/NotificationComponent"; // <-- import here

function App() {
    return (
        <div className="App">
            <Header />

            <NotificationComponent />  {/* <-- add here */}

            <Outlet />
            <Footer />
        </div>
    );
}

export default App;