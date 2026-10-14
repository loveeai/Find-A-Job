<template>
  <div>
    <table>
      <tr>
        <td></td>
        <td></td>
      </tr>
      <tr v-for="items in movieAge">
        <td>{{items.movieAgeId}}</td>
        <td>{{items.movieAgeName}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: "Book",
  data(){
    return{
      movieAge: []
    }
  },
  created() {
    const _this = this
    axios.get('http://localhost:8182/sysMovieAge').then(function (resp){
        _this.movieAge = resp.data.data;
    })
  }
}
</script>

<style scoped>

</style>