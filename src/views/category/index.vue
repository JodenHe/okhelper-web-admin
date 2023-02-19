<template>
  <div class="app-container">
    <el-input v-model="filterText" placeholder="Filter keyword" style="margin-bottom:30px;" />

    <el-tree
      ref="tree2"
      :data="categorys"
      :props="defaultProps"
      :filter-node-method="filterNode"
      :render-content="renderContent"
      :expand-on-click-node="false"
      class="filter-tree"
      default-expand-all
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="temp.categoryName" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentCategoryName">
          <el-input v-model="temp.parentCategoryName" disabled="disabled" />
        </el-form-item>
        <el-form-item label="分类描述" prop="remarks">
          <el-input v-model="temp.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
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
import { categorys, remove, create, update } from '@/api/product-category'

const temp = {
  id: undefined,
  superId: undefined,
  categoryName: '',
  parentCategoryName: '',
  remarks: ''
}

export default {

  data() {
    return {
      filterText: '',
      categorys: [],
      dialogStatus: '',
      dialogFormVisible: false,
      temp,
      defaultProps: {
        children: 'categoryVoList',
        label: 'categoryName'
      },
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        categoryName: [{ required: true, message: 'categoryName is required', trigger: 'change' }]
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.getCategory()
  },
  methods: {
    resetTemp() {
      this.temp = Object.assign({}, temp)
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
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.categoryVoList || parent.data
      const index = children.findIndex(d => d.id === data.id)
      remove(data.id).then(res => {
        children.splice(index, 1)
        this.$notify({
          title: 'Success',
          message: res.msg || '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.categoryName.indexOf(value) !== -1
    },
    add(data) {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.temp.superId = data.id
      this.temp.parentCategoryName = data.categoryName
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = undefined
          create(this.temp).then((response) => {
            this.getCategory()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.msg || response.data || 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    edit(node, data) {
      const parentData = node.parent.data
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.temp = Object.assign({}, data) // copy obj
      this.temp.id = data.id
      this.temp.superId = parentData.id
      this.temp.parentCategoryName = parentData.categoryName
      this.temp.categoryName = data.categoryName
      this.temp.remarks = data.remarks
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then((response) => {
            this.getCategory()
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
    renderContent(h, { node, data, store }) {
      /*eslint jsx-quotes: ["error", "prefer-double"]*/
      return (
        <span class="custom-tree-node">
          <el-tooltip content={ data.remarks || data.categoryName } placement="bottom" effect="light">
            <span>{ node.label }</span>
          </el-tooltip>
          <span>
            <el-button size="mini" type="text" on-click={ () => this.add(data) }>新增</el-button>
            {
              data.id !== 0 ? (<el-button size="mini" type="text" on-click={ () => this.edit(node, data) }>编辑</el-button>) : ''
            }
            {
              node.isLeaf ? (<el-button size="mini" type="text" on-click={ () => this.remove(node, data) }>删除</el-button>) : ''
            }
          </span>
        </span>
      )
    }
  }
}
</script>

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
