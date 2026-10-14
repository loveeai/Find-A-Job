<template>
  <div>
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>招聘管理</el-breadcrumb-item>
        <el-breadcrumb-item>招聘信息审核</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="inputTitle" placeholder="请输入岗位标题" clearable />
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedEnterpriseId" placeholder="请选择企业" clearable>
            <el-option v-for="item in enterpriseList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedAuditStatus" placeholder="请选择审核状态" clearable>
            <el-option label="待审核" :value="2"></el-option>
            <el-option label="审核通过" :value="1"></el-option>
            <el-option label="审核不通过" :value="3"></el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button icon="el-icon-search" @click="getJobList">搜索</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="handleBatchAudit(1)" style="background-color: #67C23A;">批量通过</el-button>
        </el-col>
      </el-row>

      <el-table
        :data="jobList"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column type="index" :index="getTableIndex" label="" width="50"></el-table-column>
        <el-table-column prop="title" label="岗位标题" width="180"></el-table-column>
        <el-table-column prop="enterpriseId" label="所属企业" width="150" :formatter="enterpriseFormat"></el-table-column>
        <el-table-column prop="categoryId" label="岗位类别" width="120" :formatter="jobCategoryFormat"></el-table-column>
        <el-table-column label="薪资范围" width="150">
          <template slot-scope="scope">
            {{ scope.row.salaryMin }}-{{ scope.row.salaryMax }} 元/时
          </template>
        </el-table-column>
        <el-table-column prop="location" label="工作地点" width="120"></el-table-column>
        <el-table-column prop="status" label="审核状态" width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 2" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">审核通过</el-tag>
            <el-tag v-else-if="scope.row.status === 3" type="danger">审核不通过</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="查看详情" placement="top" :enterable="false" :open-delay="500">
              <el-button type="info" size="mini" @click="showJobDetail(scope.row)">详情</el-button>
            </el-tooltip>
            <el-tooltip
              v-if="scope.row.status === 2"
              effect="dark"
              content="审核通过"
              placement="top"
              :enterable="false"
              :open-delay="500"
            >
              <el-button type="success" size="mini" @click="handleAudit(scope.row.id, 1)">通过</el-button>
            </el-tooltip>
            <el-tooltip
              v-if="scope.row.status === 2"
              effect="dark"
              content="审核不通过"
              placement="top"
              :enterable="false"
              :open-delay="500"
            >
              <el-button type="danger" size="mini" @click="handleAudit(scope.row.id, 3)">不通过</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 7, 10, 15]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog title="招聘详情" :visible.sync="detailDialogVisible" width="60%">
      <el-descriptions :column="2" border v-if="currentJob">
        <el-descriptions-item label="岗位标题">{{ currentJob.title }}</el-descriptions-item>
        <el-descriptions-item label="所属企业">{{ enterpriseFormat(currentJob) }}</el-descriptions-item>
        <el-descriptions-item label="岗位类别">{{ jobCategoryFormat(currentJob) }}</el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ currentJob.location }}</el-descriptions-item>
        <el-descriptions-item label="最低月薪">{{ currentJob.salaryMin }} 元/月</el-descriptions-item>
        <el-descriptions-item label="最高月薪">{{ currentJob.salaryMax }} 元/月</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag v-if="currentJob.status === 2" type="warning">待审核</el-tag>
          <el-tag v-else-if="currentJob.status === 1" type="success">审核通过</el-tag>
          <el-tag v-else-if="currentJob.status === 3" type="danger">审核不通过</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentJob.createTime }}</el-descriptions-item>
        <el-descriptions-item label="岗位描述" :span="2">
          <div style="white-space: pre-wrap;">{{ currentJob.description || '暂无描述' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="福利待遇" :span="2">
          <div style="white-space: pre-wrap;">{{ currentJob.welfare || '暂无' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-if="currentJob && currentJob.status === 2" type="success" @click="handleAudit(currentJob.id, 1)">审核通过</el-button>
        <el-button v-if="currentJob && currentJob.status === 2" type="danger" @click="handleAudit(currentJob.id, 3)">审核不通过</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        title: "",
        enterpriseId: null,
        status: 2,
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      inputTitle: "",
      selectedEnterpriseId: "",
      selectedAuditStatus: 2,
      jobList: [],
      enterpriseList: [],
      jobCategoryList: [],
      multipleSelection: [],
      detailDialogVisible: false,
      currentJob: null,
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
      this.queryInfo.title = this.inputTitle.trim();
      this.queryInfo.enterpriseId = this.selectedEnterpriseId === "" ? null : Number(this.selectedEnterpriseId);
      this.queryInfo.status = this.selectedAuditStatus === "" || this.selectedAuditStatus === null
        ? null
        : Number(this.selectedAuditStatus);

      this.$axios.get("job", { params: this.queryInfo }).then((resp) => {
        this.jobList = resp.data.data || [];
        this.total = resp.data.total || 0;
        this.queryInfo.pageSize = resp.data.pageSize || this.queryInfo.pageSize;
        this.queryInfo.pageNum = resp.data.pageNum || this.queryInfo.pageNum;
      });
    },
    getEnterpriseList() {
      this.$axios.get("enterprise", { params: { pageSize: 100 } }).then((resp) => {
        this.enterpriseList = resp.data.data || [];
      });
    },
    getJobCategoryList() {
      this.$axios.get("jobCategory", { params: { pageSize: 100 } }).then((resp) => {
        this.jobCategoryList = resp.data.data || [];
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
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async handleAudit(id, status) {
      const statusText = status === 1 ? "通过" : "不通过";
      const resp = await this.$confirm(`确定要审核${statusText}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      if (resp === "cancel") {
        return this.$message.info("已取消操作");
      }

      try {
        const result = await this.$axios.put(`job/${id}/audit`, { status });
        if (result.data.code !== 200) {
          this.$message.error(result.data.msg || "审核操作失败");
          return;
        }

        this.$message.success(`审核${statusText}成功`);
        this.detailDialogVisible = false;
        this.getJobList();
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.msg) || "审核操作失败");
      }
    },
    async handleBatchAudit(status) {
      if (!this.multipleSelection.length) {
        return this.$message.warning("请先选择要审核的招聘信息");
      }

      const statusText = status === 1 ? "通过" : "不通过";
      const resp = await this.$confirm(
        `确定要批量审核${statusText}选中的 ${this.multipleSelection.length} 条招聘信息吗？`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (resp === "cancel") {
        return this.$message.info("已取消操作");
      }

      let successCount = 0;
      let failCount = 0;
      let lastErrorMessage = "";

      for (const job of this.multipleSelection) {
        try {
          const result = await this.$axios.put(`job/${job.id}/audit`, { status });
          if (result.data.code === 200) {
            successCount += 1;
          } else {
            failCount += 1;
            lastErrorMessage = result.data.msg || lastErrorMessage;
          }
        } catch (error) {
          failCount += 1;
          lastErrorMessage = (error.response && error.response.data && error.response.data.msg) || lastErrorMessage;
        }
      }

      if (failCount === 0) {
        this.$message.success(`批量审核${statusText}成功，共 ${successCount} 条`);
      } else if (successCount === 0 && lastErrorMessage) {
        this.$message.error(lastErrorMessage);
      } else {
        this.$message.warning(`批量审核完成，成功 ${successCount} 条，失败 ${failCount} 条${lastErrorMessage ? `，最近失败原因：${lastErrorMessage}` : ""}`);
      }

      this.getJobList();
    },
    showJobDetail(row) {
      this.currentJob = row;
      this.detailDialogVisible = true;
    },
    enterpriseFormat(row) {
      const enterprise = this.enterpriseList.find((item) => Number(item.id) === Number(row.enterpriseId));
      return enterprise ? enterprise.name : "未知";
    },
    jobCategoryFormat(row) {
      const category = this.jobCategoryList.find((item) => Number(item.id) === Number(row.categoryId));
      return category ? category.name : "未知";
    },
    tableRowClassName({ row }) {
      if (row.status === 2) {
        return "warning-row";
      }
      if (row.status === 3) {
        return "danger-row";
      }
      return "";
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

<style>
.el-table .warning-row {
  background: #fff7e6;
}
.el-table .danger-row {
  background: #fff1f0;
}
</style>
