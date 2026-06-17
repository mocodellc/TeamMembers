<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-cyan-300">Team Directory</p>
            <h1 class="mt-2 font-heading text-3xl leading-tight text-white md:text-4xl">People and Group Management</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-300">
              Manage members, groups, and soft-deleted records from a single local-first workspace.
            </p>
          </div>
          <nav class="flex gap-2 text-sm">
            <RouterLink
              to="/members"
              class="rounded-lg border border-slate-700 px-4 py-2 font-medium transition hover:border-cyan-400 hover:text-cyan-200"
              active-class="border-cyan-400 bg-cyan-500/10 text-cyan-200"
            >
              Members
            </RouterLink>
            <RouterLink
              to="/groups"
              class="rounded-lg border border-slate-700 px-4 py-2 font-medium transition hover:border-cyan-400 hover:text-cyan-200"
              active-class="border-cyan-400 bg-cyan-500/10 text-cyan-200"
            >
              Groups
            </RouterLink>
          </nav>
        </div>
      </header>

      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
