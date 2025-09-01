import { useState } from "react";
import { ChevronDown, ChevronUp, User, TestTube, Bell } from "lucide-react";
import { UserNotificationService } from "@/features/user/notifications";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const UserNotificationsTest = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [testUserId, setTestUserId] = useState("");
    const [isTestingUser, setIsTestingUser] = useState(false);
    const [notificationType, setNotificationType] = useState<"test" | "purchase" | "sale" | "like" | "message">("test");

    const { currentUser } = useAuth();

    const handleTestUserNotification = async () => {
        if (!testUserId.trim()) {
            alert("Please enter a user ID to test");
            return;
        }

        setIsTestingUser(true);
        try {
            console.log("🧪 Testing user notification system...");
            
            // Test Firebase connection
            const connectionOk = await UserNotificationService.testFirebaseConnection(testUserId);
            console.log("🧪 Firebase connection:", connectionOk ? "✅ OK" : "❌ FAILED");
            
            if (connectionOk) {
                let testId: string;
                
                switch (notificationType) {
                    case "purchase":
                        testId = await UserNotificationService.createPurchaseNotification(
                            testUserId, 
                            "test-model-123", 
                            "Test Model", 
                            29.99
                        );
                        break;
                    case "sale":
                        testId = await UserNotificationService.createSaleNotification(
                            testUserId, 
                            "test-model-123", 
                            "Test Model", 
                            29.99, 
                            "buyer-123"
                        );
                        break;
                    case "like":
                        testId = await UserNotificationService.createLikeNotification(
                            testUserId, 
                            "test-model-123", 
                            "Test Model", 
                            "liker-123", 
                            "Test Liker"
                        );
                        break;
                    case "message":
                        testId = await UserNotificationService.createMessageNotification(
                            testUserId, 
                            "sender-123", 
                            "Test Sender", 
                            "This is a test message preview..."
                        );
                        break;
                    default:
                        testId = await UserNotificationService.createTestNotification(testUserId);
                }
                
                console.log("🧪 Test notification created:", testId);
                alert(`✅ ${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} notification created successfully! ID: ${testId}`);
            } else {
                alert("❌ Firebase connection test failed. Check console for details.");
            }
        } catch (error) {
            console.error("🧪 User notification test failed:", error);
            alert(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsTestingUser(false);
        }
    };

    const handleTestCurrentUser = async () => {
        if (!currentUser?.uid) {
            alert("No current user logged in");
            return;
        }
        setTestUserId(currentUser.uid);
        await handleTestUserNotification();
    };

    const handleTestMultipleUsers = async () => {
        if (!testUserId.trim()) {
            alert("Please enter a user ID to test");
            return;
        }

        setIsTestingUser(true);
        try {
            console.log("🧪 Testing multiple notification types...");
            
            const connectionOk = await UserNotificationService.testFirebaseConnection(testUserId);
            if (!connectionOk) {
                alert("❌ Firebase connection test failed");
                return;
            }

            // Create multiple test notifications
            const notifications = [
                await UserNotificationService.createTestNotification(testUserId),
                await UserNotificationService.createPurchaseNotification(testUserId, "model-1", "Test Model 1", 19.99),
                await UserNotificationService.createLikeNotification(testUserId, "model-2", "Test Model 2", "user-1", "Test User"),
                await UserNotificationService.createMessageNotification(testUserId, "user-2", "Another User", "Hello there!")
            ];

            console.log("🧪 Multiple notifications created:", notifications);
            alert(`✅ Created ${notifications.length} test notifications successfully!`);
        } catch (error) {
            console.error("🧪 Multiple notifications test failed:", error);
            alert(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsTestingUser(false);
        }
    };

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-3 bg-bg-secondary rounded-lg border border-br-secondary hover:bg-bg-primary transition-colors"
            >
                <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-semibold text-txt-primary">
                        User Notifications Testing
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
                    <h4 className="text-lg font-semibold text-txt-primary mb-3 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-primary" />
                        Test User Notifications
                    </h4>
                    
                    {/* Notification Type Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-txt-secondary mb-2">
                            Notification Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {[
                                { value: "test", label: "Test", color: "bg-gray-600" },
                                { value: "purchase", label: "Purchase", color: "bg-green-600" },
                                { value: "sale", label: "Sale", color: "bg-yellow-600" },
                                { value: "like", label: "Like", color: "bg-red-600" },
                                { value: "message", label: "Message", color: "bg-blue-600" }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setNotificationType(type.value as any)}
                                    className={`px-3 py-2 text-white rounded-lg text-sm transition-colors ${
                                        notificationType === type.value 
                                            ? `${type.color} ring-2 ring-offset-2 ring-offset-bg-secondary ring-white` 
                                            : `${type.color}/70 hover:${type.color}`
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* User ID Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-txt-secondary mb-1">
                                User ID to Test
                            </label>
                            <input
                                type="text"
                                value={testUserId}
                                onChange={(e) => setTestUserId(e.target.value)}
                                className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter user ID or leave empty for current user"
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <button
                                onClick={handleTestCurrentUser}
                                disabled={isTestingUser || !currentUser?.uid}
                                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                <TestTube className="w-4 h-4 mr-2" />
                                Test Current User
                            </button>
                        </div>
                    </div>

                    {/* Test Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button
                            onClick={handleTestUserNotification}
                            disabled={isTestingUser || !testUserId.trim()}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            <TestTube className="w-4 h-4 mr-2" />
                            {isTestingUser ? "Testing..." : `Test ${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)}`}
                        </button>
                        
                        <button
                            onClick={handleTestMultipleUsers}
                            disabled={isTestingUser || !testUserId.trim()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            <TestTube className="w-4 h-4 mr-2" />
                            Test Multiple Types
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-4 p-3 bg-bg-primary/20 rounded-lg border border-br-secondary">
                        <p className="text-sm text-txt-secondary">
                            <strong>Note:</strong> This will create real notifications in the database. 
                            Use for testing purposes only.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
