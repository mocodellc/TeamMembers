import { createRouter, createWebHistory } from 'vue-router'
import GroupsView from '../views/GroupsView.vue'
import MembersView from '../views/MembersView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/members' },
    { path: '/members', name: 'members', component: MembersView },
    { path: '/groups', name: 'groups', component: GroupsView },
    { path: '/:pathMatch(.*)*', redirect: '/members' },
  ],
})

export default router
