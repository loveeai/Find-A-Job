<template>
  <div>
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>招聘管理</el-breadcrumb-item>
        <el-breadcrumb-item>投诉管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-input v-model="inputJobId" placeholder="职位ID" clearable />
        </el-col>
        <el-col :span="4">
          <el-input v-model="inputUserName" placeholder="投诉用户" clearable />
        </el-col>
        <el-col :span="5">
          <el-input v-model="inputCompanyName" placeholder="所属企业" clearable />
        </el-col>
        <el-col :span="7">
          <el-input v-model="inputReason" placeholder="投诉原因" clearable />
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-search" @click="getComplaintList">搜索</el-button>
        </el-col>
      </el-row>

      <el-table :data="complaintList" border stripe style="width: 100%">
        <el-table-column type="index" :index="getTableIndex" label="" width="60"></el-table-column>
        <el-table-column prop="id" label="投诉ID" width="100"></el-table-column>
        <el-table-column prop="jobId" label="职位ID" width="100"></el-table-column>
        <el-table-column prop="jobTitle" label="职位名称" min-width="180"></el-table-column>
        <el-table-column prop="companyName" label="企业名称" min-width="180"></el-table-column>
        <el-table-column prop="userName" label="投诉用户" width="140"></el-table-column>
        <el-table-column prop="reason" label="投诉原因" min-width="220" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="投诉时间" width="180"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="viewComplaint(scope.row)">查看</el-button>
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

    <el-dialog title="投诉详情" :visible.sync="detailVisible" width="600px">
      <el-descriptions v-if="currentComplaint" :column="1" border>
        <el-descriptions-item label="投诉ID">{{ currentComplaint.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职位信息">
          {{ currentComplaint.jobTitle || '-' }}（ID：{{ currentComplaint.jobId || '-' }}）
        </el-descriptions-item>
        <el-descriptions-item label="所属企业">{{ currentComplaint.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="投诉用户">{{ currentComplaint.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="投诉时间">{{ currentComplaint.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="投诉原因">{{ currentComplaint.reason || '-' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        jobId: null,
        userName: "",
        companyName: "",
        reason: "",
        pageNum: 1,
        pageSize: 7
      },
      inputJobId: "",
      inputUserName: "",
      inputCompanyName: "",
      inputReason: "",
      complaintList: [],
      total: 0,
      detailVisible: false,
      currentComplaint: null
    };
  },
  created() {
    this.getComplaintList();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    getComplaintList() {
      const jobIdNumber = Number(this.inputJobId);
      this.queryInfo.jobId = this.inputJobId && !Number.isNaN(jobIdNumber) ? jobIdNumber : null;
      this.queryInfo.userName = this.inputUserName.trim();
      this.queryInfo.companyName = this.inputCompanyName.trim();
      this.queryInfo.reason = this.inputReason.trim();

      axios.get("complaint", { params: this.queryInfo }).then((resp) => {
        this.complaintList = resp.data.data || [];
        this.total = resp.data.total || 0;
        this.queryInfo.pageSize = resp.data.pageSize || this.queryInfo.pageSize;
        this.queryInfo.pageNum = resp.data.pageNum || this.queryInfo.pageNum;
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getComplaintList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getComplaintList();
    },
    viewComplaint(row) {
      this.currentComplaint = row;
      this.detailVisible = true;
    }
  }
};
</script>

<style scoped>
</style>
