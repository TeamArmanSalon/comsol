/* ComSol — Community Solution
   Cubero, Marc Lean
   Heruela, Dave
   Arellano, Ericka
   Dela cruz, Tricia
   Tenorio, Nadine
   Salamante, Chris Jordan
   Salvoro, Miguel
*/

function renderShell({ active, title }) {
  const user = ComSol.getUser() || { name: "Citizen", email: "" };

  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
    submit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
    project:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
    megaphone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a2 2 0 0 0 2 2h2l6 4V5L7 9H5a2 2 0 0 0-2 2z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
    event:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z"/></svg>',
    siren:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M6 20v-5a6 6 0 0 1 12 0v5M12 4v3M4.9 6.9l2 2M19.1 6.9l-2 2"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    logout:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    brand:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="11" r="3"/></svg>',
  };

  const groups = [
    {
      label: "Main",
      items: [
        {
          key: "dashboard",
          label: "Home",
          href: "home.html",
          icon: icons.home,
        },
        {
          key: "create",
          label: "Report an Issue",
          href: "create.html",
          icon: icons.submit,
        },
        {
          key: "reports",
          label: "Track My Reports",
          href: "reports.html",
          icon: icons.list,
        },
      ],
    },
    {
      label: "Community",
      items: [
        {
          key: "projects",
          label: "Community Projects",
          href: "projects.html",
          icon: icons.project,
        },
        {
          key: "announcements",
          label: "Announcements",
          href: "announcements.html",
          icon: icons.megaphone,
        },
        {
          key: "events",
          label: "Events",
          href: "events.html",
          icon: icons.event,
        },
        {
          key: "feedback",
          label: "Feedback",
          href: "feedback.html",
          icon: icons.chat,
        },
      ],
    },
    {
      label: "Directory",
      items: [
        {
          key: "officials",
          label: "Contact Officials",
          href: "officials.html",
          icon: icons.phone,
        },
        {
          key: "emergency",
          label: "Emergency Contacts",
          href: "emergency.html",
          icon: icons.siren,
        },
      ],
    },
  ];


  const navHtml = groups
    .map(
      (g) => `
    <div class="sidebar-group-label">${ComSol.t(g.label)}</div>
    ${g.items
      .map(
        (it) => `
      <a class="sidebar-item ${active === it.key ? "active" : ""}" href="${it.href}">
        ${it.icon}<span>${ComSol.t(it.label)}</span>
      </a>
    `,
      )
      .join("")}
  `,
    )
    .join("");

  const shellRoot = document.getElementById("app-root");
  const pageContent = shellRoot ? shellRoot.innerHTML : "";

  const html = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
  <div class="brand-mark">
    <img src="images/logo.png" alt="ComSol logo" width="42" height="42" decoding="async">
  </div>
  <span>ComSol</span>
</div>
        <nav class="sidebar-nav">
          ${navHtml}
        </nav>
      </aside>
      <div class="sidebar-scrim" id="scrim"></div>
      <div class="main">
        <header class="topbar">
          <button class="topbar-toggle" id="menuBtn" aria-label="Open menu">${icons.menu}</button>
          <div class="topbar-title">${title || ""}</div>
          <div class="topbar-spacer"></div>

          <div class="topbar-pop" id="notifWrap">
            <button class="topbar-bell" id="bellBtn" aria-label="Notifications" aria-haspopup="true" aria-expanded="false">
              ${icons.bell}<span class="bell-badge" id="bellBadge" hidden>0</span>
            </button>
            <div class="pop-menu pop-notif" id="notifMenu" role="menu" hidden>
              <div class="pop-head">
                <span>${ComSol.t("Notifications")}</span>
                <button class="pop-link" id="notifReadAll" type="button">Mark all as read</button>
              </div>
              <div class="pop-list" id="notifList"></div>
            </div>
          </div>

          <div class="topbar-pop" id="userWrap">
            <button class="topbar-avatar" id="avatarBtn" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">
              <span class="avatar-sm">${ComSol.initials(user.name)}</span>
            </button>
            <div class="pop-menu pop-user" id="userMenu" role="menu" hidden>
              <div class="pop-user-head">
                <span class="avatar-sm">${ComSol.initials(user.name)}</span>
                <div class="info">
                  <div class="n">${user.name}</div>
                  <div class="e">${user.email || ""}</div>
                </div>
              </div>
              <a class="pop-item" role="menuitem" href="profile.html">${icons.user}<span>${ComSol.t("Profile")}</span></a>
              <a class="pop-item" role="menuitem" href="settings.html">${icons.gear}<span>${ComSol.t("Settings")}</span></a>
              <div class="pop-sep"></div>
              <a class="pop-item danger" role="menuitem" href="#" id="popLogout">${icons.logout}<span>${ComSol.t("Log Out")}</span></a>
            </div>
          </div>
        </header>
        <main class="content"><div class="content-narrow">${pageContent}</div></main>
      </div>
    </div>
  `;

  // Modals live outside #app-root, so detach them before the shell replaces
  // the body and re-attach them afterwards.
  const modals = Array.from(document.querySelectorAll("body > .modal-scrim"));
  document.body.innerHTML = html;
  modals.forEach((m) => document.body.appendChild(m));

  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  const open = () => {
    sidebar.classList.add("open");
    scrim.classList.add("open");
  };
  const close = () => {
    sidebar.classList.remove("open");
    scrim.classList.remove("open");
  };
  document.getElementById("menuBtn").addEventListener("click", open);
  scrim.addEventListener("click", close);

  /* ---------------- Top-right popovers ---------------- */
  const notifMenu = document.getElementById("notifMenu");
  const userMenu = document.getElementById("userMenu");
  const bellBtn = document.getElementById("bellBtn");
  const avatarBtn = document.getElementById("avatarBtn");

  function setOpen(menu, btn, state) {
    menu.hidden = !state;
    menu.classList.toggle("open", state);
    btn.setAttribute("aria-expanded", state ? "true" : "false");
  }
  function closeAll() {
    setOpen(notifMenu, bellBtn, false);
    setOpen(userMenu, avatarBtn, false);
  }
  function toggle(menu, btn) {
    const next = menu.hidden;
    closeAll();
    if (next) setOpen(menu, btn, true);
  }

  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle(notifMenu, bellBtn);
    if (!notifMenu.hidden) renderNotifications();
  });
  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle(userMenu, avatarBtn);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".topbar-pop")) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  document.getElementById("popLogout").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Log out of ComSol?")) ComSol.logout();
  });

  /* ---------------- Notifications ---------------- */
  const typeIcon = {
    announcement: icons.megaphone,
    event: icons.event,
    project: icons.project,
    status: icons.list,
    feedback: icons.chat,
  };

  function renderBadge() {
    const badge = document.getElementById("bellBadge");
    const n = ComSol.unreadCount();
    badge.hidden = n === 0;
    badge.textContent = n > 9 ? "9+" : String(n);
    bellBtn.classList.toggle("has-unread", n > 0);
  }

  function renderNotifications() {
    const list = document.getElementById("notifList");
    const items = ComSol.getNotifications();
    list.innerHTML = items.length
      ? items
          .map(
            (n) => `
        <a class="notif ${n.read ? "" : "unread"}" href="${n.href}" data-id="${n.id}">
          <span class="notif-ico ${n.type}">${typeIcon[n.type] || icons.bell}</span>
          <span class="notif-body">
            <span class="notif-title">${n.title}</span>
            <span class="notif-text">${(n.body || "").slice(0, 90)}</span>
            <span class="notif-time">${ComSol.formatDate(n.ts)}</span>
          </span>
          ${n.read ? "" : '<span class="notif-dot"></span>'}
        </a>`,
          )
          .join("")
      : '<div class="notif-empty">You have no notifications yet.</div>';

    list.querySelectorAll(".notif").forEach((a) => {
      a.addEventListener("click", () => {
        ComSol.markNotificationRead(a.dataset.id);
      });
    });
    renderBadge();
  }

  document.getElementById("notifReadAll").addEventListener("click", (e) => {
    e.stopPropagation();
    ComSol.markAllNotificationsRead();
    renderNotifications();
  });

  renderBadge();
  // Live updates: another tab (e.g. the admin panel) writing new content.
  window.addEventListener("storage", () => {
    renderBadge();
    if (!notifMenu.hidden) renderNotifications();
  });
  setInterval(renderBadge, 15000);
}

