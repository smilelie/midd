<template>
  <div class="createPost-container">
    <el-form
      ref="postForm"
      :model="postForm"
      :rules="rules"
      label-width="120px"
      label-position="left"
      class="form-container"
    >
      <el-form-item label="药品名称" prop="name">
        <el-input v-model="postForm.name" />
      </el-form-item>
      <el-form-item label="药品英文名称" prop="nameEn">
        <el-input v-model="postForm.nameEn" />
      </el-form-item>
      <el-form-item label="化学分子式" prop="formula">
        <el-input v-model="postForm.formula" />
      </el-form-item>
      <el-form-item label="规格" prop="stardand">
        <el-input v-model="postForm.stardand" />
      </el-form-item>
      <el-form-item label="重量/容量" prop="weight">
        <el-input v-model="postForm.weight" />
      </el-form-item>
      <el-form-item label="物理状态" prop="status">
        <el-input v-model="postForm.status" />
      </el-form-item>
      <el-form-item label="管控级别" prop="level">
        <el-select v-model="postForm.level" placeholder="请选择管控级别">
          <el-option label="普通" value="普通" />
          <el-option label="危险" value="危险" />
          <el-option label="易燃易爆" value="易燃易爆" />
        </el-select>
      </el-form-item>
      <el-form-item class="postInfo-container-item">
        <el-button type="primary" @click="submitForm">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { fetchReagent } from '@/api/reagent'
const defaultForm = {
  name: '', // 药品名称
  nameEn: '', // 英文名称
  formula: '', // 分子式
  stardard: '', // 规格
  weight: '', // 重量、容量
  status: '', // 物理状态
  level: '普通', // 管控级别
  id: undefined
}

export default {
  name: 'ReagentDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }

    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        name: [{ validator: validateRequire }],
        nameEn: [{ validator: validateRequire }]
      },
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength () {
      return this.postForm.content_short.length
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get () {
        return (+new Date(this.postForm.display_time))
      },
      set (val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created () {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData (id) {
      fetchReagent(id).then(response => {
        this.postForm = response.data

        // just for test
        // this.postForm.title += `   Article Id:${this.postForm.id}`
        // this.postForm.content_short += `   Article Id:${this.postForm.id}`

        // set tagsview title
        // this.setTagsViewTitle()

        // set page title
        // this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle () {
      const title = 'Edit Reagent'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle () {
      const title = 'Edit Reagent'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm () {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: '成功',
            message: '数据保存成功',
            type: 'success',
            duration: 2000
          })
          // this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      console.log('resetForm')
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  padding: 40px 45px 20px 50px;

  @include clearfix;
  margin-bottom: 10px;

  .postInfo-container-item {
    float: right;
  }
}
</style>
