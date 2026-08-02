/* ComSol — Community Solution
   Cubero, Marc Lean
   Heruela, Dave
   Arellano, Ericka
   Dela cruz, Tricia
   Tenorio, Nadine
   Salamante, Chris Jordan
   Salvoro, Miguel
*/

function renderAdminShell({ active, title }) {
  const admin = ComSol.getAdmin() || {
    name: "Administrator",
    email: "",
    role: "Administrator",
  };

  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
    megaphone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a2 2 0 0 0 2 2h2l6 4V5L7 9H5a2 2 0 0 0-2 2z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    chart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 15v3M12 10v8M17 6v12"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 4.5a4 4 0 0 1 0 7M18 21a6 6 0 0 0-3-5.2"/></svg>',
    project:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
    site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>',

    logout:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    brand:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="11" r="3"/></svg>',
  };

  const items = [
    {
      key: "dashboard",
      label: "Admin Dashboard",
      href: "admin.html",
      icon: icons.home,
    },
    {
      key: "reports",
      label: "Manage Reports",
      href: "admin-reports.html",
      icon: icons.list,
    },
    {
      key: "analytics",
      label: "Reports Analytics",
      href: "admin-analytics.html",
      icon: icons.chart,
    },
    {
      key: "residents",
      label: "Manage Residents",
      href: "admin-residents.html",
      icon: icons.users,
    },
    {
      key: "announcements",
      label: "Post Announcement",
      href: "admin-announcements.html",
      icon: icons.megaphone,
    },
    {
      key: "projects",
      label: "Projects & Events",
      href: "admin-projects.html",
      icon: icons.project,
    },
    {
      key: "feedback",
      label: "Resident Feedback",
      href: "admin-feedback.html",
      icon: icons.chat,
    },
  ];


  const pending = ComSol.reportStats().pending;

  const navHtml = `
    <div class="sidebar-group-label">Administration</div>
    ${items
      .map(
        (it) => `
      <a class="sidebar-item ${active === it.key ? "active" : ""}" href="${it.href}">
        ${it.icon}<span>${it.label}</span>
        ${it.key === "reports" && pending ? `<span class="nav-count">${pending}</span>` : ""}
      </a>
    `,
      )
      .join("")}
    <div class="sidebar-group-label">Resident View</div>
    <a class="sidebar-item" href="home.html">${icons.site}<span>Open Resident Site</span></a>
  `;

  const shellRoot = document.getElementById("app-root");
  const pageContent = shellRoot ? shellRoot.innerHTML : "";

  // Modals live outside #app-root, so detach them before the shell replaces
  // the body and re-attach them afterwards.
  const modals = Array.from(document.querySelectorAll("body > .modal-scrim"));

  document.body.innerHTML = `
    <div class="app admin-app">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark"><img src="images/logo.png" alt="ComSol logo" width="42" height="42" decoding="async"></div>
          ComSol <span class="admin-chip">Admin</span>
        </div>
        <nav class="sidebar-nav">
          ${navHtml}
          <a class="sidebar-item logout" href="#" id="sb-logout">${icons.logout}<span>Logout</span></a>
        </nav>
        <div class="sidebar-user">
          <div class="avatar-sm">${ComSol.initials(admin.name)}</div>
          <div class="info">
            <div class="n">${admin.name}</div>
            <div class="e">${admin.role}</div>
          </div>
        </div>
      </aside>
      <div class="sidebar-scrim" id="scrim"></div>
      <div class="main">
        <header class="topbar">
          <button class="topbar-toggle" id="menuBtn" aria-label="Open menu">${icons.menu}</button>
          <div class="topbar-title">${title || ""}</div>
          <div class="topbar-spacer"></div>
          <span class="admin-chip">Administrator</span>
        </header>
        <main class="content"><div class="content-narrow">${pageContent}</div></main>
      </div>
    </div>
  `;

  modals.forEach((m) => document.body.appendChild(m));

  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  document.getElementById("menuBtn").addEventListener("click", () => {
    sidebar.classList.add("open");
    scrim.classList.add("open");
  });
  scrim.addEventListener("click", () => {
    sidebar.classList.remove("open");
    scrim.classList.remove("open");
  });
  document.getElementById("sb-logout").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Log out")) ComSol.adminLogout();
  });
}
