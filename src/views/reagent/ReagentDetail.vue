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
      <el-form-item label="cas编号" prop="cas">
        <el-input v-model="postForm.cas" />
      </el-form-item>
      <el-form-item label="药品名称" prop="name">
        <el-input v-model="postForm.name_cn" />
      </el-form-item>
      <el-form-item label="药品英文名称" prop="nameEn">
        <el-input v-model="postForm.name_en" />
      </el-form-item>
      <el-form-item label="化学分子式" prop="formula">
        <el-input v-model="postForm.formula" />
      </el-form-item>
      <!-- <el-form-item label="规格" prop="stardand">
        <el-input v-model="postForm.stardand" />
      </el-form-item>
      <el-form-item label="重量/容量" prop="weight">
        <el-input v-model="postForm.weight" />
      </el-form-item>
      <el-form-item label="物理状态" prop="status">
        <el-input v-model="postForm.status" />
      </el-form-item>-->
      <el-form-item label="管控级别" prop="level">
        <el-select v-model="postForm.ctrl_level" placeholder="普通">
          <el-option label="普通" value="0" />
          <el-option label="危险" value="1" />
          <el-option label="易燃易爆" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item class="postInfo-container-item">
        <el-button type="primary" size="mini" @click="submitForm">添加</el-button>
        <el-button size="mini" plain @click="resetForm('postForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { fetchReagent, createReagent } from '@/api/reagent'
const defaultForm = {
  cas: 'cas-1011',
  name_cn: '农夫山泉', // 药品名称
  name_en: 'water hill', // 英文名称
  formula: 'H2O', // 分子式
  ctrl_level: '', // 管控级别
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
        nameEn: [{ validator: validateRequire }],
        cas: [{ validator: validateRequire }],
        formula: [{ validator: validateRequire }]
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
          createReagent(this.postForm).then(response => {
            console.log('success save data' + response)
            this.$message({
              title: '成功',
              message: '数据保存成功',
              type: 'success',
              duration: 2000
            }).catch(err => {
              console.log(err)
              this.$message.err(err)
              // this.loading = false
            })
          })

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

  padding: 10px 15px 10px 15px;

  @include clearfix;
  margin-bottom: 10px;

  .postInfo-container-item {
    float: right;
  }
}
</style>


