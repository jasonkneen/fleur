export function AppScreenshots() {
  return (
    <section>
      <div className="flex overflow-x-auto pb-4 gap-4 -mx-8 px-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-none w-[600px] aspect-[4/3] rounded-xl bg-gray-100" />
        ))}
      </div>
    </section>
  );
} 