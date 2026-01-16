export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Mainyard</h3>
            <p className="text-gray-400">
              Connect with curated professionals in your community.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/residents" className="hover:text-white">
                  Browse Residents
                </a>
              </li>
              <li>
                <a href="/auth/signin" className="hover:text-white">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/auth/signup" className="hover:text-white">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Residents</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/auth/signup" className="hover:text-white">
                  Join as Resident
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-center text-gray-400">
            © 2024 Mainyard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
