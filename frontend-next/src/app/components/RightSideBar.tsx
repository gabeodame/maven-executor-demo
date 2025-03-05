import BuildMetrics from "./BuildMetrics";
import Artifacts from "./Artifacts";

export default function RightSideBar() {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
      <BuildMetrics />
      <Artifacts />
    </div>
  );
}
