<template>
  <div :style="[gridStyle]">
    <h1 class="mb-3">
      Conway’s Game of Life (Multiplayer)
    </h1>

    <b-card bg-variant="warning" class="mx-auto">
      <b-card-header class="user-box mb-2">
        <h3 class="white">
          This is your color
        </h3>
      </b-card-header>

      <div class="grid mx-auto text-center">
        <Cell v-for="x in grid" :key="x.id" :cell='x' :background="color" />
      </div>

      <b-card-footer class="user-box mt-2">
        <h4 class="white">
          {{"Generation : " + tick}}
        </h4>
      </b-card-footer>
    </b-card>

    <div>
      <b-dropdown menu-class="menu" text="Presets" class="mt-3" variant="warning" size="lg">
        <b-dropdown-item @click="presets('blinkers')">Blinkers</b-dropdown-item>
        <b-dropdown-item @click="presets('toad')">Toad</b-dropdown-item>
        <b-dropdown-item @click="presets('beacon')">Beacon</b-dropdown-item>
      </b-dropdown>
    </div>

    <b-card body-class="card-body" class="mt-3 bcard d-flex justify-content-center mx-auto">
      <b-card-header>
        <h4 class="white">
          {{"Total Number of Players : " + users.length}}
        </h4>
      </b-card-header>

      <div class="text-center white m-2" :style="{ background: user.color }" v-for="(user, index) in users" :key="user.id">
        {{ "User " + (index + 1).toString() }}
      </div>
    </b-card>
  </div>
</template>

<script>
import Cell from './Cell.vue'

export default {
  name: 'GameOfLife',
  components: {
    Cell: Cell
  },
  data () {
    return {
      boxSize: 25,
      rows: 0,
      columns: 0,
      grid: [],
      play: false,
      tick: 0,
      users: [],
      color: '',
      rngCounter: 0,
      noSpace: false
    }
  },
  created () {
    this.$socket.on('create_users', (data) => {
      this.users = data
      var user = this.users.find(x => x.id === this.$socket.id)
      this.color = user.color
    })

    this.$socket.on('create_grid', (grid, rows, columns) => {
      this.grid = grid
      this.rows = rows
      this.columns = columns
    })

    this.$socket.on('update_cell', (data) => {
      this.grid = data
    })

    this.$socket.on('update_grid', (data) => {
      this.grid = data
    })

    this.$socket.on('update_tick', (data) => {
      this.tick = data
    })

    this.$socket.on('new_user', () => {
      this.$bvToast.toast(' ', {
        title: 'A user logged in!',
        variant: 'success'
      })
    })

    this.$socket.on('lost_user', () => {
      this.$bvToast.toast(' ', {
        title: 'A user logged out!',
        variant: 'warning'
      })
    })
  },
  methods: {
    rng (rowLimit, columnLimit, oscillators) {
      this.rngCounter += 1

      var forbidden = []

      for (var i = 1; i < columnLimit; i++) {
        for (var j = 0; j < this.rows - rowLimit + 1; j++) {
          forbidden.push(this.columns - i + (this.columns * j))
        }
      }

      var rowNum = (this.rows - rowLimit + 1) * this.columns
      for (rowNum; rowNum < this.rows * this.columns; rowNum++) {
        forbidden.push(rowNum)
      }

      var uncheckedCells = this.grid.filter(x => x.checked === false)
      var uncheckedNums = []

      for (var u of uncheckedCells) {
        uncheckedNums.push(u.value)
      }

      uncheckedNums = uncheckedNums.filter(x => !forbidden.includes(x))

      var randomNumber = uncheckedNums[Math.floor((Math.random() * (uncheckedNums.length - 1)) + 0)]

      var farray = []

      switch (oscillators) {
        case 'blinkers':
          farray = [randomNumber, randomNumber + 1, randomNumber + 2]
          break
        case 'toad':
          farray = [randomNumber + 1, randomNumber + 2, randomNumber + 3, randomNumber + this.columns, randomNumber + this.columns + 1, randomNumber + this.columns + 2]
          break
        case 'beacon':
          farray = [randomNumber, randomNumber + 1, randomNumber + this.columns, randomNumber + this.columns + 1, randomNumber + (this.columns * 2) + 2, randomNumber + (this.columns * 2) + 3, randomNumber + (this.columns * 3) + 2, randomNumber + (this.columns * 3) + 3]
          break
      }

      var checkedCells = this.grid.filter(x => x.checked === true)
      var checkedNums = []
      for (var k of checkedCells) {
        checkedNums.push(k.value)
      }

      if (this.rngCounter >= this.rows * this.columns) {
        this.rngCounter = 0
        this.$bvToast.toast('There is no space left for ' + oscillators, {
          title: 'Warning!',
          variant: 'danger'
        })
        return []
      } else {
        if (forbidden.includes(farray[0]) || farray.some(x => checkedNums.includes(x))) {
          farray = this.rng(rowLimit, columnLimit, oscillators)
        }
      }

      return farray
    },
    presets (oscillators) {
      switch (oscillators) {
        // 1 x 3 blocks
        case 'blinkers':
          var blinkerArray = this.rng(1, 3, 'blinkers')
          for (var i of blinkerArray) {
            this.grid.splice(i, 1, { value: i, checked: true, background: this.color })
          }
          this.$socket.emit('update_grid', this.grid)
          break
        // 2 x 4 blocks
        case 'toad':
          var toadArray = this.rng(2, 4, 'toad')
          for (var j of toadArray) {
            this.grid.splice(j, 1, { value: j, checked: true, background: this.color })
          }
          this.$socket.emit('update_grid', this.grid)
          break
        // 4 x 4 blocks
        case 'beacon':
          var beaconArray = this.rng(4, 4, 'beacon')
          for (var k of beaconArray) {
            this.grid.splice(k, 1, { value: k, checked: true, background: this.color })
          }
          this.$socket.emit('update_grid', this.grid)
          break
      }
    }
  },
  computed: {
    gridStyle () {
      return {
        '--width': (this.columns * this.boxSize).toString() + 'px',
        '--background-color': this.color
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: purple;
}

.grid {
  width: var(--width);
  display: grid;
  justify-content: center;
  align-content: center;
  place-items: stretch;
  grid-template-columns: repeat(auto-fit, 25px);
  grid-template-rows: repeat(auto-fit, 25px);
  grid-auto-columns: 25px;
  grid-auto-rows: 25px;
}

.white {
  color: white;
}

.bcard {
  max-width: 25rem;
}

.card-body {
  background-color: black;
}

.user-box {
  background-color: var(--background-color)
}

.menu {
  background: purple;
}

</style>
