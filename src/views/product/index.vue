<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.deleteStatus" clearable class="filter-item" placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-input v-model="listQuery.condition" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <treeselect
        v-model="listQuery.categoryId"
        style="width: 200px"
        class="filter-item"
        placeholder="分类"
        :options="categorys"
        :normalizer="normalizer"
        :show-count="true"
      />
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="fetchData">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="照片" width="110" align="center">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.mainImg"
            style="width: 70px; height: 70px"
            :src="scope.row.mainImg"
            fit="fill"
          />
        </template>
      </el-table-column>
      <el-table-column label="商品" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.productName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.salesStock }}
        </template>
      </el-table-column>
      <el-table-column label="零售价" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.retailPrice }}
        </template>
      </el-table-column>
      <el-table-column label="成本价" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.storagePrice }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.deleteStatus | statusFilter">{{ scope.row.deleteStatus | statusNameFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button :disabled="row.deleteStatus==0" size="mini" type="danger" @click="handleDelete(row)">
            下架
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="temp.productName" />
        </el-form-item>
        <el-form-item label="货号" prop="articleNumber">
          <el-input v-model="temp.articleNumber" />
        </el-form-item>
        <el-form-item label="条码" prop="barCode">
          <el-input v-model="temp.barCode" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <treeselect
            v-model="temp.categoryId"
            class="filter-item"
            placeholder="请选择分类"
            :options="categorys"
            :normalizer="normalizer"
            :show-count="true"
          />
        </el-form-item>
        <el-form-item label="零售价" prop="retailPrice">
          <el-input v-model="temp.retailPrice" type="number" />
        </el-form-item>
        <el-form-item label="状态" prop="deleteStatus">
          <el-select v-model="temp.deleteStatus" class="filter-item" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-upload
        :action="uploadProps.action"
        :headers="uploadProps.headers"
        list-type="picture-card"
        :file-list="temp.fileList"
        :on-success="handleUploadSuccess"
        :on-remove="handleFileRemove"
      >
        <i class="el-icon-plus" />
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, deleteProduct, productDetail, create, update } from '@/api/product'
import { categorys } from '@/api/product-category'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const temp = {
  id: undefined,
  productName: '',
  articleNumber: '',
  barCode: '',
  categoryId: undefined,
  retailPrice: undefined,
  fileList: []
}

const statusOptions = [
  { key: 1, display_name: '上架' },
  { key: 0, display_name: '下架' }
]

const uploadProps = {
  action: process.env.VUE_APP_BASE_API + '/upload/img',
  headers: {
    token: getToken()
  }
}

export default {
  components: { Pagination, Treeselect },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    statusNameFilter(status) {
      const statusMap = {
        1: '上架',
        0: '下架'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listQuery: {
        pageNum: 1,
        limit: 20,
        deleteStatus: 1,
        categoryId: undefined,
        condition: undefined,
        orderBy: 'create_time desc'
      },
      statusOptions,
      listLoading: true,
      categorys: [],
      normalizer(node) {
        return {
          id: node.id,
          label: node.categoryName,
          children: node.categoryVoList
        }
      },
      dialogStatus: '',
      dialogFormVisible: false,
      temp,
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        productName: [{ required: true, message: 'productName is required', trigger: 'change' }],
        articleNumber: [{ required: true, message: 'articleNumber is required', trigger: 'change' }],
        barCode: [{ required: true, message: 'barCode is required', trigger: 'change' }],
        categoryId: [{ required: true, message: 'categoryId is required', trigger: 'change' }],
        retailPrice: [{ required: true, message: 'retailPrice is required', trigger: 'change' }],
        deleteStatus: [{ required: true, message: 'status is required', trigger: 'change' }]
      },
      uploadProps
    }
  },
  computed: {
  },
  created() {
    this.fetchData()
    this.getCategory()
  },
  methods: {
    resetTemp() {
      this.temp = Object.assign({}, temp)
    },
    fetchData() {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.total = response.data.total
        this.list = response.data.results
        this.listLoading = false
      })
    },
    getCategory() {
      categorys().then(res => {
        const categorys = [
          {
            id: 0,
            categoryName: '全部分类',
            categoryVoList: res.data
          }
        ]
        this.categorys = categorys
      })
    },
    handleDelete(row) {
      deleteProduct(row.id).then((response) => {
        this.fetchData()
        this.$notify({
          title: 'Success',
          message: response.msg || response.data || 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = undefined
          if (this.temp.fileList && this.temp.fileList.length > 0) {
            this.temp.mainImg = this.temp.fileList[0].url
            this.temp.subImgs = this.temp.fileList.map(obj => obj.url).join(',')
          } else {
            this.temp.mainImg = undefined
            this.temp.subImgs = undefined
          }
          create(this.temp).then((response) => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.msg || 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      productDetail(row.id).then(res => {
        this.temp = Object.assign({}, res.data) // copy obj
        if (res.data.subImgs) {
          const fileList = []
          res.data.subImgs.split(',').forEach(item => {
            fileList.push({
              url: item
            })
          })
          this.temp.fileList = fileList
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.temp.fileList && this.temp.fileList.length > 0) {
            this.temp.mainImg = this.temp.fileList[0].url
            this.temp.subImgs = this.temp.fileList.map(obj => obj.url).join(',')
          } else {
            this.temp.mainImg = undefined
            this.temp.subImgs = undefined
          }
          const tempData = Object.assign({}, this.temp)
          update(tempData).then((response) => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.msg || response.data || 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUploadSuccess(response, file, fileList) {
      const index = fileList.indexOf(file)
      fileList[index].url = response.data.url
      this.temp.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.temp.fileList = fileList
    }
  }
}
</script>
<style scoped>
  .filter-container {
    padding-bottom: 10px;
  }
  .filter-container .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
</style>
