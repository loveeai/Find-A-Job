<template>
  <div class="statistics-page">
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-row :gutter="20" class="summary-row">
      <el-col :span="6" v-for="card in summaryCards" :key="card.key">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">{{ card.label }}</div>
          <div class="summary-value">{{ summary[card.key] || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <div class="chart-title">用户角色分布</div>
          <div ref="userRoleChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <div class="chart-title">企业状态分布</div>
          <div ref="enterpriseStatusChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <div class="chart-title">投递处理状态</div>
          <div ref="applicationStatusChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <div class="chart-title">岗位审核状态</div>
          <div ref="jobAuditChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <div class="chart-title">近六个月岗位发布趋势</div>
          <div ref="monthlyJobChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <div class="chart-title">企业岗位数量排行</div>
          <div ref="topEnterpriseChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "StatisticsDashboard",
  data() {
    return {
      loading: false,
      summary: {
        userCount: 0,
        enterpriseCount: 0,
        activeJobCount: 0,
        applicationCount: 0,
        resumeCount: 0,
        commentCount: 0
      },
      summaryCards: [
        { key: "userCount", label: "普通用户数" },
        { key: "enterpriseCount", label: "企业总数" },
        { key: "activeJobCount", label: "在招岗位数" },
        { key: "applicationCount", label: "简历投递数" },
        { key: "resumeCount", label: "简历总数" },
        { key: "commentCount", label: "评论总数" }
      ],
      userRoleStats: [],
      enterpriseStatusStats: [],
      applicationStatusStats: [],
      jobAuditStats: [],
      monthlyJobPublishStats: [],
      topEnterpriseJobStats: [],
      chartInstances: {}
    };
  },
  mounted() {
    this.loadStatistics();
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    this.disposeCharts();
  },
  methods: {
    async loadStatistics() {
      this.loading = true;
      try {
        const resp = await axios.get("dashboard/statistics");
        const data = (resp.data && resp.data.data) || {};
        this.summary = {
          ...this.summary,
          ...(data.summary || {})
        };
        this.userRoleStats = data.userRoleStats || [];
        this.enterpriseStatusStats = data.enterpriseStatusStats || [];
        this.applicationStatusStats = data.applicationStatusStats || [];
        this.jobAuditStats = data.jobAuditStats || [];
        this.monthlyJobPublishStats = data.monthlyJobPublishStats || [];
        this.topEnterpriseJobStats = data.topEnterpriseJobStats || [];

        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        this.$message.error("获取统计数据失败");
      } finally {
        this.loading = false;
      }
    },

    handleResize() {
      Object.values(this.chartInstances).forEach(chart => {
        if (chart) {
          chart.resize();
        }
      });
    },

    disposeCharts() {
      Object.keys(this.chartInstances).forEach(key => {
        const chart = this.chartInstances[key];
        if (chart) {
          chart.dispose();
        }
      });
      this.chartInstances = {};
    },

    initChart(refName) {
      const dom = this.$refs[refName];
      if (!dom) {
        return null;
      }

      if (this.chartInstances[refName]) {
        this.chartInstances[refName].dispose();
      }

      const instance = echarts.init(dom);
      this.chartInstances[refName] = instance;
      return instance;
    },

    buildPieOption(title, list, colors) {
      return {
        color: colors,
        tooltip: {
          trigger: "item"
        },
        legend: {
          bottom: 0
        },
        series: [
          {
            name: title,
            type: "pie",
            radius: ["45%", "72%"],
            center: ["50%", "45%"],
            data: list.map(item => ({
              name: item.name,
              value: item.nums
            })),
            label: {
              formatter: "{b}\n{c}"
            }
          }
        ]
      };
    },

    buildBarOption(title, list, color, options = {}) {
      const labelRotate = Number(options.labelRotate || 0);
      const gridBottom = Number(options.gridBottom || 45);

      return {
        color: [color],
        tooltip: {
          trigger: "axis"
        },
        grid: {
          left: 40,
          right: 20,
          top: 30,
          bottom: gridBottom
        },
        xAxis: {
          type: "category",
          data: list.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: labelRotate,
            align: labelRotate ? "right" : "center",
            margin: labelRotate ? 18 : 8
          }
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: title,
            type: "bar",
            barMaxWidth: 42,
            data: list.map(item => item.nums),
            label: {
              show: true,
              position: "top"
            }
          }
        ]
      };
    },

    buildLineOption(title, list, color) {
      return {
        color: [color],
        tooltip: {
          trigger: "axis"
        },
        grid: {
          left: 40,
          right: 20,
          top: 30,
          bottom: 35
        },
        xAxis: {
          type: "category",
          data: list.map(item => item.name)
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: title,
            type: "line",
            smooth: true,
            symbolSize: 10,
            data: list.map(item => item.nums),
            areaStyle: {
              opacity: 0.12
            }
          }
        ]
      };
    },

    renderCharts() {
      const userRoleChart = this.initChart("userRoleChart");
      if (userRoleChart) {
        userRoleChart.setOption(
          this.buildPieOption("用户角色", this.userRoleStats, ["#07c160", "#3b82f6", "#f59e0b"])
        );
      }

      const enterpriseStatusChart = this.initChart("enterpriseStatusChart");
      if (enterpriseStatusChart) {
        enterpriseStatusChart.setOption(
          this.buildPieOption("企业状态", this.enterpriseStatusStats, ["#10b981", "#ff6b6b"])
        );
      }

      const applicationStatusChart = this.initChart("applicationStatusChart");
      if (applicationStatusChart) {
        applicationStatusChart.setOption(
          this.buildBarOption("投递数量", this.applicationStatusStats, "#6366f1")
        );
      }

      const jobAuditChart = this.initChart("jobAuditChart");
      if (jobAuditChart) {
        jobAuditChart.setOption(
          this.buildBarOption("岗位数量", this.jobAuditStats, "#14b8a6")
        );
      }

      const monthlyJobChart = this.initChart("monthlyJobChart");
      if (monthlyJobChart) {
        monthlyJobChart.setOption(
          this.buildLineOption("岗位发布趋势", this.monthlyJobPublishStats, "#f97316")
        );
      }

      const topEnterpriseChart = this.initChart("topEnterpriseChart");
      if (topEnterpriseChart) {
        topEnterpriseChart.setOption(
          this.buildBarOption("岗位数量", this.topEnterpriseJobStats, "#8b5cf6", {
            labelRotate: 35,
            gridBottom: 90
          })
        );
      }
    }
  }
};
</script>

<style scoped>
.statistics-page {
  padding: 0 20px 20px;
}

.board {
  margin-bottom: 20px;
}

.summary-row,
.chart-row {
  margin-bottom: 20px;
}

.summary-card {
  border-radius: 16px;
}

.summary-label {
  font-size: 14px;
  color: #8a8f99;
}

.summary-value {
  margin-top: 12px;
  font-size: 30px;
  font-weight: 700;
  color: #1f2937;
}

.chart-card {
  border-radius: 16px;
}

.chart-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.chart-box {
  height: 360px;
}
</style>
