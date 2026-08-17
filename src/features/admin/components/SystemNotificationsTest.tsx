import { useState } from "react";
import { Bell, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

import { Button } from "@/components";
import { useNotificationTest } from "../scripts/testNotifications";

export function SystemNotificationsTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Test System Alert");
  const [message, setMessage] = useState("This is a test system alert message.");
  const [duration, setDuration] = useState(5000);

  const { testNotification, testAllTypes, testPersistent, testLongMessage } =
    useNotificationTest();

  const handleTest = (type: "success" | "error" | "warning" | "info") => {
    testNotification({
      type,
      title,
      message,
      duration,
    });
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
      <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="size-5 text-accent" aria-hidden="true" />

        <span>System Alerts Testing</span>

        {isOpen ? (
          <ChevronUp className="size-5" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-5" aria-hidden="true" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-2 rounded-lg border border-br-secondary bg-section p-4">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-txt-secondary">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-br-secondary bg-page px-3 py-2 text-txt-primary transition-colors"
                placeholder="Alert title"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-txt-secondary">
                Duration (ms)
              </label>

              <input
                type="number"
                value={duration}
                onChange={(event) => {
                  setDuration(Number(event.target.value));
                }}
                className="w-full rounded-lg border border-br-secondary bg-page px-3 py-2 text-txt-primary transition-colors"
                placeholder="5000"
                min="0"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-txt-secondary">
              Message
            </label>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-br-secondary bg-page px-3 py-2 text-txt-primary transition-colors"
              placeholder="Alert message"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <button
              type="button"
              onClick={() => handleTest("success")}
              className="rounded-lg bg-success px-3 py-2 text-sm font-semibold text-txt-inverse transition-colors hover:bg-success-hover"
            >
              Success
            </button>

            <button
              type="button"
              onClick={() => handleTest("error")}
              className="rounded-lg bg-error px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-error-hover"
            >
              Error
            </button>

            <button
              type="button"
              onClick={() => handleTest("warning")}
              className="rounded-lg bg-warning px-3 py-2 text-sm font-semibold text-txt-inverse transition-colors"
            >
              Warning
            </button>

            <Button onClick={() => handleTest("info")} size="sm">
              Info
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Button
              onClick={handleTestAll}
              size="sm"
              leftIcon={<MessageSquare className="size-4" aria-hidden="true" />}
            >
              Test All Types
            </Button>

            <Button variant="secondary" size="sm" onClick={handleTestPersistent}>
              Persistent
            </Button>

            <Button size="sm" onClick={handleTestLong}>
              Long Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
