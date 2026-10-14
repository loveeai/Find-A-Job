<template>
  <div>
    <!--面包屑导航区域-->
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>岗位管理</el-breadcrumb-item>
        <el-breadcrumb-item>岗位信息管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!--卡片视图-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-input placeholder="请输入岗位名称" v-model="inputName" clearable />
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedStatus" placeholder="请选择状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedParentId" placeholder="请选择上级岗位" clearable>
            <el-option value="" label="无上级岗位"></el-option>
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-search" @click="getJobCategoryList">搜索</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="showAddDialog"
            style="background-color: chocolate;color: aliceblue;">添加岗位</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="danger" @click="multipleDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="jobCategoryList" style="width: 100%" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column type="index" :index="getTableIndex" label=""></el-table-column>
        <el-table-column prop="name" label="岗位名称" width="200px"></el-table-column>
        <el-table-column prop="parentId" label="上级岗位" width="150px" :formatter="parentCategoryFormat"></el-table-column>
        <!-- <el-table-column prop="status" label="状态" :formatter="statusFormat" width="100px"></el-table-column> -->
        <el-table-column prop="createTime" label="创建时间" width="180px"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180px"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改岗位信息" placement="top" :enterable="false" :open-delay="500">
              <el-button type="primary" size="mini" style="background-color: chocolate;color: aliceblue;" @click="showEditDialog(scope.row.id)">修改</el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除岗位" placement="top" :enterable="false" :open-delay="500">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteJobCategoryById(scope.row.id)"></el-button>
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
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="上级岗位" prop="parentId">
          <el-select v-model="addForm.parentId" placeholder="请选择上级岗位" clearable>
            <el-option value="" label="无上级岗位"></el-option>
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="状态" prop="status">
          <el-select v-model="addForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addJobCategory">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改岗位对话框-->
    <el-dialog title="修改岗位信息" :visible.sync="editDialogVisible" width="60%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="150px">
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="上级岗位" prop="parentId">
          <el-select v-model="editForm.parentId" placeholder="请选择上级岗位" clearable>
            <el-option value="" label="无上级岗位"></el-option>
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="editJobCategory">确 定</el-button>
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
        name: "",
        parentId: null,
        status: null,
        pageNum: 1,
        pageSize: 7,
      },
      total: 0,
      //控制对话框的显示与隐藏
      addDialogVisible: false,
      //添加岗位的表单数据
      addForm: {
        name: "",
        parentId: null,
        status: null,
      },
      //验证表单规则对象
      addFormRules: {
        name: [
          { required: true, message: "请输入岗位名称", trigger: "blur" },
        ],
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        name: [
          { required: true, message: "请输入岗位名称", trigger: "blur" },
        ],

      },
      inputName: "",
      selectedStatus: "",
      selectedParentId: "",
      jobCategoryList: [],
      parentCategories: [],
      statusOptions: [
        { id: 0, name: "禁用" },
        { id: 1, name: "正常" },
      ],
      multipleSelection: [],
    };
  },
  created() {
    this.getJobCategoryList();
    this.getParentCategories();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    getJobCategoryList() {
      this.queryInfo.name = this.inputName;
      // 转换为数字类型，空字符串转换为null
      this.queryInfo.parentId = this.selectedParentId ? parseInt(this.selectedParentId) : null;
      this.queryInfo.status = this.selectedStatus ? parseInt(this.selectedStatus) : null;
      const _this = this;
      this.$axios.get("jobCategory", { params: _this.queryInfo }).then((resp) => {
        _this.jobCategoryList = resp.data.data;
        _this.total = resp.data.total;
        _this.queryInfo.pageSize = resp.data.pageSize;
        _this.queryInfo.pageNum = resp.data.pageNum;
      });
    },
    getParentCategories() {
      const _this = this;
      this.$axios.get("jobCategory", { params: { pageSize: 100 } }).then((resp) => {
        _this.parentCategories = resp.data.data;
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getJobCategoryList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getJobCategoryList();
    },
    showAddDialog() {
      this.addDialogVisible = true;
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 监听添加按钮
    async addJobCategory() {
      let success = true;
      this.addForm.status = 0;
      const _this = this;
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 预校验成功，发网络请求
        axios.defaults.headers.post["Content-Type"] = "application/json";
        await axios
          .post("jobCategory", JSON.stringify(_this.addForm))
          .then((resp) => {
            if (resp.data.code !== 200) {
              this.$message.error("添加岗位失败！");
              success = false;
            }
          });
        this.getJobCategoryList();
        this.getParentCategories();
        if (!success) return;
        //隐藏添加对话框
        this.addDialogVisible = false;
        this.$message.success("添加岗位成功！");
      });
    },
    // 显示修改对话框，回显数据
    async showEditDialog(id) {
      const _this = this;
      await axios.get("jobCategory/" + id).then((resp) => {
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
    async editJobCategory() {
      this.$refs.editFormRef.validate(async (valid) => {
        this.editForm.status = 0;
        const _this = this;
        if (!valid) return;
        let success = true;
        axios.defaults.headers.put["Content-Type"] = "application/json";
        await axios
          .put("jobCategory", JSON.stringify(_this.editForm))
          .then((resp) => {
            if (resp.data.code !== 200) {
              this.$message.error("修改岗位信息失败！");
              success = false;
            }
          });
        if (!success) return;
        this.editDialogVisible = false;
        this.getJobCategoryList();
        this.getParentCategories();
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
      await axios.delete("jobCategory/ids/" + ids).then((resp) => {
        if (resp.data.code !== 200) {
          this.$message.error("批量删除岗位失败！");
        }
      });
      this.getJobCategoryList();
      this.getParentCategories();
      this.$message.success("批量删除岗位成功！");
    },
    //根据id删除对应的岗位
    async deleteJobCategoryById(id) {
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

      await axios.delete("jobCategory/" + id).then((resp) => {
        if (resp.data.code !== 200) {
          _this.$message.error("删除岗位失败！");
        }
      });
      this.getJobCategoryList();
      this.getParentCategories();
      this.$message.success("删除岗位成功！");
    },
    parentCategoryFormat(row) {
      if (!row.parentId) {
        return "无上级岗位";
      }
      const parent = this.parentCategories.find(item => item.id === row.parentId);
      return parent ? parent.name : "未知";
    },
    statusFormat(row) {
      if (row.status === 1) {
        return "正常";
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
