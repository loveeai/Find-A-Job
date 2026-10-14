<template>
  <div>
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>招聘管理</el-breadcrumb-item>
        <el-breadcrumb-item>评论管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-input placeholder="职位ID" v-model="inputJobId" clearable />
        </el-col>
        <el-col :span="5">
          <el-input placeholder="用户昵称" v-model="inputUserName" clearable />
        </el-col>
        <el-col :span="7">
          <el-input placeholder="评论内容" v-model="inputContent" clearable />
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-search" @click="getCommentList">搜索</el-button>
        </el-col>
      </el-row>

      <el-table :data="commentList" style="width: 100%" border stripe>
        <el-table-column type="index" :index="getTableIndex" label=""></el-table-column>
        <el-table-column prop="id" label="评论ID" width="100"></el-table-column>
        <el-table-column prop="jobId" label="职位ID" width="100"></el-table-column>
        <el-table-column prop="jobTitle" label="职位标题" min-width="160"></el-table-column>
        <el-table-column prop="userName" label="用户" width="140"></el-table-column>
        <el-table-column prop="content" label="内容" min-width="220"></el-table-column>
        <el-table-column prop="times" label="时间" width="160"></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="删除评论" placement="top" :enterable="false" :open-delay="500">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCommentById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 7, 10]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import global from "@/assets/css/global.css";
export default {
  data() {
    return {
      queryInfo: {
        jobId: null,
        userName: "",
        content: "",
        pageNum: 1,
        pageSize: 7,
      },
      inputJobId: "",
      inputUserName: "",
      inputContent: "",
      total: 0,
      commentList: [],
      roleId: null,
    };
  },
  created() {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser") || "{}");
    this.roleId = loginUser?.sysUser?.roleId;
    this.getCommentList();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    getCommentList() {
      const jobIdNumber = Number(this.inputJobId);
      this.queryInfo.jobId = this.inputJobId && !Number.isNaN(jobIdNumber) ? jobIdNumber : null;
      this.queryInfo.userName = this.inputUserName;
      this.queryInfo.content = this.inputContent;

      const _this = this;
      axios.get("comment", { params: _this.queryInfo }).then((resp) => {
        _this.commentList = resp.data.data;
        _this.total = resp.data.total;
        _this.queryInfo.pageSize = resp.data.pageSize;
        _this.queryInfo.pageNum = resp.data.pageNum;
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getCommentList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getCommentList();
    },
    async deleteCommentById(id) {
      const _this = this;
      const resp = await this.$confirm("此操作将永久删除该评论, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      if (resp == "cancel") {
        return _this.$message.info("已取消删除");
      }

      let success = true;
      await axios.delete("comment/" + id).then((resp) => {
        if (resp.data.code !== 200) {
          success = false;
        }
      });
      if (!success) return _this.$message.error("删除评论失败！");
      this.getCommentList();
      this.$message.success("删除评论成功！");
    },
  },
};
</script>

<style scoped>
</style>
