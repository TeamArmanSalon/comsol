/* ComSol — Community Solution
   Cubero, Marc Lean
   Heruela, Dave
   Arellano, Ericka
   Dela cruz, Tricia
   Tenorio, Nadine
   Salamante, Chris Jordan
   Salvoro, Miguel
*/


/* ------------------------------------------------------------------
   Safe storage wrapper
   Some browsers (Safari Private Mode, embedded webviews, or pages opened
   directly with file://) throw on localStorage access or when the 5 MB
   quota is exceeded. Store never throws: it falls back to an in-memory
   map so the prototype keeps working on ANY host or browser.
   ------------------------------------------------------------------ */
const Store = (() => {
  const memory = {};
  let ok = true;
  try {
    const k = "__comsol_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
  } catch {
    ok = false;
  }
  return {
    available: ok,
    get(key) {
      try {
        return ok ? window.localStorage.getItem(key) : (memory[key] ?? null);
      } catch {
        return memory[key] ?? null;
      }
    },
    /** @returns {boolean} false when the write failed (e.g. quota exceeded) */
    set(key, value) {
      memory[key] = value;
      if (!ok) return true;
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      delete memory[key];
      try {
        if (ok) window.localStorage.removeItem(key);
      } catch {}
    },
  };
})();


const ComSol = {
  KEY_USER: "comsol.user",
  KEY_REPORTS: "comsol.reports",
  KEY_FEEDBACK: "comsol.feedback",

  getUser() {
    try {
      return JSON.parse(Store.get(this.KEY_USER));
    } catch {
      return null;
    }
  },
  setUser(u) {
    Store.set(this.KEY_USER, JSON.stringify(u));
  },
  clearUser() {
    Store.remove(this.KEY_USER);
  },

  /**
   * Guards resident pages. Throws a halt marker after redirecting so the
   * rest of the page script does not keep running (and crashing) on a
   * missing session while the browser navigates away.
   */
  requireAuth() {
    if (!this.getUser()) {
      window.location.replace("login.html");
      throw new Error("ComSol: redirecting to login");
    }
  },

  // ------------- Reports -------------
  seedIfEmpty() {
    if (Store.get(this.KEY_REPORTS)) return;
    const now = Date.now();
    const day = 86400000;
    const mkHistory = (baseTs, statuses) =>
      statuses.map((s, i) => ({
        status: s.status,
        note: s.note,
        ts: baseTs + i * (day / 2),
      }));

    const seed = [
      {
        id: 1,
        ref: "CS-2026-0001",
        category: "Illegal Garbage",
        title: "Trash pile near market",
        description:
          "A large pile of garbage keeps accumulating near the corner of the wet market. It has not been collected in 5 days.",
        status: "resolved",
        date: now - 6 * day,
        image: null,
        location: "Barangay San Isidro, Manila",
        history: mkHistory(now - 6 * day, [
          { status: "pending", note: "Report submitted by resident." },
          {
            status: "review",
            note: "Assigned to Sanitation Office for verification.",
          },
          { status: "progress", note: "Cleanup crew dispatched to site." },
          { status: "resolved", note: "Area cleared and sanitized." },
        ]),
      },
      {
        id: 2,
        ref: "CS-2026-0002",
        category: "Damaged Road",
        title: "Big pothole on Main St.",
        description:
          "Deep pothole causing traffic slowdown and damaging vehicles that pass through.",
        status: "progress",
        date: now - 3 * day,
        image: null,
        location: "Main St. corner Rizal Ave.",
        history: mkHistory(now - 3 * day, [
          { status: "pending", note: "Report submitted by resident." },
          { status: "review", note: "Verified by Public Works inspector." },
          { status: "progress", note: "Road repair scheduled this week." },
        ]),
      },
      {
        id: 3,
        ref: "CS-2026-0003",
        category: "Broken Street Light",
        title: "Dark alley near school",
        description:
          "Street light out for over a week — the area becomes unsafe at night for students and residents.",
        status: "review",
        date: now - 2 * day,
        image: null,
        location: "San Roque Alley",
        history: mkHistory(now - 2 * day, [
          { status: "pending", note: "Report submitted by resident." },
          { status: "review", note: "Forwarded to Electrical Maintenance." },
        ]),
      },
      {
        id: 4,
        ref: "CS-2026-0004",
        category: "Flood",
        title: "Water blocking road",
        description:
          "Heavy rains flooded the intersection. Water is still stagnant even a day after.",
        status: "pending",
        date: now - 1 * day,
        image: null,
        location: "P. Burgos & M. H. del Pilar",
        history: mkHistory(now - 1 * day, [
          {
            status: "pending",
            note: "Report submitted by resident. Awaiting review.",
          },
        ]),
      },
      {
        id: 5,
        ref: "CS-2026-0005",
        category: "Fallen Tree",
        title: "Tree fell on sidewalk",
        description:
          "Storm damage — a large mango tree blocks the pedestrian path completely.",
        status: "resolved",
        date: now - 8 * day,
        image: null,
        location: "Mabini St.",
        history: mkHistory(now - 8 * day, [
          { status: "pending", note: "Report submitted by resident." },
          { status: "review", note: "Verified by Barangay Response Team." },
          { status: "progress", note: "Tree removal in progress." },
          { status: "resolved", note: "Sidewalk cleared and made safe." },
        ]),
      },
    ];
    Store.set(this.KEY_REPORTS, JSON.stringify(seed));
  },

  getReports() {
    this.seedIfEmpty();
    try {
      return JSON.parse(Store.get(this.KEY_REPORTS)) || [];
    } catch {
      return [];
    }
  },

  makeRefNumber() {
    const year = new Date().getFullYear();
    const list = this.getReports();
    const next = String(list.length + 1).padStart(4, "0");
    return `CS-${year}-${next}`;
  },

  /**
   * True when the report belongs to the signed-in resident.
   * Matches on account id / email first (survives a profile rename) and
   * falls back to the display name for reports saved before linking existed.
   */
  isMyReport(r, user) {
    const u = user || this.getUser() || {};
    if (!r) return false;
    if (u.id && r.userId) return String(r.userId) === String(u.id);
    const email = (u.email || "").toLowerCase();
    const re = (r.userEmail || "").toLowerCase();
    if (email && re) return re === email;
    const phone = this.normalizePhone(u.phone || "");
    const rp = this.normalizePhone(r.userPhone || "");
    if (phone && rp) return rp === phone;
    if (r.by && u.name) return r.by === u.name;
    return false;
  },

  /** Reports filed by the signed-in resident. */
  getMyReports() {
    const u = this.getUser() || {};
    return this.getReports().filter((r) => this.isMyReport(r, u));
  },

  addReport(r) {
    const list = this.getReports();
    const now = Date.now();
    const u = this.getUser() || {};
    r.id = now;
    r.date = now;
    r.status = "pending";
    r.ref = this.makeRefNumber();
    // Link the report to the signed-in resident so "My activity" and the
    // administrator's resident list can count reports per account.
    r.by = u.name || "Resident";
    r.userEmail = (u.email || "").toLowerCase();
    r.userPhone = u.phone || "";
    r.userId = u.id || null;
    r.history = [
      {
        status: "pending",
        note: "Report submitted by resident. Awaiting review.",
        ts: now,
      },
    ];
    list.unshift(r);
    // Photos are stored as data URLs. If the browser storage quota is hit,
    // drop the photo rather than losing the whole report.
    if (!Store.set(this.KEY_REPORTS, JSON.stringify(list))) {
      r.image = null;
      Store.set(this.KEY_REPORTS, JSON.stringify(list));
      this.toast("Photo was too large to save — report saved without it.");
    }
    return r;
  },

  // ------------- Feedback -------------
  getFeedback() {
    try {
      return JSON.parse(Store.get(this.KEY_FEEDBACK)) || [];
    } catch {
      return [];
    }
  },
  /** Only the feedback submitted by the currently signed-in resident. */
  getMyFeedback() {
    const u = this.getUser() || {};
    const email = (u.email || "").toLowerCase();
    const phone = this.normalizePhone(u.phone || "");
    return this.getFeedback().filter((f) => {
      const fe = (f.userEmail || "").toLowerCase();
      const fp = this.normalizePhone(f.userPhone || "");
      if (fe && email) return fe === email;
      if (fp && phone) return fp === phone;
      // Legacy entries saved before feedback was linked to an account.
      return !fe && !fp;
    });
  },
  addFeedback(f) {
    const list = this.getFeedback();
    const u = this.getUser() || {};
    f.id = Date.now();
    f.date = Date.now();
    f.state = f.state || "open";
    // Link the feedback to the signed-in resident so it shows up in their
    // history and the administrator knows who sent it.
    f.userName = u.name || "Resident";
    f.userEmail = u.email || "";
    f.userPhone = u.phone || "";
    list.unshift(f);
    Store.set(this.KEY_FEEDBACK, JSON.stringify(list));
    return f;
  },


  // ------------- Utilities -------------
  formatDate(ts) {
    const d = new Date(ts);
    const diff = (Date.now() - ts) / 86400000;
    if (diff < 1) return "Today";
    if (diff < 2) return "Yesterday";
    if (diff < 7) return Math.floor(diff) + " days ago";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  formatFullDate(ts) {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  },

  statusLabel(s) {
    return (
      {
        pending: "Pending",
        review: "Under Review",
        progress: "In Progress",
        resolved: "Resolved",
        rejected: "Rejected",
      }[s] || s
    );
  },

  initials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  },

  categoryIconKey(name) {
    const c = CATEGORIES.find((x) => x.name === name);
    return c ? c.icon : "more";
  },

  categoryIcon(key, size = 22) {
    const svgs = {
      delete:
        '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
      car: '<path d="M5 17h14M6 13l1.5-5A2 2 0 0 1 9.4 6.5h5.2a2 2 0 0 1 1.9 1.5L18 13M4 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2m10 0v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M4 13h16"/>',
      fire: '<path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .3-2 .8-3-1 1-1.8 3-1.8 5a6 6 0 0 0 12 0c0-5-4-8-7-10z"/>',
      water: '<path d="M12 3s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/>',
      road: '<path d="M4 22 8 2h8l4 20M12 6v2M12 12v2M12 18v2"/>',
      bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 2 2 2 4h4c0-2 1-3 2-4a7 7 0 0 0-4-12z"/>',
      tree: '<path d="M12 2 6 10h3l-4 6h5v6h4v-6h5l-4-6h3z"/>',
      more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    };
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgs[key] || svgs.more}</svg>`;
  },

  toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  },

  /**
   * Downscales/compresses a picked image entirely in the browser (canvas),
   * so uploads stay small enough for browser storage and pages load fast.
   * No server or paid image service is required.
   * @returns {Promise<string|null>} a JPEG data URL
   */
  compressImage(file, maxSize = 1000, quality = 0.72) {
    return new Promise((resolve) => {
      if (!file || !file.type || !file.type.startsWith("image/"))
        return resolve(null);
      const reader = new FileReader();
      reader.onerror = () => resolve(null);
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => resolve(String(ev.target.result));
        img.onload = () => {
          try {
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } catch {
            resolve(String(ev.target.result));
          }
        };
        img.src = String(ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  },

  logout() {
    this.clearUser();
    window.location.href = "index.html";
  },
};

const CATEGORIES = [
  { id: "garbage", name: "Illegal Garbage", icon: "delete" },
  { id: "parking", name: "Illegal Parking", icon: "car" },
  { id: "fire", name: "Fire Incident", icon: "fire" },
  { id: "flood", name: "Flood", icon: "water" },
  { id: "road", name: "Damaged Road", icon: "road" },
  { id: "light", name: "Broken Street Light", icon: "bulb" },
  { id: "tree", name: "Fallen Tree", icon: "tree" },
  { id: "other", name: "Other Concern", icon: "more" },
];

/* -------- Static (placeholder) content: Announcements, Projects, Events, Officials, Emergency -------- */
const ANNOUNCEMENTS = [
  {
    id: 1,
    tag: "Advisory",
    title: "Water interruption on Aug 12",
    body: "Scheduled maintenance from 8:00 AM to 4:00 PM will temporarily suspend water service in Zones 1–3. Please prepare adequate storage.",
    date: Date.now() - 1 * 86400000,
  },
  {
    id: 2,
    tag: "Notice",
    title: "Barangay clean-up drive this Saturday",
    body: "Join fellow residents in a community-wide clean-up starting at 6:00 AM at the covered court. Bring gloves and refreshments.",
    date: Date.now() - 2 * 86400000,
  },
  {
    id: 3,
    tag: "Announcement",
    title: "New online reporting hours",
    body: "Reports submitted after 8:00 PM will now be processed the following business day for faster resolution.",
    date: Date.now() - 4 * 86400000,
  },
  {
    id: 4,
    tag: "Advisory",
    title: "Typhoon preparedness reminders",
    body: "Residents in low-lying areas are advised to prepare emergency kits, secure important documents, and monitor official updates.",
    date: Date.now() - 6 * 86400000,
  },
];

const PROJECTS = [
  {
    id: 1,
    title: "Main Street Road Rehabilitation",
    status: "ongoing",
    progress: 65,
    location: "Main St. cor. Rizal Ave.",
    body: "Full re-asphalting and drainage improvement of the main road to reduce flooding and vehicle damage.",
    started: Date.now() - 40 * 86400000,
  },
  {
    id: 2,
    title: "Solar Street Lights Installation",
    status: "ongoing",
    progress: 30,
    location: "Zones 4 & 5",
    body: "Installation of 45 solar-powered street lights to improve nighttime safety in dark alleys.",
    started: Date.now() - 20 * 86400000,
  },
  {
    id: 3,
    title: "Public Market Renovation",
    status: "completed",
    progress: 100,
    location: "Barangay Public Market",
    body: "Roofing repair, drainage upgrade, and new stall partitions to improve hygiene and vendor conditions.",
    started: Date.now() - 180 * 86400000,
  },
  {
    id: 4,
    title: "Riverbank Reforestation",
    status: "completed",
    progress: 100,
    location: "Ilog Pasig segment",
    body: "Community planting of native trees along the riverbank to reduce erosion and improve air quality.",
    started: Date.now() - 220 * 86400000,
  },
];

const EVENTS = [
  {
    id: 1,
    title: "Barangay Assembly Meeting",
    date: Date.now() + 3 * 86400000,
    time: "6:00 PM",
    location: "Covered Court",
    body: "Open assembly to discuss upcoming projects, community concerns, and the 2026 budget proposal. All residents welcome.",
  },
  {
    id: 2,
    title: "Free Medical Mission",
    date: Date.now() + 8 * 86400000,
    time: "8:00 AM",
    location: "Health Center",
    body: "Free consultation, medicines, and basic laboratory services provided by partner hospitals.",
  },
  {
    id: 3,
    title: "Community Clean-Up Drive",
    date: Date.now() + 12 * 86400000,
    time: "6:00 AM",
    location: "Main St. Plaza",
    body: "Bring gloves, brooms, and refreshments. Trash bags provided. Volunteers earn service certificates.",
  },
  {
    id: 4,
    title: "Youth Sports Fest Opening",
    date: Date.now() + 20 * 86400000,
    time: "3:00 PM",
    location: "Barangay Gym",
    body: "Opening ceremony for the annual sports tournament: basketball, volleyball, and chess.",
  },
];

const OFFICIALS = [
  {
    id: 1,
    name: "Hon. Marc Lean N. Cubero",
    position: "Barangay Captain",
    phone: "+63 917 555 0101",
    email: "captain@comsol.gov",
  },
  {
    id: 2,
    name: "Hon. Ericka Arellano",
    position: "Barangay Kagawad — Infrastructure",
    phone: "+63 917 555 0102",
    email: "infra@comsol.gov",
  },
  {
    id: 3,
    name: "Hon. Tricia Mae C. Dela Cruz",
    position: "Barangay Kagawad — Health & Sanitation",
    phone: "+63 917 555 0103",
    email: "health@comsol.gov",
  },
  {
    id: 4,
    name: "Hon. Dave T. Heruela",
    position: "Barangay Kagawad — Peace & Order",
    phone: "+63 917 555 0104",
    email: "peace@comsol.gov",
  },
  {
    id: 5,
    name: "Ms. Nadine D. Tenorio",
    position: "Barangay Secretary",
    phone: "+63 917 555 0105",
    email: "secretary@comsol.gov",
  },
  {
    id: 6,
    name: "Mr. Ahldee Evangelista",
    position: "Barangay Treasurer",
    phone: "+63 917 555 0106",
    email: "treasurer@comsol.gov",
  },
];

const EMERGENCY = [
  {
    id: "brgy",
    name: "Barangay Office",
    phone: "+63 2 8555 0100",
    desc: "General inquiries, incident logging, 24/7 duty officer.",
  },
  {
    id: "police",
    name: "Police Station",
    phone: "117",
    desc: "Crime reporting and immediate police assistance.",
  },
  {
    id: "fire",
    name: "Fire Station",
    phone: "160",
    desc: "Fire incidents and rescue emergencies.",
  },
  {
    id: "amb",
    name: "Ambulance / Medical",
    phone: "911",
    desc: "Medical emergencies and hospital transport.",
  },
  {
    id: "ndrrmc",
    name: "Disaster Response Team",
    phone: "+63 2 8555 0111",
    desc: "Flood, typhoon, and disaster-related emergencies.",
  },
];

/* ============================================================
   ADMIN SIDE — extends the shared ComSol object.
   Prototype-only credentials; no backend involved.
   ============================================================ */
Object.assign(ComSol, {
  KEY_ADMIN: "comsol.admin",
  KEY_POSTS: "comsol.posts",

  ADMIN_ACCOUNTS: [
    {
      email: "admin@comsol.gov",
      password: "admin123",
      name: "Barangay Administrator",
      role: "Administrator",
    },
  ],

  // ---- Admin session ----
  getAdmin() {
    try {
      return JSON.parse(Store.get(this.KEY_ADMIN));
    } catch {
      return null;
    }
  },
  adminLogin(email, password) {
    const a = this.ADMIN_ACCOUNTS.find(
      (x) => x.email === email.toLowerCase() && x.password === password,
    );
    if (!a) return null;
    const session = { name: a.name, email: a.email, role: a.role };
    Store.set(this.KEY_ADMIN, JSON.stringify(session));
    return session;
  },
  requireAdmin() {
    if (!this.getAdmin()) {
      window.location.replace("admin-login.html");
      throw new Error("ComSol: redirecting to admin login");
    }
  },
  adminLogout() {
    Store.remove(this.KEY_ADMIN);
    window.location.href = "admin-login.html";
  },

  // ---- Report moderation ----
  saveReports(list) {
    Store.set(this.KEY_REPORTS, JSON.stringify(list));
  },
  /** Move a report to a new status and append a timeline entry. */
  updateReportStatus(id, status, note) {
    const list = this.getReports();
    const r = list.find((x) => String(x.id) === String(id));
    if (!r) return null;
    r.status = status;
    r.history = r.history || [];
    r.history.push({
      status,
      note:
        note ||
        `Status updated to ${this.statusLabel(status)} by the administrator.`,
      ts: Date.now(),
      by: "admin",
    });
    this.saveReports(list);
    return r;
  },

  /** Counts used by both the resident dashboard and the admin dashboard. */
  reportStats() {
    const all = this.getReports();
    const count = (s) => all.filter((r) => r.status === s).length;
    return {
      total: all.length,
      pending: count("pending"),
      review: count("review"),
      progress: count("progress"),
      resolved: count("resolved"),
      rejected: count("rejected"),
    };
  },

  /** Report totals per category, highest first. */
  categoryBreakdown() {
    const all = this.getReports();
    return CATEGORIES.map((c) => ({
      name: c.name,
      icon: c.icon,
      count: all.filter((r) => r.category === c.name).length,
    }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  },

  // ---- Announcements posted by the admin ----
  getPosts() {
    try {
      return JSON.parse(Store.get(this.KEY_POSTS)) || [];
    } catch {
      return [];
    }
  },
  addPost(p) {
    const list = this.getPosts();
    p.id = Date.now();
    p.date = Date.now();
    list.unshift(p);
    Store.set(this.KEY_POSTS, JSON.stringify(list));
    return p;
  },
  deletePost(id) {
    const list = this.getPosts().filter((p) => String(p.id) !== String(id));
    Store.set(this.KEY_POSTS, JSON.stringify(list));
  },
  /** Admin posts first, then the built-in placeholder announcements. */
  getAnnouncements() {
    return [...this.getPosts(), ...ANNOUNCEMENTS];
  },
});

/* ============================================================
   ADMIN SIDE — PART 2
   Resident directory, feedback replies, projects/events CRUD,
   and reporting analytics + CSV export.
   ============================================================ */
Object.assign(ComSol, {
  KEY_USERS: "comsol.users",
  KEY_XPROJECTS: "comsol.projects",
  KEY_XEVENTS: "comsol.events",

  // ---------------- Resident directory ----------------
  /** Every resident account known to the prototype (seeded on first read). */
  getUsers() {
    let list;
    try {
      list = JSON.parse(Store.get(this.KEY_USERS));
    } catch {
      list = null;
    }
    if (!list) {
      const day = 86400000;
      list = [
        {
          id: 1,
          name: "Juan Dela Cruz",
          email: "juan.delacruz@gmail.com",
          phone: "+63 917 111 2233",
          address: "12 Mabini St., Zone 1",
          joined: Date.now() - 90 * day,
          active: true,
        },
        {
          id: 2,
          name: "Maria Santos",
          email: "maria.santos@gmail.com",
          phone: "+63 917 222 3344",
          address: "45 Rizal Ave., Zone 3",
          joined: Date.now() - 45 * day,
          active: true,
        },
        {
          id: 3,
          name: "Pedro Reyes",
          email: "pedro.reyes@yahoo.com",
          phone: "+63 917 333 4455",
          address: "8 Bonifacio St., Zone 5",
          joined: Date.now() - 12 * day,
          active: true,
        },
      ];
      Store.set(this.KEY_USERS, JSON.stringify(list));
    }
    return list;
  },
  saveUsers(list) {
    Store.set(this.KEY_USERS, JSON.stringify(list));
  },
  /**
   * Adds the account to the directory, or refreshes it when the email (or
   * mobile number) already belongs to an existing account.
   */
  registerUser(u) {
    const list = this.getUsers();
    const email = (u.email || "").toLowerCase();
    const phone = this.normalizePhone(u.phone || "");
    const found = list.find(
      (x) =>
        (email && (x.email || "").toLowerCase() === email) ||
        (phone && this.normalizePhone(x.phone || "") === phone),
    );
    if (found) {
      Object.assign(found, {
        name: u.name || found.name,
        email: u.email || found.email,
        phone: u.phone || found.phone,
      });
      if (u.passHash) found.passHash = u.passHash;
    } else {
      list.unshift({
        id: Date.now(),
        name: u.name,
        email: u.email,
        phone: u.phone || "—",
        passHash: u.passHash || "",
        address: u.address || "—",
        joined: Date.now(),
        active: true,
      });
    }
    this.saveUsers(list);
    return list;
  },

  setUserActive(id, active) {
    const list = this.getUsers();
    const u = list.find((x) => String(x.id) === String(id));
    if (u) u.active = active;
    this.saveUsers(list);
  },
  deleteUser(id) {
    this.saveUsers(this.getUsers().filter((u) => String(u.id) !== String(id)));
  },
  /** How many reports each resident filed (matched by name for the prototype). */
  reportsByUser(name) {
    return this.getReports().filter((r) => (r.by || "") === name).length;
  },

  // ---------------- Feedback moderation ----------------
  saveFeedback(list) {
    Store.set(this.KEY_FEEDBACK, JSON.stringify(list));
  },
  /** Attach an official reply; residents see it on their Feedback page. */
  replyFeedback(id, text) {
    const list = this.getFeedback();
    const f = list.find((x) => String(x.id) === String(id));
    if (!f) return null;
    f.reply = text;
    f.replyDate = Date.now();
    f.state = "resolved";
    this.saveFeedback(list);
    return f;
  },
  setFeedbackState(id, state) {
    const list = this.getFeedback();
    const f = list.find((x) => String(x.id) === String(id));
    if (f) f.state = state;
    this.saveFeedback(list);
  },

  // ---------------- Projects & events (admin managed) ----------------
  getExtra(key) {
    try {
      return JSON.parse(Store.get(key)) || [];
    } catch {
      return [];
    }
  },
  /** Admin-created projects first, then the built-in placeholders. */
  getProjects() {
    return [...this.getExtra(this.KEY_XPROJECTS), ...PROJECTS];
  },
  addProject(p) {
    const list = this.getExtra(this.KEY_XPROJECTS);
    p.id = "p" + Date.now();
    p.started = Date.now();
    list.unshift(p);
    Store.set(this.KEY_XPROJECTS, JSON.stringify(list));
    return p;
  },
  updateProject(id, patch) {
    const list = this.getExtra(this.KEY_XPROJECTS);
    const p = list.find((x) => String(x.id) === String(id));
    if (p) Object.assign(p, patch);
    Store.set(this.KEY_XPROJECTS, JSON.stringify(list));
  },
  deleteProject(id) {
    const list = this.getExtra(this.KEY_XPROJECTS).filter(
      (p) => String(p.id) !== String(id),
    );
    Store.set(this.KEY_XPROJECTS, JSON.stringify(list));
  },
  /** Admin-created events merged with the placeholders, soonest first. */
  getEvents() {
    return [...this.getExtra(this.KEY_XEVENTS), ...EVENTS].sort(
      (a, b) => a.date - b.date,
    );
  },
  addEvent(ev) {
    const list = this.getExtra(this.KEY_XEVENTS);
    ev.id = "e" + Date.now();
    list.unshift(ev);
    Store.set(this.KEY_XEVENTS, JSON.stringify(list));
    return ev;
  },
  deleteEvent(id) {
    const list = this.getExtra(this.KEY_XEVENTS).filter(
      (e) => String(e.id) !== String(id),
    );
    Store.set(this.KEY_XEVENTS, JSON.stringify(list));
  },

  // ---------------- Analytics & export ----------------
  /** Report counts for the last `months` calendar months, oldest first. */
  reportsByMonth(months = 6) {
    const all = this.getReports();
    const out = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      out.push({
        label: d.toLocaleDateString(undefined, { month: "short" }),
        count: all.filter((r) => r.date >= +d && r.date < +next).length,
      });
    }
    return out;
  },
  /** Average days between submission and the resolved entry in the timeline. */
  avgResolutionDays() {
    const done = this.getReports().filter((r) => r.status === "resolved");
    if (!done.length) return 0;
    const total = done.reduce((sum, r) => {
      const end = (r.history || []).filter((h) => h.status === "resolved").pop();
      return sum + ((end ? end.ts : Date.now()) - r.date) / 86400000;
    }, 0);
    return Math.round((total / done.length) * 10) / 10;
  },
  /** Builds a CSV of every report and triggers a browser download. */
  exportReportsCSV() {
    const rows = [
      [
        "Reference",
        "Title",
        "Category",
        "Status",
        "Location",
        "Date Submitted",
        "Description",
      ],
      ...this.getReports().map((r) => [
        r.ref || "",
        r.title || "",
        r.category || "",
        this.statusLabel(r.status),
        r.location || "",
        new Date(r.date).toLocaleString(),
        (r.description || "").replace(/\s+/g, " "),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `comsol-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
});

/* ------------------------------------------------------------------
   User preferences (Settings page)
   Stored locally so the prototype works without a backend.
   ------------------------------------------------------------------ */
Object.assign(ComSol, {
  KEY_PREFS: "comsol.prefs",

  defaultPrefs() {
    return {
      // Barangay / locality
      barangay: "Barangay San Isidro",
      purok: "",
      defaultLocation: "",
      // Notifications
      notifyStatus: true,
      notifyAnnouncements: true,
      notifyEvents: true,
      notifyEmergency: true,
      // (Appearance / dark mode removed — one consistent look for everyone.)

      // Privacy
      anonymousDefault: false,
      shareContact: true,
      // Admin
      defaultLanding: "home.html",
      sessionTimeout: "30",
    };
  },

  getPrefs() {
    let saved = {};
    try {
      saved = JSON.parse(Store.get(this.KEY_PREFS)) || {};
    } catch {
      saved = {};
    }
    return { ...this.defaultPrefs(), ...saved };
  },

  setPrefs(patch) {
    const next = { ...this.getPrefs(), ...patch };
    Store.set(this.KEY_PREFS, JSON.stringify(next));
    this.applyPrefs();
    return next;
  },

  resetPrefs() {
    Store.remove(this.KEY_PREFS);
    this.applyPrefs();
  },

  /**
   * Kept as a harmless no-op so older calls still work. The Appearance /
   * dark-mode feature was removed — the app has one consistent appearance.
   */
  applyPrefs() {},

  /** Label passthrough (kept so existing calls to ComSol.t() keep working). */
  t(key) {
    return key;
  },


  /** Downloads everything this browser stores about the user as JSON. */
  exportMyData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            user: this.getUser(),
            preferences: this.getPrefs(),
            reports: this.getReports(),
            feedback: this.getFeedback(),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comsol-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
});

// Appearance / dark-mode support was removed: the interface now has a single
// consistent light appearance, so there is nothing to apply on load.

/* ============================================================
   ACCOUNT IDENTITY — email OR mobile number
   Registration collects a mobile number, and residents may sign in with
   either their email address or that mobile number. Passwords are never
   stored in clear text: only a SHA-256 digest is kept.
   ============================================================ */
Object.assign(ComSol, {
  /** Digits-only comparison form of a PH mobile number ("+63 917…" -> "0917…"). */
  normalizePhone(value) {
    let d = String(value || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("63") && d.length === 12) d = "0" + d.slice(2);
    if (d.length === 10 && d.startsWith("9")) d = "0" + d;
    return d;
  },

  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
  },

  /** Accepts 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX and spaced variants. */
  isValidPhone(value) {
    const d = this.normalizePhone(value);
    return /^09\d{9}$/.test(d);
  },

  /** Pretty, consistent storage format: 09XX XXX XXXX */
  formatPhone(value) {
    const d = this.normalizePhone(value);
    if (!/^09\d{9}$/.test(d)) return String(value || "").trim();
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  },

  /** SHA-256 where available, with a deterministic fallback for file:// pages. */
  async hashPassword(password) {
    const text = String(password || "");
    try {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("comsol:" + text),
      );
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      let h = 5381;
      for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i);
      return "fb" + (h >>> 0).toString(16);
    }
  },

  /** Finds an account by email address OR mobile number. */
  findAccount(identifier) {
    const raw = String(identifier || "").trim();
    if (!raw) return null;
    const list = this.getUsers();
    if (this.isEmail(raw)) {
      const email = raw.toLowerCase();
      return list.find((u) => (u.email || "").toLowerCase() === email) || null;
    }
    const phone = this.normalizePhone(raw);
    if (!phone) return null;
    return list.find((u) => this.normalizePhone(u.phone || "") === phone) || null;
  },

  /** True when the email or mobile number is already taken. */
  accountExists(email, phone) {
    return !!(
      (email && this.findAccount(email)) ||
      (phone && this.findAccount(phone))
    );
  },

  /**
   * Verifies credentials given either an email or a mobile number.
   * @returns {Promise<{ok:boolean, reason?:string, account?:object}>}
   */
  async verifyLogin(identifier, password) {
    const account = this.findAccount(identifier);
    if (!account) return { ok: false, reason: "notfound" };
    if (account.active === false) return { ok: false, reason: "suspended" };
    if (account.passHash) {
      const hash = await this.hashPassword(password);
      if (hash !== account.passHash) return { ok: false, reason: "password" };
    }
    return { ok: true, account };
  },

  /**
   * Saves profile edits for the signed-in resident, keeping the session user
   * and the directory record in sync. Rejects duplicates.
   * @returns {{ok:boolean, reason?:string}}
   */
  updateProfile({ name, email, phone, address }) {
    const current = this.getUser() || {};
    const cleanEmail = String(email || "").trim();
    const cleanPhone = phone ? this.formatPhone(phone) : "";
    if (!String(name || "").trim()) return { ok: false, reason: "name" };
    if (!this.isEmail(cleanEmail)) return { ok: false, reason: "email" };
    if (cleanPhone && !this.isValidPhone(cleanPhone))
      return { ok: false, reason: "phone" };

    const list = this.getUsers();
    const mine = this.findAccount(current.email) || this.findAccount(current.phone);
    const clash = list.find((u) => {
      if (mine && String(u.id) === String(mine.id)) return false;
      const sameEmail =
        (u.email || "").toLowerCase() === cleanEmail.toLowerCase();
      const samePhone =
        cleanPhone &&
        this.normalizePhone(u.phone || "") === this.normalizePhone(cleanPhone);
      return sameEmail || samePhone;
    });
    if (clash) return { ok: false, reason: "duplicate" };

    if (mine) {
      Object.assign(mine, {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone || mine.phone,
        address: address != null ? address : mine.address,
      });
      this.saveUsers(list);
    }
    this.setUser({
      ...current,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone || current.phone || "",
      address: address != null ? address : current.address,
    });
    return { ok: true };
  },

  /**
   * Changes the signed-in resident's password after checking the current one.
   * @returns {Promise<{ok:boolean, reason?:string}>}
   */
  async changePassword(currentPassword, newPassword) {
    const user = this.getUser() || {};
    const account =
      this.findAccount(user.email) || this.findAccount(user.phone);
    if (!account) return { ok: false, reason: "notfound" };
    if (account.passHash) {
      const hash = await this.hashPassword(currentPassword);
      if (hash !== account.passHash) return { ok: false, reason: "password" };
    }
    if (String(newPassword || "").length < 6)
      return { ok: false, reason: "short" };
    account.passHash = await this.hashPassword(newPassword);
    const list = this.getUsers().map((u) =>
      String(u.id) === String(account.id) ? account : u,
    );
    this.saveUsers(list);
    return { ok: true };
  },
});





/* ============================================================
   NOTIFICATIONS
   Derived feed built from the data the admin side already writes:
   announcements (comsol.posts), events, projects, the resident's own
   report status history and official replies to their feedback.
   Read state is stored per browser in comsol.notifs.
   ============================================================ */
Object.assign(ComSol, {
  KEY_NOTIFS: "comsol.notifs",

  _notifState() {
    try {
      const s = JSON.parse(Store.get(this.KEY_NOTIFS)) || {};
      return {
        read: Array.isArray(s.read) ? s.read : [],
        since: s.since || 0,
        init: !!s.init,
      };
    } catch {
      return { read: [], since: 0 };
    }
  },
  _saveNotifState(s) {
    Store.set(this.KEY_NOTIFS, JSON.stringify(s));
  },

  /** Full notification feed, newest first, already filtered by preferences. */
  getNotifications() {
    this._ensureNotifBaseline();
    const p = this.getPrefs();
    const user = this.getUser() || {};
    const mine = (by) => !by || by === user.name;
    const state = this._notifState();
    const out = [];

    if (p.notifyAnnouncements) {
      this.getPosts().forEach((a) => {
        out.push({
          id: "post:" + a.id,
          type: "announcement",
          title: a.title || "New announcement",
          body: a.body || "",
          ts: a.date || 0,
          href: "announcements.html#post-" + a.id,
        });
      });
    }

    if (p.notifyEvents) {
      // Events the resident asked to be reminded about, surfaced in the bell
      // once the event is within 3 days (and until it has passed).
      let reminded = [];
      try {
        reminded = JSON.parse(Store.get("comsol.reminders")) || [];
      } catch {
        reminded = [];
      }
      if (reminded.length) {
        const soon = 3 * 86400000;
        this.getEvents().forEach((ev) => {
          if (!reminded.some((id) => String(id) === String(ev.id))) return;
          const when = Number(ev.date) || 0;
          const left = when - Date.now();
          if (left > soon || left < -86400000) return;
          out.push({
            id: "remind:" + ev.id,
            type: "event",
            title: "Reminder: " + (ev.title || "Community event"),
            body:
              (left < 0
                ? "Happening now"
                : left < 86400000
                  ? "Happening today"
                  : "Coming up soon") +
              (ev.time ? " · " + ev.time : "") +
              (ev.location ? " · " + ev.location : ""),
            ts: when,
            href: "events.html",
          });
        });
      }

      this.getExtra(this.KEY_XEVENTS).forEach((e) => {
        out.push({
          id: "event:" + e.id,
          type: "event",
          title: "New event: " + (e.title || "Community event"),
          body: e.place || e.location || "",
          ts: Number(String(e.id).replace(/\D/g, "")) || e.date || 0,
          href: "events.html",
        });
      });
      this.getExtra(this.KEY_XPROJECTS).forEach((pr) => {
        out.push({
          id: "project:" + pr.id,
          type: "project",
          title: "New project: " + (pr.title || "Community project"),
          body: pr.summary || pr.description || "",
          ts: pr.started || Number(String(pr.id).replace(/\D/g, "")) || 0,
          href: "projects.html",
        });
      });
    }

    if (p.notifyStatus) {
      this.getReports()
        .filter((r) => mine(r.by))
        .forEach((r) => {
          const hist = Array.isArray(r.history) ? r.history : [];
          hist.slice(1).forEach((h, i) => {
            out.push({
              id: "report:" + r.id + ":" + (i + 1),
              type: "status",
              title: `Report ${r.ref || "#" + r.id} is now ${this.statusLabel ? this.statusLabel(h.status) : h.status}`,
              body: h.note || r.title || "",
              ts: h.ts || r.date || 0,
              href: "reports.html#report-" + r.id,
            });
          });
        });
    }

    this.getFeedback()
      .filter((f) => f.reply && mine(f.by))
      .forEach((f) => {
        out.push({
          id: "feedback:" + f.id,
          type: "feedback",
          title: "The barangay replied to your feedback",
          body: f.reply,
          ts: f.replyDate || f.date || 0,
          href: "feedback.html#feedback-" + f.id,
        });
      });

    return out
      .filter((n) => n.ts >= (state.since || 0))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 40)
      .map((n) => ({ ...n, read: state.read.indexOf(n.id) > -1 }));
  },

  /** First run: everything that already exists counts as seen, so residents
      only get badged for activity posted after they started using the app. */
  _ensureNotifBaseline() {
    let raw;
    try {
      raw = JSON.parse(Store.get(this.KEY_NOTIFS));
    } catch {
      raw = null;
    }
    if (raw && raw.init) return;
    const s = { read: [], since: 0, init: true };
    this._saveNotifState(s);
    s.read = this.getNotifications().map((n) => n.id);
    this._saveNotifState(s);
  },

  unreadCount() {
    return this.getNotifications().filter((n) => !n.read).length;
  },

  markNotificationRead(id) {
    const s = this._notifState();
    if (s.read.indexOf(id) === -1) s.read.push(id);
    this._saveNotifState(s);
  },

  markAllNotificationsRead() {
    const s = this._notifState();
    this.getNotifications().forEach((n) => {
      if (s.read.indexOf(n.id) === -1) s.read.push(n.id);
    });
    this._saveNotifState(s);
  },

  clearNotifications() {
    this._saveNotifState({ read: [], since: Date.now(), init: true });
  },
});

/** Scrolls to and flashes the element referenced by location.hash. */
ComSol.highlightHash = function () {
  setTimeout(() => ComSol._doHighlight(), 60);
};
ComSol._doHighlight = function () {
  const id = (location.hash || "").slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("notif-target");
  setTimeout(() => el.classList.remove("notif-target"), 2000);
};
