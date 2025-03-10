import { createRouter, createWebHistory } from "vue-router";
import AppView from "@/AppView.vue";
import HomeView from "@/HomeView.vue";
import SignInView from "@/views/signin/SignInView.vue";
import AgentsView from "@/views/agents/AgentsView.vue";
import FeedsView from "@/views/agents/FeedsView.vue";
import StrategiesView from "@/views/agents/StrategiesView.vue";
import MeView from "@/views/me/MeView.vue";
import RevenueView from "@/views/me/RevenueView.vue";
import MeStrategiesView from "@/views/me/StrategiesView.vue";
import ChatView from "@/views/chat/ChatView.vue";
import CreateView from "@/views/create/CreateView.vue";
import CreateStrategyView from "@/views/create/CreateStrategyView.vue";
import StrategyView from "@/views/agents/detail/StrategyView.vue";
import FaucetView from "@/views/FaucetView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: "/",
      name: "explore",
      component: AppView,
      children: [
        {
          path: "/",
          name: "agents",
          component: AgentsView,
          children: [
            {
              path: "/",
              name: "agents-feeds",
              component: FeedsView,
            },
            {
              path: "/strategies",
              name: "agents-strategies",
              component: StrategiesView,
            },
          ],
        },
        {
          path: "/faucet",
          name: "faucet",
          component: FaucetView,
        },
        {
          path: "/strategies/:id",
          name: "strategies-strategy",
          component: StrategyView,
        },
        {
          path: "/me",
          name: "me",
          component: MeView,
          children: [
            {
              path: "/me",
              name: "me-strategies",
              component: MeStrategiesView,
            },
            {
              path: "/me/revenue",
              name: "me-revenue",
              component: RevenueView,
            },
          ],
        },
        {
          path: "/chat",
          name: "chat",
          component: ChatView,
        },

        {
          name: "create",
          path: "/create",
          component: CreateView,
          children: [
            {
              name: "create-strategy",
              path: "/create",
              component: CreateStrategyView,
            },
          ],
        },
      ],
    },
    {
      path: "/signin",
      name: "signin",
      component: HomeView,
      children: [
        {
          path: "/signin",
          name: "signin-view",
          component: SignInView,
        },
      ],
    },
    // {
    //   path: "/:pathMatch(.*)*",
    //   name: "NotFound",
    //   component: PageNotFoundView,
    // },
  ],
});

export default router;
