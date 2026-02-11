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
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center border-8 border-black p-12 bg-yellow-400">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-black font-black uppercase tracking-widest text-lg">LOADING ADMIN DASHBOARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-white">
      <div className="border-8 border-black p-12 bg-black text-white mb-12">
        <h1 className="text-6xl font-black uppercase tracking-tight">ADMIN DASHBOARD</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-12 border-8 border-black bg-white">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 px-8 py-6 font-black uppercase text-sm tracking-wider border-r-4 border-black last:border-r-0 transition-colors ${
            activeTab === "stats"
              ? "bg-yellow-400 text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          STATS
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 px-8 py-6 font-black uppercase text-sm tracking-wider border-r-4 border-black last:border-r-0 transition-colors ${
            activeTab === "pending"
              ? "bg-yellow-400 text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          PENDING ({pendingResidents.length})
        </button>
        <button
          onClick={() => setActiveTab("residents")}
          className={`flex-1 px-8 py-6 font-black uppercase text-sm tracking-wider transition-colors ${
            activeTab === "residents"
              ? "bg-yellow-400 text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          ALL RESIDENTS ({allResidents.length})
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border-8 border-black p-8">
            <p className="text-xs font-black uppercase tracking-widest mb-4">TOTAL USERS</p>
            <p className="text-6xl font-black">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-white border-8 border-black p-8">
            <p className="text-xs font-black uppercase tracking-widest mb-4">APPROVED RESIDENTS</p>
            <p className="text-6xl font-black">
              {stats.totalResidents}
            </p>
          </div>
          <div className="bg-white border-8 border-black p-8">
            <p className="text-xs font-black uppercase tracking-widest mb-4">TOTAL BOOKINGS</p>
            <p className="text-6xl font-black">
              {stats.totalBookings}
            </p>
          </div>
          <div className="bg-white border-8 border-black p-8">
            <p className="text-xs font-black uppercase tracking-widest mb-4">PLATFORM REVENUE</p>
            <p className="text-6xl font-black">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Pending Residents Tab */}
      {activeTab === "pending" && (
        <div className="bg-white border-8 border-black p-8">
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-6">
            PENDING RESIDENT APPROVALS
          </h2>

          {pendingResidents.length === 0 ? (
            <div className="text-center py-16 border-4 border-black bg-yellow-400">
              <p className="text-black font-black uppercase tracking-wider text-xl">NO PENDING RESIDENTS</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingResidents.map((resident) => (
                <div
                  key={resident.id}
                  className="flex justify-between items-center p-6 border-4 border-black bg-white hover:bg-yellow-400 transition-colors"
                >
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tight mb-2">{resident.user.name}</h3>
                    <p className="text-sm font-bold uppercase tracking-wide mb-1">{resident.user.email}</p>
                    <p className="text-2xl font-black">
                      ${resident.price}/HOUR
                    </p>
                  </div>
                  <button
                    onClick={() => handleApprove(resident.id)}
                    className="bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    APPROVE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Residents Tab */}
      {activeTab === "residents" && (
        <div className="bg-white border-8 border-black p-8">
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-6">
            ALL RESIDENTS
          </h2>

          {allResidents.length === 0 ? (
            <div className="text-center py-16 border-4 border-black bg-yellow-400">
              <p className="text-black font-black uppercase tracking-wider text-xl">NO RESIDENTS</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                      NAME
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                      EMAIL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                      PRICE
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                      BOOKINGS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {allResidents.map((resident) => (
                    <tr key={resident.id} className="border-b-4 border-black hover:bg-yellow-400 transition-colors">
                      <td className="px-6 py-4 font-black uppercase text-sm tracking-tight border-r-4 border-black">
                        {resident.user.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm border-r-4 border-black">{resident.user.email}</td>
                      <td className="px-6 py-4 font-black text-lg border-r-4 border-black">${resident.price}</td>
                      <td className="px-6 py-4 border-r-4 border-black">
                        <span
                          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-4 border-black inline-block ${
                            resident.approved
                              ? "bg-white text-black"
                              : "bg-yellow-400 text-black"
                          }`}
                        >
                          {resident.approved ? "APPROVED" : "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-2xl border-r-4 border-black">{resident.bookings.length}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleFeature(resident.id, resident.featured)
                          }
                          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-4 border-black transition-colors ${
                            resident.featured
                              ? "bg-yellow-400 text-black hover:bg-white"
                              : "bg-white text-black hover:bg-yellow-400"
                          }`}
                        >
                          {resident.featured ? "★ FEATURED" : "FEATURE"}
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