<template>
  <div class="titlebar">
    <span class="userName" v-text="'当前用户：' + name" />

    <span class="titleName">{{ title }}</span>
    <span class="menu_buttons">
      <el-button type="primary" @click.native="logout">退出登录</el-button>
    </span>
  </div>
</template>

<script>

export default {
  name: 'Titlebar',
  data () {
    return {
      title: '试剂管理系统'
    }
  },
  computed: {
    name () {
      return this.$store.getters.name
    }
  },
  methods: {
    async logout () {
      console.log('logout')
      await this.$store.dispatch('user/logout')
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)sr
      this.$router.push('/homepage')
    }
  }
}
</script>

<style lang="scss" scoped>
.titlebar {
  height: 80px;
  overflow: hidden;
  position: relative;
  background: rgb(200, 207, 186);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 20px 20px;
  text-align: center;

  .userName {
    font-size: 18px;
    position: relative;
    float: left;
    margin: 10px;
  }

  .titleName {
    width: 500px;
    position: relative;
    margin: 20% 10%;
    font-size: 26px;
    letter-spacing: 4px;
  }
  .menu_buttons {
    position: relative;
    float: right;
    margin: 0 20px;
  }
}
</style>
