<template>
  <div class="app-container">
    <el-dialog title="试剂详细信息" :visible.sync="dialogDetail">
      <el-form :model="dataDetail" label-position="left">
        <el-form-item label="cas编号" label-width="60px" prop="cas">
          <el-input v-model="cas" />
        </el-form-item>
        <el-form-item label="药品名称" label-width="60px" prop="name">
          <el-input v-model="name_cn" />
        </el-form-item>
        <el-form-item label="药品英文名称" label-width="60px" prop="nameEn">
          <el-input v-model="name_en" />
        </el-form-item>
        <el-form-item label="化学分子式" label-width="60px" prop="formula">
          <el-input v-model="formula" />
        </el-form-item>
        <el-form-item label="位置信息" label-width="60px">
          <el-select v-model="locationVal" placeholder="请选择位置">
            <el-option v-for="item in locations" :key="item.id" :label="item.id" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="takeReagent" size="mini">取药</el-button>
        <el-button @click="cancel" size="mini">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="二次认证" :visible.sync="dialogAuthVisible">
      <el-form>
        <el-form-item label="用户名称" prop="authName">
          <el-input v-model="authName" />
        </el-form-item>
        <el-form-item label="用户密码" prop="name">
          <el-input v-model="authPass" type="password" show-password="true" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="authOk">确定</el-button>
        <el-button type="primary" size="mini" plain @click="authCancel">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogWaitVisible" width="30%">
      <span>等待刷卡中。。。</span>
    </el-dialog>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-input v-model="searchText" placeholder="请输入查找的药品" @keyup.enter.native="onSearch" />
      </el-col>
      <el-col :span="4">
        <el-button type="primary" size="mini" @click="onSearch">查找</el-button>
      </el-col>

      <el-col :span="4">
        <router-link :to="'/reagent/create/'">
          <el-button type="success" size="mini" @click="onCreate">添加新试剂</el-button>
        </router-link>
      </el-col>
    </el-row>
    <br />
    <el-table
      v-loading="listLoading"
      :data="list"
      size="mini"
      element-loading-text="Loading"
      border
      fit
      stripe
      highlight-current-row
      :cell-style="{padding: '0'}"
    >
      <!-- <el-table-column align="center" label="索引" width="40">
        <template slot-scope="scope">{{ scope.$index }}</template>
      </el-table-column>-->
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">{{ scope.row.cas }}</template>
      </el-table-column>
      <el-table-column label="药品名称">
        <template slot-scope="scope">{{ scope.row.names | nameFilter }}</template>
      </el-table-column>
      <el-table-column label="英文名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.names | enNameFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="化学分子式" align="center">
        <template slot-scope="scope">{{ scope.row.formula }}</template>
      </el-table-column>
      <!-- <el-table-column label="规格">
        <template slot-scope="scope">{{ scope.row.stardard }}</template>
      </el-table-column>
      <el-table-column label="重量/容量">
        <template slot-scope="scope">{{ scope.row.weight }}</template>
      </el-table-column>
      <el-table-column class-name="status-col" label="物理状态" width="90" align="center">
        <template slot-scope="scope">{{ scope.row.status }}</template>
      </el-table-column>-->
      <!-- 危险、易燃易爆、普通 -->
      <!-- <el-table-column class-name="status-col" label="管控级别" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.level | levelFilter">{{ scope.row.level }}</el-tag>
        </template>
      </el-table-column>-->
      <el-table-column class-name="option-button" label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" plain @click="showDetail(scope.row)">详细信息</el-button>
          <!-- <el-button
            type="primary"
            size="mini"
            icon="el-icon-delete"
            plain
            @click="removeReagent(scope.row.cas)"
          >删除</el-button>-->
        </template>

        <!-- <el-button type="primary" size="mini" icon="el-icon-delete" @click="removeReagent">删除</el-button> -->
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { fetchList, unlockReagent } from '@/api/reagent'
import { secondAuth } from '@/api/user'

export default {
  filters: {
    levelFilter (level) {
      const statusMap = {
        易燃易爆: 'success',
        普通: 'gray',
        危险: 'danger'
      }
      return statusMap[level]
    },
    nameFilter (names) {
      const nameList = names.map((name) => name.name_cn)
      return nameList.join()
    },
    enNameFilter (names) {
      const nameList = names.map((name) => name.name_en)
      return nameList.join()
    }
  },
  data () {
    return {
      list: null,
      listLoading: false,
      searchText: '',
      // 取药默认查询在库数据
      loc_state: 1,
      dialogDetail: false,
      dialogWaitVisible: false,
      dialogAuthVisible: false,
      dataDetail: null,
      cas: '',
      name_cn: '',
      name_en: '',
      formula: '',
      locations: null,
      locationVal: '',
      taken: '',
      // 1-take, 2-return
      takeType: 1,
      authName: '',
      authPass: ''
    }
  },

  methods: {
    takeReagent () {
      this.dialogDetail = false
      this.takeType = 1
      // this.unlock(1)
      this.showAuthDialog()
    },
    cancel () {
      this.dialogDetail = false
      // this.takeType = 2
      // this.showAuthDialog()
    },

    authOk () {
      this.dialogAuthVisible = false
      const param = {
        username: this.authName,
        password: this.authPass
      }
      secondAuth(param).then(response => {
        console.log('auth success.')
        this.token = response.token

        this.unlock()
      }).catch(err => {
        this.$message.error('用户认证失败.')
      })
    },
    authCancel () {
      this.dialogAuthVisible = false
    },

    showAuthDialog () {
      this.dialogAuthVisible = true
    },

    unlock () {
      this.$message.info('开门中，请稍等。。。')
      const param = {
        st_id: this.locationVal,
        token: '',
        type: this.takeType
      }
      debugger
      unlockReagent(param).then(response => {
        this.list = response.data.items
        this.listLoading = false
        console.log('list: ' + this.list)

        // 等待刷卡信息
        this.dialogWaitVisible = true
      }).then(response => {
        this.dialogWaitVisible = false
        this.$message.success('刷卡成功')
      }).catch(err => {
        this.dialogWaitVisible = false
        this.$message.error('数据异常！')
      })
    },
    removeReagent (id) {
      if (this.list === null) {
        return
      }
      this.list.some((item, i) => {
        if (item.id === id) {
          this.list.splice(i, 1)
          // 在数组的some方法中，如果return true，就会立即终止这个数组的后续循环,所以相比较foreach，如果想要终止循环，那么建议使用some
          return
        }
      })
    },
    showDetail (data) {
      console.log(data)
      this.dataDetail = data
      this.cas = data.cas
      this.name_cn = data.names[0].name_cn
      this.name_en = data.names[0].name_en
      this.formula = data.formula
      this.dialogDetail = true
      this.locations = data.location
    },
    onSearch () {
      console.log('fetchData')
      this.fetchData()
    },
    onCreate () {
      console.log('create reagent.')
      // this.createReagent()
      // this.$router.push('/reagent/create')
    },
    fetchData () {
      this.listLoading = true
      var param = {
        's': this.searchText,
        'loc_state': this.loc_state,
        has_loc: true,
        has_all_state: false
      }
      fetchList(param).then(response => {
        this.list = response.data
        this.listLoading = false
        console.log('list: ' + this.list)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  font-size: 9px;
}

.el-table--mini td,
.el-table--mini th {
  padding: 0;
}

.el-form-item {
  font-size: 8px;
  margin-bottom: 2px;
}
</style>
