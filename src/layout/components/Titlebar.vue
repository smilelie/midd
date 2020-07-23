<template>
  <div class="titlebar">
    <span class="userName" v-text="'当前用户：' + name" />

    <span class="titleName">{{ title }}</span>
    <span class="menu_buttons">
      <el-button type="primary" size="mini" @click.native="logout">返回</el-button>
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
  height: 30px;
  overflow: hidden;
  position: relative;
  background: #889aa4;
  box-shadow: 0 1px 2px rgba(0, 21, 41, 0.08);
  padding: 4px 2px;
  text-align: center;

  .userName {
    font-size: 8px;
    float: left;
    margin: 6px;
  }

  .titleName {
    margin: 20% 10%;
    font-size: 14px;
    letter-spacing: 2px;
  }
  .menu_buttons {
    float: right;
    margin: 0 20px;

    // .el-button--mini {
    //   padding: 4px 10px;
    //   font-size: 8px;
    // }
  }
}
</style>
