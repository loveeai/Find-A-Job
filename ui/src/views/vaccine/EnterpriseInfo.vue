<template>
  <div class="enterprise-page">
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>企业管理</el-breadcrumb-item>
        <el-breadcrumb-item>企业信息管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <el-row :gutter="20" class="toolbar">
        <el-col :span="5">
          <el-input v-model="inputName" placeholder="请输入企业名称" clearable />
        </el-col>
        <el-col :span="5">
          <el-input v-model="inputAddress" placeholder="请输入企业地址" clearable />
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedStatus" placeholder="请选择状态" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-search" @click="getEnterpriseList">搜索</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="showAddDialog">新增企业</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="danger" @click="multipleDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <el-table
        :data="enterpriseList"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column type="index" :index="getTableIndex" label="" width="60" />
        <el-table-column label="Logo" width="92">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.logo"
              :src="resolveImageUrl(scope.row.logo)"
              fit="cover"
              class="logo-image"
            />
            <div v-else class="logo-placeholder">无</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="企业名称" min-width="180" />
        <el-table-column prop="scale" label="企业规模" min-width="120" />
        <el-table-column prop="employeeCount" label="员工数量" width="100" />
        <el-table-column prop="industry" label="所属行业" min-width="120" />
        <el-table-column prop="address" label="企业地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="企业描述" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="150">
          <template slot-scope="scope">
            <div class="status-switch">
              <el-switch
                :value="Number(scope.row.status) === 1"
                active-color="#13ce66"
                inactive-color="#ff6b6b"
                @change="value => handleStatusChange(scope.row, value)"
              />
              <span class="status-text">{{ Number(scope.row.status) === 1 ? "正常" : "禁用" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showEditDialog(scope.row.id)">修改</el-button>
            <el-button type="danger" size="mini" @click="deleteEnterpriseById(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <el-dialog title="新增企业" :visible.sync="addDialogVisible" width="720px" @close="resetAddDialog">
      <el-form :model="addForm" :rules="enterpriseRules" ref="addFormRef" label-width="110px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="Logo">
          <el-upload
            class="logo-uploader"
            :action="uploadAction"
            :show-file-list="true"
            :limit="1"
            list-type="picture-card"
            :file-list="addUploadList"
            :on-success="handleAddUploadSuccess"
            :on-remove="handleAddUploadRemove"
            :before-upload="beforeLogoUpload"
            :on-exceed="handleLogoExceed"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="企业规模" prop="scale">
          <el-input v-model="addForm.scale" />
        </el-form-item>
        <el-form-item label="员工数量" prop="employeeCount">
          <el-input v-model.number="addForm.employeeCount" type="number" />
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-input v-model="addForm.industry" />
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="addForm.address" />
        </el-form-item>
        <el-form-item label="企业描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="addStatusSwitch" active-color="#13ce66" inactive-color="#ff6b6b" />
          <span class="dialog-status-text">{{ addStatusSwitch ? "正常" : "禁用" }}</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addEnterprise">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改企业信息" :visible.sync="editDialogVisible" width="720px" @close="resetEditDialog">
      <el-form :model="editForm" :rules="enterpriseRules" ref="editFormRef" label-width="110px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Logo">
          <el-upload
            class="logo-uploader"
            :action="uploadAction"
            :show-file-list="true"
            :limit="1"
            list-type="picture-card"
            :file-list="editUploadList"
            :on-success="handleEditUploadSuccess"
            :on-remove="handleEditUploadRemove"
            :before-upload="beforeLogoUpload"
            :on-exceed="handleLogoExceed"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="企业规模" prop="scale">
          <el-input v-model="editForm.scale" />
        </el-form-item>
        <el-form-item label="员工数量" prop="employeeCount">
          <el-input v-model.number="editForm.employeeCount" type="number" />
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-input v-model="editForm.industry" />
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="editForm.address" />
        </el-form-item>
        <el-form-item label="企业描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="editStatusSwitch" active-color="#13ce66" inactive-color="#ff6b6b" />
          <span class="dialog-status-text">{{ editStatusSwitch ? "正常" : "禁用" }}</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editEnterprise">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
function createEmptyEnterprise() {
  return {
    id: null,
    name: "",
    logo: "",
    scale: "",
    employeeCount: null,
    industry: "",
    address: "",
    description: "",
    status: 1
  };
}

export default {
  data() {
    return {
      queryInfo: {
        name: "",
        address: "",
        status: null,
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      inputName: "",
      inputAddress: "",
      selectedStatus: "",
      enterpriseList: [],
      multipleSelection: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: createEmptyEnterprise(),
      editForm: createEmptyEnterprise(),
      addUploadList: [],
      editUploadList: [],
      addStatusSwitch: true,
      editStatusSwitch: true,
      uploadAction: "http://127.0.0.1:8182/upload/logo",
      statusOptions: [
        { id: 1, name: "正常" },
        { id: 0, name: "禁用" }
      ],
      enterpriseRules: {
        name: [{ required: true, message: "请输入企业名称", trigger: "blur" }],
        scale: [{ required: true, message: "请输入企业规模", trigger: "blur" }],
        employeeCount: [{ required: true, message: "请输入员工数量", trigger: "blur" }],
        industry: [{ required: true, message: "请输入所属行业", trigger: "blur" }],
        address: [{ required: true, message: "请输入企业地址", trigger: "blur" }],
        description: [{ required: true, message: "请输入企业描述", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getEnterpriseList();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    createEmptyEnterprise() {
      return createEmptyEnterprise();
    },

    resolveImageUrl(value) {
      if (!value) {
        return "";
      }
      if (/^https?:\/\//.test(value)) {
        return value;
      }
      return `http://127.0.0.1:8182${value}`;
    },

    normalizeFileList(logo) {
      if (!logo) {
        return [];
      }
      return [
        {
          name: "logo",
          url: this.resolveImageUrl(logo)
        }
      ];
    },

    async getEnterpriseList() {
      this.queryInfo.name = this.inputName.trim();
      this.queryInfo.address = this.inputAddress.trim();
      this.queryInfo.status = this.selectedStatus === "" ? null : Number(this.selectedStatus);

      const resp = await axios.get("enterprise", { params: this.queryInfo });
      this.enterpriseList = resp.data.data || [];
      this.total = Number(resp.data.total || 0);
      this.queryInfo.pageSize = Number(resp.data.pageSize || this.queryInfo.pageSize);
      this.queryInfo.pageNum = Number(resp.data.pageNum || this.queryInfo.pageNum);
    },

    handleSizeChange(pageSize) {
      this.queryInfo.pageSize = pageSize;
      this.getEnterpriseList();
    },

    handleCurrentChange(pageNum) {
      this.queryInfo.pageNum = pageNum;
      this.getEnterpriseList();
    },

    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },

    showAddDialog() {
      this.addDialogVisible = true;
      this.addForm = this.createEmptyEnterprise();
      this.addStatusSwitch = true;
      this.addUploadList = [];
    },

    async showEditDialog(id) {
      const resp = await axios.get(`enterprise/${id}`);
      this.editForm = {
        ...this.createEmptyEnterprise(),
        ...(resp.data.data || {})
      };
      this.editStatusSwitch = Number(this.editForm.status) === 1;
      this.editUploadList = this.normalizeFileList(this.editForm.logo);
      this.editDialogVisible = true;
    },

    resetAddDialog() {
      if (this.$refs.addFormRef) {
        this.$refs.addFormRef.resetFields();
      }
      this.addForm = this.createEmptyEnterprise();
      this.addStatusSwitch = true;
      this.addUploadList = [];
    },

    resetEditDialog() {
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.resetFields();
      }
      this.editForm = this.createEmptyEnterprise();
      this.editStatusSwitch = true;
      this.editUploadList = [];
    },

    beforeLogoUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) {
        this.$message.error("请上传图片格式的 Logo");
      }
      if (!isLt2M) {
        this.$message.error("Logo 大小不能超过 2MB");
      }
      return isImage && isLt2M;
    },

    handleLogoExceed() {
      this.$message.warning("Logo 只能上传一张");
    },

    handleAddUploadSuccess(response) {
      this.addForm.logo = (response && response.data) || "";
      this.addUploadList = this.normalizeFileList(this.addForm.logo);
    },

    handleEditUploadSuccess(response) {
      this.editForm.logo = (response && response.data) || "";
      this.editUploadList = this.normalizeFileList(this.editForm.logo);
    },

    handleAddUploadRemove() {
      this.addForm.logo = "";
      this.addUploadList = [];
    },

    handleEditUploadRemove() {
      this.editForm.logo = "";
      this.editUploadList = [];
    },

    async addEnterprise() {
      this.addForm.status = this.addStatusSwitch ? 1 : 0;
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const resp = await axios.post("enterprise", this.addForm);
        if (resp.data.code !== 200) {
          this.$message.error("新增企业失败");
          return;
        }
        this.$message.success("新增企业成功");
        this.addDialogVisible = false;
        this.getEnterpriseList();
      });
    },

    async editEnterprise() {
      this.editForm.status = this.editStatusSwitch ? 1 : 0;
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const resp = await axios.put("enterprise", this.editForm);
        if (resp.data.code !== 200) {
          this.$message.error("修改企业信息失败");
          return;
        }
        this.$message.success("修改企业信息成功");
        this.editDialogVisible = false;
        this.getEnterpriseList();
      });
    },

    async handleStatusChange(row, value) {
      const originalStatus = Number(row.status) === 1 ? 1 : 0;
      const nextStatus = value ? 1 : 0;
      row.status = nextStatus;

      try {
        const resp = await axios.put("enterprise", {
          ...row,
          status: nextStatus
        });
        if (resp.data.code !== 200) {
          row.status = originalStatus;
          this.$message.error("企业状态更新失败");
          return;
        }
        this.$message.success(nextStatus === 1 ? "企业已启用" : "企业已禁用");
      } catch (error) {
        row.status = originalStatus;
        this.$message.error("企业状态更新失败");
      }
    },

    async multipleDelete() {
      if (!this.multipleSelection.length) {
        this.$message.warning("请先选择要删除的企业");
        return;
      }

      const resp = await this.$confirm(
        "此操作将永久删除选中的企业，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (resp === "cancel") {
        return this.$message.info("已取消删除");
      }

      const ids = this.multipleSelection.map(item => item.id);
      const result = await axios.delete(`enterprise/ids/${ids}`);
      if (result.data.code !== 200) {
        this.$message.error("批量删除企业失败");
        return;
      }
      this.$message.success("批量删除企业成功");
      this.getEnterpriseList();
    },

    async deleteEnterpriseById(id) {
      const resp = await this.$confirm(
        "此操作将永久删除该企业，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (resp === "cancel") {
        return this.$message.info("已取消删除");
      }

      const result = await axios.delete(`enterprise/${id}`);
      if (result.data.code !== 200) {
        this.$message.error("删除企业失败");
        return;
      }
      this.$message.success("删除企业成功");
      this.getEnterpriseList();
    }
  }
};
</script>

<style scoped>
.board {
  margin-bottom: 20px;
}

.box-card {
  margin: 0 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.logo-image,
.logo-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 10px;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-text,
.dialog-status-text {
  font-size: 13px;
  color: #606266;
}
</style>
