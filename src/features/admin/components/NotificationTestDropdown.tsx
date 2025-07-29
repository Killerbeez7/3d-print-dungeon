import { useState } from "react";
import { ChevronDown, ChevronUp, Bell, MessageSquare } from "lucide-react";
import { useNotificationTest } from "../scripts/testNotifications";

export const NotificationTestDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("Test Notification");
    const [message, setMessage] = useState("This is a test notification message.");
    const [duration, setDuration] = useState(5000);

    const { testNotification, testAllTypes, testPersistent, testLongMessage } =
        useNotificationTest();

    const handleTest = (type: "success" | "error" | "warning" | "info") => {
        testNotification({ type, title, message, duration });
    };

    const handleTestAll = () => {
        testAllTypes(title, message, duration);
    };

    const handleTestPersistent = () => {
        testPersistent(title, message);
    };

    const handleTestLong = () => {
        testLongMessage(title, message);
    };

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-3 bg-bg-secondary rounded-lg border border-br-secondary hover:bg-bg-primary transition-colors"
            >
                <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-semibold text-txt-primary">
                        Notification Testing
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {isOpen && (
                <div className="mt-2 p-4 bg-bg-secondary rounded-lg border border-br-secondary">
                    {/* Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-txt-secondary mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Notification title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-txt-secondary mb-1">
                                Duration (ms)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="5000"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-txt-secondary mb-1">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Notification message"
                        />
                    </div>

                    {/* Quick Test Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        <button
                            onClick={() => handleTest("success")}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            Success
                        </button>
                        <button
                            onClick={() => handleTest("error")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                            Error
                        </button>
                        <button
                            onClick={() => handleTest("warning")}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                        >
                            Warning
                        </button>
                        <button
                            onClick={() => handleTest("info")}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            Info
                        </button>
                    </div>

                    {/* Advanced Test Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button
                            onClick={handleTestAll}
                            className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Test All Types
                        </button>
                        <button
                            onClick={handleTestPersistent}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                            Persistent
                        </button>
                        <button
                            onClick={handleTestLong}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                            Long Message
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
