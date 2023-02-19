<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">
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
      <el-table-column label="帐号" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.userName }}
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userNick }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.userEmail }}
        </template>
      </el-table-column>
      <el-table-column label="性别" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.userSex }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.deleteStatus | statusFilter">{{ scope.row.deleteStatus | statusNameFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <!-- <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            Publish
          </el-button>
          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            Draft
          </el-button> -->
          <el-button size="mini" @click="handleAddRole(row)">
            分配角色
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="帐号" prop="userName">
          <el-input v-if="dialogStatus==='create'" v-model="temp.userName" />
          <el-input v-else v-model="temp.userName" disabled="disabled" />
        </el-form-item>
        <el-form-item label="昵称" prop="userNick">
          <el-input v-model="temp.userNick" />
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="temp.userEmail" type="email" />
        </el-form-item>
        <el-form-item label="性别" prop="userSex">
          <el-select v-model="temp.userSex" class="filter-item" placeholder="请选择">
            <el-option v-for="item in sexOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="userPassword">
          <el-input v-model="temp.userPassword" type="password" />
        </el-form-item>
        <el-form-item label="状态" prop="deleteStatus">
          <el-select v-model="temp.deleteStatus" class="filter-item" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
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

    <el-dialog :visible.sync="dialogVisible" title="分配角色">
      <el-form :model="temp" label-width="80px" label-position="left">
        <!-- <el-form-item label="Name">
          <el-input v-model="role.name" placeholder="Role Name" />
        </el-form-item>
        <el-form-item label="Desc">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Role Description"
          />
        </el-form-item> -->
        <el-form-item label="角色">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="rolesData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, createUser, deleteUser, updateUser } from '@/api/user'
import { vaildRoleList, assignRole } from '@/api/role'

const sexOptions = [
  { key: '男', display_name: '男' },
  { key: '女', display_name: '女' },
  { key: '保密', display_name: '保密' }
]

const statusOptions = [
  { key: 1, display_name: '启用' },
  { key: 0, display_name: '禁用' }
]

const temp = {
  id: undefined,
  userName: '',
  userNick: '',
  userEmail: '',
  userSex: '保密',
  userPassword: '',
  deleteStatus: 1,
  roleList: []
}

export default {
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
        1: '启用',
        0: '禁用'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogVisible: false,
      dialogFormVisible: false,
      sexOptions,
      statusOptions,
      dialogStatus: '',
      roles: [],
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'roleName'
      },
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      temp,
      rules: {
        userName: [{ required: true, message: 'userName is required', trigger: 'change' }],
        userNick: [{ required: true, message: 'userNick is required', trigger: 'change' }],
        deleteStatus: [{ required: true, message: 'status is required', trigger: 'change' }],
        userPassword: [{ required: true, message: 'password is required', trigger: 'change' }]
      }
    }
  },
  computed: {
    rolesData() {
      return this.roles
    }
  },
  created() {
    this.fetchData()
    this.getRoles()
  },
  methods: {
    async getRoles() {
      const res = await vaildRoleList()
      this.roles = this.generateRoles(res.data)
    },
    fetchData() {
      this.listLoading = true
      list().then(response => {
        console.log(response)
        this.list = response.data
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = Object.assign({}, temp)
    },
    handleCreate() {
      this.rules.userPassword[0].required = true
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
          createUser(this.temp).then((response) => {
            temp.id = response.data.id
            this.list.unshift(this.temp)
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
      this.rules.userPassword[0].required = false
      this.temp = Object.assign({}, row) // copy obj
      this.temp.userPassword = ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData).then((response) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
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
    handleDelete(row, index) {
      deleteUser(row.id).then((response) => {
        this.$notify({
          title: 'Success',
          message: response.msg || response.data || 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoles(roles) {
      const res = []

      for (const role of roles) {
        const data = {
          id: role.id,
          roleName: role.roleName
        }
        res.push(data)
      }
      return res
    },
    generateArr(roles) {
      const data = []
      roles.forEach(role => {
        data.push(role)
      })
      return data
    },
    handleAddRole(row) {
      const roleList = row.roleList
      this.dialogVisible = true
      this.checkStrictly = true
      const roles = this.generateRoles(roleList)
      this.temp = Object.assign({}, row) // copy obj
      this.$nextTick(() => {
        this.$refs.tree.setCheckedNodes(this.generateArr(roles))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    confirmRole() {
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      assignRole({
        userName: this.temp.userName,
        roles: checkedKeys
      }).then((response) => {
        this.dialogVisible = false
        this.$notify({
          title: 'Success',
          message: response.msg || response.data || 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
      })
    }
  }
}
</script>
<style scoped>
  .filter-container {
    padding-bottom: 10px;
  }
</style>
