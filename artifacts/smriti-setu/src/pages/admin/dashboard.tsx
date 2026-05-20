import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const API = "/api/admin";

function getToken() {
  return localStorage.getItem("smriti_admin_token") || "";
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

type Stats = {
  totalUsers: number;
  totalAncestors: number;
  totalMessages: number;
  totalNotifications: number;
  languageStats: { language: string; count: number }[];
};

type User = { id: number; name: string; email: string; language: string; createdAt: string };
type Ancestor = { id: number; userId: number; fullName: string; relationship: string; gender: string; dateOfDeath: string; familySide: string; gotram: string; createdAt: string };

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"stats" | "users" | "ancestors" | "messages">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ancestors, setAncestors] = useState<Ancestor[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) { setLocation("/admin"); return; }
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const res = await fetch(`${API}/stats`, { headers: authHeaders() });
    if (res.status === 403) { setLocation("/admin"); return; }
    setStats(await res.json());
    setLoading(false);
  }

  async function loadUsers() {
    setLoading(true);
    const res = await fetch(`${API}/users`, { headers: authHeaders() });
    setUsers(await res.json());
    setLoading(false);
  }

  async function loadAncestors() {
    setLoading(true);
    const res = await fetch(`${API}/ancestors`, { headers: authHeaders() });
    setAncestors(await res.json());
    setLoading(false);
  }

  async function loadMessages() {
    setLoading(true);
    const res = await fetch(`${API}/messages`, { headers: authHeaders() });
    setMessages(await res.json());
    setLoading(false);
  }

  function handleTab(t: typeof tab) {
    setTab(t);
    if (t === "users") loadUsers();
    else if (t === "ancestors") loadAncestors();
    else if (t === "messages") loadMessages();
    else loadStats();
  }

  function logout() {
    localStorage.removeItem("smriti_admin_token");
    setLocation("/admin");
  }

  const langEmoji: Record<string, string> = { te: "🇮🇳 Telugu", en: "🌐 English", hi: "🕉️ Hindi" };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-amber-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪔</span>
          <div>
            <h1 className="font-bold text-lg">SmritiSetu Admin</h1>
            <p className="text-amber-200 text-xs">స్మృతి సేతు అడ్మిన్ పానెల్</p>
          </div>
        </div>
        <button onClick={logout} className="bg-amber-700 hover:bg-amber-600 px-4 py-1.5 rounded-lg text-sm">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4">
        {(["stats", "users", "ancestors", "messages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-amber-600 text-white" : "bg-white text-amber-700 hover:bg-amber-100"
            }`}
          >
            {t === "stats" ? "📊 Overview" : t === "users" ? "👥 Users" : t === "ancestors" ? "🧬 Ancestors" : "💬 Messages"}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading && <div className="text-center py-10 text-amber-600">Loading...</div>}

        {/* Stats Tab */}
        {tab === "stats" && stats && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "👥" },
                { label: "Total Ancestors", value: stats.totalAncestors, icon: "🧬" },
                { label: "AI Messages", value: stats.totalMessages, icon: "💬" },
                { label: "Notifications", value: stats.totalNotifications, icon: "🔔" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-amber-800">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
              <h2 className="font-semibold text-amber-800 mb-4">🌐 Language Distribution</h2>
              <div className="flex gap-4 flex-wrap">
                {stats.languageStats.map((l) => (
                  <div key={l.language} className="bg-amber-50 rounded-lg px-4 py-3 text-center min-w-[100px]">
                    <div className="font-bold text-xl text-amber-700">{l.count}</div>
                    <div className="text-sm text-gray-600">{langEmoji[l.language] || l.language}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100">
              <h2 className="font-semibold text-amber-800">👥 Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50">
                  <tr>
                    {["ID", "Name", "Email", "Language", "Joined"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-amber-700 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                      <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
                          {langEmoji[u.language] || u.language}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ancestors Tab */}
        {tab === "ancestors" && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100">
              <h2 className="font-semibold text-amber-800">🧬 Ancestors ({ancestors.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50">
                  <tr>
                    {["ID", "Name", "Relationship", "Gender", "Family Side", "Gotram", "Added"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-amber-700 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ancestors.map((a, i) => (
                    <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                      <td className="px-4 py-3 text-gray-500">#{a.id}</td>
                      <td className="px-4 py-3 font-medium">{a.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{a.relationship}</td>
                      <td className="px-4 py-3 text-gray-600">{a.gender}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${a.familySide === "Maternal" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>
                          {a.familySide}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.gotram || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && !loading && (
          <div className="space-y-3">
            <h2 className="font-semibold text-amber-800">💬 Recent AI Messages ({messages.length})</h2>
            {messages.map((m) => (
              <div key={m.id} className={`bg-white rounded-xl p-4 border shadow-sm ${m.role === "assistant" ? "border-amber-200" : "border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.role === "assistant" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                    {m.role === "assistant" ? "🤖 AI" : "👤 User"}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
