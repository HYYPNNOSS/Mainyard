import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Your booking has been successfully created and payment processed. You
          should receive a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard/resident" className="btn-primary block">
            View My Bookings
          </Link>
          <Link href="/residents" className="btn-secondary block">
            Browse More Residents
          </Link>
        </div>
      </div>
    </div>
  );
}
