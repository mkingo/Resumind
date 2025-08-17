import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {usePuterStore} from "~/lib/puter";
import {Trash2, Loader2} from "lucide-react"; // icons
import {motion} from "framer-motion";
import Navbar from "~/components/Navbar";

const WipeApp = () => {
    const {auth, isLoading, error, clearError, fs, kv} = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [deleting, setDeleting] = useState(false);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDeleteAll = async () => {
        if (!confirm("Are you sure you want to wipe ALL app data?")) return;
        setDeleting(true);
        for (const file of files) {
            await fs.delete(file.path);
        }
        await kv.flush();
        await loadFiles();
        setDeleting(false);
    };

    const handleDeleteOne = async (file: FSItem) => {
        if (!confirm(`Delete ${file.name}?`)) return;
        setDeleting(true);
        await fs.delete(file.path);
        await loadFiles();
        setDeleting(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-6 h-6 text-gray-600"/>
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-100 rounded-md">
                Error: {error}
                <button
                    onClick={clearError}
                    className="ml-4 text-sm text-blue-600 underline"
                >
                    Clear
                </button>
            </div>
        );
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar/>

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1 className="text-2xl font-bold mb-4">
                         Wipe Your App Data
                    </h1>
                    <p className="text-xl mb-6 text-gray-600">
                        Authenticated as <span className="font-semibold">{auth.user?.username}</span>
                    </p>

                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Existing Files</h2>
                        {files.length > 0 && (
                            <button
                                disabled={deleting}
                                onClick={handleDeleteAll}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete All"}
                            </button>
                        )}
                    </div>

                    {files.length === 0 ? (
                        <p className="text-gray-500">No files found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {files.map((file) => (
                                <motion.div
                                    key={file.id}
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-xs text-gray-400">{file.path}</span>
                                    </div>
                                    <button
                                        disabled={deleting}
                                        onClick={() => handleDeleteOne(file)}
                                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition disabled:opacity-50"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600"/>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default WipeApp;
