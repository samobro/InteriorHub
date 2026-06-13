export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your platform preferences and configurations.</p>
      </div>

      <div className="max-w-2xl">
        <div className="border rounded-xl p-8 bg-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <span className="text-xl">⚙️</span>
          </div>
          <h3 className="text-lg font-medium">Settings coming soon</h3>
          <p className="text-sm text-muted-foreground">
            The settings module is currently under development. You will be able to manage admin accounts, platform emails, and notification preferences here.
          </p>
        </div>
      </div>
    </div>
  );
}