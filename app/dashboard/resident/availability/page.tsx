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
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
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

      // Update local state
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
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Manage Availability</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("updated") || message.includes("removed")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
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

      <div className="mt-8">
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Back to Dashboard
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
    <div className="card flex items-center gap-4">
      <div className="w-24">
        <p className="font-semibold">{day}</p>
      </div>

      <div className="flex-1 flex gap-4 items-center">
        <div>
          <label className="text-sm text-gray-600">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSet(dayOfWeek, startTime, endTime)}
          disabled={disabled}
          className="btn-primary"
        >
          Save
        </button>
        {availability && (
          <button
            onClick={() => onRemove(dayOfWeek)}
            disabled={disabled}
            className="btn-danger"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
