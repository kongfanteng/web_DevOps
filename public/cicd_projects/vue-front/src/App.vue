<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.id }}5555: {{ user.name }}
    </li>
  </ul>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data(){
    return {
      users: []
    }
  },
  async mounted(){
    const { data } = await axios.get('/api/users')
    this.users = data;
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
