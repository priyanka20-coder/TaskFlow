import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMe, updateProfile } from "../api/authApi";
import toast from "react-hot-toast";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMe();

        setProfile({
          name: res.data.name,
          email: res.data.email,
          password: "",
        });
      } catch (err) {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const body = {
        name: profile.name,
        email: profile.email,
      };

      if (profile.password.trim() !== "") {
        body.password = profile.password;
      }

      const res = await updateProfile(body);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("user")),
          name: res.data.name,
          email: res.data.email,
          token: res.data.token,
        })
      );

      setProfile({
        name: res.data.name,
        email: res.data.email,
        password: "",
      });

      toast.success("Profile Updated Successfully");
    } catch (err) {
      console.log(err.response?.data);
      toast.error(err.response?.data?.message || "Update Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-display font-semibold mb-6">
          Profile
        </h1>

        <div className="card p-6">

          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    {profile.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {profile.email}
                  </p>
                </div>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div>
                  <label className="label">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">
                    New Password (Optional)
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={profile.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </form>
            </>
          )}

        </div>
      </main>
    </div>
  );
}