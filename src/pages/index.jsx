import Layout from "./Layout.jsx";

import Import from "./Import";

import Project from "./Project";

import Review from "./Review";

import Settings from "./SettingsFixed";

import Projects from "./Projects";

import Dashboard from "./Dashboard";

import Home from "./Home";

import Upgrade from "./Upgrade";

import BillingSuccess from "./BillingSuccess";

import BillingFailed from "./BillingFailed";

import Features from "./Features";

import Pricing from "./Pricing";

import Faq from "./Faq";

import About from "./About";

import Contact from "./Contact";

import Terms from "./Terms";

import Privacy from "./Privacy";

import Refund from "./Refund";

import SuccessFree from "./SuccessFree";

import SuccessBasic from "./SuccessBasic";

import SuccessPro from "./SuccessPro";

import SupabaseTest from "./SupabaseTest";

import SupabaseOnly from "./SupabaseOnly";

import Login from "./Login";

import Register from "./Register";

import ForgotPassword from "./ForgotPassword";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

const PAGES = {
    
    Import: Import,
    
    Project: Project,
    
    Review: Review,
    
    Settings: Settings,
    
    Projects: Projects,
    
    Dashboard: Dashboard,
    
    Home: Home,
    
    Upgrade: Upgrade,
    
    BillingSuccess: BillingSuccess,
    
    BillingFailed: BillingFailed,
    
    Features: Features,
    
    Pricing: Pricing,
    
    Faq: Faq,
    
    About: About,
    
    Contact: Contact,
    
    Terms: Terms,
    
    Privacy: Privacy,
    
    Refund: Refund,
    
    SuccessFree: SuccessFree,
    
    SuccessBasic: SuccessBasic,
    
    SuccessPro: SuccessPro,
    
    SupabaseTest: SupabaseTest,
    
    SupabaseOnly: SupabaseOnly,
    
    Login: Login,
    
    Register: Register,
    
    ForgotPassword: ForgotPassword,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    
    // Handle root path redirect to Home
    if (url === '' || url === '/') {
        return 'Home';
    }
    
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'Home';
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Navigate to="/Home" replace />} />
                
                
                <Route path="/Import" element={<Import />} />
                
                <Route path="/Project" element={<Project />} />
                
                <Route path="/Review" element={<Review />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Upgrade" element={<Upgrade />} />
                
                <Route path="/BillingSuccess" element={<BillingSuccess />} />
                
                <Route path="/BillingFailed" element={<BillingFailed />} />
                
                <Route path="/Features" element={<Features />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/Faq" element={<Faq />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Refund" element={<Refund />} />
                
                <Route path="/SuccessFree" element={<SuccessFree />} />
                
                <Route path="/SuccessBasic" element={<SuccessBasic />} />
                
                <Route path="/SuccessPro" element={<SuccessPro />} />
                
                <Route path="/SupabaseTest" element={<SupabaseTest />} />
                
                <Route path="/SupabaseOnly" element={<SupabaseOnly />} />
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/Register" element={<Register />} />
                
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}