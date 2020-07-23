<template>
  <div class="app-container">
    <h1>此页不在需要</h1>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-input v-model="searchText" placeholder="请输入查找的药品" @keyup.enter.native="onSearch" />
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="onSearch">查找</el-button>
      </el-col>

      <el-col :span="4">
        <el-button type="primary" @click="onSearch">添加新试剂</el-button>
      </el-col>
    </el-row>
    <br>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">{{ scope.$index }}</template>
      </el-table-column>
      <el-table-column label="药品名称">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="英文名称" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nameEn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="化学分子式" width="110" align="center">
        <template slot-scope="scope">{{ scope.row.formula }}</template>
      </el-table-column>
      <el-table-column label="规格">
        <template slot-scope="scope">{{ scope.row.stardard }}</template>
      </el-table-column>
      <el-table-column label="重量/容量">
        <template slot-scope="scope">{{ scope.row.weight }}</template>
      </el-table-column>
      <el-table-column class-name="status-col" label="物理状态" width="90" align="center">
        <template slot-scope="scope">{{ scope.row.status }}</template>
      </el-table-column>
      <!-- 危险、易燃易爆、普通 -->
      <el-table-column class-name="status-col" label="管控级别" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.level | levelFilter">{{ scope.row.level }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getList } from '@/api/table'

export default {
  filters: {
    levelFilter (level) {
      const statusMap = {
        易燃易爆: 'success',
        普通: 'gray',
        危险: 'danger'
      }
      return statusMap[level]
    }
  },
  data () {
    return {
      list: null,
      listLoading: false,
      searchText: ''
    }
  },

  methods: {
    onSearch () {
      console.log('fetchData')
      this.fetchData()
    },
    fetchData () {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data.items
        this.listLoading = false
        console.log('list: ' + this.list)
      })
    }
  }
}
</script>
