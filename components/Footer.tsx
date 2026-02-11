export default function Footer() {
  return (
    <footer className="bg-black text-white mt-0 border-t-8 border-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">MAINYARD</h3>
            <p className="text-white font-bold uppercase text-sm leading-relaxed tracking-wide">
              CONNECT WITH CURATED PROFESSIONALS IN YOUR COMMUNITY.
            </p>
          </div>

          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-sm border-b-4 border-yellow-400 pb-3 inline-block">
              PLATFORM
            </h4>
            <ul className="space-y-3 text-white">
              <li>
                <a 
                  href="/residents" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → BROWSE RESIDENTS
                </a>
              </li>
              <li>
                <a 
                  href="/auth/signin" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → SIGN IN
                </a>
              </li>
              <li>
                <a 
                  href="/auth/signup" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → SIGN UP
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-sm border-b-4 border-yellow-400 pb-3 inline-block">
              FOR RESIDENTS
            </h4>
            <ul className="space-y-3 text-white">
              <li>
                <a 
                  href="/auth/signup" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → JOIN AS RESIDENT
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → HOW IT WORKS
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → PRICING
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-sm border-b-4 border-yellow-400 pb-3 inline-block">
              LEGAL
            </h4>
            <ul className="space-y-3 text-white">
              <li>
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → PRIVACY POLICY
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → TERMS OF SERVICE
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition font-bold uppercase text-sm tracking-wider inline-block hover:translate-x-1 transform"
                >
                  → CONTACT
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-4 border-white mt-12 pt-8">
          <p className="text-center text-white font-black uppercase tracking-widest text-sm">
            © 2026 OPENYARD /// ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}