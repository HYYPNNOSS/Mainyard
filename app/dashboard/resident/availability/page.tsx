"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  setAvailability,
  removeAvailability,
  getResidentProfile,
} from "@/server/actions/residentActions";

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await getResidentProfile();
        if (profileData) {
          setProfile(profileData);
          setAvailabilities(profileData.availabilities || []);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      loadProfile();
    }
  }, [session?.user?.id]);

  async function handleSetAvailability(
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) {
    setSaving(true);
    setMessage("");

    try {
      await setAvailability(dayOfWeek, startTime, endTime);

      const existingIndex = availabilities.findIndex(
        (a) => a.dayOfWeek === dayOfWeek
      );
      if (existingIndex >= 0) {
        const updated = [...availabilities];
        updated[existingIndex] = {
          ...updated[existingIndex],
          startTime,
          endTime,
        };
        setAvailabilities(updated);
      } else {
        setAvailabilities([
          ...availabilities,
          { dayOfWeek, startTime, endTime, id: `new-${dayOfWeek}` },
        ]);
      }

      setMessage("Availability updated!");
    } catch (error) {
      console.error("Failed to set availability:", error);
      setMessage("Failed to update availability");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveAvailability(dayOfWeek: number) {
    setSaving(true);
    setMessage("");

    try {
      await removeAvailability(dayOfWeek);
      setAvailabilities((prev) =>
        prev.filter((a) => a.dayOfWeek !== dayOfWeek)
      );
      setMessage("Availability removed!");
    } catch (error) {
      console.error("Failed to remove availability:", error);
      setMessage("Failed to remove availability");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center border-8 border-black p-12 bg-yellow-400">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-black font-black uppercase tracking-widest text-lg">LOADING AVAILABILITY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 bg-white">
      <div className="border-8 border-black p-12 bg-black text-white mb-12">
        <h1 className="text-6xl font-black uppercase tracking-tight">MANAGE AVAILABILITY</h1>
      </div>

      {message && (
        <div
          className={`mb-8 p-6 border-8 border-black ${
            message.includes("updated") || message.includes("removed")
              ? "bg-white text-black"
              : "bg-yellow-400 text-black"
          }`}
        >
          <p className="font-black uppercase tracking-wide">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        {DAYS.map((day, index) => {
          const availability = availabilities.find(
            (a) => a.dayOfWeek === index
          );
          return (
            <AvailabilityRow
              key={index}
              day={day}
              dayOfWeek={index}
              availability={availability}
              onSet={handleSetAvailability}
              onRemove={handleRemoveAvailability}
              disabled={saving}
            />
          );
        })}
      </div>

      <div className="mt-12">
        <button
          onClick={() => router.back()}
          className="bg-white text-black px-8 py-5 font-black uppercase tracking-wider hover:bg-gray-100 transition-colors border-4 border-black"
        >
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
}

interface AvailabilityRowProps {
  day: string;
  dayOfWeek: number;
  availability?: any;
  onSet: (dayOfWeek: number, startTime: string, endTime: string) => void;
  onRemove: (dayOfWeek: number) => void;
  disabled: boolean;
}

function AvailabilityRow({
  day,
  dayOfWeek,
  availability,
  onSet,
  onRemove,
  disabled,
}: AvailabilityRowProps) {
  const [startTime, setStartTime] = useState(availability?.startTime || "09:00");
  const [endTime, setEndTime] = useState(availability?.endTime || "17:00");

  return (
    <div className="bg-white border-8 border-black p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="w-full md:w-32">
        <p className="font-black text-xl uppercase tracking-tight">{day}</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-xs font-black uppercase tracking-widest mb-3">START TIME</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black"
            disabled={disabled}
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-black uppercase tracking-widest mb-3">END TIME</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={() => onSet(dayOfWeek, startTime, endTime)}
          disabled={disabled}
          className="flex-1 md:flex-none bg-black text-white px-8 py-3 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          SAVE
        </button>
        {availability && (
          <button
            onClick={() => onRemove(dayOfWeek)}
            disabled={disabled}
            className="flex-1 md:flex-none bg-white text-black px-8 py-3 font-black uppercase tracking-wider hover:bg-yellow-400 transition-colors border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            REMOVE
          </button>
        )}
      </div>
    </div>
  );
}