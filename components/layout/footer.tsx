export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-4">NgeStream</h3>
            <p className="text-gray-400 text-sm">Created by alvnfrs</p>
            <p className="text-gray-400 text-sm mt-2">Your ultimate streaming experience</p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/movies" className="hover:text-white transition-colors">
                  Movies
                </a>
              </li>
              <li>
                <a href="/tv" className="hover:text-white transition-colors">
                  TV Shows
                </a>
              </li>
              <li>
                <a href="/genres" className="hover:text-white transition-colors">
                  Genres
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Account</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/profile" className="hover:text-white transition-colors">
                  Profile
                </a>
              </li>
              <li>
                <a href="/wishlist" className="hover:text-white transition-colors">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="/liked" className="hover:text-white transition-colors">
                  Liked Movies
                </a>
              </li>
              <li>
                <a href="/subscription" className="hover:text-white transition-colors">
                  Subscription
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} NgeStream. All rights reserved. This is a demo project and not a real
            streaming service.
          </p>
          <p className="mt-2">
            Movie data provided by{" "}
            <a
              href="https://www.themoviedb.org/"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Movie Database (TMDB)
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
