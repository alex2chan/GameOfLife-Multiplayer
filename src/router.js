import Vue from "vue"
import VueRouter from "vue-router"
import GameOfLife from "./components/GameOfLife.vue"

Vue.use(VueRouter)

export default new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "GameOfLife",
      component: GameOfLife
    }
  ]
})
