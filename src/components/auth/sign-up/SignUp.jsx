import React from "react";
import { Link } from "react-router-dom"; // optional, if using React Router

export const SignUp = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                    Sign Up
                </h2>
                <form className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label
                            className="block text-gray-600 mb-1"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="John Doe"
                        />
                    </div>

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

                    {/* Confirm Password Input */}
                    <div>
                        <label
                            className="block text-gray-600 mb-1"
                            htmlFor="confirmPass"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPass"
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Re-enter your password"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Sign Up
                    </button>
                </form>

                {/* Extra Links (e.g. Sign In) */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
