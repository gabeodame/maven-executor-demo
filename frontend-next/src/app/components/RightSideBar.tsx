import BuildMetrics from "./BuildMetrics";
import Artifacts from "./Artifacts";

export default function RightSideBar() {
  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto p-4">
      <BuildMetrics />
      <Artifacts />
    </div>
  );
}
