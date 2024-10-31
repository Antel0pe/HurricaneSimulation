import { StormMapComponent } from "@/components/storm-map";
import Image from "next/image";
import ProjCRSMap from "@/components/testProjCrs";

export default function Home() {
  return (
      <div>
          <ProjCRSMap />
    </div>
  );
}
