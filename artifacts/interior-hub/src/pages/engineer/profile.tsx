import { useState, useEffect, useRef } from "react";
import { Save, Mail, Shield, Clock, CheckCircle2, XCircle, Camera, Upload } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { mockMyProfile } from "@/data/mock";
import type { EngineerProfile } from "@/types";

// ─── Data source (replace with real API calls) ───────────────────────────────
function useMyProfile() {
  const [data, setData] = useState<EngineerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setData(mockMyProfile); setIsLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);
  return { data, setData, isLoading };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function EngineerProfilePage() {
  const { data: profile, setData: setProfile, isLoading } = useMyProfile();
  const { toast } = useToast();

  // Editable form state
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Local photo state — file picked but not yet uploaded
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Initialise form once profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setCity(profile.city);
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setProfileImageUrl(profile.profileImageUrl ?? "");
    }
  }, [profile]);

  // Photo file picker handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload to Cloudinary and save returned URL
    const objectUrl = URL.createObjectURL(file);
    setLocalPhotoPreview(objectUrl);
  };

  // The URL to actually display in the avatar (local preview wins over saved URL)
  const displayedPhoto = localPhotoPreview ?? (profileImageUrl || null);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Save handler — wire to PATCH /api/engineer/profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700)); // TODO: replace with API call
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            fullName,
            city,
            phone: phone || null,
            bio: bio || null,
            profileImageUrl: (localPhotoPreview ?? profileImageUrl) || null,
          }
        : prev,
    );
    setSaving(false);
    toast({ title: "Profile updated successfully" });
  };

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <p className="text-muted-foreground">Failed to load profile.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage how your profile appears to clients on InteriorHub.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Editable fields — left 2/3 ─────────────────────────────────── */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Public Profile</CardTitle>
              <CardDescription>Visible to clients browsing the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* ── Profile photo ── */}
              <div className="flex items-center gap-5">
                {/* Avatar circle */}
                <div className="relative shrink-0">
                  <div className="h-20 w-20 rounded-full border-2 border-border overflow-hidden bg-primary/10 flex items-center justify-center">
                    {displayedPhoto ? (
                      <img
                        src={displayedPhoto}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-primary font-bold text-xl">{initials}</span>
                    )}
                  </div>
                  {/* Small camera badge */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-card hover:bg-primary/90 transition-colors"
                    title="Change photo"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>

                {/* Text + button */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">{fullName || "Your name"}</p>
                  <p className="text-xs text-muted-foreground">
                    {localPhotoPreview
                      ? "New photo selected — save to confirm"
                      : "JPG, PNG or WebP · max 5 MB"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs mt-1"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-3 w-3" />
                    Change Photo
                  </Button>
                  {/* Hidden file input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>

              <Separator />

              {/* ── Text fields ── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Sana'a"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+967 77 000 0000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your design style, specialties, and experience..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{bio.length}/600 characters</p>
              </div>

              {/* Fallback URL input */}
              <div className="space-y-1.5">
                <Label htmlFor="profileImageUrl" className="text-muted-foreground text-xs">
                  Or paste profile image URL directly
                </Label>
                <Input
                  id="profileImageUrl"
                  value={profileImageUrl}
                  onChange={(e) => {
                    setProfileImageUrl(e.target.value);
                    setLocalPhotoPreview(null); // clear local pick if URL is typed
                  }}
                  placeholder="https://..."
                  type="url"
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* ── Read-only account info — right 1/3 ─────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
              <CardDescription>Managed by InteriorHub. Read-only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Email
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              </div>

              <Separator />

              {/* Account status */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Account Status
                </p>
                <AccountStatusBadge status={profile.status} />
              </div>

              <Separator />

              {/* Trial status */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Trial Period
                </p>
                {profile.trialEndsAt ? (
                  <TrialStatus trialEndsAt={profile.trialEndsAt} />
                ) : (
                  <p className="text-sm text-muted-foreground">No trial period set</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed bg-muted/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To change your email address or resolve account issues, please contact{" "}
                  <span className="font-medium text-foreground">support@interiorhub.ye</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccountStatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Approved</span>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-amber-700">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Pending Review</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-sm text-red-700">
      <XCircle className="h-4 w-4" />
      <span className="font-medium">Disabled</span>
    </div>
  );
}

function TrialStatus({ trialEndsAt }: { trialEndsAt: string }) {
  const end = new Date(trialEndsAt);
  const now = new Date();
  const isExpired = end < now;
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-1">
      <Badge
        className={
          isExpired
            ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
            : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
        }
      >
        {isExpired ? "Expired" : "Active"}
      </Badge>
      <p className="text-xs text-muted-foreground">
        {isExpired
          ? `Expired on ${format(end, "MMM d, yyyy")}`
          : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining · ends ${format(end, "MMM d, yyyy")}`}
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-5">
                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-9 w-full" /></div>
              </div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-8" /><Skeleton className="h-32 w-full" /></div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
