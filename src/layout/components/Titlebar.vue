<template>
  <div class="titlebar">
    <span class="userName" v-text="'当前用户：' + name" />

    <span class="titleName">{{ title }}</span>
    <span class="menu_buttons">
      <el-button type="primary" @click.native="toHome">返回主菜单</el-button>
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
    toHome () {
      this.$router.push('/homepage')
    }
    // async logout () {
    //   console.log('logout')
    //   await this.$store.dispatch('user/logout')
    //   this.$router.push('/homepage')
    // }
  }
}
</script>

<style lang="scss" scoped>
.titlebar {
  height: 80px;
  overflow: hidden;
  position: relative;
  background: #8894;
  box-shadow: 0 1px 2px rgba(43, 206, 105, 0.08);
  padding: 20px 20px;
  text-align: center;

  .userName {
    font-size: 16px;
    float: left;
    margin: 6px;
  }

  .titleName {
    margin: 20% 10%;
    font-size: 26px;
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
