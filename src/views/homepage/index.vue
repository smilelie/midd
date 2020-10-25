<template>
  <div class="backgroud-img">
    <div class="menu_buttons">
      <el-row type="flex" justify="center">
        <router-link to="/reagent/take">
          <el-button type="primary">取出试剂</el-button>
        </router-link>
      </el-row>
      <el-row type="flex" justify="center">
        <router-link to="/reagent/store">
          <el-button type="primary">归还试剂</el-button>
        </router-link>
      </el-row>
      <el-row type="flex" justify="center">
        <router-link to="/reagent/manager">
          <el-button type="primary">试剂管理</el-button>
        </router-link>
      </el-row>
      <el-row type="flex" justify="center">
        <el-button type="primary" @click="logout">重新登录</el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      url: '@/assets/texture/1208.jpg',
      fit: 'fill'
    }
  },
  computed: {
    // isLogin: function () {
    //   const name=this.$store.getters.name || ''
    //   console.log
    //   return name !== ''
    // }
  },
  methods: {
    isLogin: function () {
      const name = this.$store.getters.name || ''
      console.log(name)
      return name !== ''
    },
    async logout () {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    takeReagent () {
      console.log('takeReagent')
    },
    returnReagent () {
      console.log('returnReagent')
    }

  }
}

</script>

<style scoped>
.backgroud-img {
  background: url("../../assets/texture/1207.jpg");
  background-size: 100% 100%;
  height: 100%;
  position: fixed;
  width: 100%;
}

.menu_buttons {
  margin: 30% auto;
}

.el-button {
  font-size: 64px;
  margin: 30px;
  padding: 24px 80px;
}
</style>
