import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { Loader2 } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fs } = usePuterStore();

    const [hasResumes, setHasResumes] = useState(false);
    const [loadingResumes, setLoadingResumes] = useState(true);

    const checkResumes = async () => {
        try {
            setLoadingResumes(true);
            const files = (await fs.readDir("./")) as FSItem[];
            // Example filter: only consider `.pdf` or `.docx` as resumes
            const resumeFiles = files.filter((f) =>
                f.name.toLowerCase().match(/\.(pdf|docx|doc)$/)
            );
            setHasResumes(resumeFiles.length > 0);
        } catch (err) {
            console.error("Error checking resumes:", err);
            setHasResumes(false);
        } finally {
            setLoadingResumes(false);
        }
    };

    useEffect(() => {
        checkResumes();
    }, []);

    const handleBackHome = () => {
        if (location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <nav className="navbar">
            {/* Logo */}
            <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
            >
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>

            {/* Buttons */}
            <div className="flex gap-4">
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>

                {/* Conditionally show wipe button */}
                {loadingResumes ? (
                    <div className="flex items-center px-3 py-2 text-gray-500">
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Checking...
                    </div>
                ) : (
                    hasResumes && (
                        <button
                            onClick={() => navigate("/wipe")}
                            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-4 py-2 rounded-lg shadow-md transition"
                        >
                            Wipe Data
                        </button>
                    )
                )}

                <button
                    onClick={handleBackHome}
                    className="secondary-button cursor-pointer w-fit px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                    Back to Home
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
