(() => {
  const byId = id => document.getElementById(id);
  const cfg = window.PORTFOLIO_CONFIG || {};
  const ready = cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.includes("YOUR_") && !cfg.supabaseAnonKey.includes("YOUR_") &&
    window.supabase && window.supabase.createClient;
  const warning = byId("setup-warning"), signIn = byId("google-signin"), signOut = byId("signout");
  const form = byId("message-form"), status = byId("auth-status"), feedback = byId("message-feedback");
  const inbox = byId("owner-inbox"), inboxList = byId("inbox-list"), refresh = byId("refresh-inbox");
  if (!ready) {
    status.textContent = "Waiting for Supabase setup.";
    signIn.disabled = true;
    signIn.title = "Add Supabase URL and anon key in assets/config.js first.";
    return;
  }
  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  let currentUser = null;
  const say = (message, kind = "") => { feedback.textContent = message; feedback.className = `feedback ${kind}`; };
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  async function loadInbox() {
    if (!currentUser || !inbox || !inboxList) return;
    const { data: isAdmin, error: adminError } = await client.rpc("is_portfolio_admin");
    if (adminError || !isAdmin) { inbox.classList.add("hidden"); return; }
    inbox.classList.remove("hidden");
    inboxList.innerHTML = '<p class="muted">Loading messages…</p>';
    const { data, error } = await client.from("portfolio_messages")
      .select("id, sender_email, body, created_at")
      .order("created_at", { ascending: false }).limit(100);
    if (error) { inboxList.innerHTML = '<p class="feedback error">Could not load inbox. Check the SQL policies.</p>'; return; }
    if (!data || !data.length) { inboxList.innerHTML = '<p class="muted">No messages yet.</p>'; return; }
    inboxList.innerHTML = data.map(m => `<article class="inbox-message"><div class="inbox-meta"><strong>${escapeHtml(m.sender_email || "Google user")}</strong><time>${escapeHtml(new Date(m.created_at).toLocaleString())}</time></div><p>${escapeHtml(m.body)}</p><button class="text-button delete-message" data-id="${escapeHtml(m.id)}">Delete</button></article>`).join("");
    inboxList.querySelectorAll(".delete-message").forEach(button => button.addEventListener("click", async () => {
      if (!confirm("Delete this message?")) return;
      const { error } = await client.from("portfolio_messages").delete().eq("id", button.dataset.id);
      if (error) say("Could not delete message.", "error"); else { say("Message deleted.", "success"); loadInbox(); }
    }));
  }
  async function updateSession(session) {
    currentUser = session?.user || null;
    if (!currentUser) {
      status.textContent = "Not signed in.";
      signIn.classList.remove("hidden"); signOut.classList.add("hidden"); form.classList.add("hidden"); inbox.classList.add("hidden");
      return;
    }
    status.textContent = `Signed in as ${currentUser.email || "Google account"}.`;
    signIn.classList.add("hidden"); signOut.classList.remove("hidden"); form.classList.remove("hidden");
    const { data: isAdmin } = await client.rpc("is_portfolio_admin");
    if (isAdmin) { form.classList.add("hidden"); await loadInbox(); }
    else inbox.classList.add("hidden");
  }
  signIn.addEventListener("click", async () => {
    say("");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href.split("?")[0] }
    });
    if (error) say(`Google sign-in failed: ${error.message}`, "error");
  });
  signOut.addEventListener("click", async () => { await client.auth.signOut(); say("Signed out.", "success"); });
  form.addEventListener("submit", async e => {
    e.preventDefault(); say("");
    if (!currentUser) { say("Please sign in first.", "error"); return; }
    const body = byId("message-body").value.trim();
    if (body.length < 5 || body.length > 3000) { say("Message must be 5–3000 characters.", "error"); return; }
    const { error } = await client.from("portfolio_messages").insert({
      sender_id: currentUser.id, sender_email: currentUser.email || null, body
    });
    if (error) say("Message could not be sent. Please check setup and try again.", "error");
    else { byId("message-body").value = ""; say("Message sent privately. Thanks!", "success"); }
  });
  refresh?.addEventListener("click", loadInbox);
  client.auth.getSession().then(({ data }) => updateSession(data.session));
  client.auth.onAuthStateChange((_event, session) => { updateSession(session); });
})();
