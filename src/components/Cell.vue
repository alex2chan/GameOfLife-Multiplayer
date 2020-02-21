<template lang="html">
  <div :class="checked ? 'checked' : 'unchecked'" class="cell" @click="onClick()" :style="[bg]">
  </div>
</template>

<script>
export default {
  name: 'Cell',
  props: {
    cell: {
      type: Object
    },
    background: {
      type: String
    }
  },
  data () {
    return {
      checked: false
    }
  },
  created () {
    if (this.cell.background !== 'white') {
      this.$socket.emit('update_cell', this.cell)
    }
  },
  methods: {
    onClick () {
      if (this.checked) {
        if (this.cell.background === this.background) {
          this.checked = false
          this.cell.checked = false

          this.$socket.emit('update_cell', this.cell)
        }
      } else {
        this.checked = true
        this.cell.checked = true
        this.cell.background = this.background

        this.$socket.emit('update_cell', this.cell)
      }
    }
  },
  watch: {
    // watch the cells as the grid updates
    cell: function (newVal, oldVal) {
      this.checked = newVal.checked
    }
  },
  computed: {
    bg () {
      return {
        '--background-color': this.cell.background
      }
    }
  }
}
</script>

<style lang="css" scoped>
.cell {
  border: 1px solid black;
}
.cell:hover {
  background-color: rgba(255, 105, 180, 0.9);
}
.checked {
  background-color: var(--background-color);
}
.unchecked {
  background-color: white;
}
</style>
