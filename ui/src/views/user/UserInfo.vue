<template>
  <div>
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>企业用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <el-row :gutter="16">
        <el-col :span="5">
          <el-input v-model="filters.userName" placeholder="用户名" clearable />
        </el-col>
        <el-col :span="5">
          <el-input v-model="filters.phoneNumber" placeholder="手机号" clearable />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.auditStatus" placeholder="审核状态" clearable>
            <el-option v-for="item in auditOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-search" @click="getUserList">搜索</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="showAddDialog">新增企业用户</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="danger" @click="multipleDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48"></el-table-column>
        <el-table-column type="index" :index="getTableIndex" label="" width="60"></el-table-column>
        <el-table-column prop="userName" label="用户名" min-width="140"></el-table-column>
        <el-table-column prop="phoneNumber" label="手机号" min-width="140"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
        <el-table-column prop="company.name" label="所属企业" min-width="180"></el-table-column>
        <el-table-column label="审核状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="auditTagType(scope.row.auditStatus)" size="small">
              {{ auditStatusText(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="90">
          <template slot-scope="scope">
            {{ scope.row.sex ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="300">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showEditDialog(scope.row.userId)">修改</el-button>
            <el-button
              v-if="Number(scope.row.auditStatus) !== 1"
              type="success"
              size="mini"
              @click="changeAuditStatus(scope.row, 1)"
            >
              审核通过
            </el-button>
            <el-button
              v-if="Number(scope.row.auditStatus) !== 2"
              type="warning"
              size="mini"
              @click="changeAuditStatus(scope.row, 2)"
            >
              驳回
            </el-button>
            <el-button type="danger" size="mini" @click="deleteUserById(scope.row.userId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="queryInfo.pageNum"
        :page-size="queryInfo.pageSize"
        :page-sizes="[5, 7, 10]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-card>

    <el-dialog title="新增企业用户" :visible.sync="addDialogVisible" width="60%" @close="resetAddDialog">
      <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="120px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="addForm.phoneNumber"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="addForm.sex" placeholder="请选择性别">
            <el-option v-for="item in genderOptions" :key="String(item.value)" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业" prop="companyId">
          <el-select v-model="addForm.companyId" placeholder="请选择所属企业" filterable clearable>
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="auditStatus">
          <el-select v-model="addForm.auditStatus" placeholder="请选择审核状态">
            <el-option v-for="item in auditOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            ref="pictureRef"
            action=""
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :file-list="pics"
            :on-change="handleChange"
            :on-exceed="handleExceed"
          >
            <i slot="default" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{ file }">
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改企业用户" :visible.sync="editDialogVisible" width="60%" @close="resetEditDialog">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="120px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editForm.password" type="password" show-password placeholder="不修改可留空"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="editForm.phoneNumber"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="editForm.sex" placeholder="请选择性别">
            <el-option v-for="item in genderOptions" :key="String(item.value)" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业" prop="companyId">
          <el-select v-model="editForm.companyId" placeholder="请选择所属企业" filterable clearable>
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="auditStatus">
          <el-select v-model="editForm.auditStatus" placeholder="请选择审核状态">
            <el-option v-for="item in auditOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            ref="pictureEditRef"
            action=""
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :file-list="pics"
            :on-change="handleChange"
            :on-exceed="handleExceed"
          >
            <i slot="default" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{ file }">
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editUserInfo">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible" width="420px">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
function createEmptyForm() {
  return {
    userId: null,
    userName: "",
    password: "",
    email: "",
    phoneNumber: "",
    sex: true,
    companyId: "",
    userPicture: "",
    roleId: 2,
    auditStatus: 1
  };
}

export default {
  data() {
    const checkMobile = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入手机号"));
        return;
      }
      if (!/^1\d{10}$/.test(value)) {
        callback(new Error("请输入正确的手机号"));
        return;
      }
      callback();
    };

    const checkEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入邮箱"));
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback(new Error("请输入正确的邮箱"));
        return;
      }
      callback();
    };

    return {
      filters: {
        userName: "",
        phoneNumber: "",
        auditStatus: ""
      },
      queryInfo: {
        userName: "",
        phoneNumber: "",
        auditStatus: null,
        roleId: 2,
        pageNum: 1,
        pageSize: 7
      },
      total: 0,
      userList: [],
      companyList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: createEmptyForm(),
      editForm: createEmptyForm(),
      formRules: {
        userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        phoneNumber: [{ validator: checkMobile, trigger: "blur" }],
        email: [{ validator: checkEmail, trigger: "blur" }],
        sex: [{ required: true, message: "请选择性别", trigger: "change" }],
        companyId: [{ required: true, message: "请选择所属企业", trigger: "change" }],
        auditStatus: [{ required: true, message: "请选择审核状态", trigger: "change" }]
      },
      editFormRules: {
        userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        phoneNumber: [{ validator: checkMobile, trigger: "blur" }],
        email: [{ validator: checkEmail, trigger: "blur" }],
        sex: [{ required: true, message: "请选择性别", trigger: "change" }],
        companyId: [{ required: true, message: "请选择所属企业", trigger: "change" }],
        auditStatus: [{ required: true, message: "请选择审核状态", trigger: "change" }]
      },
      auditOptions: [
        { value: 0, label: "待审核" },
        { value: 1, label: "已通过" },
        { value: 2, label: "已驳回" }
      ],
      genderOptions: [
        { value: true, label: "男" },
        { value: false, label: "女" }
      ],
      multipleSelection: [],
      pics: [],
      pictureList: [],
      deletePicList: [],
      dialogImageUrl: "",
      dialogVisible: false
    };
  },
  created() {
    this.getUserList();
    this.getCompanyList();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    getUserList() {
      this.queryInfo.userName = this.filters.userName.trim();
      this.queryInfo.phoneNumber = this.filters.phoneNumber.trim();
      this.queryInfo.auditStatus = this.filters.auditStatus === "" ? null : Number(this.filters.auditStatus);
      this.queryInfo.roleId = 2;

      axios.get("sysUser", { params: this.queryInfo }).then((resp) => {
        this.userList = resp.data.data || [];
        this.total = resp.data.total || 0;
        this.queryInfo.pageSize = resp.data.pageSize || this.queryInfo.pageSize;
        this.queryInfo.pageNum = resp.data.pageNum || this.queryInfo.pageNum;
      });
    },
    getCompanyList() {
      axios.get("enterprise", {
        params: {
          pageNum: 1,
          pageSize: 200
        }
      }).then((resp) => {
        this.companyList = resp.data.data || [];
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getUserList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    showAddDialog() {
      this.addForm = createEmptyForm();
      this.pics = [];
      this.pictureList = [];
      this.deletePicList = [];
      this.addDialogVisible = true;
    },
    async showEditDialog(id) {
      const resp = await axios.get(`sysUser/${id}`);
      const data = resp.data.data || createEmptyForm();
      this.editForm = {
        ...createEmptyForm(),
        ...data,
        password: "",
        roleId: 2,
        auditStatus: data.auditStatus == null ? 0 : Number(data.auditStatus)
      };
      this.pics = this.buildPictureFileList(this.editForm.userPicture);
      this.pictureList = [];
      this.deletePicList = [];
      this.editDialogVisible = true;
    },
    resetAddDialog() {
      if (this.$refs.addFormRef) {
        this.$refs.addFormRef.resetFields();
      }
      if (this.$refs.pictureRef) {
        this.$refs.pictureRef.clearFiles();
      }
      this.addForm = createEmptyForm();
      this.pics = [];
      this.pictureList = [];
      this.deletePicList = [];
    },
    resetEditDialog() {
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.resetFields();
      }
      if (this.$refs.pictureEditRef) {
        this.$refs.pictureEditRef.clearFiles();
      }
      this.editForm = createEmptyForm();
      this.pics = [];
      this.pictureList = [];
      this.deletePicList = [];
    },
    async addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        await this.submitFile();
        const payload = {
          ...this.addForm,
          roleId: 2,
          auditStatus: Number(this.addForm.auditStatus),
          userPicture: this.pictureList.length ? JSON.stringify(this.pictureList) : ""
        };

        axios.defaults.headers.post["Content-Type"] = "application/json";
        const resp = await axios.post("sysUser", JSON.stringify(payload));
        if (resp.data.code !== 200) {
          this.$message.error(resp.data.msg || "新增企业用户失败");
          return;
        }

        this.addDialogVisible = false;
        this.getUserList();
        this.$message.success("新增企业用户成功");
      });
    },
    async editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        await this.submitFile();
        const payload = {
          ...this.editForm,
          roleId: 2,
          auditStatus: Number(this.editForm.auditStatus),
          userPicture: this.pictureList.length ? JSON.stringify(this.pictureList) : ""
        };

        axios.defaults.headers.put["Content-Type"] = "application/json";
        const resp = await axios.put("sysUser", JSON.stringify(payload));
        if (resp.data.code !== 200) {
          this.$message.error(resp.data.msg || "修改企业用户失败");
          return;
        }

        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success("修改企业用户成功");

        for (const url of this.deletePicList) {
          await axios.get("/upload/delete?filePath=" + url.substring(url.indexOf("/images")));
        }
      });
    },
    async changeAuditStatus(row, auditStatus) {
      const actionText = auditStatus === 1 ? "审核通过" : "驳回";
      const confirmResult = await this.$confirm(`确认要${actionText}该企业用户吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch((err) => err);

      if (confirmResult === "cancel") {
        return this.$message.info("已取消操作");
      }

      const detailResp = await axios.get(`sysUser/${row.userId}`);
      const payload = {
        ...(detailResp.data.data || row),
        roleId: 2,
        auditStatus,
        password: ""
      };

      axios.defaults.headers.put["Content-Type"] = "application/json";
      const resp = await axios.put("sysUser", JSON.stringify(payload));
      if (resp.data.code !== 200) {
        this.$message.error(resp.data.msg || `${actionText}失败`);
        return;
      }

      this.getUserList();
      this.$message.success(`${actionText}成功`);
    },
    async deleteUserById(id) {
      const confirmResult = await this.$confirm("此操作将永久删除该企业用户，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch((err) => err);

      if (confirmResult === "cancel") {
        return this.$message.info("已取消删除");
      }

      const resp = await axios.delete(`sysUser/${id}`);
      if (resp.data.code !== 200) {
        this.$message.error(resp.data.msg || "删除企业用户失败");
        return;
      }

      this.getUserList();
      this.$message.success("删除企业用户成功");
    },
    async multipleDelete() {
      if (!this.multipleSelection.length) {
        this.$message.info("请先选择要删除的企业用户");
        return;
      }

      const confirmResult = await this.$confirm("此操作将永久删除选中的企业用户，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch((err) => err);

      if (confirmResult === "cancel") {
        return this.$message.info("已取消删除");
      }

      const ids = this.multipleSelection.map((item) => item.userId);
      const resp = await axios.delete(`sysUser/${ids}`);
      if (resp.data.code !== 200) {
        this.$message.error(resp.data.msg || "批量删除失败");
        return;
      }

      this.getUserList();
      this.$message.success("批量删除成功");
    },
    auditStatusText(status) {
      const value = Number(status);
      if (value === 1) {
        return "已通过";
      }
      if (value === 2) {
        return "已驳回";
      }
      return "待审核";
    },
    auditTagType(status) {
      const value = Number(status);
      if (value === 1) {
        return "success";
      }
      if (value === 2) {
        return "danger";
      }
      return "warning";
    },
    normalizePictureList(value) {
      if (!value) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.filter(Boolean);
      }
      if (typeof value === "string") {
        const text = value.trim();
        if (!text) {
          return [];
        }
        if (text.startsWith("[") || text.startsWith("{")) {
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              return parsed.filter(Boolean);
            }
            if (parsed && typeof parsed === "object") {
              return [parsed.url || parsed.path || parsed.src].filter(Boolean);
            }
          } catch (error) {
            return [text];
          }
        }
        return [text];
      }
      if (typeof value === "object") {
        return [value.url || value.path || value.src].filter(Boolean);
      }
      return [];
    },
    buildPictureFileList(value) {
      return this.normalizePictureList(value).map((item) => ({
        name: "avatar",
        url: item.startsWith("http") ? item : this.global.base + item,
        status: "success"
      }));
    },
    handleRemove(file) {
      const index = this.pics.findIndex((item) => item.url === file.url);
      if (file.status === "success") {
        this.deletePicList.push(file.url);
      }
      if (index >= 0) {
        this.pics.splice(index, 1);
      }
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleChange(file, fileList) {
      this.pics = fileList.slice(0, 1);
    },
    handleExceed() {
      this.$message.error("企业用户头像最多上传一张");
    },
    async submitFile() {
      this.pictureList = [];

      for (let i = 0; i < this.pics.length; i += 1) {
        const item = this.pics[i];
        if (item.status === "success") {
          this.pictureList.push(item.url.substring(item.url.indexOf("/images")));
          continue;
        }

        const formData = new FormData();
        formData.append("file", item.raw);
        const response = await axios.post("upload/user", formData);
        this.pictureList.push(response.data.data);
      }
    }
  }
};
</script>

<style scoped>
.el-table {
  margin-top: 16px;
  font-size: 14px;
}

.el-pagination {
  margin-top: 16px;
}
</style>
