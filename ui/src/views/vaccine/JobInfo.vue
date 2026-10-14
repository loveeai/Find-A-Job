<template>
  <div>
    <!--面包屑导航区域-->
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>招聘管理</el-breadcrumb-item>
        <el-breadcrumb-item>招聘岗位信息管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!--卡片视图-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-input placeholder="请输入岗位标题" v-model="inputTitle" clearable />
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedEnterpriseId" placeholder="请选择企业" clearable>
            <el-option v-for="item in enterpriseList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedCategoryId" placeholder="请选择岗位类别" clearable>
            <el-option v-for="item in jobCategoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedStatus" placeholder="请选择状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-search" @click="getJobList">搜索</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="showAddDialog"
            style="background-color: chocolate;color: aliceblue;">添加岗位</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="danger" @click="multipleDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="jobList" style="width: 100%" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column type="index" :index="getTableIndex" label=""></el-table-column>
        <el-table-column prop="title" label="岗位标题" ></el-table-column>
        <el-table-column prop="enterpriseId" label="所属企业"  :formatter="enterpriseFormat"></el-table-column>
        <el-table-column prop="categoryId" label="岗位类别" :formatter="jobCategoryFormat"></el-table-column>
        <el-table-column prop="salaryMin" label="最低时薪" ></el-table-column>
        <el-table-column prop="salaryMax" label="最高时薪" ></el-table-column>
        <el-table-column prop="location" label="工作地点" ></el-table-column>
        <el-table-column prop="status" label="状态" :formatter="statusFormat" ></el-table-column>
        <el-table-column prop="createTime" label="创建时间" ></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改岗位信息" placement="top" :enterable="false" :open-delay="500">
              <el-button type="primary" size="mini" style="background-color: chocolate;color: aliceblue;" @click="showEditDialog(scope.row.id)">修改</el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除岗位" placement="top" :enterable="false" :open-delay="500">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteJobById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum" :page-sizes="[5, 7, 9]" :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!--添加岗位对话框-->
    <el-dialog title="添加岗位" :visible.sync="addDialogVisible" width="60%" @close="addDialogClosed">
      <!--内容主题区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="岗位标题" prop="title">
          <el-input v-model="addForm.title"></el-input>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="addForm.enterpriseId" placeholder="请选择企业">
            <el-option v-for="item in enterpriseList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="岗位类别" prop="categoryId">
          <el-select v-model="addForm.categoryId" placeholder="请选择岗位类别">
            <el-option v-for="item in jobCategoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最低时薪" prop="salaryMin">
          <el-input v-model="addForm.salaryMin" type="number"></el-input>
        </el-form-item>
        <el-form-item label="最高时薪" prop="salaryMax">
          <el-input v-model="addForm.salaryMax" type="number"></el-input>
        </el-form-item>
        <el-form-item label="工作地点" prop="location">
          <el-input v-model="addForm.location"></el-input>
        </el-form-item>
        <el-form-item label="岗位描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="福利待遇" prop="welfare">
          <el-input v-model="addForm.welfare" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="addForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addJob">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改岗位对话框-->
    <el-dialog title="修改岗位信息" :visible.sync="editDialogVisible" width="60%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="150px">
        <el-form-item label="岗位标题" prop="title">
          <el-input v-model="editForm.title"></el-input>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="editForm.enterpriseId" placeholder="请选择企业">
            <el-option v-for="item in enterpriseList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="岗位类别" prop="categoryId">
          <el-select v-model="editForm.categoryId" placeholder="请选择岗位类别">
            <el-option v-for="item in jobCategoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最低时薪" prop="salaryMin">
          <el-input v-model="editForm.salaryMin" type="number"></el-input>
        </el-form-item>
        <el-form-item label="最高时薪" prop="salaryMax">
          <el-input v-model="editForm.salaryMax" type="number"></el-input>
        </el-form-item>
        <el-form-item label="工作地点" prop="location">
          <el-input v-model="editForm.location"></el-input>
        </el-form-item>
        <el-form-item label="岗位描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="福利待遇" prop="welfare">
          <el-input v-model="editForm.welfare" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="editJob">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import global from "@/assets/css/global.css";
export default {
  data() {
    return {
      queryInfo: {
        title: "",
        enterpriseId: null,
        categoryId: null,
        status: null,
        pageNum: 1,
        pageSize: 7,
      },
      total: 0,
      //控制对话框的显示与隐藏
      addDialogVisible: false,
      //添加岗位的表单数据
      addForm: {
        title: "",
        enterpriseId: null,
        categoryId: null,
        salaryMin: null,
        salaryMax: null,
        location: "",
        description: "",
        welfare: "",
        status: null,
      },
      //验证表单规则对象
      addFormRules: {
        title: [
          { required: true, message: "请输入岗位标题", trigger: "blur" },
        ],
        enterpriseId: [
          { required: true, message: "请选择所属企业", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "请选择岗位类别", trigger: "change" },
        ],
        salaryMin: [
          { required: true, message: "请输入最低时薪", trigger: "blur" },
        ],
        salaryMax: [
          { required: true, message: "请输入最高时薪", trigger: "blur" },
        ],
        location: [
          { required: true, message: "请输入工作地点", trigger: "blur" },
        ],
        status: [
          { required: true, message: "请选择状态", trigger: "change" },
        ],
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        title: [
          { required: true, message: "请输入岗位标题", trigger: "blur" },
        ],
        enterpriseId: [
          { required: true, message: "请选择所属企业", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "请选择岗位类别", trigger: "change" },
        ],
        salaryMin: [
          { required: true, message: "请输入最低时薪", trigger: "blur" },
        ],
        salaryMax: [
          { required: true, message: "请输入最高时薪", trigger: "blur" },
        ],
        location: [
          { required: true, message: "请输入工作地点", trigger: "blur" },
        ],
        status: [
          { required: true, message: "请选择状态", trigger: "change" },
        ],
      },
      inputTitle: "",
      selectedEnterpriseId: "",
      selectedCategoryId: "",
      selectedStatus: "",
      jobList: [],
      enterpriseList: [],
      jobCategoryList: [],
      statusOptions: [
        { id: 0, name: "禁用" },
        { id: 1, name: "审核通过" },
        { id: 2, name: "待审核" },
        { id: 3, name: "未通过审核" },
      ],
      multipleSelection: [],
    };
  },
  created() {
    this.getJobList();
    this.getEnterpriseList();
    this.getJobCategoryList();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    getJobList() {
      this.queryInfo.title = this.inputTitle;
      // 转换为数字类型，空字符串转换为null
      this.queryInfo.enterpriseId = this.selectedEnterpriseId ? parseInt(this.selectedEnterpriseId) : null;
      this.queryInfo.categoryId = this.selectedCategoryId ? parseInt(this.selectedCategoryId) : null;
      this.queryInfo.status = this.selectedStatus ? parseInt(this.selectedStatus) : null;
      const _this = this;
      this.$axios.get("job", { params: _this.queryInfo }).then((resp) => {
        _this.jobList = resp.data.data;
        _this.total = resp.data.total;
        _this.queryInfo.pageSize = resp.data.pageSize;
        _this.queryInfo.pageNum = resp.data.pageNum;
      });
    },
    getEnterpriseList() {
      const _this = this;
      axios.get("enterprise", { params: { pageSize: 100 } }).then((resp) => {
        _this.enterpriseList = resp.data.data;
      });
    },
    getJobCategoryList() {
      const _this = this;
      axios.get("jobCategory", { params: { pageSize: 100 } }).then((resp) => {
        _this.jobCategoryList = resp.data.data;
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getJobList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getJobList();
    },
    showAddDialog() {
      this.addDialogVisible = true;
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 监听添加按钮
    async addJob() {
      let success = true;
      const _this = this;
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 预校验成功，发网络请求
        axios.defaults.headers.post["Content-Type"] = "application/json";
        await axios
          .post("job", JSON.stringify(_this.addForm))
          .then((resp) => {
            if (resp.data.code !== 200) {
              this.$message.error("添加岗位失败！");
              success = false;
            }
          });
        this.getJobList();
        if (!success) return;
        //隐藏添加对话框
        this.addDialogVisible = false;
        this.$message.success("添加岗位成功！");
      });
    },
    // 显示修改对话框，回显数据
    async showEditDialog(id) {
      const _this = this;
      await axios.get("job/" + id).then((resp) => {
        _this.editForm = resp.data.data;
      });
      this.editDialogVisible = true;
    },
    // 监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 取消修改
    cancelEdit() {
      this.editDialogVisible = false;
    },
    async editJob() {
      this.$refs.editFormRef.validate(async (valid) => {
        const _this = this;
        if (!valid) return;
        let success = true;
        axios.defaults.headers.put["Content-Type"] = "application/json";
        await axios
          .put("job", JSON.stringify(_this.editForm))
          .then((resp) => {
            if (resp.data.code !== 200) {
              this.$message.error("修改岗位信息失败！");
              success = false;
            }
          });
        if (!success) return;
        this.editDialogVisible = false;
        this.getJobList();
        this.$message.success("修改岗位信息成功！");
      });
    },
    // 监听多选框变化
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async multipleDelete() {
      const _this = this;
      if (!this.multipleSelection.length) {
        return _this.$message.info("请先选择要删除的数据");
      }
      //询问用户是否确认删除
      const resp = await this.$confirm(
        "此操作将永久删除这些条目, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 用户确认删除, resp为字符串"confirm"
      // 用户取消删除，resp为字符串"cancel"
      if (resp == "cancel") {
        return _this.$message.info("已取消删除");
      }

      let ids = [];
      this.multipleSelection.forEach((data) => {
        ids.push(data.id);
      });
      await axios.delete("job/ids/" + ids).then((resp) => {
        if (resp.data.code !== 200) {
          this.$message.error("批量删除岗位失败！");
        }
      });
      this.getJobList();
      this.$message.success("批量删除岗位成功！");
    },
    //根据id删除对应的岗位
    async deleteJobById(id) {
      const _this = this;
      //询问用户是否确认删除
      const resp = await this.$confirm(
        "此操作将永久删除该条目, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 用户确认删除, resp为字符串"confirm"
      // 用户取消删除，resp为字符串"cancel"
      if (resp == "cancel") {
        return _this.$message.info("已取消删除");
      }

      await axios.delete("job/" + id).then((resp) => {
        if (resp.data.code !== 200) {
          _this.$message.error("删除岗位失败！");
        }
      });
      this.getJobList();
      this.$message.success("删除岗位成功！");
    },
    enterpriseFormat(row) {
      const enterprise = this.enterpriseList.find(item => item.id === row.enterpriseId);
      return enterprise ? enterprise.name : "未知";
    },
    jobCategoryFormat(row) {
      const category = this.jobCategoryList.find(item => item.id === row.categoryId);
      return category ? category.name : "未知";
    },
    statusFormat(row) {
      if (row.status === 1) {
        return "审核通过";
      } else if (row.status === 2) {
        return "待审核";
      } else if (row.status === 3) {
        return "未通过审核";
      } else {
        return "禁用";
      }
    },
  },
};
</script>

<style scoped>
.board {
  margin-bottom: 20px;
}
.box-card {
  margin: 0 20px;
}
</style>
