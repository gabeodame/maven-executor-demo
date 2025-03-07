import BuildMetrics from "./BuildMetrics";
import Artifacts from "./Artifacts";

export default function RightSideBar() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-[400px] overflow-y-auto overflow-x-hidden items-center min-h-full p-4">
      <BuildMetrics />
      <Artifacts />
    </div>
  );
}
