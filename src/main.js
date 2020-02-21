import Vue from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import io from 'socket.io-client'

let baseUrl = ''
if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://blooming-beach-14889.herokuapp.com/'
} else {
  baseUrl = 'http://localhost:4000/'
}

Vue.prototype.$socket = io.connect(baseUrl)

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
