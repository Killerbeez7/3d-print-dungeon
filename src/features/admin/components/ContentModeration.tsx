import { useState, useEffect } from "react";
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MdDelete, MdCheck, MdClose } from "react-icons/md";
import type { AdminReport } from "@/types/admin";

export const ContentModeration = () => {
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("pending");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const reportsRef = collection(db, "reports");
                const q = query(reportsRef);
                const querySnapshot = await getDocs(q);
                
                const reportsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AdminReport[];
                
                setReports(reportsData);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            const reportRef = doc(db, "reports", reportId);
            await updateDoc(reportRef, { status });
            
            setReports(reports.map(report => 
                report.id === reportId 
                    ? { ...report, status }
                    : report
            ));
        } catch (error) {
            console.error("Error updating report status:", error);
        }
    };

    const handleDeleteContent = async (reportId: string, contentId: string, contentType: string) => {
        if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
            return;
        }

        try {
            // Delete the reported content
            const contentRef = doc(db, contentType, contentId);
            await deleteDoc(contentRef);

            // Update report status
            const reportRef = doc(db, "reports", reportId);
            await updateDoc(reportRef, { status: "resolved" });

            // Update local state
            setReports(reports.map(report => 
                report.id === reportId 
                    ? { ...report, status: "resolved" }
                    : report
            ));
        } catch (error) {
            console.error("Error deleting content:", error);
        }
    };

    const filteredReports = reports.filter(report => report.status === selectedStatus);

    if (loading) {
        return <div className="text-center py-4">Loading reports...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Status Filter */}
            <div className="flex space-x-2">
                {["pending", "reviewing", "resolved"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            selectedStatus === status
                                ? "bg-accent text-white"
                                : "bg-bg-secondary text-txt-secondary hover:text-txt-primary"
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-br-secondary">
                    <thead className="bg-bg-secondary">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Content</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Reporter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-br-secondary">
                        {filteredReports.map((report) => (
                            <tr key={report.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            className="h-10 w-10 rounded object-cover"
                                            src={report.contentPreviewUrl || "/placeholder.png"}
                                            alt=""
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-txt-primary">
                                                {report.contentTitle || "Untitled"}
                                            </div>
                                            <div className="text-sm text-txt-secondary">
                                                ID: {report.contentId}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-bg-secondary text-txt-secondary">
                                        {report.contentType}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-txt-primary">{report.reason}</div>
                                    <div className="text-xs text-txt-secondary">{report.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-txt-secondary">{report.reporterName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, "resolved")}
                                            className="text-green-500 hover:text-green-600"
                                            title="Mark as resolved"
                                        >
                                            <MdCheck size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, "reviewing")}
                                            className="text-yellow-500 hover:text-yellow-600"
                                            title="Mark as reviewing"
                                        >
                                            <MdClose size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContent(report.id, report.contentId, report.contentType)}
                                            className="text-red-500 hover:text-red-600"
                                            title="Delete content"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredReports.length === 0 && (
                <div className="text-center py-8 text-txt-secondary">
                    No {selectedStatus} reports found.
                </div>
            )}
        </div>
    );
}; 