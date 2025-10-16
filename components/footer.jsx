export function Footer() {
    return (
      <footer className="w-full z-10 border-t bg-white py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          {/* Brand and Description */}
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-xl font-bold text-primary mb-2">Sama Hostel</h2>
            <p className="text-gray-500 text-sm mb-4">
              Modern hostel management made simple. Streamline bookings, guests, and maintenance with ease.
            </p>
            <div className="flex gap-3 mt-2">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.646.59-2.542.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 16.11 4c-2.48 0-4.49 2.01-4.49 4.49 0 .352.04.695.116 1.022C7.728 9.36 4.1 7.6 1.67 4.98a4.48 4.48 0 0 0-.61 2.26c0 1.56.795 2.94 2.01 3.75a4.48 4.48 0 0 1-2.034-.563v.057c0 2.18 1.55 4 3.61 4.42-.378.104-.776.16-1.187.16-.29 0-.57-.028-.845-.08.57 1.78 2.23 3.08 4.2 3.12A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583A9.1 9.1 0 0 0 24 4.59a8.98 8.98 0 0 1-2.54.697z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.131 4.672.414 3.678 1.408c-.994.994-1.277 2.092-1.336 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.282.342 2.38 1.336 3.374.994.994 2.092 1.277 3.374 1.336C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.059 2.38-.342 3.374-1.336.994-.994 1.277-2.092 1.336-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.282-.342-2.38-1.336-3.374C19.328.414 18.23.131 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
            </div>
          </div>
          {/* Navigation Links */}
          <div className="flex-1 min-w-[150px]">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-500 hover:text-indigo-600 transition-colors">Home</a>
              </li>
              <li>
                <a href="/about" className="text-gray-500 hover:text-indigo-600 transition-colors">About Us</a>
              </li>
              <li>
                <a href="/contact" className="text-gray-500 hover:text-indigo-600 transition-colors">Contact</a>
              </li>
              <li>
                <a href="/faq" className="text-gray-500 hover:text-indigo-600 transition-colors">FAQ</a>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Contact</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>
                <span className="font-medium text-gray-700">Email:</span> info@samahostel.com
              </li>
              <li>
                <span className="font-medium text-gray-700">Phone:</span> +1 (555) 123-4567
              </li>
              <li>
                <span className="font-medium text-gray-700">Address:</span> 123 Hostel Lane, City, Country
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Sama Hostel. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a
              href="#"
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    );
  }
  
  