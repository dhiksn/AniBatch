import type { Metadata } from "next";
import { ScheduleContent } from "./ScheduleContent";

export const metadata: Metadata = {
  title: "Jadwal Rilis — AniBatch",
  description: "Jadwal update anime terbaru setiap hari di AniBatch",
};

export default function SchedulePage() {
  return <ScheduleContent />;
}