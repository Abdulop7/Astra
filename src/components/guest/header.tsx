import Link from "next/link";

export default function GuestHeader() {
    return (
        <header className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 z-50 bg-transparent">
            {/* Logo */}
            <Link href={"/"}>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        A
                    </div>
                </div>
            </Link>

            {/* Right Side Buttons */}
            <div className="flex items-center space-x-4">
                <Link href={"/log-in-or-create-account"}>
                    <button
                        //   onClick={onLogin}
                        className="text-white hover:text-purple-300 transition cursor-pointer"
                    >
                        Login
                    </button>
                </Link>
                <Link href={"/log-in-or-create-account"}>
                    <button
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition cursor-pointer"
                    >
                        Sign Up Free
                    </button>
                </Link>

            </div>
        </header>
    );
}
