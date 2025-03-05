import React from "react";
import { Link } from "react-router-dom"; // optional, if using React Router

export const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                    Sign In
                </h2>
                <form className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label
                            className="block text-gray-600 mb-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            className="block text-gray-600 mb-1"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="inline-flex items-center text-gray-600">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-500"
                            />
                            <span className="ml-2">Remember me</span>
                        </label>
                        <a
                            href="#"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                {/* Extra Links (e.g. Sign Up) */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};
