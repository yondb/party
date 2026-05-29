export default function AppLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div className="panel-ash h-28" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-3xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
