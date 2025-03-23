import BuildMetrics from "./BuildMetrics";
import Artifacts from "./Artifacts";

export default function RightSideBar() {
  return (
    <div className="flex flex-col gap-4 p-4 w-full flex-1 overflow-y-auto min-h-0">
      <BuildMetrics />
      <Artifacts />
    </div>
  );
}
