"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getPendingResidents,
  getAllResidents,
  getAdminStats,
  approveResident,
  featureResident,
} from "@/server/actions/adminActions";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingResidents, setPendingResidents] = useState<any[]>([]);
  const [allResidents, setAllResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, pendingData, allData] = await Promise.all([
          getAdminStats(),
          getPendingResidents(),
          getAllResidents(),
        ]);
        setStats(statsData);
        setPendingResidents(pendingData);
        setAllResidents(allData);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === "ADMIN") {
      loadData();
    }
  }, [session?.user?.role]);

  async function handleApprove(residentId: string) {
    try {
      await approveResident(residentId);
      setPendingResidents((prev) =>
        prev.filter((r) => r.id !== residentId)
      );
      setAllResidents((prev) =>
        prev.map((r) =>
          r.id === residentId ? { ...r, approved: true } : r
        )
      );
    } catch (error) {
      console.error("Failed to approve resident:", error);
    }
  }

  async function handleFeature(residentId: string, featured: boolean) {
    try {
      await featureResident(residentId, !featured);
      setAllResidents((prev) =>
        prev.map((r) =>
          r.id === residentId ? { ...r, featured: !featured } : r
        )
      );
    } catch (error) {
      console.error("Failed to feature resident:", error);
    }
  }

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-medium ${
            activeTab === "stats"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium ${
            activeTab === "pending"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Pending Residents ({pendingResidents.length})
        </button>
        <button
          onClick={() => setActiveTab("residents")}
          className={`px-4 py-2 font-medium ${
            activeTab === "residents"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          All Residents ({allResidents.length})
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-gray-600 mb-2">Total Users</p>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalUsers}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 mb-2">Approved Residents</p>
            <p className="text-4xl font-bold text-green-600">
              {stats.totalResidents}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 mb-2">Total Bookings</p>
            <p className="text-4xl font-bold text-purple-600">
              {stats.totalBookings}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 mb-2">Platform Revenue</p>
            <p className="text-4xl font-bold text-yellow-600">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Pending Residents Tab */}
      {activeTab === "pending" && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Pending Resident Approvals</h2>

          {pendingResidents.length === 0 ? (
            <p className="text-gray-600">No pending residents</p>
          ) : (
            <div className="space-y-4">
              {pendingResidents.map((resident) => (
                <div
                  key={resident.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-bold">{resident.user.name}</h3>
                    <p className="text-sm text-gray-600">{resident.user.email}</p>
                    <p className="text-sm text-gray-600">
                      ${resident.price}/hour
                    </p>
                  </div>
                  <button
                    onClick={() => handleApprove(resident.id)}
                    className="btn-primary"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Residents Tab */}
      {activeTab === "residents" && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">All Residents</h2>

          {allResidents.length === 0 ? (
            <p className="text-gray-600">No residents</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allResidents.map((resident) => (
                    <tr key={resident.id} className="border-t border-gray-200">
                      <td className="px-6 py-4 font-semibold">
                        {resident.user.name}
                      </td>
                      <td className="px-6 py-4">{resident.user.email}</td>
                      <td className="px-6 py-4">${resident.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            resident.approved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {resident.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{resident.bookings.length}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleFeature(resident.id, resident.featured)
                          }
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            resident.featured
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {resident.featured ? "Featured" : "Feature"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
