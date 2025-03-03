import Executor from "./components/Executor";

export default async function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center ">
      <Executor />
    </div>
  );
}
