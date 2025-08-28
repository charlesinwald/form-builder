import { Loader } from "./loader-9";

export default function LoaderDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="p-8 border rounded-lg">
        <h3 className="mb-4 text-lg font-semibold">Loader Component:</h3>
        <Loader />
      </div>
    </div>
  );
}