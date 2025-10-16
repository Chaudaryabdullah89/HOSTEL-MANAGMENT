"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/dashboard/warden", label: "Dashboard" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="w-full bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-indigo-700 font-extrabold text-2xl tracking-tight">Sama Hostel</span>
        </Link>
      </div>
      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              pathname === link.href
                ? "text-indigo-700"
                : "text-gray-700 hover:text-indigo-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {/* Auth Buttons */}
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </nav>
  );
}
